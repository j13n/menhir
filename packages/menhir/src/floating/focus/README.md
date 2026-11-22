# `floating/focus`

Focus in a popup, where the browser does not already do what the WAI-ARIA
patterns ask (#27). `showModal()` gives a dialog initial focus, return focus
and an inert page, and a `popover` rendered after its trigger keeps the Tab
order and returns focus on Escape (PLAN.md section 8, "What the browser does
for popups"). This folder adds the Tab wrap of a modal dialog, overrides of
where focus starts and returns, and the search for tabbable elements the
wrap needs.

One file per behaviour, so a popup bundles only what it uses (PLAN.md
section 6, rule 6): a non-modal Popover has no Tab wrap and no tabbable
search.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Read       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                    | 2026-11-22 |
| WAI-ARIA [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): Tab from the last tabbable element moves to the first, Shift+Tab from the first to the last; focus starts on the first focusable element, a static element at the top of long content (`tabindex="-1"`), or the least destructive action; on close it returns to the element that invoked the dialog, or to another that "provides logical work flow" when that one "no longer exists"           | 2026-11-22 |
| WAI-ARIA [alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): the modal dialog's keyboard interaction                                                                                                                                                                                                                                                                                                                                                           | 2026-11-22 |
| WAI-ARIA practice [Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/): the tab sequence follows the DOM; `tabindex="-1"` is focusable but not in it; positive values are "strongly advised" against; a radio group is one tab stop, its checked radio                                                                                                                                                                                        | 2026-11-22 |
| WCAG 2.2 [Understanding 2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html) (updated 2026-05-18): restricting focus to a modal dialog is not a trap while the user can leave it, such as with Esc                                                                                                                                                                                                                                                  | 2026-11-22 |
| WCAG 2.2 [Understanding 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) (updated 2026-10-04): outside a modal dialog the page is inert; on close focus returns to the button                                                                                                                                                                                                                                                                             | 2026-11-22 |
| Size: PLAN.md section 6, rules 2 and 6                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 2026-11-22 |
| HTML standard, [the `dialog` element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element), [the `popover` attribute](https://html.spec.whatwg.org/multipage/popover.html) and [`inert`](https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute) (last updated 2026-11-22): the focusing steps honour `autofocus`; a dialog's close restores focus to the element focused before it opened, a popover's only when focus is inside it | 2026-11-22 |

## Shape

| File              | Exports                                      | Used by                                 | What it does                                                                |
| ----------------- | -------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| `tabWrap.ts`      | `createTabWrap`                              | Dialog, Alert Dialog                    | Tab and Shift+Tab cycle inside a modal `<dialog>`, the topmost only         |
| `tabbable.ts`     | `tabStops`, `isSameStop`, `FocusableElement` | `tabWrap.ts`                            | The tab stops inside an element, in tab order, framework-free               |
| `initialFocus.ts` | `createInitialFocus`                         | every popup with an `initialFocus` prop | Moves focus to another element than the browser's once the popup has opened |
| `returnFocus.ts`  | `createReturnFocus`                          | every popup with a `returnFocus` prop   | Moves focus to another element than the browser's once the popup has closed |
| `target.ts`       | `FocusTarget` (a type)                       | `initialFocus.ts`, `returnFocus.ts`     | What `initialFocus` and `returnFocus` take                                  |

The popup modules take their options as getters, as `floating/dismissal`
does:

```ts
createTabWrap({
  get dialog() { return dialog; },
  get open() { return open(); },
});
createInitialFocus({
  get popup() { return dialog; },
  get open() { return open(); },
  get initialFocus() { return props.initialFocus; },
});
createReturnFocus({
  get popup() { return dialog; },
  get open() { return open(); },
  get returnFocus() { return props.returnFocus; },
});
```

- **Listeners exist only while open**, and return focus keeps its own until
  the popup has closed. Effects do not run on the server, and nothing runs
  at import time.
- **Elements are read once open**, in the effect's apply, after refs are
  assigned.

### Decisions

- **The Tab wrap is a keydown listener over the tabbable search**, as in
  #94's spike. On Tab from the last tab stop, or from an element after it,
  focus moves to the first; on Shift+Tab from the first, from an element
  before it or from the `<dialog>` itself, to the last. With no tab stop,
  Tab keeps focus where it is. Elsewhere the browser moves focus. The stops
  are found on each key press, so content added while open counts.
- **The topmost dialog only.** A nested dialog's key bubbles through the
  dialog around it, which ignores a key whose target's nearest `<dialog>`,
  looked up across shadow roots, is not itself. The browser makes the
  dialogs below inert, so focus is never in them. The listener is on the
  window, after the document where Solid delegates its handlers, so a
  consumer's `onKeyDown` can handle the key first.
- **A key already handled** (`defaultPrevented`), such as Tab in an editor
  that inserts a tab, does not wrap.
- **Tab stops, as the browser counts them**, with what the spike showed in
  Chromium on 2026-11-22: an element whose `tabIndex` is 0 or more, or a
  `contenteditable` editing host with no `tabindex`, that is not
  `:disabled`, is visible (`checkVisibility` with `visibilityProperty`,
  which covers `hidden`, `display: none`, `visibility: hidden` and the
  content of a closed `<details>`) and is not inside an `inert` subtree. An
  `<a>` without `href` reports a `tabIndex` of 0 but is not focusable, so it
  is left out. A radio group is one stop: its checked radio, else its first.
  An open shadow root is searched in place of its host's children, a slot by
  its assigned elements or else its fallback. Positive `tabindex` values come
  first, in ascending order, then the rest in tree order.
- **Initial focus is an `initialFocus` prop, over `autofocus`.** The browser
  chooses first: `showModal()` and `showPopover()` focus the first element
  inside with the `autofocus` attribute, and `showModal()` the first
  focusable element without one, while a popover leaves focus on its
  trigger. That costs nothing, and a static element at the top of long
  content takes `tabindex="-1" autofocus`. The prop overrides it, as
  `returnFocus` does on close: an element, or a function called on each
  opening with the element the browser focused inside the popup, or `null`.
  It is there for what `autofocus` cannot do: codebases whose lint bans
  `autofocus` (the accessibility rule `no-autofocus`), focusing the
  `<dialog>` itself, which Chromium ignores `autofocus` on (spike,
  2026-11-22), and an element a consumer does not render, reached through a
  ref. The browser focuses its choice first, so focus moves twice, in the
  same task, before anything is painted. Solid sets `autofocus` as an
  attribute and moves no focus itself.
- **A ref inside the popup goes in a function**, `initialFocus={() => input}`:
  Solid passes a bare identifier as a value, read when the popup's props
  are, before the refs inside it are assigned.
- **Return focus is a `returnFocus` prop**: an element, or a function called
  when the popup closes with the element the browser focused, or `null`
  when it found none, so `(focused) => focused ?? fallback` keeps the
  browser's choice and replaces only a missing one. Without the prop the
  browser decides: a dialog returns focus to the element focused before it
  opened, a popover to its trigger when focus was inside it. When that
  element is gone, the browser leaves focus on the `<body>`.
- **Return focus respects a focus the user moved.** If focus moved to an
  element outside the popup while it was shown, such as a press on another
  button that light-dismissed a popover, it stays there. The browser's own
  restore, which comes after the popup is hidden, does not count.
- **Focus returns once the popup has closed**, not when its state turns
  false. A dialog that is still shown is still modal and the page inert, so
  focus cannot return any earlier. Return focus acts after the flush that
  closed the popup, or, if the popup is still shown then, as presence (#96)
  will keep it while it animates, on its `close` or `toggle` event.
- **How a popup composes the Tab wrap** (rule 6): Dialog and Alert Dialog
  are always modal and call `createTabWrap` from their Popup. A modal
  Popover is #33's to decide, between a part and a ref factory over
  `createTabWrap`; not a `modal` flag, which would ship the wrap in every
  app.
- **No hiding of the page outside**: `showModal()` makes it inert (#94).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no `showModal()`, no `popover`, no layout
and no `checkVisibility`. Real key and pointer input comes from
`vitest/browser` and the Chrome DevTools Protocol
(`test/floating/input.ts`). The test popups in
`test/floating/focus/` wire each module as a popup component will.

`tabbable.test.tsx`

- Finds the native focusable elements and `tabindex="0"`, in tree order (C)
- Leaves out `tabindex="-1"`, an `<a>` without `href` and a hidden input (C)
- Leaves out disabled controls, and those in a disabled `<fieldset>` but not in its first `<legend>` (C)
- Leaves out what is hidden: `hidden`, `display: none`, `visibility: hidden` (but not a visible child), `hidden="until-found"` (C)
- Leaves out the content of a closed `<details>`, and keeps its first `<summary>` (C)
- Leaves out an `inert` subtree (C)
- Counts a `contenteditable` editing host, not its children, and not one with `tabindex="-1"` (C)
- Counts a radio group once: its checked radio, else its first; radios without a name each count (C)
- Searches an open shadow root, slotted elements at their slot, and a slot's fallback (C)
- Counts an iframe and a `<video controls>` (C)
- Puts positive `tabindex` values first, in ascending order (C)

`tabWrap.test.tsx`

- Without the wrap, Tab from the last element leaves the dialog (C)
- Tab from the last tab stop moves to the first (C)
- Shift+Tab from the first moves to the last, and from the `<dialog>` itself (C)
- Tab between stops is left to the browser (C)
- With no tab stop, Tab and Shift+Tab keep focus on the dialog (C)
- Tab from a `tabindex="-1"` element after the last stop moves to the first (C)
- Tab from any radio of a group that is the last stop moves to the first (C)
- Tab from a last stop inside a shadow root moves to the first (C)
- A dialog that is itself inside a shadow root wraps (C)
- A stop added while open counts (C)
- A key already handled does not wrap (C)
- Nested dialogs: the topmost wraps, and the dialog around it does not take over (C)
- Listens only while open, and stops on close and on disposal

`initialFocus.test.tsx`

- Without `initialFocus`, a dialog focuses its first focusable element (C)
- `autofocus` on an element inside a dialog focuses it, also a static `tabindex="-1"` element (C)
- `autofocus` inside a popover focuses it when it opens; without it focus stays on the trigger (C)
- `initialFocus` with an element moves focus there once the dialog has opened (C)
- A ref inside the popup, through a function (C)
- A function is called on each opening with the element the browser focused; returning nothing keeps it (C)
- `initialFocus` can focus the `<dialog>` itself (C)
- A popover's function gets `null` when the browser focused nothing inside, and can move focus in (C)
- Nothing happens while closed

`returnFocus.test.tsx`

- Without `returnFocus`, a dialog returns focus to the element focused before it opened (C)
- `returnFocus` with an element moves focus there once the dialog has closed (C)
- `returnFocus` with a function is read when it closes (C)
- The element focused before is gone: focus ends on the `<body>` (C)
- A function receives the element the browser focused, or `null` when it is gone (C)
- A dialog opened from code, without a trigger, returns focus to what was focused before, or to `returnFocus` (C)
- A popover closed by Escape moves focus to `returnFocus` (C)
- A popover closed by a press on another button leaves focus on that button (C)
- A popup still shown after its state turned false, as with an exit animation, returns focus once it has closed (C)
- A popup disposed while open moves no focus (C)
- Listens only while open, and stops once closed and on disposal

`test/floating/focus/Focus.hydrate.test.tsx`

- The server HTML carries `autofocus` and nothing else: nothing runs during a server render
- Hydration adopts the server's elements without warnings
- After hydration and opening, Tab wraps and focus returns (C)

## Left out

| Case                                                                       | Reason                                                                                                                                                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An iframe as the last tab stop                                             | Tab from inside it is handled in the iframe's document, which the dialog's listener does not see, so focus can leave for the browser's UI. Put a focusable element after an iframe at the end of a dialog |
| Closed shadow roots                                                        | Script cannot see inside them. Their host is a stop if it is focusable                                                                                                                                    |
| Focus on an element that is no stop, in another shadow tree than the stops | Whether it is past the edge comes from `compareDocumentPosition`, whose order across shadow trees is the browser's own. A stop there wraps as tested                                                      |
| Tab order across shadow scopes with positive `tabindex`                    | Positive values are sorted over the whole dialog, not per scope; the practice advises against them                                                                                                        |
| A radio group with none checked, entered with Shift+Tab                    | The browser enters at the last radio; the wrap focuses the group's first. Both are in the group, and arrow keys move within it                                                                            |
| `<area>`, SVG links and other rare stops                                   | No popup content in this phase needs them; `tabIndex` counts most of them already                                                                                                                         |
| Hiding the page outside a modal popup                                      | `showModal()` makes it inert (#94)                                                                                                                                                                        |
| Tab order of a non-modal popover                                           | The browser's, for a popover rendered after its trigger (#94)                                                                                                                                             |
| Firefox and WebKit                                                         | Tests run in Chromium (PLAN.md section 5). #94 ran the browser's part, and the spike's Tab wrap, in all three engines                                                                                     |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out.

Measured on 2026-11-22.

| File                              | Size  | Budget  |
| --------------------------------- | ----- | ------- |
| `tabWrap.ts` (with `tabbable.ts`) | 896 B | 1,050 B |
| `tabbable.ts`                     | 538 B | 650 B   |
| `returnFocus.ts`                  | 476 B | 600 B   |
| `initialFocus.ts`                 | 306 B | 350 B   |

Dialog uses `tabWrap`, `initialFocus` and
`returnFocus`; a non-modal Popover `initialFocus` and `returnFocus` at most.
`test/bundle-size/popupModules.test.ts` checks that each of those two alone
bundles no Tab wrap and no tabbable search, and `popupModules.ts` that
Popover and Tooltip bundle neither.
