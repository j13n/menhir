# `floating/dismissal`

Closing a popup from outside it, where the browser does not already do it,
and the reason a popup closed (#26). The browser closes the topmost modal
`<dialog>` and `auto` popover on Escape, a popover on a press outside it (its
light dismiss), and nests both (PLAN.md section 8, "What the browser does for
popups"). This folder adds what is left: a press on a dialog's backdrop,
Escape for Tooltip's `manual` popover, keeping a refused close open, and the
reason for each close.

One file per way of closing, so a popup bundles only those it uses
(PLAN.md section 6, rule 6): Alert Dialog has no outside press, Tooltip has
only Escape.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                        | Read       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                        | 2026-11-22 |
| WAI-ARIA [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): "Escape: Closes the dialog."                                                                                                                         | 2026-11-22 |
| WAI-ARIA [tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/): "Escape: Dismisses the Tooltip." Focus stays on the trigger                                                                                                    | 2026-11-22 |
| WAI-ARIA [menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and [menu and menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) patterns: Escape closes the menu that contains focus, and focus returns to its opener | 2026-11-22 |
| WCAG 2.2 [Understanding 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (updated 2026-07-12): dismissible "without moving pointer hover or keyboard focus", such as with Esc    | 2026-11-22 |
| Size: PLAN.md section 6, rules 2 and 6                                                                                                                                                                                                        | 2026-11-22 |
| HTML standard, [the `popover` attribute](https://html.spec.whatwg.org/multipage/popover.html) (last updated 2026-11-22): light dismiss runs on `pointerdown` and `pointerup`, checks no button, and counts a press on the invoker as inside   | 2026-11-22 |

No pattern asks for a press outside to close a popup. The modal dialog
pattern allows it ("in some implementations, attempts to interact with the
inert content cause the dialog to close"), and #94 decided Dialog has it.

## Shape

| File              | Exports              | Used by              | What it does                                                                                                     |
| ----------------- | -------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `reason.ts`       | types only           | every popup          | `OpenChangeReason` and `OpenChangeDetails`, the second argument of `onOpenChange`                                |
| `dialogClose.ts`  | `createDialogClose`  | Dialog, Alert Dialog | Reports a modal dialog the browser closed (Escape, a close request, a form), once, and opens it again if refused |
| `outsidePress.ts` | `createOutsidePress` | Dialog               | Reports a press on a dialog's backdrop                                                                           |
| `popoverClose.ts` | `createPopoverClose` | Popover, the menus   | Reports an `auto` popover the browser closed, with the reason, and shows it again if refused                     |
| `escape.ts`       | `createEscape`       | Tooltip              | Reports Escape for a `manual` popover, the topmost only, and keeps the popups below it open                      |

Each takes its options as getters and an `onDismiss(details)` callback. The
popup closes through its own setter, so a controlled popup only asks
(`createControllableSignal`, PLAN.md section 8, "A part's own state is not
held by its consumer's async work"):

```ts
const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
  get value() { return props.open; },
  get defaultValue() { return props.defaultOpen ?? false; },
  onChange: (value, details) => props.onOpenChange?.(value, details),
});
createDialogClose({
  get dialog() { return dialog; },
  get open() { return open(); },
  onDismiss: (details) => setOpen(false, details),
});
```

- **Listeners exist only while open.** Each module's effect adds them when
  `open` turns true and removes them when it turns false or the owner is
  disposed. Effects do not run on the server, so nothing is added there,
  and nothing runs at import time.
- **Elements are read once open**, in the effect's apply, after refs are
  assigned.
- **A close the popup made itself is not reported.** When the popup's state
  turns false, the component calls `close()` or `hidePopover()`; the
  modules check `open` first and stay quiet.

### The reasons

The second argument of `onOpenChange` is `{ reason, event }` (PLAN.md
section 8, "Change callbacks receive the new value only"). `event` is the
event that caused the change: the key or pointer event when one did, else
the browser's own `cancel`, `close` or `beforetoggle`. Later components add
reasons; they do not rename these.

| Reason          | When                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `escape-key`    | Escape: a dialog's `cancel` after an Escape key, a popover the browser closed on Escape, a Tooltip's own listener                 |
| `outside-press` | A press outside: on a dialog's backdrop, or a popover's light dismiss                                                             |
| `trigger-press` | The trigger was pressed, by pointer or keyboard: a popover's `popovertarget` closing it                                           |
| `close-request` | The browser closed the popup for another reason: the back gesture on Android, a `<form method="dialog">`, another popover opening |

### Decisions

- **Outside press closes on release,** as the browser's light dismiss does:
  the `click` that ends a primary-button press which also started on the
  backdrop. The backdrop is a press whose target is the `<dialog>` itself
  and whose point is outside its border box, since a press on the dialog's
  padding or its own scrollbar targets the `<dialog>` too. A drag that
  starts inside and ends on the backdrop, a secondary button (no `click`)
  and a touch that scrolls (`pointercancel`, no `click`) do not close.
- **Tooltip's Escape is marked handled, and carries on.** Its listener calls
  `preventDefault()`, so the browser does not also close a dialog or
  popover below it, and does not stop propagation, so the app's own key
  listeners still see the key, and can tell from `defaultPrevented` that
  something handled it. It ignores a key already handled
  (`defaultPrevented`) and a key while an input method is composing
  (`isComposing`).
- **The topmost Tooltip only.** Listeners on one target and phase run in the
  order they were added, and a Tooltip adds its listeners when it opens. In
  the capture phase each open Tooltip claims the key on the event, so the
  last one opened holds the claim; in the bubble phase only that one
  closes. No shared stack (`floating/README.md`).
- **The reason for a browser close** comes from the input event of the same
  task: the browser fires `cancel` and `beforetoggle` synchronously while it
  handles the key or pointer event (Chromium, checked on 2026-11-22). A
  capture listener notes an Escape key, a pointer released outside or on
  the trigger and a click on the trigger, and forgets it in a timer, so a
  later close is not blamed on it. A click elsewhere is not a press
  outside: a key fires `click` too, such as Enter on another popover's
  trigger. A popover's close is reported on `beforetoggle`, not `toggle`,
  which comes a task later. The timing was checked in Chromium only; #94
  ran the browser's own part in all three engines.
- **A refused close is reopened, and reported once.** A dialog's `cancel` is
  always prevented, so the popup's state decides; the browser closes it
  anyway on a second Escape (`cancel` is not cancelable then), and the
  `close` that follows is not reported again; once the state has settled
  (`onFlush`) and still says open, the module calls `showModal()` again. A
  popover's close cannot be refused. On its `toggle`, a task after it is
  hidden and the state has settled, the module calls `showPopover()` again
  if the state still says open. Not in an `onFlush` from `beforetoggle`:
  with real input that flush runs inside the browser's hide, while the
  popover is still showing.
- **For Popover (#33):** follow an opening by the trigger on `toggle`, not
  `beforetoggle`. With real input, the state's flush would run inside the
  browser's show, and an effect that calls `showPopover()` would throw
  (`test/floating/dismissal/Popover.tsx`).
- **Focus leaving closes nothing here.** The browser leaves a popover open
  when focus leaves it (#94), and a modal dialog keeps focus. Tooltip
  closes on blur of its trigger, which is Tooltip's own (#34).
- **No way to declare an element inside** that is not in the popup, such as
  a toast: no popup of this phase needs one. A dialog's backdrop covers the
  page, and a popover's light dismiss is the browser's.
- **Refusing a close needs the controlled form** (PLAN.md section 8,
  "Nothing cancels the part's handler"): the details have no `cancel()`.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no top layer, no light dismiss, no close
requests and no layout. Real key and pointer input, which the browser
acts on, comes from `vitest/browser` and the Chrome DevTools Protocol
(`test/floating/dismissal/input.ts`). The test popups in
`test/floating/dismissal/` (`Dialog.tsx`, `Popover.tsx`, `Tooltip.tsx`)
wire each module as a popup component will, through
`createControllableSignal`.

`dialogClose.test.tsx`

- Escape reports `escape-key` with the key event, and an uncontrolled dialog closes (C)
- A controlled dialog that keeps `open` stays open and modal on the first Escape (C)
- On the second Escape the browser closes it anyway: it is reported once and opened again, modal (C)
- A dialog closed by a `<form method="dialog">` reports `close-request`, and closes (C)
- A dialog the popup closed itself reports nothing (C)
- Nested dialogs: Escape closes the topmost only, one per press (C)
- Listeners exist only while open, and are removed on close and on disposal

`outsidePress.test.tsx`

- A press on the backdrop reports `outside-press` with the click, and closes (C)
- A press inside, and on the dialog's padding, does not close (C)
- A press that starts inside and ends on the backdrop, such as a dragged text selection, does not close (C)
- A press that starts on the backdrop and ends inside does not close (C)
- A press where the trigger is, under the backdrop, closes and does not reopen (C)
- A secondary-button press on the backdrop does not close (C)
- A press on the dialog's own scrollbar does not close (C)
- A touch on the backdrop that scrolls the page does not close; a tap does (C)
- A press in an iframe inside the dialog does not close (C)
- Nested dialogs: a press on the topmost backdrop closes the topmost only (C)
- Listeners exist only while open, and are removed on close and on disposal

`popoverClose.test.tsx`

- Escape reports `escape-key` (C)
- A press outside reports `outside-press` (C)
- A press on the trigger reports `trigger-press`, and does not reopen (C)
- Enter on the trigger reports `trigger-press` (C)
- A press inside does not close (C)
- Focus moving out of the popover does not close it (C)
- A controlled popover that keeps `open` is shown again, and the close is reported once (C)
- A popover the popup closed itself reports nothing (C)
- A close with no key or press, such as another popover opening, reports `close-request` (C)
- Enter on another popover's trigger reports `close-request`, not `outside-press` (C)
- An Escape that closed nothing is not the reason for a later close (C)
- Nested popovers: Escape closes the topmost only, one per press (C)
- Listeners exist only while open, and are removed on close and on disposal

`escape.test.tsx`

- Escape reports `escape-key` with the key event, and the tooltip closes
- Other keys do nothing
- Nothing while closed
- Escape while an input method is composing does nothing
- A key already handled (`defaultPrevented`) does nothing
- The key is marked handled and carries on to the page's listeners
- Two open tooltips: Escape closes the one opened last, then the other
- A dialog below the tooltip stays open, and the next Escape closes it (C)
- A popover below the tooltip stays open, and the next Escape closes it (C)
- Listeners exist only while open, and are removed on close and on disposal

`test/floating/dismissal/Dismissal.hydrate.test.tsx`

- The server render adds nothing and reads no `document` or `window`
- Hydration adopts the server's elements without warnings, and Escape closes the opened popups afterwards

## Left out

| Case                                                         | Reason                                                                                                                                                                                              |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A popover's outside press, Escape and nesting as code        | The browser's light dismiss and close requests do them (#94); this folder only reports the reason                                                                                                   |
| A dialog or popover opened above an open Tooltip             | Escape closes the Tooltip first. A popup opening over the trigger takes its hover or focus, which closes the Tooltip (#34); checking the top layer for it would cost bytes in every Tooltip         |
| A press on the page's scrollbar while a dialog is open       | The page should not scroll behind a modal dialog (scroll lock, #28), and the test browser's input reaches elements, not the viewport's scrollbar. The dialog's own scrollbar is tested              |
| Outside press in shadow roots and portals                    | No popup is portalled (#94), and the backdrop press targets the `<dialog>` whatever is behind it                                                                                                    |
| Safari's `keyCode` 229 for an Escape that ends a composition | Tests run in Chromium (PLAN.md section 5), which reports `isComposing`; revisit with a WebKit report                                                                                                |
| Focus leaving closes a popup                                 | No popup of this phase closes on it ("Decisions" above); Tooltip's blur is #34's                                                                                                                    |
| An element declared as inside                                | No popup of this phase needs one ("Decisions" above)                                                                                                                                                |
| The Android back gesture                                     | Not available to the tests. It reaches the same `cancel` and `beforetoggle` as Escape, without a key, so it reports `close-request`; the `<form method="dialog">` and popover cases cover that path |
| Firefox and WebKit                                           | Tests run in Chromium (PLAN.md section 5). #94 ran the browser's part in all three engines                                                                                                          |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out.

Measured on 2026-11-22. `reason.ts` holds types only, so it adds nothing.

| File              | Size  | Budget |
| ----------------- | ----- | ------ |
| `dialogClose.ts`  | 432 B | 550 B  |
| `outsidePress.ts` | 408 B | 500 B  |
| `popoverClose.ts` | 526 B | 650 B  |
| `escape.ts`       | 344 B | 400 B  |

Dialog will use `dialogClose` and `outsidePress`, Alert Dialog
`dialogClose` alone, Popover and the menus `popoverClose`, and Tooltip
`escape` (`test/bundle-size/popupModules.ts` checks what each must not
bundle).
