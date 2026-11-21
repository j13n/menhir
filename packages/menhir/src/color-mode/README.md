# Color Mode

The reader's light, dark or system choice: saved, applied to `<html>`, and
followed across tabs. A utility, not a component: it renders nothing, and the
control that changes the mode is the app's. The one exception to "Styling,
themes" in PLAN.md's non-goals; see `docs/adr/0001-color-mode-utility.md`.

## Sources

| Source                                                                                                       | Read       |
| ------------------------------------------------------------------------------------------------------------ | ---------- |
| [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) (MDN) | 2026-11-21 |
| [`storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) (MDN)               | 2026-11-21 |

## Shape

```ts
import {
  colorModeScript,
  createColorMode,
  nextColorMode,
  resolveColorMode,
} from "menhir/color-mode";
```

- `createColorMode(options?)` returns `mode`, `system` and `resolved`
  accessors and `setMode`. Call it in a component.
- `colorModeScript(options?)` returns the source of an inline head script
  that applies the choice before the first paint.
- `nextColorMode(mode, system)` is the order for a single cycling toggle:
  from `system`, the opposite of the system's look, then the system's look,
  then `system`. A click from `system` always changes the look.
- `resolveColorMode(mode, system)` replaces `system` with the system's look.

Both functions take the same options, so the hook and the script agree:
`storageKey` (default `"color-mode"`) and `attribute`, a `data-*` attribute
set to `light` or `dark` (default `"data-theme"`) or `"class"` for a `light`
or `dark` class.

Decisions:

- **The saved choice is read in `onSettled`.** The server cannot see the
  reader's storage or system, so it renders `system` and `light`; reading
  storage during the first client render would make hydration disagree. The
  head script has already applied the right look, so the page does not
  flash; only content that shows the mode, such as a toggle's icon, catches
  up once the page settles.
- **The DOM is written imperatively**, from `setMode` and the listeners, not
  from an effect. An effect's first run would apply the default `light`
  before the saved choice is read, undoing the head script.
- **`system` is stored as no value**: `setMode("system")` removes the key, so
  a reader who never chose has nothing saved.
- **Instances in one tab stay in step** through a `menhir:color-mode` event
  on `window`; the `storage` event only reaches other tabs. A site can render
  a toggle in its header and another in its docs.
- **Storage that throws**, as with cookies blocked, is ignored: the choice
  lasts for the page.
- **The head script's options are escaped** so that a `storageKey` cannot end
  the `<script>` element.

## Test list

`colorMode.test.ts`

- `resolveColorMode` keeps a fixed mode and replaces `system`
- `nextColorMode` cycles through every mode, for a light and a dark system
- `nextColorMode` changes the look on the first click from `system`
- `parseColorMode` reads `light` and `dark`, and anything else as `system`

`colorModeScript.test.ts`

- Applies the system preference when nothing is saved
- Applies a saved `light` or `dark` over the system
- Treats an unknown saved value as `system`
- Falls back to the system when storage throws
- Reads `storageKey` and writes `attribute`
- Swaps the `light` and `dark` classes with `attribute: "class"`
- Cannot close its script element through the options

`createColorMode.test.tsx`

- Reads the saved choice and the system once settled, and applies the look
- Is `system` with nothing saved, and resolves to the system's look
- Treats an unknown saved value as `system`
- Applies the same look as the head script with the same options, for every
  saved value, system preference and attribute kind
- Saves a choice and applies it; `system` removes the saved value
- Cycles from a button click with `nextColorMode`
- Follows the system while the choice is `system`, and not otherwise
- Follows a choice made, or storage cleared, in another tab; ignores other keys
- Keeps instances in the same tab in step, per storage key
- Uses `storageKey` and `attribute`, and swaps classes with `"class"`
- Works without storage, for the life of the page
- Stops listening when its owner is disposed

`test/color-mode/ColorMode.hydrate.test.tsx`

- The server renders `system`; hydration adopts it without warnings, then
  reads the saved choice and changes it on click

## Left out

| Case                                         | Reason                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Cookie storage, for server rendering         | #62                                                                                         |
| Modes beyond light, dark and system          | #63                                                                                         |
| A `nonce` or hash for a strict CSP           | #64                                                                                         |
| Setting `color-scheme` on `<html>`           | Styling: one line of CSS on the attribute, which the docs page shows                        |
| Turning transitions off while the mode swaps | Styling: the app decides whether colours fade, and can scope transitions with `motion-safe` |
| An element other than `<html>`               | The head script runs before the body exists, and one look per page is the common case       |
| A control                                    | The app's; the docs page shows one built on `nextColorMode`                                 |
