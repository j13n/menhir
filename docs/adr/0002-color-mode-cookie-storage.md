# One color-mode entry point per storage, and a cookie is read during the first render

Color mode can save the choice in a cookie (#62), so a server can render the chosen mode instead of leaving it to the head script. Each storage is its own entry point, `menhir/color-mode/local-storage` and `menhir/color-mode/cookie`, exporting the same functions; there is no `menhir/color-mode`. An app ships only the storage it imports, which PLAN.md section 6, rule 6 asks for, the import says which storage it uses, and switching is a change of import. The cookie version of `createColorMode` reads the cookie during the first render, through `getRequestEvent()` from `@solidjs/web` on the server, so the state is right before hydration without tying the library to a server framework.

## Considered options

- **A `storage: "cookie"` flag**: the simplest API, but every app would ship the cookie code, about a third of the entry point.
- **A storage object passed as the option** (`storage: cookieStorage`): ships only what is imported, but the whole entry point, which its size budget measures, still holds both storages, and the object's interface (with the head script's source in it) would be public API.
- **An `initialMode` option the app reads and passes in**: no `@solidjs/web` import, but every app has to wire the request's cookie through to the hook itself.

## Consequences

- There are two ways in, so the docs page says which to use: `local-storage`, unless the server renders each page and should send the chosen mode.
- An entry point can be a folder one level down (`src/color-mode/cookie/index.ts`), sharing code with its siblings inside the utility's folder.
- The head script stays, for cookies too: the server cannot see `prefers-color-scheme`, so a choice of `system` still needs it.
- A page rendered without a request, such as a prerendered one, has no cookie to read, so cookie storage needs per-request rendering; otherwise hydration disagrees with the client's first render.
- Cookies have no `storage` event, so another tab picks up a choice when it is shown again (`visibilitychange`), not live.
