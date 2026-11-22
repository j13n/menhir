# Tooltip

A short text that describes an element, such as what an icon button does or
the shortcut for it, shown when the pointer rests on the element or when it
receives keyboard focus: the WAI-ARIA tooltip pattern. The second positioned
popup, after Popover (#33), and the first that opens on hover and on focus.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Read       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 2026-11-22 |
| WAI-ARIA [tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/), marked "work in progress; it does not yet have task force consensus", with no date of its own: a tooltip appears "when the element receives keyboard focus or the mouse hovers over it", "typically appears after a small delay and disappears when Escape is pressed or on mouse out"; "Tooltip widgets do not receive focus"; "Escape: Dismisses the Tooltip"; focus stays on the trigger; opened by focus, it is dismissed when the trigger "no longer has focus (onBlur)"; opened by the pointer, "it remains open as long as the cursor is over the trigger element or the tooltip"; the container has role `tooltip`, and the trigger "references the tooltip element with aria-describedby". Content a user must reach goes in "a non-modal dialog" | 2026-11-22 |
| WCAG 2.2 [Understanding 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (updated 2026-07-12). Dismissible: "without moving pointer hover or keyboard focus". Hoverable: "the pointer can be moved over the additional content without the additional content disappearing". Persistent: it "remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid"                                                                                                                                                                                                                                                                                                                                                      | 2026-11-22 |
| Size: PLAN.md section 6, rules 3 and 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 2026-11-22 |
| [Selectors Level 4](https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo) (Editor's Draft): `:focus-visible` matches when the browser judges a focus indicator is wanted, which it is after keyboard focus and not after a mouse press on a button; Baseline Widely available                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 2026-11-22 |
| [Accessible Name and Description Computation 1.2](https://www.w3.org/TR/accname-1.2/): an element referenced directly by `aria-describedby` gives its text even when hidden                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 2026-11-22 |

## Shape

`Tooltip.Root` renders no element: it holds the open state and the hover
delays. `Tooltip.Trigger` renders a native `<button type="button">`, the
element described. `Tooltip.Popup` renders a `<div popover="manual"
role="tooltip">`, placed against the Trigger, and inside it `Tooltip.Arrow`
renders a `<div>` that points at the Trigger. `Tooltip.Group` renders no
element: the tooltips inside it form a delay group.

```tsx
<Tooltip.Group>
  <Tooltip.Root>
    <Tooltip.Trigger aria-label="Bold">
      <BoldIcon />
    </Tooltip.Trigger>
    <Tooltip.Popup sideOffset={6}>
      <Tooltip.Arrow />
      Bold (Ctrl+B)
    </Tooltip.Popup>
  </Tooltip.Root>
  …
</Tooltip.Group>
```

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser** (`popover="manual"`, #94): the top layer, with no portal.
  A `manual` popover is not closed by Escape, a press outside or another
  popover opening, so it neither closes nor is closed by a Popover or a
  menu. `popover="hint"` would close on Escape, but it is not Baseline.
- **The `floating` layer**: `hover` (opening after the delay, closing when
  the pointer leaves the Trigger and the Popup, with the safe area between
  them) and `escape` from the Root, `group` from the Group, presence and
  `positioning` with `offset`, `flip` and `shift` from the Popup, and
  `arrow` from the Arrow. Nothing wraps Tab, moves focus, locks the page's
  scroll or closes on a press outside: `menhir/tooltip` bundles no
  `tabWrap`, `tabbable`, `scroll-lock`, `outsidePress`, `dialogClose` or
  `popoverClose` (`test/bundle-size/popupModules.ts`).
- **The parts**: opening on keyboard focus and closing on blur, keeping the
  tooltip open while the Trigger is hovered or focused, closing it when the
  Trigger is pressed, the description link and a disabled Trigger.

### Decisions

- **Parts.** Root, Trigger, Popup and Arrow, as Popover's (PLAN.md section 8,
  "Positioned popups"), with no Title, Description or Close: the Popup's
  text is the description, and a tooltip holds nothing to press. **The
  Group** is the part that makes a delay group (#30): it renders no element,
  creates the group with its `delay` and `timeout` props and provides it
  through context, and each Root inside joins it. An app that renders no
  Group does not bundle `hover/group` (`test/package`).
- **The state and delays are on the Root**: `open`, `defaultOpen`,
  `onOpenChange`, and `delay` (default 600 ms) and `closeDelay` (default 0),
  as decided with hover intent (PLAN.md section 8, "Hover delays"). In a
  Group, a Root without its own `delay` takes the Group's.
- **It opens** when a mouse or a pen rests on the Trigger for `delay`
  (`trigger-hover`), and at once when the Trigger receives keyboard focus
  (`trigger-focus`, a new reason). Keyboard focus is focus that matches
  `:focus-visible`: **a press that focuses the Trigger does not open it**,
  since the user pointed at the Trigger to press it and the tooltip would
  only cover what the press opens. A touch opens nothing (#30): a tap gives
  a button focus, but not `:focus-visible`.
- **It closes** on Escape (`escape-key`), on blur (`trigger-focus`), when
  the pointer has left the Trigger and the Popup (`trigger-hover`), and
  **when the Trigger is pressed** (`trigger-press`), by pointer or by Enter
  or Space: the press does what the button does, such as opening a menu or
  a dialog, which the tooltip would cover. A tooltip closed by a press
  stays closed while the pointer stays on the Trigger (#30) and while the
  Trigger keeps its focus, and a press before the hover delay has ended
  cancels the opening until the pointer leaves and comes back: hover's
  `disabled` holds from a press until the pointer next enters the Trigger.
  A press by Enter or Space, with the pointer elsewhere, holds nothing back.
- **Hovered or focused keeps it open** (WCAG 1.4.13, persistent). The close
  from hover is ignored while the Trigger has keyboard focus, and the close
  on blur while the pointer is on the Trigger or the Popup (`:hover`). So a
  tooltip opened by focus stays open when the mouse passes over and away,
  and one opened by hover stays open when focus leaves while the pointer
  rests on it. Each then closes when the other condition ends. In a Group,
  hovering another Trigger opens its tooltip and closes the one open, unless
  that one's Trigger has keyboard focus: then both stay open until the
  focus leaves.
- **Focus returned to the Trigger opens it**, when it matches
  `:focus-visible`, as after Escape closes a dialog that the Trigger opened
  by keyboard: the user is back on the Trigger, by keyboard, and the browser
  shows its focus ring too.
- **Scrolling closes nothing of its own.** The tooltip follows its Trigger
  (`autoUpdate`). A scroll under a still pointer moves the pointer off the
  Trigger, which closes a tooltip opened by hover, as #30 decided; one
  opened by focus stays open while the Trigger has focus.
- **The Trigger always names the Popup** in `aria-describedby`. A closed
  Popup stays in the document, `display: none` (#96), and an element
  referenced directly by `aria-describedby` gives its text even when hidden
  (AccName), so the Trigger has its description whether the tooltip is open
  or not, and in the server HTML before hydration. A screen reader that
  reaches the Trigger without moving focus, as a virtual cursor does, reads
  it too. The Popup's `id` is the Root's, generated with `createUniqueId`,
  since the Trigger before it names it (PLAN.md section 8, "Generated ids
  belong to the root"). The consumer's `aria-describedby` on the Trigger
  wins, kept out of the merge as on a Popup ("`undefined` is a value");
  `aria-describedby={false}` removes the link, for a tooltip that only
  repeats the Trigger's name.
- **A tooltip is not a name.** The description is read after the Trigger's
  name, so an icon button still needs an `aria-label`. A Trigger whose
  `aria-label` and tooltip say the same thing passes
  `aria-describedby={false}`, so it is not read twice.
- **No interactive content.** The Popup never takes focus, and nothing in it
  can be reached by keyboard: Tab from the Trigger goes on to the element
  after it. Content a user must reach, such as a link or a button, belongs
  in a Popover (#33).
- **A disabled Trigger opens nothing.** A disabled `<button>` cannot be
  focused, so keyboard users would never see its tooltip, and Chromium fires
  pointer events on it while other engines have not always done so (#30).
  So the Root asks the Trigger's `disabled` when the pointer enters and opens
  nothing. To describe an unavailable action, use `aria-disabled="true"`
  instead: the Trigger stays focusable, opens its tooltip on hover and on
  focus, and the app ignores its presses.
- **The Trigger may be any element** that takes focus, such as a link, and
  no warning is given for one that is not a `<button>`: the tooltip needs
  only focus and pointer events. It keeps `type="button"`.
- **The positioning props** are Popover's, on the Popup: `side` (default
  `"top"`, where a tooltip is usually expected and the pointer does not
  cover it), `align` (default `"center"`), `sideOffset` and `alignOffset`
  (default 0), `collisionPadding` (default 5) and `anchor`. The Popup gets
  `data-side`, `data-align`, `--anchor-width`, `--anchor-height` and
  `--transform-origin`.
- **The Arrow** is Popover's (PLAN.md section 8, "Positioned popups"), written
  again: a popup may import only the popup it builds on (PLAN.md section 6,
  rule 4), and Tooltip does not build on Popover.
- **The server renders a `defaultOpen` Tooltip closed**, and hydration opens
  it, as for every popup (PLAN.md section 8, "Popups").
- **Exit animations** run for every close, through presence: no close is the
  browser's, since a `manual` popover is never hidden by it.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element against the part conventions. "A" marks a case the WAI-ARIA
tooltip pattern requires, "W" a case of WCAG 1.4.13, "C" a case that runs
only in Chromium (`it.skipIf(isJSDOM)`): jsdom has no `popover`, no layout,
no real pointer, and matches `:focus-visible` on any focus and `:hover`
never. Hover in jsdom comes from Testing Library's pointer events with fake
timers; real pointer movement from the Chrome DevTools Protocol
(`test/floating/input.ts`). In jsdom an opened popover gets
`:popover-open` from a stub (`test/popover/stubPopover.ts`).

`root/TooltipRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default: the Popup is not shown, and every part has `data-closed`
- `defaultOpen` starts open: the Popup is shown, and every part has `data-open`
- Opens after 600 ms of a mouse resting on the Trigger, and reports `trigger-hover` with the `pointerenter` (A: after a small delay)
- `delay` and `closeDelay` change the delays
- Closes when the pointer leaves the Trigger, reporting `trigger-hover` (A: on mouse out)
- Escape closes it, reporting `escape-key`, and focus stays on the Trigger (A: Escape; W: dismissible)
- Controlled open: hover leaving and Escape only ask, and it stays open
- Controlled closed: hover and focus only ask, and it stays closed
- Follows a controlled value changed from outside, showing and hiding the Popup
- Opens before async work that `onOpenChange` starts settles (PLAN.md "API conventions")

`trigger/TooltipTrigger.test.tsx`

- Renders a button with type `button`, named by its content, taking the consumer's `id`
- Has `aria-describedby` naming the Popup, and its description is the Popup's text while closed and while open (A: `aria-describedby`)
- The consumer's `aria-describedby` wins, and `false` removes it
- Keyboard focus opens it at once, reporting `trigger-focus` (A: on keyboard focus)
- Tab onto the Trigger opens it, and Tab away closes it, reporting `trigger-focus` (A: dismissed on blur; C)
- A press that focuses the Trigger does not open it (C)
- A press on the Trigger closes the open tooltip, reporting `trigger-press`, and it stays closed while the pointer stays (C)
- A press before the hover delay ends opens nothing until the pointer leaves and comes back
- A press by keyboard, with the pointer elsewhere, does not stop the next hover from opening it
- Enter and Space on the Trigger close the tooltip opened by focus, and it stays closed while the Trigger keeps focus (C)
- A tap opens nothing (C)
- Opened by focus, it stays open when the pointer enters and leaves the Trigger, and closes on blur (W: persistent; C)
- Opened by hover, it stays open when the Trigger loses focus while the pointer rests on it, and closes when the pointer leaves (W: persistent; C)
- A disabled Trigger opens nothing on hover; one with `aria-disabled` opens on hover and on focus (also C, with a real pointer)
- Calls the consumer's `onClick`, `onFocus` and `onBlur`
- Does not submit its form
- `render` with a link keeps the Trigger's behaviour
- Throws a descriptive error outside `Tooltip.Root`

`popup/TooltipPopup.test.tsx`

- Renders a `<div popover="manual">` with the `tooltip` role and the Root's `id`, hidden until opened
- Opened, it is in the top layer, above an element with a high `z-index` (C)
- Never takes focus: opening leaves focus on the Trigger, and Tab goes from the Trigger to the element after it (A: does not receive focus; C)
- The pointer may move from the Trigger across the gap onto the Popup, and it stays open, then closes once the pointer leaves both (A: over the trigger or the tooltip; W: hoverable; C)
- Placed above the Trigger by default, and on each `side`, with `data-side` and `data-align` (C)
- `sideOffset` moves it away from the Trigger (C)
- At the top edge of the viewport it flips below (C)
- `anchor` places it against another element (C)
- Stays open when a Popover opens, and a Popover stays open when it opens (C)
- Stays shown, with `data-closed`, while its exit animation runs after Escape, then hides (C)
- `render` with a `<div>` keeps its behaviour
- Throws a descriptive error outside `Tooltip.Root`

`arrow/TooltipArrow.test.tsx`

- Renders an `aria-hidden` `<div>`
- Points at the Trigger's center, with the Popup's `data-side` and `data-align` (C)
- Throws a descriptive error outside `Tooltip.Popup`

`group/TooltipGroup.test.tsx`

- Renders no element of its own
- With one tooltip of the group open, hovering another opens it at once and closes the first
- Within `timeout` of the last closing, the next opens at once; after it, the next waits its delay
- The Group's `delay` applies to a Root without one, and a Root's own wins
- A tooltip outside the Group waits its delay while one inside is open

`Tooltip.popups.test.tsx`

- A Popover opened by pressing the Trigger, by pointer or by Enter, closes the tooltip, and the first Escape closes the Popover (#26; C)
- A Dialog opened by pressing the Trigger, by pointer or by Enter, closes the tooltip, and the first Escape closes the Dialog (#26; C)
- A tooltip inside a Dialog: Escape closes the tooltip, and the Dialog stays open until the next Escape (C)

`test/tooltip/Tooltip.hydrate.test.tsx`

- The server HTML of a closed Tooltip has the Trigger with its type and `aria-describedby` naming a hidden popover with its role, `id` and `data-closed`, before any script runs (PLAN.md section 10)
- The server HTML of a `defaultOpen` Tooltip has a hidden popover with `data-open` and no position
- Hydration adopts the server's elements without warnings; a `defaultOpen` Tooltip is then shown and placed
- After hydration the tooltip opens on hover and on keyboard focus (C)

## Left out

| Case                                             | Reason                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opening on a long press, or on a tap             | A tooltip is not a name, so the Trigger must be usable without it; a long press brings up the browser's own callout (#30). A file of its own if asked                                                                                                                                                             |
| Interactive content in the Popup                 | See "Decisions": it belongs in a Popover                                                                                                                                                                                                                                                                          |
| A tooltip that follows the pointer               | No pattern asks for it. `anchor` takes a virtual element, which an app can move                                                                                                                                                                                                                                   |
| Closing on scroll                                | See "Decisions": it follows the Trigger, and a scroll under the pointer closes a tooltip opened by hover                                                                                                                                                                                                          |
| A `disabled` prop on the Root                    | A controlled `open={false}` keeps it closed; a flag would ship in every app (PLAN.md section 6, rule 6)                                                                                                                                                                                                           |
| A Trigger outside the Root, or several Triggers  | As for the other popups (PLAN.md section 8, "Popups"). Put one Root around each Trigger                                                                                                                                                                                                                           |
| A dialog or popover opened above an open tooltip | Dismissal leaves it here (#26): pressing the Trigger closes the tooltip, by pointer or keyboard (`Tooltip.popups.test.tsx`), rather than the focus or hover a popup takes, which a popover does not take. A popup opened by other means, such as a shortcut, is not covered: Escape would close the tooltip first |
| `size` and `hide` middleware                     | As on Popover: no part carries them, and a prop would be a flag                                                                                                                                                                                                                                                   |
| `popover="hint"` and `interestfor`               | Not Baseline (#94)                                                                                                                                                                                                                                                                                                |
| An element with only a `title` attribute         | The browser's own tooltip is not Menhir's to style or time; a Trigger should not carry a `title` as well, or both are shown                                                                                                                                                                                       |
| Tried with screen readers                        | Not yet: Chromium's accessibility tree shows the Trigger's description, open and closed. VoiceOver, NVDA and JAWS are still to be tried (#119)                                                                                                                                                                    |
| Firefox and WebKit                               | Tests run in Chromium (PLAN.md section 5). #94 ran a `manual` popover in all three engines; `:focus-visible` and `:hover` are Widely available                                                                                                                                                                    |

## Browsers and screen readers

Tried on 2026-11-22 in Chromium (Playwright's headless build, through the
test suite). The `manual` popover's behaviour was run in Chromium, Firefox
and WebKit in #94. No screen reader has been tried yet.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-22.

| Entry point      | Size    | Budget  |
| ---------------- | ------- | ------- |
| `menhir/tooltip` | 9,780 B | 11.5 kB |

Most of it is `@floating-ui/dom`, as for Popover (9,599 B): `createPosition`
with `offset`, `flip` and `shift`, and the `arrow` middleware from the Arrow.
The rest is `hover` (905 B in #30, the safe area included), `group` from the
Group (251 B), `escape` (344 B), presence and the parts. An app that renders
no Group does not bundle `hover/group`, and one that renders no Arrow does
not bundle its middleware (`test/package`).
