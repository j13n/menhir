# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, with small and measurable bundles.

Status: planning. Nothing in this document is built yet. Versions were checked on 2026-11-18 and name availability on 2026-11-19.

## 1. Why this exists

- React has Base UI, Radix and React Aria. Solid's established equivalents (Kobalte, corvu, Ark UI) are fewer, less active, and were built for Solid 1.x. Base UI ports for Solid 2.0 appeared in late 2026 (section 4); they mirror Base UI's structure and its bundle sizes.
- Solid 2.0 is now stable (`solid-js@2.0.1`). Every existing library has to migrate, so a library written natively for 2.0 has an opening.
- A recurring complaint about the current Solid options is bundle size: importing one simple component pulls in a large shared layer that does not tree-shake. Menhir treats bundle size as a feature with enforced budgets.

## 2. Goals and non-goals

**Goals**

- Behaviour and accessibility on par with the best React primitives. Base UI is the starting point and the source of tests: a component's ported Base UI tests must pass.
- Each component costs only what it uses. Sizes are published per component.
- Idiomatic Solid 2.0 APIs, not React APIs with different imports.
- Near-zero runtime dependencies.

**Non-goals**

- Styling, themes, or a shadcn-style registry. Those can be built on top later.
- Support for Solid 1.x.
- Being a Base UI port. Its behaviour and tests are where each component starts; its source structure, its API and its release schedule are not a contract (how close the API stays is open question 4).
- Covering all of Base UI before the first release.

## 3. Name

