# Alert Dialog

A modal dialog that interrupts the user to ask for a response to an
important message, such as "Delete this file?" with Cancel and Delete: the
WAI-ARIA alert dialog pattern. It builds on Dialog (`src/dialog/README.md`),
whose decisions it keeps unless this README says otherwise.

## When to use it

Use Alert Dialog when the page cannot go on until the user answers, and a
press outside should not count as an answer: confirming an action that cannot
be undone, or acknowledging an error. Assistive technologies tell it apart
from other dialogs by its `alertdialog` role, and may give it special
treatment, such as a system alert sound.

Use Dialog for anything else the user works with on top of the page, such as
a form or settings, which a press on the backdrop may close. Use neither for
a message that needs no answer: that is a status message, not a dialog.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                         | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                         | 2026-11-22 |
| [WAI-ARIA alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): the `alertdialog` role, `aria-modal`, a name from `aria-labelledby` or `aria-label`, and `aria-describedby` naming the message. Its keyboard interaction is the modal dialog pattern's | 2026-11-22 |
| [WAI-ARIA alert dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/examples/alertdialog/) (last updated 2025-08-12): initial focus on the first focusable element, the least destructive action; Escape closes it                                            | 2026-11-22 |
| [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), which the alert dialog pattern refers to for the keyboard: Tab and Shift+Tab stay inside, Escape closes                                                                               | 2026-11-22 |
| Size: PLAN.md section 6, rules 3, 4 and 6                                                                                                                                                                                                                                      | 2026-11-22 |

## Shape

The same parts as Dialog, in the same places:

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
  <AlertDialog.Popup>
    <AlertDialog.Title>Delete this file?</AlertDialog.Title>
    <AlertDialog.Description>It cannot be undone.</AlertDialog.Description>
    <AlertDialog.Close>Cancel</AlertDialog.Close>
    <AlertDialog.Close onClick={deleteFile}>Delete</AlertDialog.Close>
  </AlertDialog.Popup>
