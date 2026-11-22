# `floating/positioning`

Places a popup against its anchor, on `@floating-ui/dom` 1.8.0, and keeps it
there while the page scrolls and resizes. Used by Popover (#33), Tooltip (#34)
and the list popups of Phase 3 (#36), never by Dialog or Alert Dialog
(`test/bundle-size/popupModules.ts`). This folder is the only place in menhir
that imports `@floating-ui/dom`.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                 | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                 | 2026-11-22 |
| No WAI-ARIA pattern covers positioning. The popup patterns need a popup that is visible, all of it reachable, wherever its trigger is in the viewport                                                                  | 2026-11-22 |
| Size: PLAN.md section 6, rule 6                                                                                                                                                                                        | 2026-11-22 |
| Floating UI docs: [`computePosition`](https://floating-ui.com/docs/computePosition), [`autoUpdate`](https://floating-ui.com/docs/autoUpdate), [middleware](https://floating-ui.com/docs/middleware)                    | 2026-11-22 |
| Floating UI docs: [offset](https://floating-ui.com/docs/offset), [flip](https://floating-ui.com/docs/flip), [shift](https://floating-ui.com/docs/shift), [size](https://floating-ui.com/docs/size)                     | 2026-11-22 |
| Floating UI docs: [arrow](https://floating-ui.com/docs/arrow), [hide](https://floating-ui.com/docs/hide), [virtual elements](https://floating-ui.com/docs/virtual-elements), [misc](https://floating-ui.com/docs/misc) | 2026-11-22 |
| The type declarations and source of `@floating-ui/dom` 1.8.0, for what the docs do not tie to a version (right to left, `autoUpdate`'s observers)                                                                      | 2026-11-22 |

The docs are not versioned; where they and 1.8.0's declarations differ, the
declarations win.

## Shape

| File                | Exports          | What it does                                                                                                                                                 |
| ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `createPosition.ts` | `createPosition` | Places the popup while it is open, writes its position, `data-side`, `data-align` and the anchor's CSS variables, and returns the position as reactive state |
| `offset.ts`         | `offset`         | The gap between anchor and popup, and a shift along the alignment                                                                                            |
| `flip.ts`           | `flip`           | Moves the popup to the opposite side when it does not fit                                                                                                    |
| `shift.ts`          | `shift`          | Slides the popup along the anchor to keep it in view                                                                                                         |
| `size.ts`           | `size`           | Writes the space left in the viewport as `--available-width` and `--available-height`                                                                        |
| `arrow.ts`          | `arrow`          | Places an arrow element so that it points at the anchor's center                                                                                             |
| `hide.ts`           | `hide`           | Sets `data-anchor-hidden` while the anchor is scrolled out of view                                                                                           |

A popup passes the middleware it uses, in this order: `offset`, `flip`,
`shift`, `size`, `arrow`, `hide` (Floating UI's middleware docs: offset first,
flip before shift for aligned placements, arrow and hide last). One file per
middleware, so a popup that does not render an arrow does not bundle `arrow`
(PLAN.md section 6, rule 6), and each has its own budget.

```ts
const position = createPosition({
  get anchor() { return trigger; },
  get popup() { return popup; },
  get open() { return open(); },
  get side() { return props.side; },
  get align() { return props.align; },
  get middleware() {
    return [
      offset({ mainAxis: props.sideOffset, alignmentAxis: props.alignOffset }),
      flip({ padding: props.collisionPadding }),
      shift({ padding: props.collisionPadding }),
    ];
  },
});
```

- **The options are getters**, read in an effect's compute, so a change to
  any of them restarts the placement with the new values.
- **Placed while open.** When `open` is true and both elements are there,
  `autoUpdate` starts: it places the popup at once, and again on a scroll or
  resize of an ancestor, a resize of either element and a layout shift of the
  anchor. Closing, or disposing of the owner, stops it. Nothing runs on the
  server, where effects do not run.
- **Placed before it is painted.** The popup must be shown before the
  placement starts: a popup component creates the effect that calls
  `showPopover()` before it calls `createPosition`, and effects run in the
  order they were created. `computePosition` then resolves in microtasks of
  the same task, before the browser paints.
- **A stale result is dropped.** Each placement takes the next number of a
  counter. A result is written only if no placement has started since, and
  closing counts as one. A stale run of `size` may already have written its
  variables while measuring, so the newest result is written again when a
  stale one comes in after it.
- **The anchor** is an element, or a virtual element (`getBoundingClientRect`,
  and `contextElement` for scrolling), such as a point for Context Menu.
- **Right to left** comes free: `@floating-ui/dom` reads the popup's
  computed `direction`, so `start` is the anchor's right edge in a
  right-to-left page. Sides stay physical.

### What it writes on the popup

After each placement that is not stale (PLAN.md section 8, "API conventions"):

- `top` and `left` through `inset: <y>px auto auto <x>px`, rounded to device
  pixels. The strategy is `fixed`: the popup is a popover in the top layer
  (#94), whose containing block is the viewport.
- `data-side`: `top`, `right`, `bottom` or `left`, after `flip`.
- `data-align`: `start`, `center` or `end`.
- `--anchor-width` and `--anchor-height`, in pixels.
- `--transform-origin`: the point of the popup nearest the anchor's center,
  on the edge that faces the anchor, for `transform-origin`.
- `--available-width` and `--available-height`, with `size`.
- `data-anchor-hidden`, with `hide`.
- The arrow element's `left` or `top`, with `arrow`.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that needs layout, so it runs only in
Chromium (`it.skipIf(isJSDOM)`). The test popup, `test/floating/positioning/Popup.tsx`,
is a `popover="manual"` element shown by an effect created before
`createPosition`, as a popup component does.

`createPosition.test.tsx`

- Writes nothing while closed: no `inset`, no `data-side`, no variables
- Once open, writes the position, `data-side`, `data-align` and the anchor's size
- Exposes the side, alignment and coordinates as reactive state
- Each side and alignment puts the popup on that side, flush with the anchor's start, center or end (C)
- Placed before the first paint after it opens (C)
- Placed before its first paint when it is rendered open (C)
- Right to left, `start` is flush with the anchor's right edge (C)
- Rounds the position to device pixels (C)
- `--transform-origin` is the anchor's center on the popup's facing edge (C)
- A virtual anchor, a point, places the popup at the point (C)
- Follows a scrolling ancestor of the anchor (C)
- Follows the anchor when it is resized (C)
- Follows the popup when it is resized (C)
- A side changed while open is applied
- Stops on close: moving the anchor and scrolling afterwards moves nothing (C)
- Starts again on reopening, at the anchor's new place (C)
- Stops on disposal: nothing is written after the owner is gone (C)
- A stale result never overwrites a newer one, even when it comes in last
- What a stale run's middleware wrote is written over by the newest result
- A result that comes in after the popup has closed is dropped

`middleware.test.tsx`

- `offset` puts the gap between anchor and popup, and shifts along the alignment (C)
- `flip` at each viewport edge: the popup moves to the opposite side, and `data-side` follows (C)
- `shift` at each viewport edge: the popup stays in view, `padding` away from the edge (C)
- `size` writes `--available-width` and `--available-height`, and a popup limited by them fits in one placement (C)
- `arrow` points at the anchor's center, also when `shift` has moved the popup (C)
- `hide` sets `data-anchor-hidden` when the anchor is scrolled out of its scrolling ancestor, and removes it when it is back (C)

`test/floating/positioning/Position.hydrate.test.tsx`

- The server HTML has no position, no `data-side` and no variables: nothing is computed during a server render
- Hydration adopts the server's elements without warnings, and opening afterwards places the popup

## Left out

| Case                                                       | Reason                                                                                                                                             |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logical sides, such as `inline-start`                      | `@floating-ui/dom`'s sides are physical; only alignment follows the writing direction. A popup that needs it maps the side from `direction` itself |
| `autoPlacement` and `inline`                               | No planned popup needs them. Each would be a file of its own here, added with the popup that does                                                  |
| Updating on every animation frame (`animationFrame`)       | For an anchor moved by a transform animation; it runs every frame while open. Add it as an option when a popup needs it                            |
| The `absolute` strategy, for a popup outside the top layer | Every positioned popup is a popover in the top layer (#94)                                                                                         |
| A positioned wrapper around the popup                      | The popover is the top-layer element, so it is the one positioned (PLAN.md section 8, "API conventions")                                           |
| `hide`'s `escaped` strategy                                | Only `referenceHidden` is asked for: a popup whose anchor has scrolled away                                                                        |
| A collision boundary other than the viewport               | The popup is in the top layer, so only the viewport clips it. `flip`, `shift` and `size` still take `boundary` and pass it on                      |
| Placement in jsdom                                         | jsdom has no layout; those cases run in Chromium. The cases without layout (what is written and when, stale results) run in both                   |
| Firefox and WebKit                                         | Tests run in Chromium (PLAN.md section 5)                                                                                                          |
| Device pixel ratios other than the test browser's          | Vitest cannot change it per test. The test checks that the written position is a whole number of device pixels at the ratio it runs with           |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out, `@floating-ui/dom` counted.

Measured on 2026-11-22. Each file alone counts the code it shares with
`createPosition` inside `@floating-ui/dom`, so the second column, an app with
`createPosition` and that file less one with `createPosition` alone, is what
a popup pays to add the middleware.

| File                | Alone   | Added to `createPosition` | Budget  |
| ------------------- | ------- | ------------------------- | ------- |
| `createPosition.ts` | 5,545 B | –                         | 6,650 B |
| `offset.ts`         | 588 B   | 294 B                     | 700 B   |
| `flip.ts`           | 1,215 B | 847 B                     | 1,450 B |
| `shift.ts`          | 509 B   | 245 B                     | 600 B   |
| `size.ts`           | 810 B   | 465 B                     | 1,000 B |
| `arrow.ts`          | 870 B   | 454 B                     | 1,050 B |
| `hide.ts`           | 526 B   | 251 B                     | 650 B   |

`createPosition` with `offset`, `flip` and `shift`, what Popover and Tooltip
will likely use, is 6,841 B; with every middleware, 7,869 B. Of
`createPosition`, nearly all is `computePosition` and `autoUpdate` (#94 measured
them at 4,583 B and 2,187 B alone).
