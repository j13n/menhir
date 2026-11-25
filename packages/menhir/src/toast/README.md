# Toast

A short message that appears at an edge of the screen, stacks with the
others and leaves by itself: a notification, also called a snackbar. The
only component whose content is added by code outside it, and the only one
that must show above a modal dialog it is not part of (#207).

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                     | Read on    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                     | 2026-11-25 |
| WAI-ARIA [alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/): an alert "displays a brief, important message in a way that attracts the user's attention without interrupting the user's task", does not move focus, and should not disappear by itself where that fails WCAG 2.2.1. There is no toast pattern | 2026-11-25 |
| WAI-ARIA 1.2, the [`status`](https://www.w3.org/TR/wai-aria-1.2/#status) and [`alert`](https://www.w3.org/TR/wai-aria-1.2/#alert) roles and [`aria-live`](https://www.w3.org/TR/wai-aria-1.2/#aria-live): `polite` waits for the user to be idle, `assertive` interrupts                                                   | 2026-11-25 |
| [WCAG 2.2.1, Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html): a time limit the content sets can be turned off, adjusted or extended                                                                                                                                                 | 2026-11-25 |
| [WCAG 4.1.3, Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): a status message is announced through a role or property, without receiving focus                                                                                                                                         | 2026-11-25 |
| HTML, [the top layer](https://html.spec.whatwg.org/multipage/interaction.html#modal-dialogs-and-inert-subtrees) and modal dialogs: while a modal dialog is open, every node that is not its descendant is inert                                                                                                            | 2026-11-25 |
| Size (PLAN.md section 6): see "Size" below                                                                                                                                                                                                                                                                                 | 2026-11-25 |

## Shape

```tsx
import { createToastManager, Toast } from "menhir/toast";

const toasts = createToastManager();

// Anywhere: an event handler, an action, a module with no component.
toasts.add({ title: "Saved", description: "Your changes are stored." });

<Toast.Provider manager={toasts}>
  <App />
  <Toast.Region aria-label="Notifications">
    {(toast) => (
      <Toast.Root toast={toast} ref={Toast.swipe({ direction: "right" })}>
        <Toast.Title />
        <Toast.Description />
        <Toast.Action onClick={undo}>Undo</Toast.Action>
        <Toast.Close aria-label="Close" />
      </Toast.Root>
    )}
  </Toast.Region>
</Toast.Provider>;
```

| Export               | Renders                                             | Does                                                                                                                                                                      |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createToastManager` | nothing                                             | Holds the list. `add(options)` returns the toast's id, `update(id, options)` changes one, `remove(id?)` closes one or all, `toasts()` reads the list                      |
| `Toast.Provider`     | nothing                                             | Hands the manager, the default `duration` and the `limit` to the parts                                                                                                    |
| `Toast.Region`       | `<div popover="manual" role="region" aria-live>`    | The landmark, the live region and the top-layer element. Renders its function child once per toast. Pauses the timers, takes focus on F6, moves into an open modal dialog |
| `Toast.Root`         | `<div>`, `role="alert"` when its priority is `high` | One toast: its timer, Escape, its exit, `--toast-index`                                                                                                                   |
| `Toast.Title`        | `<div>`                                             | The toast's `title`, or its children                                                                                                                                      |
| `Toast.Description`  | `<div>`                                             | The toast's `description`, or its children                                                                                                                                |
| `Toast.Action`       | `<button type="button">`                            | Something to do about the message. Closes the toast once pressed, and a toast that has one does not leave by itself                                                       |
| `Toast.Close`        | `<button type="button">`                            | Closes the toast                                                                                                                                                          |
| `Toast.swipe`        | a ref for `Toast.Root`                              | Swipe to dismiss                                                                                                                                                          |
| `Toast.measure`      | a ref for `Toast.Region`                            | Each toast's height and offset, for a stylesheet that collapses and expands the stack                                                                                     |

### Decisions

Settled by the maintainer on 2026-11-25 (#207, "Settle first"):

- **The app makes the list.** `createToastManager()` returns the object the
  app hands to `Toast.Provider` and calls from anywhere. No module state:
  that would be shared between requests on the server. On the server
  `add()` does nothing, so a manager made at module level stays empty
  there, and the server HTML holds the Region and no toast. The manager
  holds signals and no store, so an app without a store bundles no store
  engine.
- **The Region moves into an open modal dialog.** It is a
  `popover="manual"` shown from mount, so it is in the top layer, above any
  `z-index`. The top layer is ordered by when each element was shown, and a
  modal dialog makes everything outside it inert, so (tried on 2026-11-25 in
  Chromium 159, Firefox 159 and WebKit 27.2 through Playwright, all three
  the same):

  | Case                                                 | Painted          | Focus and clicks |
  | ---------------------------------------------------- | ---------------- | ---------------- |
  | Region shown, then `showModal()`                     | under the dialog | none: inert      |
  | Region hidden and shown again after the dialog opens | above the dialog | none: inert      |
  | Region moved into the dialog and shown again         | above the dialog | work             |

  So while a modal dialog is open the Region's element is a child of the
  one opened last, and it goes back to its place when that closes. The
  browser hides a popover that moves, so it is shown again after each move.
  A `MutationObserver` on the document's `open` attributes finds the
  dialogs, since `showModal()` fires no event that is Widely available.

- **The Region is the live region.** It has `aria-live="polite"` and is in
  the server HTML, so it exists before its first toast, which a screen
  reader needs to announce an addition. A toast of `high` priority is a
  `role="alert"`, which interrupts. A `low` one has no role: the Region
  announces it.
- **Seven parts, and swipe is a ref** (PLAN.md section 6, rule 6): an app
  that does not use `Toast.swipe` bundles none of it
  (`test/bundle-size/toastModules.test.ts`). `Toast.measure` is the same.

Decided with the build (#207, "Decide and record"):

- **Timing** (WCAG 2.2.1). A toast stays `duration` milliseconds: its own,
  else the Provider's, else 5000. `Infinity` keeps it until it is closed.
  Timers pause, and go on with the time left, while the pointer is on the
  Region, while focus is inside it and while the page is hidden. A toast
  with an `Action` does not leave by itself unless it was given a
  `duration` of its own: a user who needs longer to reach a button must not
  lose it. `update()` starts the time again.
- **Keyboard.** F6 (`hotkey` on the Region, `false` for none) moves focus
  to the Region when it has a toast, from where Tab reaches the buttons of
  each toast in the order they were added. Escape with focus in a toast
  closes that toast, and the key is marked handled, so a dialog under it
  stays open. When a toast that holds focus closes, focus goes to the
  Region if another toast is left, else back to where it was before it
  entered the Region.
- **Stacking.** Toasts are in the document in the order they were added,
  oldest first, which is the order a screen reader and Tab meet them.
  Each Root has `--toast-index`, 0 for the newest, and `data-front` on the
  newest; the Region has `--toast-count` and, while the pointer is on it or
  focus is inside it, `data-expanded`. `limit` on the Provider shows that
  many at once: the rest wait, not rendered and their timers not started,
  until one leaves. No limit by default, since a toast with an Action
  could hold the others back. `Toast.measure` adds `--toast-height` and
  `--toast-offset`, the heights of the newer toasts added up, in pixels.
  Menhir positions nothing.
- **Exit.** A closed toast has `data-closed` and stays in the document
  until the animations and transitions running in it have ended
  (`floating/presence/exit.ts`), then leaves the list. With none it leaves
  at once.
- **Swipe.** `Toast.swipe({ direction, threshold })`: one direction or
  several of `left`, `right`, `up`, `down` (default `right`), and the
  distance in pixels that dismisses (default 50). A press that moves 5 px or less is a click, and moves nothing. While the pointer drags further,
  the Root has `data-swipe="move"` and `--toast-swipe-x` and
  `--toast-swipe-y`, the distance along the allowed directions; released
  past the threshold it has `data-swipe="end"` and
  `data-swipe-direction`, and closes with the reason `swipe`; released
  before, the attributes are removed. A press that became a swipe does not
  click the button under it.
- **Updating and removing.** `update(id, options)` changes the fields
  given. `add()` with the id of an open toast in the list updates it, and
  with the id of one that has closed and is still leaving, replaces it at once.

  `remove(id)` closes one and `remove()` all, with their exit.

- **Reasons.** `onOpenChange(false, { reason, event })` in a toast's
  options: `timeout`, `close-press`, `action-press`, `swipe`, `escape-key`
  and `remove`. `event` is absent for `timeout` and `remove`. The type is
  Toast's own: a toast is not a popup that opens and closes, and the
  popups' details always carry an event.
- **`Action` closes the toast**, after the app's `onClick`, with the reason
  `action-press`, which the issue's list did not have: an "Undo" that stays
  after it was pressed is wrong more often than right.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element. "A" marks a case from the alert pattern or the roles, "W" a
case of WCAG 2.2.1 or 4.1.3, "C" a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no `popover`, no top layer, no layout, no
real pointer and no animations. In jsdom the Region's popover comes from a
stub (`test/popover/stubPopover.ts`).

`manager/createToastManager.test.ts`

- `add()` returns an id of its own making, and the toast is in `toasts()` with its fields
- `add()` keeps the id it is given
- Toasts are listed in the order they were added
- `update()` changes the fields given and keeps the others
- `update()` right after `add()`, before a flush, changes that toast
- `add()` with the id of a listed toast updates it, and the list keeps one
- `remove(id)` takes a toast nobody rendered off the list, and reports `remove` with no event
- `remove()` removes all
- `remove()` of an unknown id does nothing

`provider/ToastProvider.test.tsx`

- Renders no element of its own
- A part outside it throws a descriptive error

`region/ToastRegion.test.tsx`

- Renders a `<div popover="manual" role="region">` with `aria-live="polite"` and `tabindex="-1"`, shown, with no toast (A, W: the live region exists first)
- Renders its function child once per toast, oldest first, and a toast added later after them (W: announced as an addition)
- Has `--toast-count`
- `limit` renders that many, and the next once one has left
- Has `data-expanded` while the pointer is on it, and while focus is inside it
- F6 moves focus to it when it has a toast, and does nothing when it has none
- `hotkey` changes the key, and `false` removes it
- Is in the top layer, above an element with a high `z-index` (C)
- Opened after it, a modal dialog holds it: a toast is painted above the dialog and its button takes a click (C)
- Once moved it is not expanded and its timers go on, though no pointer left it (C)
- Goes back to its place when the dialog closes, still shown (C)
- With a dialog open in a dialog, it is in the one opened last, then in the first (C)
- A dialog open before it mounts holds it (C)
- Unmounted while in a dialog, it leaves the document (C)

`root/ToastRoot.test.tsx`

- Renders a `<div>` with `data-open` and `data-priority="low"`, and no role
- A `high` priority toast is a `role="alert"` (A)
- Has `--toast-index`, 0 for the newest, and `data-front` on the newest only
- Leaves after the Provider's `duration`, 5000 ms by default, reporting `timeout` with no event
- Its own `duration` wins, and `Infinity` keeps it
- The timer pauses while the pointer is on the Region and goes on with the time left (W)
- The timer pauses while focus is inside the Region (W)
- The timer pauses while the page is hidden, and waits from the start when mounted in a hidden page (W)
- `update()` shows the new fields and starts the time again
- Escape with focus inside closes it and no other toast, reporting `escape-key`, and marks the key handled
- `remove(id)` closes it, reporting `remove`
- When it closes holding focus, focus goes to the Region if a toast is left, else to where it was before (C)
- Stays in the document with `data-closed` while its exit animation runs, then leaves (C)
- A toast added under the id of one that is leaving replaces it at once, and that one's exit does not take the new one along (C)
- Throws a descriptive error outside `Toast.Region`

`title/ToastTitle.test.tsx`, `description/ToastDescription.test.tsx`

- Renders the toast's field, and its children instead when it has any
- Follows `update()`

`action/ToastAction.test.tsx`

- Renders a button with type `button`
- A press calls the consumer's `onClick`, then closes the toast, reporting `action-press` with the click
- A toast with an Action does not leave by itself (W)
- A toast with an Action and a `duration` of its own leaves after it
- Reached by Tab from the Region after F6, and a press by keyboard acts (C)

`close/ToastClose.test.tsx`

- Renders a button with type `button`
- A press closes the toast, reporting `close-press` with the click
- Warns in development when `render` is not a button

`swipe/swipe.test.tsx`

- A drag past the threshold in its direction closes the toast, reporting `swipe`, with `data-swipe="end"` and `data-swipe-direction` (C)
- While dragging, the Root has `data-swipe="move"` and the distance in `--toast-swipe-x` (C)
- A drag released before the threshold leaves it open, with the attributes removed (C)
- A drag the other way moves nothing and closes nothing (C)
- `threshold` and several directions are taken (C)
- A press that moves 5 px or less moves nothing, and is still a click on the button under it (C)
- A press on the Close button that became a swipe does not also click it (C)

`measure/measure.test.tsx`

- Each Root has its height in `--toast-height` and the heights of the newer toasts in `--toast-offset`, kept as toasts come, leave and change size (C)

`test/toast/Toast.hydrate.test.tsx`

- The server HTML holds the Region, not shown, and no toast, though the fixture's module added one
- Hydration adopts the server's Region without warnings and shows it, and a toast added after is rendered

`test/bundle-size/toastModules.test.ts`

- An app that uses every part but `swipe` and `measure` bundles neither
- An app that also uses `swipe` bundles it and not `measure`, and the other way round, so the check can fail

## Left out

| Case                                            | Reason                                                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A toast that follows a promise                  | Left out of the first version (#207): `update()` from an `action` does it, shown on the docs page                                                                    |
| A toast anchored to an element                  | Left out of the first version (#207): it would bring positioning, about 7 kB                                                                                         |
| What a screen reader says                       | No test can hear it. To be tried by a person; see "Browsers and screen readers"                                                                                      |
| Whether a move into a dialog is announced again | The same                                                                                                                                                             |
| A dialog removed from the document while open   | Covered by the same observer as a close, but only an app that removes an open dialog meets it; Menhir's Dialog stays in the document                                 |
| Firefox and WebKit                              | Tests run in Chromium (PLAN.md section 5). The top-layer cases were run by script in all three (see "Decisions")                                                     |
| A non-modal `<dialog>`, an `auto` popover       | Neither makes the page inert, so the Region stays usable where it is. An `auto` popover shown later is painted above it until the next toast is added                |
| jsdom without a `popover` stub                  | The Region calls `showPopover()` when it mounts, so an app's jsdom test that renders one stubs it, as `test/popover/stubPopover.ts` does here; no check ships for it |
| A limit that drops toasts                       | Waiting loses no message; dropping would                                                                                                                             |

## Browsers and screen readers

Tried on 2026-11-25, by script through Playwright, on the docs site's home
page, with Menhir's Dialog:

| Browser      | A toast above an open Dialog | Its Close takes a click | F6, then Tab to Close | Escape closes the toast, the Dialog stays | Back in its place after the Dialog |
| ------------ | ---------------------------- | ----------------------- | --------------------- | ----------------------------------------- | ---------------------------------- |
| Chromium 159 | yes                          | yes                     | yes                   | yes                                       | yes                                |
| Firefox 159  | yes                          | yes                     | yes                   | yes                                       | yes                                |
| WebKit 27.2  | yes                          | yes                     | yes, with Option+Tab  | yes                                       | yes                                |

WebKit on macOS leaves buttons out of the Tab order unless the system's
keyboard navigation is on; Option+Tab reaches them, as on any page.

Not tried, and left to a person (#229): Safari itself and a phone, where swipe
meets a touch; and every screen reader (VoiceOver, NVDA, JAWS, TalkBack):
whether a `low` toast is read when idle and a `high` one at once, whether
an Action's label is read with its toast, and whether the Region's move
into a dialog reads its toasts again.

## Size

Measured as `test/bundle-size` measures an entry point: Rolldown, minified,
gzipped, Solid left out, as a production build. The budget is the measured
size plus about 20%, rounded.

Measured on 2026-11-25.

| What                                        | Size    | Budget |
| ------------------------------------------- | ------- | ------ |
| `menhir/toast`, everything                  | 3,389 B | 4 kB   |
| The manager and the seven parts             | 2,658 B |        |
| `Toast.swipe` on top of them                | 453 B   |        |
| `Toast.measure` on top of them              | 162 B   |        |
| Of the parts: `region/dialogHost.ts`, alone | 371 B   |        |
| `floating/presence/exit.ts`, alone          | 290 B   | 350 B  |

An app that uses every part but `swipe` and `measure` bundles neither
(`test/bundle-size/toastModules.test.ts`).