</AlertDialog.Root>
```

`AlertDialog.Root`, `Trigger`, `Title`, `Description` and `Close` are
Dialog's parts, re-exported. `AlertDialog.Popup` is its own: Dialog's Popup
with the `alertdialog` role and no outside press.

### Decisions

- **It imports Dialog's parts.** A popup may import the popup it builds on,
  which `popupBases` in `packages/menhir/layers.ts` names, and no other
  (PLAN.md section 6, rule 4). The lint rule allows `alert-dialog` to import
  `dialog` and nothing else between popups. So an app that uses both pays
  for the shared parts once (see "Size"). Of the other two options, putting
  the shared parts in `floating` would make components of a layer that
  holds behaviour, each part with a module budget of its own, and copying
  them would make an app with both pay twice.
- **The Popup's shared code is in `dialog/popup/renderDialogPopup.tsx`**,
  which both Popups call: presence, the close request, the Tab wrap, the
  focus props, the scroll lock and the naming. Dialog's Popup passes
  `createOutsidePress` to it; Alert Dialog's passes the role instead. So
  `menhir/alert-dialog` bundles no outside press (`test/bundle-size`,
  `popupModules.ts`).
- **The `alertdialog` role** is on the `<dialog>`, which ARIA in HTML
  allows. `showModal()` still makes it modal (`aria-modal="true"`), with the
  top layer and an inert page. The consumer's `role` wins, as for any
  attribute of a part.
- **A press outside does not close it**, as the pattern's "interrupts the
  user's workflow" means: a click that missed the dialog is not an answer.
  The press reaches the `<dialog>` and nothing happens.
- **Escape closes it**, reporting `escape-key`. The pattern's keyboard is the
  modal dialog pattern's, where Escape closes, and its example closes on
  Escape. Escape is the least destructive answer, as Cancel is. The browser
  closes a modal `<dialog>` on Escape anyway, and holds a refused close only
  once, so keeping it open would be code against the platform (PLAN.md
  section 8, "What the browser does for popups"). A controlled Alert Dialog
  that keeps `open` refuses it, as a Dialog does.
- **Initial focus is the browser's**: the element with `autofocus`, else the
  first focusable one. The pattern's example puts focus on the least
  destructive action, which only the consumer knows. Place Cancel first, or
  give it `autofocus`, or name it in `initialFocus`; the README's example
  and the docs page place it first. No part marks the cancel action: it
  would be one more part for what `autofocus` does at no cost.
- **Every action is an `AlertDialog.Close`**, the confirming one with its
  own `onClick`, which runs before the dialog closes. An action that must
  wait, such as a request that may fail, controls `open` and closes it
  itself.
- **No Description is required.** The pattern's `aria-describedby` names
  the message, which `AlertDialog.Description` gives; without one, the Popup
  describes nothing, as a Dialog does. No warning, for the reason Dialog
  gives none for a missing name.
- **Development messages of the shared parts** name both components where
  they cannot tell them apart: a part outside its Root throws "Dialog parts
  must be placed within `<Dialog.Root>`, and Alert Dialog parts within
  `<AlertDialog.Root>`". The warning for a `render` function that renders no
  `<button>` names the part as Dialog's (`Dialog.Trigger`, `Dialog.Close`),
  since the part cannot tell, and telling it would cost every production
  app bytes. The Popup's warning names `AlertDialog.Popup`.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the Popup against the
part conventions. "A" marks a case the WAI-ARIA alert dialog pattern
requires, or the modal dialog pattern it refers to, "C" a case that runs only
in Chromium (`it.skipIf(isJSDOM)`). The re-exported parts are Dialog's, and
their own tests are Dialog's (`src/dialog/README.md`).

`AlertDialog.test.tsx`

- Its parts work together: the Trigger opens it and Close closes it, and `onOpenChange` gets `trigger-press` and `close-press`
- `defaultOpen` starts open, and every part has `data-open`
- A part outside `AlertDialog.Root` throws an error that names it

`popup/AlertDialogPopup.test.tsx`

- Renders a `<dialog>` with the `alertdialog` role, closed until opened
- Opened, it is modal: the `alertdialog` role, `:modal`, in the top layer, above an element with a high `z-index` (A: role `alertdialog`, `aria-modal`; C)
- Opened, the page outside is inert: a script cannot focus a button behind it (A: outside not operable; C)
- Named by its Title in `aria-labelledby` and described by its Description in `aria-describedby` (A: name, `aria-describedby` names the message)
- Without a Title, an `aria-label` names it (A: `aria-label`)
- The consumer's `role` wins
- Focus moves to the first focusable element on opening: Cancel, placed first (A: initial focus on the least destructive action; C)
- … and to the element with `autofocus`: Cancel, placed last (A; C)
- Tab from the last element moves to the first, Shift+Tab from the first to the last (A: Tab, Shift+Tab; C)
- Escape closes it, reporting `escape-key` with the key event (A: Escape; C)
- A press on the backdrop does not close it, and reports nothing (C)
- Focus returns to the Trigger on close (A: return focus; C)
- The page does not scroll while it is open, and scrolls again once closed (C)
- `render` with a `<dialog>` keeps its behaviour; warns in development, naming `AlertDialog.Popup`, when `render` does not render a `<dialog>`
- Throws a descriptive error outside `AlertDialog.Root`

`test/alert-dialog/AlertDialog.hydrate.test.tsx`

- The server HTML of a closed Alert Dialog has the Trigger with its type and `aria-haspopup`, and a closed `<dialog>` with the `alertdialog` role and `data-closed`, before any script runs (PLAN.md section 10)
- The server HTML of a `defaultOpen` Alert Dialog has a closed `<dialog>` with `data-open` and no `aria-labelledby` or `aria-describedby`, which name nothing yet
- Hydration adopts the server's elements without warnings; a `defaultOpen` Alert Dialog is then modal, named by its Title and described by its Description (C for `:modal`)
- After hydration the Trigger opens it by click, and by Enter (C)

## Left out

| Case                                                                                                                                                                                       | Reason                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cases of the re-exported parts (the Trigger's attributes, the Title's and Description's ids, nesting, the exit animation, `initialFocus` and `returnFocus` as functions, a refused Escape) | They are Dialog's parts and Dialog's shared Popup code, tested in `src/dialog`. `AlertDialog.test.tsx` checks that the namespace wires them up                                                                         |
| A part that marks the cancel action, or a Cancel and an Action part                                                                                                                        | See "Decisions": `autofocus` or the order steers initial focus at no cost, and both actions are `AlertDialog.Close`                                                                                                    |
| An Alert Dialog that Escape does not close                                                                                                                                                 | See "Decisions": the pattern closes on Escape, and the browser closes on a second Escape anyway. A controlled one refuses a close                                                                                      |
| A `<form method="dialog">` closing it                                                                                                                                                      | Dialog's shared close request reports it (`close-request`), tested in `src/dialog`                                                                                                                                     |
| A warning for an Alert Dialog with no Description                                                                                                                                          | The message may come from `aria-describedby` naming any element; as for a missing name in Dialog, only the accessibility tree settles it                                                                               |
| Tried with screen readers                                                                                                                                                                  | Not yet: Chromium's accessibility tree shows the `alertdialog` role, `modal=true`, the name and the description, and leaves the page outside out. VoiceOver, NVDA and JAWS are still to be tried, as for Dialog (#119) |

## Browsers and screen readers

Tried on 2026-11-22 in Chromium (Playwright's headless build, through the
test suite). No screen reader has been tried yet (#119).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-22.

| App                                       | Size    | Budget |
| ----------------------------------------- | ------- | ------ |
| `menhir/alert-dialog`                     | 3,356 B | 4.1 kB |
| `menhir/dialog`                           | 3,497 B | 4.2 kB |
| `menhir/dialog` and `menhir/alert-dialog` | 3,549 B |        |

Alert Dialog is Dialog less the outside press. An app with both pays 52 B
over Dialog alone, Alert Dialog's own Popup, instead of 3,356 B for a second
copy: the shared parts, the Popup's shared code and the `floating` modules
are bundled once (`test/package` checks it on the built package). Sharing
the Popup's code cost Dialog 27 B (3,470 B before #32), for the function
both Popups call.

The two together were measured as `test/bundle-size/comparison.size-limit.js`
measures components together: an app that imports both entry points and uses
every part of each.
