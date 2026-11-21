# Color scheme, not color mode

The utility for the reader's light, dark or system choice was first called color mode (`menhir/color-mode`, `createColorMode`, `data-color-mode`). It is renamed color scheme (`menhir/color-scheme`, `createColorScheme` returning `scheme` and `setScheme`, `data-color-scheme`, storage key `color-scheme`) while `menhir` is 0.0.0, before any release depends on the name. Color scheme is the platform's word for exactly this choice: `prefers-color-scheme` is what `system` follows, and the CSS `color-scheme` property takes the resolved value as it is, so `[data-color-scheme="dark"] { color-scheme: dark }` is one line. It also places the utility beside `menhir/theme` (ADR 0003): a theme is a named look, and a color scheme is whether a look is light or dark, which is how the theme docs already use CSS `color-scheme`.

## Considered options

- **Keep color mode**: "dark mode" is everyday language, but "system mode" is not, and the name matches nothing in the platform.
- **Appearance**: the operating system's word for the setting, but CSS has an unrelated `appearance` property, so `data-appearance` reads as form-control styling.
- **Theme for light, dark and system, and a new name for the list of themes** (palette, skin): matches "light theme", but ADR 0003 gave theme to the named list, and "the nord palette" is worse than "the nord theme". It moves the awkward name instead of removing it.

## Consequences

- The name suggests the utility sets the CSS `color-scheme` property. It does not: it sets the attribute, and the docs page shows the line of CSS that sets the property from it.
- Sites that saved a choice under the old `color-mode` key show the default once; there were no releases to migrate.
