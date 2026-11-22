# Dialog

A window over the page that the user deals with before going back to it,
such as a form to edit a profile or a confirmation: the WAI-ARIA modal
dialog pattern. The first popup, which settles the popup conventions of
PLAN.md section 8, "API conventions".

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                    | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                    | 2026-11-22 |
| [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): roles, states and keyboard, and its notes on initial focus, return focus and a close button. It names nothing on the button that opens the dialog                                | 2026-11-22 |
| [WAI-ARIA modal dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/) (last updated 2026-03-04)                                                                                                                                         | 2026-11-22 |
| Size: PLAN.md section 6, rules 3 and 6                                                                                                                                                                                                                                    | 2026-11-22 |
| HTML standard, [the `dialog` element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element): `showModal()` gives the `dialog` role with `aria-modal`, the top layer, an inert page, Escape as a close request and initial and return focus | 2026-11-22 |

## Shape

`Dialog.Root` renders no element: it holds the open state and shares it.
`Dialog.Trigger` renders a native `<button type="button">` that opens the
dialog. `Dialog.Popup` renders the `<dialog>`, opened with `showModal()`
(#94; ADR 0006), and inside it `Dialog.Title` renders an `<h2>`,
`Dialog.Description` a `<p>` and `Dialog.Close` a `<button type="button">`
that closes it.

```tsx
<Dialog.Root>
  <Dialog.Trigger>Edit profile</Dialog.Trigger>
  <Dialog.Popup>
    <Dialog.Title>Edit profile</Dialog.Title>
    <Dialog.Description>Your name is shown on your posts.</Dialog.Description>
    <Dialog.Close>Done</Dialog.Close>
  </Dialog.Popup>
</Dialog.Root>
```

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser** (`showModal()`, #94): the `dialog` role with
  `aria-modal="true"`, the top layer, an inert page outside the dialog,
  Escape and other close requests, focus on the first focusable element
  (or the one with `autofocus`), focus back on the element focused before
  it opened, nested dialogs closing one Escape at a time, and `::backdrop`.
- **The `floating` layer**, all from the Popup: presence (`showModal()`
  and `close()`, after exit animations), `dialogClose` (the reason for
  Escape and other close requests, a refused close opened again),
  `outsidePress` (a press on the backdrop), `tabWrap` (Tab and Shift+Tab
  stay inside), `initialFocus` and `returnFocus` (the props of the same
  names) and `scrollLock`. Nothing positions it and nothing opens it on
  hover: `menhir/dialog` bundles no `@floating-ui/*`, `positioning` or
  `hover` (`test/bundle-size/popupModules.ts`).

### Decisions

- **Parts.** Only what a native element cannot do. The Root is state, so it
  has no element: a wrapper would sit around a button in the page's flow
  for nothing. The Trigger and Close are buttons that change the state with
  a reason, and the Popup must be the `<dialog>`. The Title and Description
  are parts because the Popup names them in `aria-labelledby` and
  `aria-describedby`. **No Backdrop part**: `::backdrop` covers the page
  behind a modal `<dialog>` in the top layer, and a Backdrop element could
  only be another element inside the dialog. Style it as
  `.popup::backdrop` and `.popup[data-closed]::backdrop`, or with
  Tailwind's `backdrop:` variant (`backdrop:backdrop-blur-xs`); presence
  waits for its exit animation too. A Backdrop element inside the dialog
  would make the `<dialog>` a transparent full-screen layer and the panel
  a separate element, so every app would undo the browser's dialog styles
  to get a dimmed or blurred page that `::backdrop` gives already (#31).
- **Modal only.** A non-modal popup is Popover's (#33), and a `modal` flag
  would ship the modal behaviour in every app (PLAN.md section 6, rule 6).
- **The open state** is `open`, `defaultOpen` and
  `onOpenChange(open, { reason, event })` on the Root, through
  `createControllableSignal`. The Trigger opens with `trigger-press`, Close
  closes with `close-press` (added to `OpenChangeReason` here), and the
  `floating` layer reports `escape-key`, `outside-press` and
  `close-request`. A controlled Dialog that keeps `open` refuses the close,
  as dismissal does (#26).
- **A controlled Dialog with no Trigger** returns focus where the browser
  does: the element focused before it opened, such as the app's own button
  that set `open`. When that element is gone, the browser leaves focus on
  the `<body>`, and `returnFocus` on the Popup decides instead
  (`(focused) => focused ?? fallback`).
- **The Popup names its Title and Description** in `aria-labelledby` and
  `aria-describedby`, and only while they are rendered: each registers its
  `id` with the Root once mounted (`onSettled`) and removes it on disposal,
  so a dialog without a Title names nothing, and one whose Title is in a
  `<Show>` follows it. Without a Title, give the Popup an `aria-label`.
  The consumer's `aria-labelledby` or `aria-describedby` on the Popup wins.
  Both are kept out of the merge, so a wrapper that forwards
  `aria-labelledby={props["aria-labelledby"]}` without one does not remove
  the Title's ("`undefined` is a value", PLAN.md section 8); `false`
  removes it.
- **The Title and Description keep the consumer's `id`**, else a generated
  one (PLAN.md section 8, "Generated ids belong to the root", revisited
  here). The convention gives the id to the root because a part rendered
  later cannot hand its `id` to an earlier one in the server HTML. Here the
  Popup is rendered before its Title, but it names nothing in the server
  HTML (next point), so the Title hands its `id` over once mounted, the
  consumer's included.
- **The server renders a `defaultOpen` Dialog closed**, and hydration opens
  it with `showModal()`. Server HTML can only say `<dialog open>`, which is
  non-modal: the page behind it stays focusable and pressable, it has no
  `::backdrop`, and it is laid out in the page's flow instead of in the top
  layer, so it would not be the dialog the user gets a moment later. A
  closed `<dialog>` is `display: none`, so the server HTML has nothing
  wrong in it to show, and it names no Title: the Popup has no
  `aria-labelledby` or `aria-describedby` until hydration. The cost: a
  `defaultOpen` Dialog shows only once its script has run, as a modal
  dialog has to anyway. The `data-*` attributes follow the state, so the
  server's closed Popup of a `defaultOpen` Dialog already has `data-open`.
- **The Trigger has `aria-haspopup="dialog"`**, which tells a screen reader
  that it opens a dialog, as ARIA defines the value. **No `aria-expanded`**:
  while the dialog is open the Trigger is inert, so the state is never read
  out as true. **No `aria-controls`**: the closed `<dialog>` is in the
  document but `display: none`, and the open one is the only thing the user
  can reach, so there is nothing to move to. The pattern names none of the
  three.
- **The Popup must be a `<dialog>`**: a `render` function that returns
  another element breaks it, since `showModal()` exists on no other
  element. Development builds warn, as for a part that must be a button.
- **`initialFocus` and `returnFocus` are props of the Popup**, the element
  whose focus they steer (PLAN.md section 8, "Focus in a popup"). Without
  them the browser decides; `autofocus` steers its choice at no cost.
- **A closed Popup stays in the document**, `display: none` (#96), so its
  content keeps its state between openings, as a Collapsible's Panel does.
- **`data-open`/`data-closed`** on every part that renders an element, as
  on a Collapsible (#22) and a popup (#96). While the Popup leaves, it has
  `data-closed`, which is the exit; the entry is the consumer's
  `@starting-style` or `@keyframes` on `[data-open]`.
- **Alert Dialog builds on these parts** (#32): `menhir/alert-dialog`
  re-exports the Root, Trigger, Title, Description and Close, and its Popup
  calls the same `popup/renderDialogPopup.tsx` as this one, with the
  `alertdialog` role and without `createOutsidePress`, which only
  `DialogPopup.tsx` passes. So an app with both pays for the shared code
  once (`src/alert-dialog/README.md`, "Size"). A part outside its Root
  names both Roots in its error, since the part cannot tell which one is
  missing.
- **Nested dialogs** need nothing of their own: a Dialog inside another's
  Popup opens over it, Escape closes the topmost (the close request goes to
  it alone), the outside press of each counts only on its own backdrop,
  Tab wraps in the topmost, focus returns step by step, and the page
  unlocks when the last one has closed (the scroll lock is counted).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element against the part conventions. "A" marks a case the WAI-ARIA
modal dialog pattern requires, "C" a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no `showModal()`, no layout, no focus
order and no real input. In jsdom an opened `<dialog>` gets `open` from a
stub (`test/dialog/stubDialog.ts`).

`root/DialogRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default: the Popup is not shown, and every part has `data-closed`
- `defaultOpen` starts open: the Popup is shown, and every part has `data-open`
- Uncontrolled: the Trigger opens it and Close closes it, and `onOpenChange` gets each value with its reason and event (`trigger-press`, `close-press`)
- Controlled open: Close only asks, and the dialog stays open
- Controlled closed: the Trigger only asks, and the dialog stays closed
- Follows a controlled value changed from outside, opening and closing the `<dialog>`
- Opens before async work that `onOpenChange` starts settles (PLAN.md "API conventions")
- A controlled Dialog with no Trigger, opened from the app's own button, returns focus to that button on close (A: return focus; C)
- … and when that button is gone, `returnFocus` with a fallback moves focus there (A: return focus to another element; C)

`trigger/DialogTrigger.test.tsx`

- Renders a button with type `button` and `aria-haspopup="dialog"`, and no `aria-expanded` or `aria-controls`
- Named by its content
- Opens on click, and on Enter and Space with focus on it (C)
- Does not submit its form
- `id` goes on the button
- Calls the consumer's `onClick` once per click
- `render` with a button component keeps the Trigger's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Dialog.Root`

`popup/DialogPopup.test.tsx`

- Renders a `<dialog>`, closed until opened
- Opened, it is modal: the `dialog` role, `:modal`, in the top layer, above an element with a high `z-index` (A: role `dialog`, `aria-modal`; C)
- Opened, the page outside is inert: a script cannot focus a button behind it (A: outside not operable; C)
- Named by its Title in `aria-labelledby` and described by its Description in `aria-describedby` (A: name, optional description)
- Without a Title or Description, has no `aria-labelledby` or `aria-describedby`; an `aria-label` names it (A: `aria-label`)
- A Title or Description rendered later, or removed, is named or no longer named
- A Title or Description with the consumer's `id` is named by that `id`
- The consumer's `aria-labelledby` and `aria-describedby` win over the parts'
- Focus moves inside on opening: to the element with `autofocus`, else the first focusable one (A: initial focus; C)
- `initialFocus` moves focus to another element: a function, called with the browser's choice (A: notes on initial focus; C). The element form is `floating/focus`'s, tested there
- Tab from the last element moves to the first, Shift+Tab from the first to the last (A: Tab, Shift+Tab; C)
- Escape closes it, reporting `escape-key` with the key event (A: Escape; C)
- Escape on a controlled Dialog that stays open keeps it open and modal (C)
- A press on the backdrop closes it, reporting `outside-press`; a press inside does not (C)
- A `<form method="dialog">` inside closes it, reporting `close-request` (C)
- Focus returns to the Trigger on close (A: return focus; C)
- `returnFocus` moves focus to another element on close (A: return focus elsewhere; C)
- The page does not scroll while it is open, and scrolls again once closed (C)
- Stays shown, with `data-closed`, while its exit animation runs, then closes; focus returns and the page unlocks only then (C)
- `render` with a `<dialog>` keeps its behaviour; warns in development when `render` does not render a `<dialog>`
- Throws a descriptive error outside `Dialog.Root`

`title/DialogTitle.test.tsx`, `description/DialogDescription.test.tsx`

- Render an `<h2>` and a `<p>` with a generated `id`; two dialogs get different ids
- Throw a descriptive error outside `Dialog.Root`

`close/DialogClose.test.tsx`

- Renders a button with type `button`, named by its content (A: a visible close button)
- Closes on click, and on Enter and Space (C)
- Does not submit its form
- Calls the consumer's `onClick` once per click
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Dialog.Root`

`Dialog.nested.test.tsx`

- A Dialog opened from inside another opens over it, and only the inner one is not inert (C)
- Escape closes the inner one, then the outer one, focus returning to each one's Trigger in turn (C)
- A press on the inner backdrop closes only the inner one (C)
- Tab wraps inside the inner one (C)
- The page stays locked until the outer one has closed too (C)

`test/dialog/Dialog.hydrate.test.tsx`

- The server HTML of a closed Dialog has the Trigger with its type and `aria-haspopup`, and a closed `<dialog>` with `data-closed`, before any script runs (PLAN.md section 10)
- The server HTML of a `defaultOpen` Dialog has a closed `<dialog>` with `data-open` and no `aria-labelledby`, which names nothing yet
- Hydration adopts the server's elements without warnings; a `defaultOpen` Dialog is then modal and named by its Title (C)
- After hydration the Trigger opens the dialog by click, and by Enter (C)

`test/ssr-app` renders and hydrates a Dialog in a built app, and its Trigger opens it.

## Left out

| Case                                                              | Reason                                                                                                                                                                                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Backdrop part                                                   | See "Decisions": `::backdrop` covers the page behind a modal `<dialog>`. A Backdrop element could only be one more element inside the dialog                                                                               |
| A non-modal Dialog                                                | Popover's job (#33); a flag would ship modal behaviour in every app (PLAN.md section 6, rule 6)                                                                                                                            |
| A Trigger outside the Root                                        | It would need the Root's state through something other than context, such as an id or a handle, in every app. A controlled Dialog opens from any button of the app's own                                                   |
| Several Triggers for one Dialog                                   | Each would need to know which one opened the dialog, which only matters for return focus, and the browser returns focus to the one pressed already. Put one Root around each, or control `open` from the app's own buttons |
| An imperative handle (`open()`, `close()`)                        | Control `open` instead (PLAN.md section 8, "Controlled state")                                                                                                                                                             |
| A drawer that is swiped away                                      | Gesture tracking, which every Dialog app would ship; it would be its own component                                                                                                                                         |
| Server HTML with `<dialog open>` for `defaultOpen`                | See "Decisions": it is non-modal, so the server would show a different dialog over a usable page                                                                                                                           |
| `aria-expanded` and `aria-controls` on the Trigger                | See "Decisions": the Trigger is inert while the dialog is open, and the closed dialog is not shown                                                                                                                         |
| Removing a closed Popup's content from the document               | Presence keeps a closed popup in the document (#96). A consumer who wants fresh content each time controls `open` and resets their own state on opening                                                                    |
| A warning for a dialog with no name                               | The name may come from a Title, an `aria-label` or `aria-labelledby` naming any element, which only the accessibility tree settles. Chromium's accessibility checks and the pattern's docs cover it                        |
| `disabled` on the Trigger                                         | Not a prop of the part, as on Toggle and Tabs' buttons; a consumer passes it in `render`: `render={(props) => <button {...props} disabled />}`                                                                             |
| Keyboard modifiers in the change callback, and canceling a change | The details carry the event; nothing cancels a part's handler, and a controlled Dialog refuses a change by keeping `open` (PLAN.md section 8)                                                                              |
| Tried with screen readers                                         | Not yet: Chromium's accessibility tree shows the role, `modal=true`, the name and the description, and leaves the page outside out. VoiceOver, NVDA and JAWS are still to be tried (the definition of done in #31)         |

## Browsers and screen readers

Tried on 2026-11-22 in Chromium (Playwright's headless build, through the
test suite). The behaviour the browser gives (#94) was run in Chromium,
Firefox and WebKit in that spike. No screen reader has been tried yet.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-22.

| Entry point     | Size    | Budget |
| --------------- | ------- | ------ |
| `menhir/dialog` | 3,497 B | 4.2 kB |

Sharing the Popup's code with Alert Dialog (#32) added 27 B (3,470 B
before). Most of it is the `floating` layer: presence, `dialogClose`,
`outsidePress`, `tabWrap` with its tabbable search, `initialFocus`,
`returnFocus` and `scrollLock` (each module's README has its size). An app
that renders no Description, or no Title, does not bundle that part
(`test/package`).
