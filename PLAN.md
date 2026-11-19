# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, ported from Base UI one component at a time, with small and measurable bundles.

Status: planning. Nothing in this document is built yet. Versions and name availability were checked on 2026-11-18.

## 1. Why this exists

- React has Base UI, Radix and React Aria. Solid's equivalents are fewer, less active, and were built for Solid 1.x.
- Solid 2.0 is now stable (`solid-js@2.0.1`). Every existing library has to migrate, so a library written natively for 2.0 has an opening.
- A recurring complaint about the current Solid options is bundle size: importing one simple component pulls in a large shared layer that does not tree-shake. Menhir treats bundle size as a feature with enforced budgets.

## 2. Goals and non-goals

**Goals**

- Behaviour and accessibility on par with Base UI, verified by porting its tests.
- Each component costs only what it uses. Sizes are published per component.
- Idiomatic Solid 2.0 APIs, not React APIs with different imports.
- Near-zero runtime dependencies.

**Non-goals**

- Styling, themes, or a shadcn-style registry. Those can be built on top later.
- Support for Solid 1.x.
- Line-by-line parity with Base UI's source, or tracking every upstream release.
- Covering all of Base UI before the first release.

## 3. Name

- **Menhir**: a single standing stone. Fits "primitive", short, easy to say.
- npm: `menhir` and `menhir-ui` were both unclaimed on 2026-11-18. Publish a placeholder soon.
- Not yet checked: the `@menhir` npm scope, GitHub org, domain.
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

| Project                                                                                           | Notes                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| quoin-ui                                                                                          | Describes itself as a faithful Base UI port for Solid 2.0. Experimental. The closest thing to this project: read its code before starting. At 0.6.0 on 2026-11-18: 42 subpath entries, peers pinned to exactly `2.0.0-rc.18` (not stable), repo on gitcafe.dev, built with Bun and Biome. |
| nayupls1/base-ui-solid, unstyled-solid/base-ui, ZerNico/base-ui-solid, Script-Augur/base-ui-solid | Further Base UI ports for Solid found by search on 2026-11-18. Not reviewed at all; include in the Phase 0 evaluation.                                                                                                                                                                    |
| @msviderok/base-ui-solid                                                                          | Aims at full API compatibility; pinned to Base UI 1.0.0-beta.1, so well behind upstream. Includes a port of the Floating UI React layer, which is worth studying.                                                                                                                         |
| danielfrg/solid-ui                                                                                | Mostly a Kobalte fork with parts adapted from Base UI. The author wrote up a failed AI-driven straight port.                                                                                                                                                                              |
| rigid-ui, organic-ui                                                                              | Small, early.                                                                                                                                                                                                                                                                             |

Only READMEs were reviewed, not code. First task: evaluate quoin-ui and decide whether to contribute there or continue with Menhir (see section 12).

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
3. **No `Object.assign` compound components.** Use namespace re-exports so unused parts are dropped:
   ```ts
   // dialog/index.ts
   export * as Dialog from "./parts";
   // dialog/parts.ts
   export { DialogRoot as Root } from "./root";
   export { DialogTrigger as Trigger } from "./trigger";
   ```
4. **Strict layers.** Enforced by an import-boundary lint rule.
   | Layer             | Contains                                                                     | May import                 |
   | ----------------- | ---------------------------------------------------------------------------- | -------------------------- |
   | `core`            | Prop merging, controlled/uncontrolled signal, ids, polymorphism helper       | Nothing internal           |
   | `floating`        | Positioning, dismissal, focus trap, hover intent, list navigation, typeahead | `core`, `@floating-ui/dom` |
   | Simple components | Switch, Toggle, Checkbox, Tabs, etc.                                         | `core` only                |
   | Popup components  | Dialog, Popover, Menu, Select, etc.                                          | `core`, `floating`         |
5. **Near-zero dependencies.** `@floating-ui/dom` only. Use built-in `Intl` for number and date formatting.
6. **Expensive behaviour is a part, not a flag.** Portal, scroll lock and focus trap are composed in, so apps that don't render them don't ship them.

