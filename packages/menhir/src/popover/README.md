# Popover

A non-modal popup placed against its trigger, such as a few settings, a
short form or details about an item, that leaves the page usable while it is
open: the WAI-ARIA dialog pattern, read for a non-modal dialog, since there
is no popover pattern. The first positioned popup, which settles the parts
every positioned popup has (PLAN.md section 8, "API conventions").

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                 | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                 | 2026-11-22 |
| [WAI-ARIA dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), read for a non-modal dialog: the `dialog` role, a name from `aria-labelledby` or `aria-label`, an optional `aria-describedby`, Escape closes it, a visible close button, focus returns to the element that invoked it. It names nothing on the button that opens the dialog | 2026-11-22 |
| WCAG 2.2 [Understanding 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (updated 2026-10-04): a non-modal dialog's elements come in the focus order right after its trigger, then the element after the trigger (technique SCR26); a dialog not adjacent to its trigger in the focus order fails (F85)                                | 2026-11-22 |
| Size: PLAN.md section 6, rules 3 and 6                                                                                                                                                                                                                                                                                                                                 | 2026-11-22 |
| HTML standard, [the `popover` attribute](https://html.spec.whatwg.org/multipage/popover.html) (last updated 2026-11-22): light dismiss counts a press on a `popovertarget` button as a press on its popover; hiding returns focus to the element focused before the popover opened, if focus is inside it; place the popover right after its trigger in the DOM        | 2026-11-22 |

## Shape

`Popover.Root` renders no element: it holds the open state and shares it.
`Popover.Trigger` renders a native `<button type="button">` that opens and
closes the popover. `Popover.Popup` renders a `<div popover="auto"
role="dialog">`, placed against the Trigger, and inside it `Popover.Arrow`
renders a `<div>` that points at the Trigger, `Popover.Title` an `<h2>`,
`Popover.Description` a `<p>` and `Popover.Close` a `<button type="button">`
that closes it.

```tsx
<Popover.Root>
  <Popover.Trigger>Notifications</Popover.Trigger>
  <Popover.Popup sideOffset={8}>
    <Popover.Arrow />
    <Popover.Title>Notifications</Popover.Title>
    <Popover.Description>You are all caught up.</Popover.Description>
    <Popover.Close>Close</Popover.Close>
  </Popover.Popup>
</Popover.Root>
```

Render the Popup right after the Trigger: Tab then moves from the Trigger
into the Popup and on to what follows it, as WCAG's focus order asks.

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser** (`popover="auto"`, #94): the top layer, light dismiss by
  a press outside, Escape and other close requests, focus back on the
  Trigger when the popover closes with focus inside it, the Tab order of a
  popover rendered after its trigger, and nested popovers closing one at a
  time.
- **The `floating` layer**, all from the Popup: presence (`showPopover()`
  and `hidePopover()`, after exit animations), `popoverClose` (the reason
  for a close the browser made, a refused close shown again),
  `initialFocus` and `returnFocus` (the props of the same names), and
  `positioning` with `offset`, `flip` and `shift`, plus `arrow` from the
  Arrow. Nothing wraps Tab, locks the page's scroll or opens it on hover:
  `menhir/popover` bundles no `tabWrap`, `tabbable`, `scroll-lock` or
  `hover` (`test/bundle-size/popupModules.ts`).

### Decisions

- **Parts.** Dialog's (#31), plus the Arrow. The Root is state, so it has no
  element. The Trigger and Close are buttons that change the state with a
  reason. The Popup is the `popover` element, which is also the element
  positioned (PLAN.md section 8, "Positioned popups"): there is no
  positioner part around it. The Title and Description are parts because
  the Popup names them. The Arrow is a part because the Popup has to place
  it, and because an app that renders none does not bundle the `arrow`
  middleware (PLAN.md section 6, rule 6).
- **No Anchor part.** The Popup is placed against the Trigger, or against
  its `anchor` prop: an element, a virtual element (a
  `getBoundingClientRect()`, such as a point or a text selection), or a
  function returning one, which is how an element reached through a ref is
  passed (`anchor={() => field}`), as with `initialFocus`. A part would
  only mark an element for the same purpose and cost a context and a
  registration in every app that uses one.
- **Non-modal only.** Tab moves from the Trigger into the Popup and on to
  what follows the Trigger, which the browser does for a popover rendered in
  place (#94). Escape and a press outside close it, the browser's light
  dismiss; focus leaving it does not. **A modal Popover is left out**: a
  `modal` flag would ship the Tab wrap and the scroll lock in every app
  (PLAN.md section 6, rule 6), and a part or a ref factory over a widened
  `createTabWrap` would be a second way to build what Dialog is. A popup
  that keeps focus inside until it closes is a Dialog (#27's options are in
  #33).
- **The Trigger has `popovertarget`**, naming the Popup, so the browser
  counts a press on it as a press on the popover: light dismiss leaves the
  popover open on pointer down, and the Trigger's own click closes it. The
  click opens and closes the popover through the Root's state, as Dialog's
  Trigger does, and calls `preventDefault()`, which stops the browser from
  toggling it too. So the popover is shown in the same flush as its
  placement, before it is painted, a controlled popover that keeps its state
  needs nothing to undo, and the reason is `trigger-press` with the click.
  Following the browser's own toggle would show the popover a task before
  its state, and it could be painted unplaced in between.
- **The Trigger's attributes**: `aria-haspopup="dialog"`, since the Popup
  has the `dialog` role; `aria-expanded`, `"true"` or `"false"` by the
  state, since the Trigger stays in the page while the popover is open and
  its state is read out; and `aria-controls` naming the Popup, which is
  always in the document. Chromium exposes `aria-expanded` from
  `popovertarget` already (#94), but not every engine is known to, and the
  attribute costs a few bytes. There is no WAI-ARIA popover pattern; the
  dialog pattern names nothing on the button, and these are the disclosure
  pattern's states for a button that shows content after it.
- **The Popup has the `dialog` role**, not `aria-modal`, and is named by its
  Title and described by its Description, as Dialog's Popup is (PLAN.md
  section 8, "Popups"): `aria-labelledby` and `aria-describedby` only while
  they are rendered, the consumer's winning. Without a Title, give it an
  `aria-label`.
- **The Popup's `id` is the Root's**, generated with `createUniqueId`, since
  the Trigger before it names it in `popovertarget` and `aria-controls`
  (PLAN.md section 8, "Generated ids belong to the root"). The Popup takes
  no `id` from the consumer.
- **The positioning props** are those of #25, on the Popup: `side`
  (default `"bottom"`), `align` (default `"center"`), `sideOffset` and
  `alignOffset` (default 0), and `collisionPadding` (default 5, so the
  popup does not touch the viewport's edge). `flip` and `shift` keep it in
  view; the Popup gets `data-side`, `data-align`, `--anchor-width`,
  `--anchor-height` and `--transform-origin`.
- **The Arrow** registers the `arrow` middleware with the Popup once
  mounted, and `createPosition` writes its `left` or `top` so that it points
  at the anchor's center. The consumer's CSS puts it on the edge, by the
  Popup's `data-side`; the Arrow carries `data-side` and `data-align` too,
  for a utility class. It is `aria-hidden`.
- **The server renders a `defaultOpen` Popover closed**, and hydration opens
  it, as Dialog does (PLAN.md section 8, "Popups"). A closed popover is
  `display: none` in the browser's stylesheet, so the server HTML cannot
  show it, and it could not be placed there either. The `data-*` and
  `aria-expanded` attributes follow the state, so the server's Trigger of a
  `defaultOpen` Popover says `aria-expanded="true"` until hydration shows
  the popover, a moment later.
- **A close the browser makes is not animated.** Escape and a press outside
  hide the popover in the browser, and `beforetoggle` cannot be cancelled on
  closing, so presence cannot hold it (#96). The Trigger and Close close it
  through its state, so their close waits for the exit animation. Showing
  the popover again to animate its exit would flash it in Firefox and
  WebKit, and cost bytes in every app.
- **`initialFocus` and `returnFocus` are props of the Popup**, as on Dialog.
  Without them focus stays on the Trigger when the popover opens, unless an
  element inside has `autofocus`, and returns to the Trigger when it closes
  with focus inside.
- **Focus returns to the Trigger in a nested popover too.** The browser
  returns focus only for the first popover of a stack (HTML standard, the
  show popover steps), so a popover nested in another, closed by Escape or
  its Close with focus inside, left focus on the `<body>`. Without a
  `returnFocus`, the Popup moves it to its Trigger when focus was inside as
  it closed, which it reads on `beforetoggle`. A focus that left before, such
  as a press on the page that light-dismissed the popover, stays where it
  is.
- **A controlled Popover with no Trigger** needs an `anchor`, or it is not
  placed.
- **Nested popups** need nothing of their own: a Popover inside another's
  Popup, a Popover inside a Dialog and a Dialog opened from a Popover are
  in the DOM tree of the popup around them, which the browser nests by, so
  each Escape closes the topmost and focus returns step by step.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element against the part conventions. "A" marks a case the WAI-ARIA
dialog pattern requires as it applies to a non-modal popup, "W" a case of
WCAG 2.4.3, "C" a case that runs only in Chromium (`it.skipIf(isJSDOM)`):
jsdom has no `popover`, no layout, no focus order and no real input. In
jsdom an opened popover gets `:popover-open` from a stub
(`test/popover/stubPopover.ts`).

`root/PopoverRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default: the Popup is not shown, and every part has `data-closed`
- `defaultOpen` starts open: the Popup is shown, and every part has `data-open`
- Uncontrolled: the Trigger opens it, the Trigger closes it again, and Close closes it; `onOpenChange` gets each value with its reason and event (`trigger-press`, `close-press`)
- Controlled open: the Trigger and Close only ask, and the popover stays open
- Controlled closed: the Trigger only asks, and the popover stays closed
- Follows a controlled value changed from outside, showing and hiding the popover
- Opens before async work that `onOpenChange` starts settles (PLAN.md "API conventions")

`trigger/PopoverTrigger.test.tsx`

- Renders a button with type `button`, `aria-haspopup="dialog"`, `popovertarget` and `aria-controls` naming the Popup
- `aria-expanded` is `"false"` while closed and `"true"` while open
- Named by its content, and takes the consumer's `id`
- Opens on click, and on Enter and Space with focus on it (C)
- A press on the open popover's Trigger closes it and does not open it again (C)
- Does not submit its form
- Calls the consumer's `onClick` once per click
- `render` with a button component keeps the Trigger's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Popover.Root`

`popup/PopoverPopup.test.tsx`

- Renders a `<div popover="auto">` with the `dialog` role and the Root's `id`, hidden until opened
- Opened, it is in the top layer, above an element with a high `z-index`, and not modal: a button outside can still be focused and pressed (C)
- Named by its Title in `aria-labelledby` and described by its Description in `aria-describedby` (A: name, optional description)
- Without a Title or Description, has no `aria-labelledby` or `aria-describedby`; an `aria-label` names it (A: `aria-label`)
- A Title or Description rendered later, or removed, is named or no longer named
- The consumer's `aria-labelledby` and `aria-describedby` win over the parts'
- Opening leaves focus on the Trigger; an element with `autofocus` inside takes it (C)
- `initialFocus` moves focus inside on opening (A: focus moves inside; C)
- Tab from the Trigger moves into the Popup, and from its last element to the element after the Trigger; Shift+Tab goes back (W; C)
- Escape closes it, reporting `escape-key`, and focus returns to the Trigger (A: Escape, return focus; C)
- A press outside closes it, reporting `outside-press`; a press inside does not (C)
- Focus leaving it does not close it (C)
- A controlled Popover that stays open after Escape is shown again, and the close is reported once (C)
- `returnFocus` moves focus to another element on close (A: return focus elsewhere; C)
- Placed against the Trigger on each side, with `data-side` and `data-align` (C)
- `sideOffset` and `alignOffset` move it from the Trigger (C)
- Placed before it is painted when it opens (C)
- At each edge of the viewport, flips to the other side or shifts along, `collisionPadding` away from the edge (C)
- `anchor` places it against another element, through a function for a ref, or a virtual element (C)
- Stays shown, with `data-closed`, while its exit animation runs after Close, then hides (C)
- `render` with a `<div>` keeps its behaviour
- Throws a descriptive error outside `Popover.Root`

`arrow/PopoverArrow.test.tsx`

- Renders an `aria-hidden` `<div>`
- Points at the Trigger's center, also when the Popup has shifted along the viewport's edge (C)
- Has the Popup's `data-side` and `data-align` (C)
- Throws a descriptive error outside `Popover.Popup`

`title/PopoverTitle.test.tsx`, `description/PopoverDescription.test.tsx`

- Render an `<h2>` and a `<p>` with a generated `id`, or the consumer's; two popovers get different ids
- Throw a descriptive error outside `Popover.Root`

`close/PopoverClose.test.tsx`

- Renders a button with type `button`, named by its content (A: a visible close button)
- Closes on click, and on Enter and Space, and focus returns to the Trigger (A: return focus; C)
- Does not submit its form
- Calls the consumer's `onClick` once per click
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Popover.Root`

`Popover.nested.test.tsx`

- A Popover opened from inside another stays open with it; Escape closes the inner one, then the outer one, focus returning to each Trigger in turn (C)
- A press in the outer Popover closes only the inner one (C)
- A Popover inside a Dialog: Escape closes the Popover, then the Dialog, focus returning to each Trigger in turn (C)
- A Dialog opened from a Popover keeps the Popover open; Escape closes the Dialog, then the Popover, focus returning to each Trigger in turn (C)

`test/popover/Popover.hydrate.test.tsx`

- The server HTML of a closed Popover has the Trigger with its type, `popovertarget`, `aria-haspopup`, `aria-expanded="false"` and `aria-controls`, and a hidden popover with its role, `id` and `data-closed`, before any script runs (PLAN.md section 10)
- The server HTML of a `defaultOpen` Popover has a hidden popover with `data-open` and no position
- Hydration adopts the server's elements without warnings; a `defaultOpen` Popover is then shown, placed and named by its Title
- After hydration the Trigger opens the popover by click, and by Enter (C)

## Left out

| Case                                                                                | Reason                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A modal Popover                                                                     | See "Decisions": it is a Dialog. A flag would ship the Tab wrap and scroll lock in every app (PLAN.md section 6, rule 6)                                                                                                          |
| Opening on hover                                                                    | That is Preview Card (Phase 5). `menhir/popover` bundles no `hover` (`test/bundle-size/popupModules.ts`)                                                                                                                          |
| A Trigger outside the Root                                                          | As for Dialog: it would need the Root's state through something other than context in every app. A controlled Popover opens from any button of the app's own, placed with `anchor`                                                |
| Several Triggers for one Popover                                                    | Each would need to be the anchor and the `popovertarget` in turn. Put one Root around each, or control `open` and pass `anchor`                                                                                                   |
| An Anchor part                                                                      | See "Decisions": the `anchor` prop covers it                                                                                                                                                                                      |
| `size` and `hide` (`--available-width`, `--available-height`, `data-anchor-hidden`) | No part carries them, and a prop that turns them on would be a flag that ships them in every app (PLAN.md section 6, rule 6). `flip` and `shift` keep the popover in view. Add them with a reason, such as a popover that scrolls |
| An arrow kept away from the Popup's corners (`padding`)                             | The arrow points at the anchor's center, which is at a corner only when the anchor is at the viewport's edge. Add it when asked                                                                                                   |
| An exit animation after Escape or a press outside                                   | See "Decisions": the browser hides the popover, and `beforetoggle` cannot be cancelled on closing                                                                                                                                 |
| `popover="manual"`, a popover that stays open when another opens                    | That is Tooltip's (#34). An `auto` popover closes the others that are not its ancestors, as the browser does                                                                                                                      |
| Server HTML that shows a `defaultOpen` popover                                      | See "Decisions": a closed popover is `display: none`, and the server cannot place it                                                                                                                                              |
| An imperative handle (`open()`, `close()`)                                          | Control `open` instead (PLAN.md section 8, "Controlled state")                                                                                                                                                                    |
| `disabled` on the Trigger                                                           | Not a prop of the part, as on Dialog; pass it in `render`                                                                                                                                                                         |
| A warning for a Popup that is not right after its Trigger                           | Only the focus order says so, which depends on what the app renders between them; the README and the docs page say where to put it                                                                                                |
| Tried with screen readers                                                           | Not yet: Chromium's accessibility tree shows the Trigger's expanded state and the Popup's role, name and description. VoiceOver, NVDA and JAWS are still to be tried (#119)                                                       |

## Browsers and screen readers

Tried on 2026-11-22 in Chromium (Playwright's headless build, through the
test suite). The behaviour the browser gives (#94) was run in Chromium,
Firefox and WebKit in that spike. No screen reader has been tried yet
(#240).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-22.

| Entry point      | Size    | Budget  |
| ---------------- | ------- | ------- |
| `menhir/popover` | 9,599 B | 11.5 kB |

Most of it is `@floating-ui/dom`: `createPosition` with `offset`, `flip` and
`shift` measured 6,841 B in #25 (`floating/positioning/README.md`), and the
Arrow adds the `arrow` middleware (454 B there). The rest is presence,
`popoverClose`, `initialFocus`, `returnFocus` and the parts. An app that
renders no Arrow does not bundle it or its middleware (`test/package`). Moving Dialog's
id slots to `core/slot.ts`, shared with Popover, added 17 B to Dialog.
