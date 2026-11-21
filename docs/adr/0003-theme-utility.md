# A theme utility beside color mode, not extra color modes

Some apps want a choice beyond light, dark and system, such as sepia or high contrast (#63). Menhir ships it as a separate utility, `menhir/theme/local-storage` and `menhir/theme/cookie`, rather than as extra color modes: a theme is just a theme, whether it is light or dark, and a site usually has one colour, a light, dark or system choice, or a list of themes. `createTheme({ themes, defaultTheme })` keeps the reader's choice out of the app's list, saves it, applies its name to `<html>` and follows other tabs, with a head script that applies it before the first paint, as color mode does. It has no `system` choice and no link to `prefers-color-scheme`. Both utilities share their storages, saved-choice hook and head-script builder through `src/core/preference/`, since a folder under `src/` may import only from `core`. This widens ADR 0001's exception to PLAN.md's "no themes" to the choice of theme; how each theme looks is still the app's.

## Considered options

- **Extra color modes, each on a light or dark base** (`modes: { sepia: "light" }`): built first, then dropped. It tied every theme to light or dark, made the color-mode types generic, and put the cost on every color-mode app.
- **Free-form color modes with no base**: one utility, but `system` and `resolved` would mean nothing for most of the modes.
- **Won't fix**: every app with themes would write the same saved state, head script and tab sync that ADR 0001 put in the library for color mode.
- **A copy of color mode's storage and hook in the theme folder**: no change to the `core` layer, but about 200 lines of the same logic to keep in step.
- **A default theme that follows the system**: closer to what some sites do, but it ties themes back to light and dark, which color mode already covers.

## Consequences

- `core` gains `preference/`, internal like the rest of the layer: the `localStorage` and cookie storages, `createPreference` and `preferenceScript`. Color mode is `createPreference` plus the system preference; theme is `createPreference` with a list of names.
- Color mode's entry points grow by about 150 B gzipped for the shared code, and their budgets rise to 1.4 kB (`local-storage`) and 1.7 kB (`cookie`). The theme entry points are budgeted at 1.3 kB and 1.6 kB.
- Instances in one tab keep in step through one `menhir:preference` event, keyed by storage key, so a color mode and a theme on the same page keep apart. Theme takes the `data-theme` attribute, and color mode's default moves from `data-theme` to `data-color-mode` (while `menhir` is 0.0.0), so a site can use both as they come and style each theme's light and dark looks from the two attributes.
- Theme names are limited to letters, digits, `-` and `_`, since a class cannot hold a space and the head script reads a cookie's value as saved. Development builds throw for another name.