Sketch of the package manifest:

```json
{
  "name": "menhir",
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./dialog": {
      "types": "./dist/source/dialog/index.d.ts",
      "solid": "./dist/source/dialog/index.jsx",
      "import": "./dist/dialog/index.js"
    },
    "./switch": {
      "types": "./dist/source/switch/index.d.ts",
      "solid": "./dist/source/switch/index.jsx",
      "import": "./dist/switch/index.js"
    }
  },
  "dependencies": { "@floating-ui/dom": "^1.8.0" },
  "peerDependencies": { "solid-js": "^2.0.0", "@solidjs/web": "^2.0.0" }
}
```

The `solid` condition points at uncompiled JSX and must come before `import`: compiled DOM output cannot hydrate, so SSR apps need the source. This follows the official library guide (solid-vite-plugin PR #450, merged 2026-10-30), which is written for 1.x; the 2.0 version of the guide is a separate PR that has not been read. quoin-ui 0.6.0 ships both conditions on 2.0. Confirm in the build spike (section 7).

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
| quoin-ui 0.6.0                    | One package with subpath exports; see section 4                                                                                                                                                                                    |
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

| Area                  | Choice                                                                                                                                                     | Notes                                                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Package manager, repo | pnpm 12 workspace: `packages/menhir`, `website`, `test/bundle-size`                                                                                        | Base UI's layout, with its `docs` folder named `website` here.                                                                                                                                                     |
| Compiler              | `@solidjs/vite-plugin` 3.0.1                                                                                                                               | The Solid 2.0 plugin (peers `solid-js ^2`, Vite 8 or 9). `vite-plugin-solid` 2.x is 1.x only.                                                                                                                      |
| Build                 | Vite 8 library mode with preserved modules for compiled JS; `tsc` with `jsx: preserve` for `.jsx` source and `.d.ts`                                       | The shape the official library guide documents. The template is an app, so it has no library build to copy. Fallback: tsdown 0.23.                                                                                 |
| Tests                 | Vitest 5.1; jsdom by default, Chromium through `@vitest/browser-playwright`                                                                                | Base UI's runner and split: a `VITEST_ENV` variable selects the browser, `it.skipIf(isJSDOM)` marks browser-only cases.                                                                                            |
| Test utilities        | `@solidjs/testing-library` 1.0.0-rc.2, `@testing-library/user-event`, `@testing-library/jest-dom`, plus our own `createRenderer` and `describeConformance` | The template's test library, built for Solid 2.0. Base UI's tests call the two helpers from its `#test-utils`; `createRenderer` is a thin wrapper over the testing library, so test bodies stay close to upstream. |
| SSR tests             | A Vitest node project that renders to a string, then hydrates                                                                                              | Covers the SSR line in the definition of done.                                                                                                                                                                     |
| Lint                  | oxlint 1.92 running `eslint-plugin-solid` 0.20 (`configs/v2`) as a JS plugin, one config for the workspace                                                 | The template's setup. The layer table in section 6 is enforced in oxlint too: `eslint-plugin-boundaries` as a JS plugin if it loads, otherwise per-folder `no-restricted-imports` overrides.                       |
| Formatting            | Prettier                                                                                                                                                   |                                                                                                                                                                                                                    |
| Size                  | `size-limit` 14, one budget per entry point; a script that bundles `menhir/switch` and fails if a `floating` module is included                            | Implements the enforcement list in section 6. Docs size table is generated from the same output.                                                                                                                   |
| Package checks        | `publint`, `@arethetypeswrong/cli`                                                                                                                         | Run in CI against the packed tarball.                                                                                                                                                                              |
| Types                 | TypeScript 7, `tsc --noEmit`                                                                                                                               | The template's version. Confirm in the build spike that it emits the `.jsx` source and `.d.ts` files.                                                                                                              |
| Diagnostics           | `@solidjs/diagnostics` 2.0 through the Vite plugin's `diagnostics` option                                                                                  | Dev only.                                                                                                                                                                                                          |
| Releases, CI          | Changesets, GitHub Actions                                                                                                                                 |                                                                                                                                                                                                                    |
| Docs site             | Solid 2.0 app in the `website` workspace folder, scaffolded with `pnpm create solid@latest`, set up in Phase 0                                             | Each component gets its page as it lands (section 10). The size table is generated from the `size-limit` output.                                                                                                   |

### Spikes (Phase 0, before any component work)

1. **Test renderer.** Build `createRenderer` on `@solidjs/testing-library` 1.0.0-rc.2, the Solid 2.0 version the template uses (async `render` returning `{ user, setProps }`, with `flush()` before assertions). Done when one ported Switch test passes in jsdom and Chromium. Fallback if the release candidate does not run in browser mode: build directly on `@testing-library/dom` and `render` from `@solidjs/web`.
2. **Build.** Build a one-component package (Switch) with the Vite plus `tsc` setup. Done when the output is one file per module, `publint` and `attw` pass, the `solid` condition resolves in an SSR app, and a hydrate test passes. If preserved modules do not work with the 2.0 plugin, try tsdown.

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
| Controlled/uncontrolled via hooks      | Different idiom                               | One `core` helper used everywhere                          |

## 9. Roadmap

Check the Base UI docs for the current component list; it stood at 37 in late 2026.

**Phase 0: foundations**

- Evaluate quoin-ui, the msviderok port, and the four ports found later (section 4).
- The two tooling spikes: test renderer and build (section 7).
- Repo, build, test runner, size budgets, import-boundary lint.
- `core` layer. Decide the polymorphism pattern.
- Docs site in `website` (Solid 2.0, `pnpm create solid@latest`): component page template, generated size table, deployment.
- Claim the npm name and GitHub org.

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

| Risk                                           | Mitigation                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Solo maintainer burnout                        | Narrow scope; release after Phase 2; no promise of full parity.              |
| Upstream moves monthly                         | Pin versions; port behaviour, not every release.                             |
| Solid 2.0 ecosystem and tooling still settling | Keep dependencies minimal; isolate 2.0-specific code in `core`.              |
| Duplicating quoin-ui                           | Evaluate it first; differentiate on size and quality, or contribute instead. |
| Size creep                                     | CI budgets and published numbers.                                            |

## 12. Open questions

1. Build Menhir, or contribute to quoin-ui? Decide after reading its code.
2. Polymorphism: an `as` prop, a render function prop, or both?
3. ~~Package shape~~ Decided: one `menhir` package with a subpath export per component, as in section 6 ("Package shape").
4. How close should the public API stay to Base UI's names and parts? Closer makes styled layers and docs easier to port.
5. Is the `solid` export condition still needed in 2.0? Working answer: yes (section 6). Confirm in the build spike and against the 2.0 library guide.
6. ~~Test stack~~ Decided: Vitest 5.1, jsdom plus Chromium, `@solidjs/testing-library`, as in section 7.
7. ~~Tooling~~ Decided: follow the `pnpm create solid@latest` template (oxlint, TypeScript 7, `@solidjs/testing-library`).

## References

- Base UI: https://base-ui.com
- Solid 2.0 docs: https://v2.solidjs.com
- Solid repo (migration guide, 2.0 RFCs): https://github.com/solidjs/solid
- quoin-ui: https://www.npmjs.com/package/quoin-ui
- @msviderok/base-ui-solid: https://www.npmjs.com/package/@msviderok/base-ui-solid
- danielfrg/solid-ui: https://github.com/danielfrg/solid-ui
- Kobalte: https://kobalte.dev
- Solid library guide (1.x): https://github.com/solidjs/solid-vite-plugin/pull/450
- Base UI repo (test and build setup): https://github.com/mui/base-ui
- Vitest browser mode: https://vitest.dev/guide/browser/
- tsdown Solid recipe: https://tsdown.dev/recipes/solid-support
