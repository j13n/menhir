# `floating`

The layer that popup components build on (PLAN.md section 6). It holds what
the browser does not do for a popup: `<dialog>` and `popover` already give the
top layer, Escape, light dismiss, initial and return focus, and an inert page
(PLAN.md section 8, "What the browser does for popups").

## Modules

One folder per module, each with its own README: the test list, the cases left
out, the sources and the module's measured size.

| Folder             | What it does                                                                                                               | Ticket |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| `positioning/`     | Places a popup against its anchor, on `@floating-ui/dom`                                                                   | #25    |
| `dismissal/`       | Outside press on a dialog's backdrop, Escape for Tooltip and Navigation Menu's Panels, a refused close, why a popup closed | #26    |
| `focus/`           | The Tab wrap of a modal dialog, overrides of initial and return focus, finding tabbable elements                           | #27    |
| `scroll-lock/`     | Stops the page scrolling behind a modal popup                                                                              | #28    |
| `presence/`        | Keeps a closing popup open until its exit animation has ended                                                              | #96    |
| `hover/`           | Opens and closes a popup on hover, with delays, a safe area to the popup and delay groups                                  | #30    |
| `list-navigation/` | Arrow keys between the items of a list popup                                                                               | #97    |
| `typeahead/`       | Moves to the item whose text the user types                                                                                | #98    |

`floatingModules` in `packages/menhir/layers.ts` lists the same folders, for the
size and bundle checks in `test/bundle-size`.

## Rules

- **Internal.** No entry point in `exports`, as with `core`. Apps and styled
  layers use the popup components.
- **No barrel.** A popup imports from the module's folder directly, as
  `../floating/dismissal/...`, so Dialog never reaches `positioning/` or
  `hover/`. Inside a folder, a behaviour that a popup may leave out is a file
  of its own (rule 6).
- **Imports** `core` and `@floating-ui/dom` only (rule 4; `oxlint.config.ts`).
- **Built when written.** `vite.config.ts` compiles every module, even one
  no popup imports yet, so that it can be measured.
- **A budget per module file.** `test/bundle-size/floatingBudgets.ts` has one for
  each file that a popup imports, measured like an entry point and not
  published. `floatingSize.test.ts` fails if a folder has none.
- **What each popup must not bundle** is listed in
  `test/bundle-size/popupModules.ts`, and checked once the popup is built.
- **No shared stack of open popups.** The top layer is the stack: a module asks
  the browser (`:modal`, `:popover-open`, the event's target). A Tooltip's
  Escape listener calls `preventDefault()`, so a dialog below it stays open.
  If a module ever needs a stack, it lives in `stack/`, created in the browser
  on first use and never at import time, since module state is shared between
  requests on the server. A count is not a stack: scroll lock counts the
  popups holding it in its own module, written only from effects.
- **Nothing runs at import time or during a server render** (rule 2). Listeners
  exist only while a popup is open, except on the trigger of a module that
  opens the popup from it: `hover/` listens on the trigger from mount to
  disposal, since it opens while closed.
