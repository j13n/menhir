# Color Mode

The reader's light, dark or system choice: saved, applied to `<html>`, and
followed across tabs. A utility, not a component: it renders nothing, and the
control that changes the mode is the app's. The one exception to "Styling,
themes" in PLAN.md's non-goals; see `docs/adr/0001-color-mode-utility.md`.
Cookie storage, for server rendering: `docs/adr/0002-color-mode-cookie-storage.md`.
Themes are a separate utility, `menhir/theme` (`src/theme/README.md`),
sharing the code below through `core/preference`
(`docs/adr/0003-theme-utility.md`).

## Sources

| Source                                                                                                             | Read       |
| ------------------------------------------------------------------------------------------------------------------ | ---------- |
| [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) (MDN)       | 2026-11-21 |
| [`storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) (MDN)                     | 2026-11-21 |
| [`visibilitychange` event](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) (MDN) | 2026-11-21 |
| [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) (MDN)               | 2026-11-21 |

## Shape

One entry point per storage, each exporting the same functions, so
switching storage is a change of import:

```ts
import {
  colorModeScript,
  createColorMode,
  nextColorMode,
  resolveColorMode,
} from "menhir/color-mode/local-storage";
// or, for a server that renders the chosen mode, the same and one more:
import { colorModeFromCookie } from "menhir/color-mode/cookie";
```

- `createColorMode(options?)` returns `mode`, `system` and `resolved`
  accessors and `setMode`. Call it in a component.
- `colorModeScript(options?)` returns the source of an inline head script
  that applies the choice before the first paint.
- `nextColorMode(mode, system)` is the order for a single cycling toggle:
  from `system`, the opposite of the system's look, then the system's look,
  then `system`. A click from `system` always changes the look.
- `resolveColorMode(mode, system)` replaces `system` with the system's look.
- `colorModeFromCookie(cookieHeader, options?)`, from the cookie entry point
  only, reads the mode from a `Cookie` request header, for a server that
  puts the attribute on its own `<html>`.

Both functions take the same options, so the hook and the script agree:
`storageKey`, the key or cookie name (default `"color-mode"`), and
`attribute`, a `data-*` attribute set to `light` or `dark` (default
`"data-color-mode"`) or `"class"` for a `light` or `dark` class. With `"class"`,
Menhir owns those two classes on `<html>`: changing the mode removes both
before adding one. The default is `data-color-mode`, not `data-theme`, so
that `menhir/theme` can have `data-theme` and a site can use both as they
come (ADR 0003).

Files: `local-storage/` and `cookie/` hold each entry point. The hook
(`createColorMode.ts`) and the script (`colorModeScript.ts`) are shared by
both, and take the storage as their first argument. Below them, in
`src/core/preference/` and shared with `menhir/theme`, are the storages
(`localStoragePreference`, `cookiePreference`), the saved-choice hook
(`createPreference`) and the head-script builder (`preferenceScript`). The
hook adds `system` to `createPreference`: it follows the media query and
resolves `system` through `createPreference`'s `resolve`. All of it is
internal.

Decisions:

- **A choice in `localStorage` is read in `onSettled`.** The server cannot
  see the reader's `localStorage` or system, so it renders `system` and `light`;
  reading storage during the first client render would make hydration
  disagree. The head script has already applied the right look, so the page
  does not flash; only content that shows the mode, such as a toggle's icon, catches
  up once the page settles.
- **The DOM is written imperatively**, from `setMode` and the listeners, not
  from an effect. An effect's first run would apply the default `light`
  before the saved choice is read, undoing the head script.
- **`system` is stored as no value**: `setMode("system")` removes the key, so
  a reader who never chose has nothing saved.
- **Instances in one tab stay in step** through a `menhir:preference` event
  on `window`, keyed by `storageKey`, so a theme on the same page keeps
  apart (it was `menhir:color-mode` before the code was shared with themes;
  the event is internal); the `storage` event only reaches other tabs. A site can render
  a toggle in its header and another in its docs.
- **Storage that throws**, as with cookies blocked, is ignored: the choice
  lasts for the page.
- **Each storage is an entry point**, not an option (ADR 0002): an app
  ships only the storage it imports (PLAN.md section 6, rule 6), and the
  import says which one it uses. The same function names in both make
  switching a change of import. Measured on 2026-11-21, every export
  gzipped: `local-storage` 1.16 kB, `cookie` 1.42 kB. Sharing the code
  with `menhir/theme` through `core/preference` (ADR 0003) cost about
  150 B of that, for the options objects and the generic hook.
- **A storage the server can read is read during the first render**
  (`PreferenceStorage.readsOnServer`). A cookie is read on the server from
  `getRequestEvent()` and in the browser from `document.cookie`, so `mode`
  is right from the start and hydration agrees. Reading through
  `@solidjs/web` ties the library to no server framework. `system` still
  waits for `onSettled`. A page rendered without a request, such as a
  prerendered one, has no cookie to read: it renders `system`, and
  hydration disagrees with a saved choice. Cookie storage needs per-request
  rendering.
- **The head script stays with cookies.** The server cannot see
  `prefers-color-scheme`, so `system` still needs it; with a fixed mode it
  applies what the server rendered.
- **The cookie is `Path=/`, `SameSite=Lax` and lasts a year**, so every page
  of the site is sent it and a returning reader keeps the choice. It is not
  `HttpOnly`, since the script and the hook read it. It is not `Secure`, so it
  also works on `http://localhost`; it holds nothing private. A `storageKey`
  with the `__Host-` or `__Secure-` prefix gets `Secure`, which a browser
  requires for those names. Its name is saved encoded, as `serializeCookie`
  writes it, and the script looks for the encoded name.
- **Other tabs read a cookie when shown again** (`visibilitychange`):
  cookies have no `storage` event. Two windows side by side do not follow
  each other live; the `cookieStore` `change` event would, but only in some
  browsers.
- **The head script's options are escaped** so that a `storageKey` cannot end
  the `<script>` element.
- **A strict Content Security Policy needs no option** (ADR 0004).
  `colorModeScript` returns the source and the app renders the element, so
  the app puts its nonce there, or allows the SHA-256 hash of the source. The
  source is the same for the same entry point, options and Menhir version, so
  a build can compute the hash; it is not published, since it would differ
  per option and change with a release. The script uses nothing else a
  policy restricts: no `eval`, no inline style, no request.

## Test list

Tests go through the entry points: `menhir/color-mode/local-storage` unless
they say `cookie`.

`colorMode.test.ts`

- `resolveColorMode` keeps a fixed mode and replaces `system`
- `nextColorMode` cycles through every mode, for a light and a dark system
- `nextColorMode` changes the look on the first click from `system`
- `parseColorMode` reads `light` and `dark`, and anything else as `system`

`colorModeFromCookie.test.ts`

- `colorModeFromCookie` reads the mode from a `Cookie` header, anything else
  as `system`, and the cookie named by `storageKey`

`colorModeScript.test.ts`

- Applies the system preference when nothing is saved
- Applies a saved `light` or `dark` over the system
- Treats an unknown saved value as `system`
- Falls back to the system when storage throws
- Reads `storageKey` and writes `attribute`
- Swaps the `light` and `dark` classes with `attribute: "class"`
- Cannot close its script element through the options
- Under a Content Security Policy (Chromium only; jsdom enforces none): is
  blocked by a policy that allows no inline script; runs in a script element
  with the policy's nonce; runs when the policy allows the hash of its
  source; has another hash with other options; from `cookie`, runs with a
  nonce or a hash
- From `cookie`: applies a saved `light` or `dark` over the
  system; applies the system with no cookie, an unknown value, or only
  cookies whose names contain the key; falls back to the system when cookies
  throw; reads an encoded `storageKey` and cannot close its script element

`createColorMode.test.tsx`

- Reads the saved choice and the system once settled, and applies the look
- Is `system` with nothing saved, and resolves to the system's look
- Treats an unknown saved value as `system`
- Applies the same look as the head script with the same options, for each
  entry point, saved value, system preference and attribute kind
- Saves where the head script reads, for each entry point, under a
  `storageKey` that needs encoding and escaping
- Saves a choice and applies it; `system` removes the saved value
- Cycles from a button click with `nextColorMode`
- Follows the system while the choice is `system`, and not otherwise
- Follows a choice made, or storage cleared, in another tab; ignores other keys
- Keeps instances in the same tab in step, per storage key
- Uses `storageKey` and `attribute`, and swaps classes with `"class"`
- Works without storage, for the life of the page
- Stops listening when its owner is disposed
- From `cookie`: reads the saved choice on the first render;
  applies the cookie, not `localStorage`, once settled; saves a choice in a
  cookie for every path, for a year, and removes it for `system`; saves a
  `__Host-` or `__Secure-` name as `Secure`; picks up
  another tab's choice when shown again, until disposed; works without
  cookies, for the life of the page

`test/color-mode/ColorMode.hydrate.test.tsx`

- The server renders `system`; hydration adopts it without warnings, then
  reads the saved choice and changes it on click
- From `cookie`, the server renders the cookie's choice from the
  request; hydration adopts it without warnings, and a click saves the next
  one

## Left out

| Case                                         | Reason                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Live sync of a cookie between visible tabs   | No `storage` event for cookies; `cookieStore`'s `change` event is not in every browser         |
| Modes beyond light, dark and system          | #63                                                                                            |
| A `nonce` option or a published hash         | The app renders the script element, so both are the app's; the docs page shows them (ADR 0004) |
| The head script as a file                    | A file loads after the page can paint, which is the flash the script prevents (ADR 0004)       |
| Setting `color-scheme` on `<html>`           | Styling: one line of CSS on the attribute, which the docs page shows                           |
| Turning transitions off while the mode swaps | Styling: the app decides whether colours fade, and can scope transitions with `motion-safe`    |
| An element other than `<html>`               | The head script runs before the body exists, and one look per page is the common case          |
| A control                                    | The app's; the docs page shows one built on `nextColorMode`                                    |