- **Menhir**: a single standing stone. Fits "primitive", short, easy to say.
- npm: `menhir` and `menhir-ui` were both unclaimed on 2026-11-18 and still were on 2026-11-19. `menhir` 0.0.0 was published as a placeholder on 2026-11-19 (README, LICENSE and `package.json` only). `menhir-ui` is not held: the library is one package, and an empty second one would only squat the name. Publish from `packages/menhir`, since the workspace root is private; the npm account needs two-factor authentication for writes.
- npm scope `@menhir`: already exists, with no public packages (2026-11-19). Not needed, since the package is unscoped (section 6, "Package shape").
- GitHub: the `menhir` account is taken by a user created in 2012, whose public repositories were last pushed in 2016. `menhir-ui`, `menhirjs` and `menhir-solid` were free on 2026-11-19. Decided on 2026-11-19 (#2): no org for now; the repository stays at `j13n/menhir`.
- Domains (RDAP and registry whois, 2026-11-19): `menhir.com`, `menhir.dev`, `menhir.io` and `menhir.org` are registered. `menhir.sh`, `menhirui.dev`, `menhir-ui.dev`, `menhirui.com`, `menhir-ui.com`, `menhirjs.dev` and `menhirjs.com` were free. `menhir.js.org` is unclaimed; js.org subdomains are free for JavaScript projects. Plan: once the docs site has more than placeholder content (js.org rejects placeholder pages), host it on Cloudflare and request `menhir.js.org`, which on Cloudflare has to be added as a custom domain through the API, not the dashboard. If the name is gone by then, buy a domain instead.
- Known collision: Menhir is a parser generator for OCaml. Different ecosystem; "menhir solid" and "menhir ui" should stay searchable.
- Common typos: "mehir", "menir".

## 4. Landscape

### Established Solid libraries

| Library                                 | Notes                                                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Kobalte                                 | The most complete option. Still maintained. Source of the bundle-size complaints when combined with corvu. |
| corvu                                   | High quality, small set of components.                                                                     |
| Ark UI                                  | Multi-framework, built on Zag state machines, has a Solid target.                                          |
| solid-ui, Zaidan, solidcn, shadcn-solid | Styled, copy-paste layers on top of Kobalte and corvu. Potential consumers of Menhir, not competitors.     |

### Existing Base UI ports for Solid

| Project                                                  | Notes                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ZerNico/base-ui-solid (`base-ui-solid` 0.3.1)            | The incumbent. All 38 components, peers `^2.0.0-rc.15`, upstream's tests ported and passing in CI, `main` tracking Base UI 1.9.0 (121 commits ahead of 0.3.1), MIT with Base UI's notice. Its stated goal is a file-by-file mirror of upstream. One maintainer, started 2026-10-05. Switch is 22.4 kB minified, Dialog 90.4 kB. |
| quoin-ui 0.6.0                                           | 40 components, peers pinned to exactly `2.0.0-rc.18`, no CI, its own tests instead of upstream's, Base UI's licence notice not kept. Repo on gitcafe.dev, built with Bun and Biome. Switch is 17.9 kB minified, Dialog 72.0 kB.                                                                                                 |
| unstyled-solid/base-ui (`@unstyled-solid/base-ui` 0.0.3) | All components at Base UI 1.8.0, peers pinned to exactly `2.0.0-rc.20`, upstream's tests ported in jsdom, SSR and browser lanes. One author, 21 commits. Switch is 21.5 kB minified.                                                                                                                                            |
| nayupls1/base-ui-solid (`base-ui-solidjs` 0.1.0)         | A two-day scripted port of Base UI 1.9.0 with 27 test files of its own and failing CI. Switch is 18.3 kB minified.                                                                                                                                                                                                              |
| @msviderok/base-ui-solid 1.0.0-beta.12                   | Solid 1.x only (`^1.8`), pinned to Base UI 1.0.0-beta.1, three commits since January 2026. Its tests and its port of the Floating UI React layer are useful as a reference, not as code to adapt. Switch is 14.7 kB minified, Dialog 54.0 kB.                                                                                   |
| Script-Augur/base-ui-solid                               | Solid 1.x, 24 of 38 components, stalled since 2026-09-17. Ignore.                                                                                                                                                                                                                                                               |
| danielfrg/solid-ui                                       | Mostly a Kobalte fork with parts adapted from Base UI. The author wrote up a failed AI-driven straight port. Not evaluated.                                                                                                                                                                                                     |
| rigid-ui, organic-ui                                     | Small, early. Not evaluated.                                                                                                                                                                                                                                                                                                    |

The first six were evaluated by reading their code on 2026-11-19 (#1), and the five that publish to npm had their bundles measured. Findings, sizes and what to borrow are in [docs/research/base-ui-ports.md](docs/research/base-ui-ports.md). None of them competes on bundle size, and the only viable one to contribute to has a goal that conflicts with section 8, so the decision is to continue with Menhir (section 12, question 1).

## 5. Target versions

| Dependency       | Version on 2026-11-18 | Notes                                                                |
| ---------------- | --------------------- | -------------------------------------------------------------------- |
| solid-js         | 2.0.1                 | Peer dependency. 1.x not supported.                                  |
| @solidjs/web     | 2.0.1                 | Peer dependency. Rendering and JSX types moved here in 2.0.          |
| @base-ui/react   | 1.9.0                 | Reference only, not a dependency. Pin the version being ported from. |
| @floating-ui/dom | 1.8.0                 | Only runtime dependency, used by popup components only.              |

Solid 2.0 changes that affect a component library (confirm against the official migration guide, `MIGRATION.md` in the solid repo, and v2.solidjs.com):

- `createEffect` is split into a compute phase and an apply phase.
- `onMount` is replaced by `onSettled`.
- The `use:` directive is removed in favour of ref factories.
- `<Index>` is replaced by `<For keyed={false}>`.
- Async is part of the reactive graph; Suspense is reworked.
- `render` and the JSX import source come from `@solidjs/web`.

## 6. Bundle-size rules

These are structural and must hold from the first commit.

1. **One entry point per component.** `menhir/dialog`, `menhir/switch`, and so on, declared in `exports`. No root barrel as the main way in.
2. **Unbundled ESM, `"sideEffects": false`.** One output file per source module. No code that runs at import time.
3. **No `Object.assign` compound components.** Use namespace re-exports so unused parts are dropped. Rollup and Rolldown drop them; esbuild keeps the whole namespace (measured on quoin-ui, see [docs/research/base-ui-ports.md](docs/research/base-ui-ports.md)), so measure part-level budgets with Rolldown:
   ```ts
   // dialog/index.ts
   export * as Dialog from "./index.parts.ts";
   // dialog/index.parts.ts
   export { DialogRoot as Root } from "./root/DialogRoot.tsx";
   export { DialogTrigger as Trigger } from "./trigger/DialogTrigger.tsx";
   ```
   The build has to keep that re-export as written; see "Build" in section 7.
4. **Strict layers.** Enforced by an import-boundary lint rule.
   | Layer             | Contains                                                                     | May import                 |
   | ----------------- | ---------------------------------------------------------------------------- | -------------------------- |
   | `core`            | Prop merging, controlled/uncontrolled signal, ids, polymorphism helper       | Nothing internal           |
   | `floating`        | Positioning, dismissal, focus trap, hover intent, list navigation, typeahead | `core`, `@floating-ui/dom` |
   | Simple components | Switch, Toggle, Checkbox, Tabs, etc.                                         | `core` only                |
   | Popup components  | Dialog, Popover, Menu, Select, etc.                                          | `core`, `floating`         |
5. **Near-zero dependencies.** `@floating-ui/dom` only. Use built-in `Intl` for number and date formatting.
6. **Expensive behaviour is a part, not a flag.** Portal, scroll lock and focus trap are composed in, so apps that don't render them don't ship them.

The package manifest, in the shape built in the build spike (#6). Only `./switch` exists so far; `./dialog` shows how each further component is added:

```json
{
  "name": "menhir",
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./dialog": {
      "types": "./dist/source/dialog/index.d.ts",
      "solid": "./dist/source/dialog/index.js",
      "import": "./dist/dialog/index.js"
    },
    "./switch": {
      "types": "./dist/source/switch/index.d.ts",
      "solid": "./dist/source/switch/index.js",
      "import": "./dist/switch/index.js"
    }
  },
  "dependencies": { "@floating-ui/dom": "^1.8.0" },
  "peerDependencies": { "solid-js": "^2.0.0", "@solidjs/web": "^2.0.0" }
}
```

The `solid` condition points at uncompiled JSX and must come before `import`: compiled DOM output cannot hydrate and cannot render on the server, so SSR apps need the source. Confirmed in the build spike (#6), in two ways:

- **The Solid 2.0 library guide says so.** It is the "Building a library" section of the `@solidjs/vite-plugin` 3.0.1 README. It prescribes JSX source under `solid`, listed before `import`, with `solid-js` and `@solidjs/web` as peers. The plugin adds `solid` to Vite's `resolve.conditions`, and bundles every dependency that has a `solid` export into the SSR build instead of leaving it external.
- **Removing it breaks SSR.** With the `solid` key deleted from `menhir`, the fixture app in `test/ssr-app` fails to render with "Client-only API called on the server side", because the server then gets the DOM build.

The entry of a component is a `.ts` file with no JSX, so its `solid` target ends in `.js`. The `.jsx` files are the modules it imports.

No separate server build under `node`/`worker`/`deno`, which `base-ui-solid` 0.3.1 and `unstyled-solid/base-ui` ship. It would serve only an app that renders on the server without compiling its dependencies, which is not a setup the guide describes: an app on the Solid plugin always compiles the `solid` source. Add one if a user turns up with such a setup.

### Enforcement

- A size budget per entry point in CI (size-limit or similar). A pull request that exceeds a budget fails.
- Per-component sizes published in the docs.
- A CI test that bundles a single simple component and asserts nothing from `floating` is included.

### Package shape

Decided on 2026-11-19 (#3): one `menhir` package with one subpath export per component. No `@menhir/*` packages.

How comparable libraries ship (npm and their docs, 2026-11-19):

| Library                           | Shape                                                                                                                                                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base UI (`@base-ui/react` 1.9.0)  | One package, one subpath export per component                                                                                                                                                                                      |
| quoin-ui 0.6.0                    | One package: 40 component subpath exports plus a root barrel                                                                                                                                                                       |
| Kobalte (`@kobalte/core` 0.13.14) | One package, `./*` wildcard export                                                                                                                                                                                                 |
| Ark UI (`@ark-ui/solid` 5.40.0)   | One package, built internally on per-machine `@zag-js/*` packages                                                                                                                                                                  |
| Radix                             | Per-component `@radix-ui/react-*` packages. Since 2025-01-22 also a single `radix-ui` package, so apps stay current "without worrying about conflicting or duplicate dependencies"; its Getting Started now installs only that one |
| corvu 0.7.2                       | Per-component `@corvu/*` packages, recommended so each primitive has its own semver and can be updated separately, plus a `corvu` package that re-exports them                                                                     |

Reasoning, by consideration in #3:

- **Release overhead.** One version, one changelog, one publish. With separate packages, every `core` change means releasing every package that depends on it. corvu's benefit, independent semver per primitive, is worth little before 1.0, when components change together.
- **Duplicate shared code.** Separate packages share `core` as a dependency. An app that resolves two versions of it ships two copies, and parts built against different copies do not share context. This is the problem Radix's single package was added to avoid. With one package, all components in an app come from the same `menhir` version, so they share one `core`.
- **Tree-shaking.** Bundlers drop unused modules, not unused packages. With unbundled ESM, `"sideEffects": false` and one entry per component (rules 1 and 2), importing `menhir/switch` includes only the modules reachable from that entry, the same result as a separate `@menhir/switch` package. The checks under Enforcement test this.
- **Keeping `floating` out.** `@floating-ui/dom` is a regular `dependency` of `menhir`, as it is for Kobalte and quoin-ui. Every install downloads it (174 kB unpacked in 1.8.0), but only `floating` modules import it, and only popup entries import `floating` (rule 4). An app that uses only simple components never bundles it. An optional peer dependency would save the download but make every popup user install it by hand.
- **Consumers.** A styled layer installs one package and imports from subpaths, the pattern Base UI, Kobalte and Ark UI already use, and keeps one version current instead of a set in step. It should list `menhir` as a peer dependency, so that an app using two styled layers still resolves one copy of `menhir`.

Costs accepted:

- An app cannot upgrade one component without the rest. Revisit if users ask for it after 1.0.
- Subpath types need `moduleResolution` set to `bundler`, `node16` or `nodenext`. Consumers on `node10` (`node`), which TypeScript 7 has removed, are not supported; no `typesVersions` fallback is shipped.

## 7. Tooling

Principle: use the tooling of the official Solid 2.0 template (`pnpm create solid@latest`, as scaffolded in `website`), since that is where the Solid 2.0 ecosystem is heading, and keep Base UI's test structure on top of it so its tests port almost mechanically. Versions are the ones the template resolved on 2026-11-19, or npm `latest` on 2026-11-18 for tools the template does not include.

| Area                  | Choice                                                                                                                                                     | Notes                                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Package manager, repo | pnpm 12 workspace: `packages/menhir`, `website`, `test/bundle-size`, `test/ssr-app`                                                                        | Base UI's layout, with its `docs` folder named `website` here.                                                                                                                                                                             |
| Compiler              | `@solidjs/vite-plugin` 3.0.1                                                                                                                               | The Solid 2.0 plugin (peers `solid-js ^2`, Vite 8 or 9). `vite-plugin-solid` 2.x is 1.x only.                                                                                                                                              |
| Build                 | Vite 8 library mode with preserved modules for compiled JS; `tsc -p tsconfig.build.json` with `jsx: preserve` for `.jsx` source and `.d.ts`                | The shape the official library guide documents, confirmed in the build spike (#6). `pnpm build` in `packages/menhir`. Details under "Build" below.                                                                                         |
| Tests                 | Vitest 5.1; jsdom by default, Chromium through `@vitest/browser-playwright`                                                                                | Base UI's runner and split: a `VITEST_ENV` variable selects the browser, `it.skipIf(isJSDOM)` marks browser-only cases.                                                                                                                    |
| Test utilities        | `@solidjs/testing-library` 1.0.0-rc.2, `@testing-library/user-event`, `@testing-library/jest-dom`, plus our own `createRenderer` and `describeConformance` | The template's test library, built for Solid 2.0. Base UI's tests call the two helpers from its `#test-utils`; `createRenderer` is a thin wrapper over the testing library, so test bodies stay close to upstream.                         |
| SSR tests             | `*.hydrate.test.tsx` files, run by a `hydrate` Vitest project                                                                                              | `renderOnServer` from `#test-utils` renders a fixture on a Vite SSR server, and `render(ui, { hydrate })` hydrates the result. Details under "Build" below. Covers the SSR line in the definition of done.                                 |
| Lint                  | oxlint 1.92 running `eslint-plugin-solid` 0.20 (`configs/v2`) as a JS plugin, one config for the workspace                                                 | The template's setup. The layer table in section 6 is enforced in oxlint too: `eslint-plugin-boundaries` as a JS plugin if it loads, otherwise per-folder `no-restricted-imports` overrides.                                               |
| Formatting            | Prettier                                                                                                                                                   |                                                                                                                                                                                                                                            |
| Size                  | `size-limit` 14, one budget per entry point; a script that bundles `menhir/switch` and fails if a `floating` module is included                            | Implements the enforcement list in section 6. Docs size table is generated from the same output.                                                                                                                                           |
| Package checks        | `publint --strict`, `@arethetypeswrong/cli` with `--profile esm-only`                                                                                      | `pnpm check:package`, which builds first and checks the packed tarball. The profile leaves out `node10` and CommonJS `require`, which are not supported (section 6). Run in CI.                                                            |
| Types                 | TypeScript 7, `tsc --noEmit`                                                                                                                               | The template's version. It emits the `.jsx` source and the `.d.ts` files (#6). Files that run in Node (configs, global setups, package tests) have their own `tsconfig.node.json`, so Node's types stay out of the library's type program. |
| Diagnostics           | `@solidjs/diagnostics` 2.0 through the Vite plugin's `diagnostics` option                                                                                  | Dev only.                                                                                                                                                                                                                                  |
| Releases, CI          | Changesets, GitHub Actions                                                                                                                                 |                                                                                                                                                                                                                                            |
| Docs site             | Solid 2.0 app in the `website` workspace folder, scaffolded with `pnpm create solid@latest`, set up in Phase 0                                             | Each component gets its page as it lands (section 10). The size table is generated from the `size-limit` output.                                                                                                                           |

### Spikes (Phase 0, before any component work)

1. ~~**Test renderer.**~~ Done on 2026-11-19 (#5). `createRenderer` lives in `packages/menhir/test` and is imported as `#test-utils`. It wraps `@solidjs/testing-library` 1.0.0-rc.2, which runs in jsdom and in Chromium (Vitest browser mode, `VITEST_ENV=chromium`), so the fallback is not needed. Base UI's "can be activated with $key key" Switch test passes in both, against a throwaway Switch.
   - `await render(() => <X />)` returns the testing library's queries plus a user-event `user`.
   - No `setProps`. Solid cannot clone elements, so a test that changes props passes a signal and sets it, as Kobalte's tests do. At Base UI v1.9.0, 71 of its 346 test files call `setProps`; those are rewritten this way when ported.
   - Testing Library's `eventWrapper` calls `flush()` after every event, so an assertion can follow `fireEvent` or a user-event action directly, as after React's `act()`. After setting a signal, the test calls `flush()` itself.
   - `createRenderer` registers the cleanup after each test, because the testing library does so only when Vitest globals are on.
2. ~~**Build.**~~ Done on 2026-11-19 (#6). The Vite plus `tsc` setup works with `@solidjs/vite-plugin` 3.0.1, so the tsdown fallback is not needed. Result under "Build" below.

### Build

Decided in the build spike (#6), on a throwaway two-part Switch. `pnpm build` in `packages/menhir` runs both steps:

- `vite build` (`vite.config.ts`) writes the compiled `import` entries to `dist`, one file per source module (`preserveModules`), with `solid-js` and `@solidjs/web` external.
- `tsc -p tsconfig.build.json` writes the JSX source and the types to `dist/source`. It covers only `src`.

A component is added by adding its subpath to `exports` in `package.json`, the only list of components: `vite.config.ts` reads its entries from there. `pnpm test:package` builds, then checks `dist` (`test/package`): one compiled file, one source file and one `.d.ts` per module, an `exports` entry for every folder in `src` with an `index.ts`, and that a bundler drops an unused part. It is kept out of the default `vitest` run so that watch mode does not rebuild.

What the spike found:

- **Rolldown breaks rule 3 unless told otherwise.** Rolldown 1.2 compiles `export * as Switch from "./index.parts.ts"` into an object of getters, and no bundler can drop an unused part from an object: an app using only `Switch.Root` also got `Switch.Thumb`. A small plugin in `vite.config.ts` builds each `index.parts.ts` as an entry of its own and leaves the import of it external, so `index.js` keeps the namespace re-export. tsdown was not tried; it bundles with Rolldown too, so it probably needs the same fix.
- **Relative imports name the source file**, such as `./root/SwitchRoot.tsx`. `rewriteRelativeImportExtensions` turns that into `.jsx` or `.js` in the emitted source. Extensionless imports fail `attw` under `node16` resolution.
- **`attw` runs with `--profile esm-only`.** `node10` cannot resolve subpath exports and the package has no CommonJS build (section 6, "Costs accepted").
- **Hydrate tests need two compiles of the same JSX**, one for the server and one hydratable one for the DOM, each against its own build of Solid. A test file gets only one. So `*.hydrate.test.tsx` files run in a `hydrate` Vitest project whose plugin compiles hydratable DOM code, and its global setup (`test/ssr/renderServer.ts`) starts a Vite SSR server that renders fixtures over HTTP. A test calls `renderOnServer("/path/to/Fixture.tsx")`, which returns an element holding the server HTML, then `render(() => <Fixture />, { hydrate: element })`. It works in jsdom and in Chromium.
- **Vitest projects that compile differently must not share a transform cache.** Vitest 5's `fsModuleCache` is keyed by file, not by plugin options, so the `hydrate` project has its own `fsModuleCachePath`. Sharing it gave the hydrate test the `client` project's non-hydratable output.
- **`test/ssr-app`** is a minimal SSR app that depends on `menhir` like an installed app. Its test builds it for server and client, renders the server bundle in Node and hydrates the result with the client bundle. `test/package` in `packages/menhir` checks the built package: one file per module, the order of the export conditions, and that an unused part is dropped.

## 8. Porting approach

- **Port behaviour and tests, not code.** React re-runs the component on every change; Solid runs it once. Translating hooks line by line produces lost reactivity and mistimed effects.
- **Port the test suite first for each component.** Base UI's tests encode the accessibility and browser fixes. A component is done when its ported tests pass.
- **Pin an upstream version** per component and record it. Review upstream changelogs periodically and pull in behaviour fixes deliberately.
- **Licence.** Base UI is MIT. Keep its copyright notice for ported code and tests, and credit it in the README.

### What does not translate directly

| React / Base UI                        | Problem in Solid                              | Direction                                                  |
| -------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| `render` prop with element cloning     | Solid has no element cloning                  | Pick one polymorphism pattern (see open questions)         |
| Destructured props                     | Breaks reactivity                             | Keep props as accessors; split with Solid's prop utilities |
| `useEffect` / `useLayoutEffect` timing | Different scheduling, new effect model in 2.0 | Re-derive from the intended behaviour                      |
| Internal Floating UI React hooks       | React-only                                    | Rebuild on `@floating-ui/dom` in the `floating` layer      |
| `aria-checked={false}`                 | Solid 2.0 removes an attribute set to `false` | Pass the strings `"true"` and `"false"`                    |
| `setProps` in tests                    | Solid has no element cloning                  | Change props through a signal, then `flush()`              |
| Controlled/uncontrolled via hooks      | Different idiom                               | One `core` helper used everywhere                          |

## 9. Roadmap

Check the Base UI docs for the current component list; it stood at 38 at 1.9.0 in November 2026.

**Phase 0: foundations**

- ~~Evaluate quoin-ui, the msviderok port, and the four ports found later (section 4).~~ Done: [docs/research/base-ui-ports.md](docs/research/base-ui-ports.md).
- ~~The two tooling spikes (section 7).~~ Done: test renderer (#5), build (#6).
- Repo, build, test runner, size budgets, import-boundary lint.
- `core` layer. Decide the polymorphism pattern.
- Docs site in `website` (Solid 2.0, `pnpm create solid@latest`): component page template, generated size table, deployment.
- ~~Claim the npm name and GitHub org.~~ Done (#2): `menhir` 0.0.0 holds the npm name; no org or domain yet (section 3).

**Phase 1: simple components** (days each; settles API conventions)

- Switch, Toggle, Toggle Group, Checkbox, Separator, Progress, Meter, Collapsible, Accordion, Tabs.

**Phase 2: floating layer, then the first popups** (the bulk of the work)

- `floating` layer: positioning, dismissal, focus trap, scroll lock, portal.
- Dialog, Alert Dialog, Popover, Tooltip.
- First public release once Dialog and Popover are excellent.

**Phase 3: list-based popups**

- List navigation and typeahead.
- Menu, Context Menu, Select, Combobox, Autocomplete, Menubar, Navigation Menu.

**Phase 4: forms and the rest**

- Field, Fieldset, Form, Input, Number Field, Radio, Slider, Scroll Area, Toast, Toolbar, Avatar, Preview Card.

## 10. Definition of done, per component

- Ported upstream tests pass.
- Keyboard and screen-reader behaviour matches the WAI-ARIA pattern.
- Works with SSR and hydration.
- Size budget set and met; only allowed layers imported.
- Docs page with an unstyled example and the measured size.
- Upstream version it was ported from is recorded.

## 11. Risks

| Risk                                           | Mitigation                                                                                                                                                                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Solo maintainer burnout                        | Narrow scope; release after Phase 2; no promise of full parity.                                                                                                                                                                                                     |
| Upstream moves monthly                         | Pin versions; port behaviour, not every release.                                                                                                                                                                                                                    |
| Solid 2.0 ecosystem and tooling still settling | Keep dependencies minimal; isolate 2.0-specific code in `core`.                                                                                                                                                                                                     |
| Duplicating ZerNico/base-ui-solid              | It already offers full Base UI parity on Solid 2.0. Differentiate on size and Solid-native design; measure Switch against the existing ports and revisit before Phase 2 if Menhir is not clearly smaller ("Check the bet early" in docs/research/base-ui-ports.md). |
| Size creep                                     | CI budgets and published numbers.                                                                                                                                                                                                                                   |

## 12. Open questions

1. ~~Build Menhir, or contribute to an existing port?~~ Decided on 2026-11-19 (#1): continue with Menhir, as a size-first library with its own design. Reasons, how it differs from ZerNico/base-ui-solid, and the size check that would reverse this are in [docs/research/base-ui-ports.md](docs/research/base-ui-ports.md).
2. Polymorphism: an `as` prop, a render function prop, or both?
3. ~~Package shape~~ Decided: one `menhir` package with a subpath export per component, as in section 6 ("Package shape").
4. How close should the public API stay to Base UI's names and parts? Closer makes styled layers and docs easier to port.
5. ~~Is the `solid` export condition still needed in 2.0?~~ Decided on 2026-11-19 (#6): yes. The 2.0 library guide prescribes it, and an SSR app fails without it. No separate server build. Details in section 6.
6. ~~Test stack~~ Decided: Vitest 5.1, jsdom plus Chromium, `@solidjs/testing-library`, as in section 7.
7. ~~Tooling~~ Decided: follow the `pnpm create solid@latest` template (oxlint, TypeScript 7, `@solidjs/testing-library`).

## References

- Base UI: https://base-ui.com
- Solid 2.0 docs: https://v2.solidjs.com
- Solid repo (migration guide, 2.0 RFCs): https://github.com/solidjs/solid
- ZerNico/base-ui-solid: https://github.com/ZerNico/base-ui-solid
- unstyled-solid/base-ui: https://github.com/unstyled-solid/base-ui
- nayupls1/base-ui-solid: https://github.com/nayupls1/base-ui-solid
- Script-Augur/base-ui-solid: https://github.com/Script-Augur/base-ui-solid
- quoin-ui: https://www.npmjs.com/package/quoin-ui
- @msviderok/base-ui-solid: https://www.npmjs.com/package/@msviderok/base-ui-solid
- danielfrg/solid-ui: https://github.com/danielfrg/solid-ui
- Kobalte: https://kobalte.dev
- Solid library guide: "Building a library" in the `@solidjs/vite-plugin` README, https://github.com/solidjs/solid-vite-plugin#building-a-library
- Base UI repo (test and build setup): https://github.com/mui/base-ui
- Vitest browser mode: https://vitest.dev/guide/browser/
- tsdown Solid recipe: https://tsdown.dev/recipes/solid-support
