# Theme

The reader's choice of theme, out of the app's list: saved, applied to
`<html>`, and followed across tabs. A utility, not a component: it renders
nothing, and the control that changes the theme and how each theme looks
are the app's. Separate from color mode on purpose: a theme is just a
theme, whether it is light or dark, and a site usually has either a light,
dark or system choice or a list of themes. Widens the color-mode exception
to "Styling, themes" in PLAN.md's non-goals; see
`docs/adr/0003-theme-utility.md`.

## Sources

| Source                                                                                                             | Read       |
| ------------------------------------------------------------------------------------------------------------------ | ---------- |
| [`storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) (MDN)                     | 2026-11-21 |
| [`visibilitychange` event](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) (MDN) | 2026-11-21 |
| [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) (MDN)               | 2026-11-21 |
| [Content Security Policy: nonces and hashes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) (MDN)   | 2026-11-21 |

## Shape

One entry point per storage, as for color mode (ADR 0002), each exporting
the same functions:

```ts
import { createTheme, themeScript } from "menhir/theme/local-storage";
// or, for a server that renders the chosen theme, the same and one more:
import { themeFromCookie } from "menhir/theme/cookie";

const options = {
  themes: ["paper", "nord", "dracula"],
  defaultTheme: "paper",
} as const;
```

- `createTheme(options)` returns a `theme` accessor and `setTheme`. Call it
  in a component.
- `themeScript(options)` returns the source of an inline head script that
  applies the choice before the first paint.
- `themeFromCookie(cookieHeader, options)`, from the cookie entry point
  only, reads the theme from a `Cookie` request header, for a server that
  puts the attribute on its own `<html>`.

All three take the same options, so the hook and the script agree:
`themes`, every theme the reader can choose; `defaultTheme`, the one shown
until they choose; `storageKey`, the key or cookie name (default
`"theme"`); and `attribute`, a `data-*` attribute set to the theme's name
(default `"data-theme"`) or `"class"` for a class named after it. The theme
names are inferred as a union from `themes`, so `setTheme("sepia")` does
not compile when there is no sepia.

Files: `theme.ts` holds the options, the state and the functions both
entry points share; `local-storage/` and `cookie/` bind each to its
storage. The storages, the saved-choice hook and the head-script builder
are in `src/core/preference/`, shared with color mode.

Decisions:

- **A theme has no link to the system.** There is no `system` choice and
  no `prefers-color-scheme`: before the reader chooses, the page shows
  `defaultTheme`. A site that wants the system's light or dark uses color
  mode.
- **The default theme is stored as no value**: choosing it removes the key,
  so a reader who never chose has nothing saved, and changing
  `defaultTheme` reaches every reader who kept the default.
- **A saved value that is not one of `themes` is the default**, in the hook,
  in the script and in `themeFromCookie`, so removing a theme from the list
  sends its readers back to the default.
- **The same reading, saving and syncing as color mode**, through
  `core/preference`: `localStorage` is read once the page has settled, a
  cookie during the first render; the DOM is written imperatively; storage
  that throws is ignored; instances in one tab stay in step through a
  `menhir:preference` event keyed by `storageKey`; other tabs follow through
  the `storage` event, or with a cookie, when shown again. See color mode's
  README for why.
- **The default `storageKey` is `"theme"` and the default `attribute` is
  `"data-theme"`**, the name most themes are styled from. Color mode
  defaults to `data-color-mode` and `"color-mode"`, so a site can use both
  as they come, and style a theme's dark look under both attributes.
- **Theme names are letters, digits, `-` and `_`.** A class cannot hold a
  space, and a cookie value is saved encoded, which the head script does not
  undo. Development builds throw for another name, and for a `defaultTheme`
  that is not in `themes`, from `createTheme` and `themeScript`; production
  builds drop the check with `isDev`.
- **With `attribute: "class"`, every theme name is a class Menhir owns on
  `<html>`.** Changing the theme removes all of them before adding one, so
  an app class with a theme's name would go too.
- **The head script's options are escaped** so that a `storageKey` cannot end
  the `<script>` element.
- Measured on 2026-11-21, every export gzipped: `local-storage` 1.12 kB,
  `cookie` 1.37 kB, each with about 130 B of development-only checks that
  the measurement counts (#69).
- **A strict Content Security Policy needs no option**, as for color mode
  (ADR 0004): the app renders the script element, so it puts its nonce
  there, or allows the SHA-256 hash of the source, which changes with the
  options.

## Test list

Tests go through the entry points: `menhir/theme/local-storage` unless
they say `cookie`.

`themeScript.test.ts`

- Applies the default theme when nothing is saved
- Applies a saved theme
- Applies the default theme for an unknown saved value, including
  `constructor` and `toString`
- Applies the default theme when storage throws
- Reads `storageKey` and writes `attribute`
- Swaps the theme classes with `attribute: "class"`
- Rejects a theme name the script could not apply, and a `defaultTheme`
  outside `themes`
- Cannot close its script element through the options
- Under a Content Security Policy (Chromium only; jsdom enforces none): is
  blocked without the policy's nonce or hash; runs in a script element
  with the policy's nonce; runs when the policy allows the hash of its
  source; has another hash with another list of themes
- From `cookie`: applies a saved theme, or the default; applies the default
  when cookies throw; reads an encoded `storageKey` and cannot close its
  script element

`themeFromCookie.test.ts`

- Reads the theme from a `Cookie` header, anything else as the default, and
  the cookie named by `storageKey`

`createTheme.test.tsx`

- Reads the saved theme once settled, and applies it
- Is the default theme with nothing saved, or an unknown value
- Applies the same theme as the head script with the same options, for each
  entry point, saved value and attribute kind
- Saves where the head script reads, for each entry point, under a
  `storageKey` that needs encoding and escaping
- Saves a theme and applies it; the default removes the saved value
- Changes from a `<select>`
- Follows a theme chosen, or storage cleared, in another tab; ignores other
  keys
- Keeps instances in the same tab in step, apart from a color mode on the
  same page, each on its own default attribute
- Uses `storageKey` and `attribute`, and swaps classes with `"class"`
- Rejects a theme the head script could not apply
- Works without storage, for the life of the page
- Stops listening when its owner is disposed
- From `cookie`: reads the saved theme on the first render; saves a theme
  in a cookie for every path, for a year, and removes it for the default;
  picks up another tab's choice when shown again, until disposed

`test/theme/Theme.hydrate.test.tsx`

- The server renders the default theme; hydration adopts it without
  warnings, then reads the saved theme and saves a new one on click
- From `cookie`, the server renders the cookie's theme from the request;
  hydration adopts it without warnings, and a click saves the next one

## Left out

| Case                                       | Reason                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| A default that follows the system          | A theme is just a theme; color mode covers light, dark and system (ADR 0003). A theme per system scheme: #73 |
| Light and dark variants of each theme      | Two axes; an app that wants both can use color mode and theme side by side, with two attributes              |
| Live sync of a cookie between visible tabs | No `storage` event for cookies; `cookieStore`'s `change` event is not in every browser                       |
| A `nonce` option or a published hash       | The app renders the script element, so both are the app's, as for color mode (ADR 0004)                      |
| The head script as a file                  | A file loads after the page can paint, as for color mode (ADR 0004)                                          |
| Setting `color-scheme` per theme           | Styling: one line of CSS under each theme's attribute, which the docs page shows                             |
| A control                                  | The app's: a `<select>`, radio group or menu; the docs page shows one                                        |
