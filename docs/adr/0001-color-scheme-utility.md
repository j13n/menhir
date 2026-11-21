# A color-scheme utility in the library, despite "no themes"

PLAN.md rules out styling and themes, but Menhir ships `menhir/color-scheme`. It keeps the reader's light, dark or system choice, saves it, applies it to `<html>`, follows the system preference and other tabs, and provides the inline head script that prevents a flash before the first paint. This state and the script are the same in every app and easy to get subtly wrong (a hydration mismatch, a flash, script injection through the storage key). How each scheme looks is still the app's, and so is the control that changes it. The site's own toggle is built on the utility, and its docs page shows that toggle as an example.

## Considered options

- **Site-only code**: kept the library free of anything that isn't an accessibility primitive, but every Menhir user who wants a toggle would write the same state and script again.
- **A `ColorSchemeToggle` component**: the control would have no ARIA pattern of its own (it is a button, toggle group or menu), and it would fix the number of schemes and the look of the control. The example on the docs page covers this instead.

## Consequences

- The first version leaves out cookie storage for server rendering (#62), custom schemes (#63) and a CSP nonce (#64). Each one widens the API, so each needs its own decision. Cookie storage has since been added (ADR 0002), custom schemes became a separate theme utility (ADR 0003), and a strict CSP turned out to need documentation, not an option (ADR 0004).
- An entry point can now be a utility with no `index.parts.ts`. The build in `vite.config.ts` adds a parts entry only when the file exists.
