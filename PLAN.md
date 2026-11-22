# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, with small and measurable bundles.

Status: first release (2026-11-21). Phases 0 and 1 are done and released as 0.1.0, and 0.1.1 is current; phase 2 is next (section 9). Its tickets, and those of phase 3, were written out on 2026-11-22. What is built is what `packages/menhir/package.json` exports; the READMEs name it, and `test/workspace/readme.test.ts` keeps their lists in step with `exports`. Versions were checked on 2026-11-18 and name availability on 2026-11-19.

## 1. Why this exists

- Solid has fewer component libraries than React, and the established ones were built for Solid 1.x. Libraries that appeared for Solid 2.0 in late 2026 (section 4) carry over the structure and bundle sizes of React libraries.
- Solid 2.0 is now stable (`solid-js@2.0.1`). Every existing library has to migrate, so a library written natively for 2.0 has an opening.
- A recurring complaint about the current Solid options is bundle size: importing one simple component pulls in a large shared layer that does not tree-shake. Menhir treats bundle size as a feature with enforced budgets.

## 2. Goals and non-goals

**Goals**

- Written the Solid 2.0 way. APIs and internals follow Solid 2.0's idioms. Not React APIs with different imports, and not Solid 1.x code with its imports updated.
- Behaviour and accessibility on par with the best React primitives, pinned down by tests (section 8).
- Each component costs only what it uses. Sizes are published per component.
- Near-zero runtime dependencies.

**Non-goals**

- Styling, themes, or a copy-paste component registry. Those can be built on top later. Two exceptions: the color-scheme utility (`menhir/color-scheme/local-storage` and `menhir/color-scheme/cookie`) keeps the reader's light, dark or system choice, and the theme utility (`menhir/theme/local-storage` and `menhir/theme/cookie`) keeps their choice out of the app's themes, since the state and its pre-paint script are the same in every app; how each color scheme or theme looks stays the app's (`docs/adr/0001-color-scheme-utility.md`, `docs/adr/0003-theme-utility.md`).
- Support for Solid 1.x.
- Being a port of, or modelled on, any library. Other libraries may be read for ideas; none sets Menhir's source structure, API, tests or release schedule (section 8).
- Covering every component other libraries have before the first release.

## 3. Name

- **Menhir**: a single standing stone. Fits "primitive", short, easy to say.
- npm: `menhir` and `menhir-ui` were both unclaimed on 2026-11-18 and still were on 2026-11-19. `menhir` 0.0.0 was published as a placeholder on 2026-11-19 (README, LICENSE and `package.json` only) and held the name until the first release, 0.1.0. `menhir-ui` is not held: the library is one package, and an empty second one would only squat the name. Publish from `packages/menhir`, since the workspace root is private; the npm account needs two-factor authentication for writes.
- npm scope `@menhir`: already exists, with no public packages (2026-11-19). Not needed, since the package is unscoped (section 6, "Package shape").
- GitHub: the `menhir` account is taken by a user created in 2012, whose public repositories were last pushed in 2016. `menhir-ui`, `menhirjs` and `menhir-solid` were free on 2026-11-19. Decided on 2026-11-19 (#2): no org for now; the repository stays at `j13n/menhir`.
- Domains (RDAP and registry whois, 2026-11-19): `menhir.com`, `menhir.dev`, `menhir.io` and `menhir.org` are registered. `menhir.sh`, `menhirui.dev`, `menhir-ui.dev`, `menhirui.com`, `menhir-ui.com`, `menhirjs.dev` and `menhirjs.com` were free. `menhir.js.org` is unclaimed; js.org subdomains are free for JavaScript projects. Decided on 2026-11-21 (#38): the docs site is at `menhir-ui.com`, bought through TransIP, with DNS on Cloudflare and the domain attached to the `menhir-docs` Worker as a custom domain in `website/wrangler.jsonc`.
- Known collision: Menhir is a parser generator for OCaml. Different ecosystem; "menhir solid" and "menhir ui" should stay searchable.
- Common typos: "mehir", "menir".

## 4. Landscape

The established Solid component libraries were built for Solid 1.x, and some of them have Solid 2.0 branches that are unreleased or stalled. Several libraries for Solid 2.0 appeared in late 2026; they follow the file structure of a React library and have its bundle sizes (a Switch is 18 to 22 kB minified). Styled, copy-paste layers built on the existing libraries are potential consumers of Menhir, not competitors.

The Solid 2.0 libraries were evaluated by reading their code on 2026-11-19 (#1), and those on npm had their bundles measured. None of them competes on bundle size, and the one viable to contribute to has a goal that conflicts with section 8, so the decision is to continue with Menhir (section 12, question 1).

## 5. Target versions

| Dependency       | Version | Notes                                                       |
| ---------------- | ------- | ----------------------------------------------------------- |
| solid-js         | 2.0.1   | Peer dependency. 1.x not supported.                         |
| @solidjs/web     | 2.0.1   | Peer dependency. Rendering and JSX types moved here in 2.0. |
| @floating-ui/dom | 1.8.0   | Only runtime dependency, used by positioned popups only.    |

### Browsers

Decided on 2026-11-22 (#94; ADR 0006): **Baseline Widely available** on the date of each release, plus one exception, the `popover` attribute.

- A feature is used without a fallback once it is Widely available: in every core browser (Chrome, Edge, Firefox and Safari, on desktop and on mobile) for 30 months. Before that it is not used, and no fallback is shipped for it (section 6, rule 6).
- **The exception:** `popover`, with `popovertarget`, `:popover-open` and the `toggle` events of a popover. It has been Newly available since 2025-01-27 and is Widely available from 2027-07-27. The gap is iOS Safari 17.0 to 18.2, where a tap outside does not close a popover; everything else works there. It is worth the exception because without it Popover, Tooltip and every menu ship a portal, a stacking order and their own light dismiss (section 8, "What the browser does for popups").
- Status is read from the `web-features` package (3.47.0 on 2026-11-22), which computes Baseline from MDN's browser-compat-data (8.1.10 on the same day). A decision that depends on support records the date it was checked.
- Tests run in Chromium. The spike in #94 also ran in Playwright's Firefox and WebKit (Chromium 159, Firefox 159, WebKit 27.2): these are current engines, so they show how a feature behaves, not how far back it works.

Solid 2.0 changes that affect a component library (confirm against the official migration guide, `MIGRATION.md` in the solid repo, and v2.solidjs.com):

- `createEffect` is split into a compute phase and an apply phase.
- `onMount` is replaced by `onSettled`.
- Updates are batched per microtask: a read returns the old value until the flush, and `flush()` applies pending updates now. `batch` is gone.
- Writing a signal inside a component body, memo or effect compute throws in development; `untrack` does not exempt it. Writes belong in event handlers, `onSettled` or actions.
- A reactive read at the top of a component body, or of a `<Show>`/`<For>` callback, is reported in development unless wrapped in `untrack` as a deliberate one-time read.
- Writes in one frame are applied together, so async work one of them starts holds the others. `onFlush` keeps a write out of that hold (API conventions, section 8).
- The `use:` directive is removed in favour of ref factories.
- `<Index>` is replaced by `<For keyed={false}>`.
- Async is part of the reactive graph; Suspense is reworked.
- `render` and the JSX import source come from `@solidjs/web`.

## 6. Bundle-size rules

These are structural and must hold from the first commit.

1. **One entry point per component.** `menhir/dialog`, `menhir/switch`, and so on, declared in `exports`. No root barrel as the main way in.
2. **Unbundled ESM, `"sideEffects": false`.** One output file per source module. No code that runs at import time. Development-only code, such as warnings, sits behind `isDev` from `@solidjs/web`: Solid's production builds define it as a constant `false`, and Rolldown drops the branch and whatever only it imports (measured on 2026-11-19 on `createControllableSignal`: 302 B minified in production, 573 B in development).
3. **No `Object.assign` compound components.** Use namespace re-exports so unused parts are dropped. Rollup and Rolldown drop them; esbuild keeps the whole namespace (measured on 2026-11-19), so measure part-level budgets with Rolldown:
   ```ts
   // dialog/index.ts
   export * as Dialog from "./index.parts.ts";
   // dialog/index.parts.ts
   export { DialogRoot as Root } from "./root/DialogRoot.tsx";
   export { DialogTrigger as Trigger } from "./trigger/DialogTrigger.tsx";
   ```
   The build has to keep that re-export as written; see "Build" in section 7.
4. **Strict layers.** Enforced by an import-boundary lint rule.
   | Layer             | Contains                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | May import                 |
   | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
   | `core`            | Prop merging, controlled/uncontrolled signal, polymorphism helper, the props of parts that are buttons and toggle buttons, a part's value along a range, a value that lists items, a group's roving focus, the utilities' saved preference. Ids are Solid's `createUniqueId` (#13)                                                                                                                                                                                                                                                                                                                                     | Nothing internal           |
   | `floating`        | Positioning (`createPosition` and one file per middleware), dismissal (one file per way of closing, and the reasons a popup closed), focus (the Tab wrap of a modal popup, overrides of initial and return focus, the tabbable search the wrap needs), scroll lock (`overflow: hidden` on `<html>` while a modal popup is open), presence (showing a popup, and hiding it once its exit animations have ended), hover intent (the delays, the safe area to the popup, delay groups, one file each), list navigation, typeahead. No portal: popups are in the top layer (section 8, "What the browser does for popups") | `core`, `@floating-ui/dom` |
   | Simple components | Switch, Toggle, Checkbox, Tabs, etc.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `core` only                |
   | Popup components  | Dialog, Popover, Menu, Select, etc.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `core`, `floating`         |
5. **Near-zero dependencies.** `@floating-ui/dom` only. Use built-in `Intl` for number and date formatting.
6. **Expensive behaviour is a part, not a flag.** Scroll lock and each positioning middleware are composed in, so apps that don't render them don't ship them. Behaviour the browser does is not shipped at all (section 8, "What the browser does for popups").

The package manifest, in the shape built in the build spike (#6). It lists one subpath per built component, such as `./switch`, and one per utility and storage, such as `./color-scheme/cookie`; `./dialog` shows how each further component is added:

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

No separate server build under `node`/`worker`/`deno`, which some Solid libraries ship. It would serve only an app that renders on the server without compiling its dependencies, which is not a setup the guide describes: an app on the Solid plugin always compiles the `solid` source. Add one if a user turns up with such a setup.

### Enforcement

- A size budget per entry point in CI (size-limit or similar). A pull request that exceeds a budget fails.
- Per-component sizes published in the docs.
- A CI test that bundles a single simple component and asserts nothing from `floating` is included.

Built in #9, in `test/bundle-size` (its README has the details):

- `.size-limit.js` holds one budget per entry point. `size-limit` 14 measures each with `@size-limit/rolldown`: an app that imports the entry point and uses every part of it, minified and gzipped, Solid left out. The size is that of a production app: a Rolldown plugin (`productionConstants.ts`) defines `isDev` and `isServer` as `false`, as Solid's production build does, so the code behind them is not counted (rule 2; #46). Rolldown because esbuild keeps a whole namespace. `size.test.ts` fails if an entry point in `exports` has no budget or is over it.
- `pnpm size:json` writes the same results to `dist/sizes.json`, from which the docs site generates its size table and each component page's size (#38, `website/vite-plugin-sizes.ts`).
- The bundle-size page also shows each component's size in other libraries, measured the same way with each library's framework left out (`comparison.ts`). These sizes are shown, not enforced. Its last row is of the components imported together, so that shared code is counted once. The page says these are sizes only: the libraries differ in API and in what each component includes.
- `floating.test.ts` bundles each simple component's entry point, such as `menhir/switch`, alone with Rolldown (every entry point in `exports` except the popups that `packages/menhir/layers.ts` lists for the lint config too) and fails if the bundle has a module from `floating` or an import of `@floating-ui/*`.
- `popupModules.test.ts` does the same for each popup, against what that popup must not bundle (`popupModules.ts`): `menhir/dialog` and `menhir/alert-dialog` bundle no `@floating-ui/*`, no positioning and no hover. A row is checked once its popup is in `exports`, and a fixture popup proves the check reports a module it should not bundle (#95).
- `floatingSize.test.ts` holds each module of the `floating` layer to its budget in `floatingBudgets.ts` (below), and fails if a folder in `src/floating` has none.

### The `floating` layer

Set up on 2026-11-22 (#95). `packages/menhir/src/floating/README.md` lists the modules, one folder each, and the layer's rules. `floatingModules` in `packages/menhir/layers.ts` lists the same folders for the checks in `test/bundle-size`. Three decisions:

- **Internal**, as `core` is: no entry point in `exports`, so a module can change without a release note until 1.0. Apps and styled layers use the popup components. `test/package/build.test.ts` exempts both layers from its `exports` check. Revisit after Phase 2 if a styled layer asks to build its own popups.
- **A budget per module file, measured and not published.** A module has no entry point, so `test/bundle-size/floatingBudgets.ts` gives one to each file a popup imports, keyed by its path under `dist/floating`. `floating.size-limit.js` measures each the way `.size-limit.js` measures an entry point: an app that imports it and uses all of it, minified and gzipped, Solid left out, `@floating-ui/dom` counted. These sizes are not in `dist/sizes.json`, so the docs site does not show them; each module's README records its own. So that a module is built before any popup imports it, `vite.config.ts` makes every file in `src/floating` an entry.
- **No shared stack of open popups.** Since #94 the top layer is the stack: a modal `<dialog>` and an `auto` popover nest by themselves, only the topmost dialog is not inert, and the page stops scrolling with `overflow: hidden` on `<html>` (#28 sets it inline, counted). A module asks the browser (`:modal`, `:popover-open`, the event's target). A Tooltip's Escape listener calls `preventDefault()`, which stops the close request, so a dialog below it stays open. If a module ever needs a stack, it lives in `floating/stack/`, created in the browser on first use and never at import time, since module state is shared between requests on the server.

- **Dismissal is one file per way of closing** (#26): `dialogClose.ts` (Escape and other close requests on a modal dialog, a refused close opened again), `outsidePress.ts` (a press on a dialog's backdrop), `popoverClose.ts` (the reason an `auto` popover closed, a refused close shown again) and `escape.ts` (Escape for Tooltip's `manual` popover). Alert Dialog bundles no `outsidePress`, and Tooltip only `escape`: `test/bundle-size/popupModules.ts` names a forbidden file of a module as well as a whole folder. `dismissal/README.md` records the decisions and each file's size.

- **Focus is one file per behaviour** (#27): `tabWrap.ts` (Tab and Shift+Tab cycle inside the topmost modal `<dialog>`), `tabbable.ts` (the tab stops inside an element, framework-free, which only the wrap imports), `initialFocus.ts` and `returnFocus.ts` (where focus goes once a popup has opened, and once it has closed). Dialog and Alert Dialog are always modal and call `createTabWrap` from their Popup. A modal Popover is #33's to decide (its options are in a comment there): leave it out, a part, or a ref factory over a widened `createTabWrap`; not a `modal` flag, which would ship the wrap in every app. `focus/README.md` records the decisions and each file's size.

- **Scroll lock is one file** (#28): `scrollLock.ts` sets `overflow: hidden` on `<html>` while a modal popup is open, counted so that nested popups unlock the page when the last one closes, and puts the page's own inline styles back. A page with a scrollbar gets its width as `padding-right` on `<html>`, so the content does not move, and as `--hidden-scrollbar-width`, which a `position: fixed` element uses to keep its place; a page with `scrollbar-gutter: stable` gets neither. The lock does not set `scrollbar-gutter` itself, since it is Widely available only from 2027-06-11 (section 5). The page unlocks once the popup has closed, after an exit animation (#96), not when its state turns false. A page that scrolls in another element needs no lock: a popup in the top layer chains its scrolls to the viewport (Chromium). On iOS Safari (26.5, tried on a device) a drag on the backdrop scrolled the page all the same, so while open the popup gets `overscroll-behavior: contain` and, if it does not scroll itself, `touch-action: pinch-zoom`, checked again as it changes size: a popup that overflows keeps its own `touch-action`, since Chromium would no longer scroll it by touch. Zoomed in, the popup then pans with two fingers. Chrome on iOS still scrolls the page from a drag on a dialog's text (#114). Only modal popups import it; `popupModules.ts` checks that Popover and Tooltip do not. `scroll-lock/README.md` records the decisions, what was tried on iOS Safari, and the size.

- **Presence is one file** (#96): `presence.ts` (`createPresence`) shows a popup when its state turns open, with `showModal()` for a `<dialog>` and `showPopover()` otherwise, and once it turns closed keeps it shown until the animations and transitions running in it, its descendants and its `::backdrop` have settled, then calls `close()` or `hidePopover()`; with none running it hides at once, with no timer. Infinite and paused animations do not count. While it leaves the popup is `inert`, except a popover that holds focus, since hiding a popover returns focus to its trigger only from inside it; a dialog's `close()` returns focus wherever focus is. Opening again cancels the exit. A closed popup stays in the document, `display: none` by the browser, so there is no `<Show>` and no "mounted" state in Solid. Focus returns and the page unlocks on the `close` or `toggle` event this fires (#27, #28). A popover the browser hides itself, by light dismiss, Escape or its `popovertarget`, is hidden at once, since `beforetoggle` cannot be cancelled on closing; Popover (#33) decides whether that is enough. A server's non-modal `<dialog open>` is made modal by removing `open` and calling `showModal()`, which fires no `close` and lets an entry animation run on. It stays in `floating`: Collapsible and Accordion animate their panels with CSS alone. `presence/README.md` records the decisions and the size.

- **Hover is three files** (#30): `safeArea.ts` (once the pointer has left the trigger or the popup, whether it is still on its way to the other: every point on a line from where it left to the other's box; plain DOM, no timers, so a submenu uses it without the delays), `hover.ts` (`createHover`: opens after `delay`, closes `closeDelay` after the pointer has left both through the safe area; a mouse or a pen opens it, a touch does not) and `group.ts` (`createHoverGroup`: once one popup of a group is open, the next opens at once and the first closes). Grouping is a part that provides the group through context, not module state, which would group every popup of the app, run for apps that never group and be shared between requests on the server. `popupModules.test.ts` checks that the safe area alone bundles no timer and that `hover.ts` bundles no group. `hover/README.md` records the decisions, what Chromium does when the page scrolls under a still pointer or the pointer leaves the window, and each file's size.

- **Positioning is the only folder that imports `@floating-ui/dom`** (#25), and the build leaves the import in place (`vite.config.ts`), so an app's bundler resolves the one copy. `createPosition.ts` holds `computePosition` and `autoUpdate`, and each middleware is a file of its own (`offset`, `flip`, `shift`, `size`, `arrow`, `hide`), so a popup bundles only those it passes (rule 6). `positioning/README.md` records the size of each file and what each middleware adds.

### Package shape

Decided on 2026-11-19 (#3): one `menhir` package with one subpath export per component. No `@menhir/*` packages.

Reasoning, by consideration in #3:

- **Release overhead.** One version, one changelog, one publish. With separate packages, every `core` change means releasing every package that depends on it. The benefit of separate packages, independent semver per component, is worth little before 1.0, when components change together.
- **Duplicate shared code.** Separate packages share `core` as a dependency. An app that resolves two versions of it ships two copies, and parts built against different copies do not share context. With one package, all components in an app come from the same `menhir` version, so they share one `core`.
- **Tree-shaking.** Bundlers drop unused modules, not unused packages. With unbundled ESM, `"sideEffects": false` and one entry per component (rules 1 and 2), importing `menhir/switch` includes only the modules reachable from that entry, the same result as a separate `@menhir/switch` package. The checks under Enforcement test this.
- **Keeping `floating` out.** `@floating-ui/dom` is a regular `dependency` of `menhir`. Every install downloads it (174 kB unpacked in 1.8.0), but only `floating` modules import it, and only popup entries import `floating` (rule 4). An app that uses only simple components never bundles it. An optional peer dependency would save the download but make every popup user install it by hand.
- **Consumers.** A styled layer installs one package and imports from subpaths, and keeps one version current instead of a set in step. It should list `menhir` as a peer dependency, so that an app using two styled layers still resolves one copy of `menhir`.

Costs accepted:

- An app cannot upgrade one component without the rest. Revisit if users ask for it after 1.0.
- Subpath types need `moduleResolution` set to `bundler`, `node16` or `nodenext`. Consumers on `node10` (`node`), which TypeScript 7 has removed, are not supported; no `typesVersions` fallback is shipped.

## 7. Tooling

Principle: use the tooling of the official Solid 2.0 template (`pnpm create solid@latest`, as scaffolded in `website`), since that is where the Solid 2.0 ecosystem is heading. A test uses `render(() => <X />)` from `@solidjs/testing-library`, role queries, and a signal to change a prop after rendering. Versions are the ones the template resolved on 2026-11-19, or npm `latest` on 2026-11-18 for tools the template does not include.

| Area                  | Choice                                                                                                                                                                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package manager, repo | pnpm 12 workspace: `packages/menhir`, `website`, `test/bundle-size`, `test/ssr-app`                                                                                   | Library, docs site and test apps side by side.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Compiler              | `@solidjs/vite-plugin` 3.0.1                                                                                                                                          | The Solid 2.0 plugin (peers `solid-js ^2`, Vite 8 or 9). `vite-plugin-solid` 2.x is 1.x only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Build                 | Vite 8 library mode with preserved modules for compiled JS; `tsc -p tsconfig.build.json` with `jsx: preserve` for `.jsx` source and `.d.ts`                           | The shape the official library guide documents, confirmed in the build spike (#6). `pnpm build` in `packages/menhir`. Details under "Build" below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Tests                 | Vitest 5.1; jsdom by default, Chromium through `@vitest/browser-playwright`                                                                                           | jsdom for most cases; Chromium for what jsdom cannot model (focus, layout, pointer, a Content Security Policy). A `VITEST_ENV` variable selects the browser, `it.skipIf(isJSDOM)` marks browser-only cases. Chromium runs with its scrollbars shown, which Playwright hides in headless mode, so layout is that of a desktop with classic scrollbars (#28). A `workspace` project runs checks on the workspace in Node, such as a single copy of `@solidjs/signals`.                                                                                                                                                                                                                                                   |
| Test utilities        | `@solidjs/testing-library` 1.0.0-rc.2, `@testing-library/user-event`, `@testing-library/jest-dom`, plus our own `createRenderer` and `describeConformance`            | The template's test library, built for Solid 2.0. `createRenderer` from `#test-utils` is a thin wrapper over it that adds `user`, registers cleanup, and fails a test in which Solid reports a dev diagnostic (`diagnostics: false` turns that off for a test that trips one on purpose; a test of `captureDiagnostics` proves the capture records one). `describeConformance(name, renderPart, { tagName })` checks Menhir's part conventions (section 8): default element, attributes passed through, `class` and `style` merged, `ref` composed, handlers run, props reactive, `render` rendered through and read once. Pointer and media helpers for what jsdom lacks are added when a component first needs them. |
| SSR tests             | `*.hydrate.test.tsx` files, run by a `hydrate` Vitest project                                                                                                         | `renderOnServer` from `#test-utils` renders a fixture on a Vite SSR server, and `render(ui, { hydrate })` hydrates the result. Details under "Build" below. Covers the SSR line in the definition of done.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Lint                  | oxlint 1.92 running `eslint-plugin-solid` 0.20 (`configs/v2`) as a JS plugin, one config for the workspace                                                            | The template's setup. `oxlint.config.ts` at the root. Section 6's layer table and its bans on a root barrel and on `Object.assign` are enforced in oxlint too, with `eslint-plugin-boundaries` 7.4 as a second JS plugin (#8). `test/workspace/lint.test.ts` lints fixtures that break each rule.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Formatting            | Prettier                                                                                                                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Size                  | `size-limit` 14 with `@size-limit/rolldown`, one budget per entry point; a test that bundles each simple component alone and fails if a `floating` module is included | Implements the enforcement list in section 6. Docs size table is generated from the same output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Package checks        | `publint --strict`, `@arethetypeswrong/cli` with `--profile esm-only`                                                                                                 | `pnpm check:package`, which builds first and checks the packed tarball. The profile leaves out `node10` and CommonJS `require`, which are not supported (section 6). Run in CI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Types                 | TypeScript 7, `tsc --noEmit`                                                                                                                                          | The template's version. It emits the `.jsx` source and the `.d.ts` files (#6). Files that run in Node (configs, global setups, package tests, workspace checks) have their own `tsconfig.node.json`, so Node's types stay out of the library's type program.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Diagnostics           | `@solidjs/diagnostics` 2.0 through the Vite plugin's `diagnostics` option                                                                                             | Dev only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Releases, CI          | Changesets 3, GitHub Actions                                                                                                                                          | `.github/workflows/ci.yml` runs on pull requests and `main`: format, lint, typecheck, tests in jsdom and in Chromium, the SSR app, package checks, size budgets and the docs build, then deploys `website` to Cloudflare Workers static assets at `menhir-ui.com` from `main` with wrangler 4.165 (#10), using the repository variable `CLOUDFLARE_ACCOUNT_ID` and the secret `CLOUDFLARE_API_TOKEN`. `release.yml` opens the "Version Packages" pull request and publishes to npm through trusted publishing, as `.changeset/README.md` describes.                                                                                                                                                                    |
| Docs site             | Solid 2.0 app in the `website` workspace folder, scaffolded with `pnpm create solid@latest`, set up in Phase 0                                                        | Each component gets its page as it lands (section 10). The size table is generated from the `size-limit` output.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### Spikes (Phase 0, before any component work)

1. ~~**Test renderer.**~~ Done on 2026-11-19 (#5). `createRenderer` lives in `packages/menhir/test` and is imported as `#test-utils`. It wraps `@solidjs/testing-library` 1.0.0-rc.2, which runs in jsdom and in Chromium (Vitest browser mode, `VITEST_ENV=chromium`), so the fallback is not needed. A test that activates a throwaway Switch with Enter and Space passes in both.
   - `await render(() => <X />)` returns the testing library's queries plus a user-event `user`.
   - No `setProps`. Solid cannot clone elements, so a test that changes props passes a signal and sets it.
   - Testing Library's `eventWrapper` calls `flush()` after every event, so an assertion can follow `fireEvent` or a user-event action directly, as after React's `act()`. After setting a signal, the test calls `flush()` itself.
   - `createRenderer` registers the cleanup after each test, because the testing library does so only when Vitest globals are on.
2. ~~**Build.**~~ Done on 2026-11-19 (#6). The Vite plus `tsc` setup works with `@solidjs/vite-plugin` 3.0.1, so the tsdown fallback is not needed. Result under "Build" below.

### Build

Decided in the build spike (#6), on a throwaway two-part Switch. `pnpm build` in `packages/menhir` runs both steps:

- `vite build` (`vite.config.ts`) writes the compiled `import` entries to `dist`, one file per source module (`preserveModules`), with `solid-js` and `@solidjs/web` external.
- `tsc -p tsconfig.build.json` writes the JSX source and the types to `dist/source`. It covers only `src`.

A component is added by adding its subpath to `exports` in `package.json`, the only list of components: `vite.config.ts` reads its entries from there. Its size budget is a line in `test/bundle-size/.size-limit.js`; `pnpm test` there fails until it is added. `pnpm test:package` builds, then checks `dist` (`test/package`): one compiled file, one source file and one `.d.ts` per module, an `exports` entry for every folder in `src` with an `index.ts`, and that a bundler drops an unused part. It is kept out of the default `vitest` run so that watch mode does not rebuild.

What the spike found:

- **Rolldown breaks rule 3 unless told otherwise.** Rolldown 1.2 compiles `export * as Switch from "./index.parts.ts"` into an object of getters, and no bundler can drop an unused part from an object: an app using only `Switch.Root` also got `Switch.Thumb`. A small plugin in `vite.config.ts` builds each `index.parts.ts` as an entry of its own and leaves the import of it external, so `index.js` keeps the namespace re-export. tsdown was not tried; it bundles with Rolldown too, so it probably needs the same fix.
- **Relative imports name the source file**, such as `./root/SwitchRoot.tsx`. `rewriteRelativeImportExtensions` turns that into `.jsx` or `.js` in the emitted source. Extensionless imports fail `attw` under `node16` resolution.
- **`attw` runs with `--profile esm-only`.** `node10` cannot resolve subpath exports and the package has no CommonJS build (section 6, "Costs accepted").
- **Hydrate tests need two compiles of the same JSX**, one for the server and one hydratable one for the DOM, each against its own build of Solid. A test file gets only one. So `*.hydrate.test.tsx` files run in a `hydrate` Vitest project whose plugin compiles hydratable DOM code, and its global setup (`test/ssr/renderServer.ts`) starts a Vite SSR server that renders fixtures over HTTP. A test calls `renderOnServer("/path/to/Fixture.tsx")`, which returns an element holding the server HTML, then `render(() => <Fixture />, { hydrate: element })`. It works in jsdom and in Chromium.
- **Vitest projects that compile differently must not share a transform cache.** Vitest 5's `fsModuleCache` is keyed by file, not by plugin options, so the `hydrate` project has its own `fsModuleCachePath`. Sharing it gave the hydrate test the `client` project's non-hydratable output.
- **`test/ssr-app`** is a minimal SSR app that depends on `menhir` like an installed app. Its test builds it for server and client, renders the server bundle in Node and hydrates the result with the client bundle. `test/package` in `packages/menhir` checks the built package: one file per module, the order of the export conditions, and that an unused part is dropped.

## 8. Sources and approach

Menhir is written the Solid 2.0 way. What decides how a component is built, in this order; an earlier one wins when two disagree:

1. **Solid 2.0 idioms** decide the API and the internals: [AGENTS.md](AGENTS.md), `node_modules/solid-js/CHEATSHEET.md`, the migration guide and v2.solidjs.com.
2. **The WAI-ARIA Authoring Practices** pattern for the component decides its roles, states and keyboard behaviour.
3. **Size.** A component costs only what it uses (section 6). Between two ways of meeting 1 and 2, the smaller one wins, and extra behaviour has to be worth its bytes.
4. **Other libraries** may be read for ideas, such as browser and assistive-technology fixes the pattern does not spell out. None is a model for Menhir's source structure, API or tests. They are credited in one place, the docs site's home page, and not named anywhere else.

How this applies to each component:

- **Write behaviour; never translate source.** React re-runs a component on every change while Solid runs it once, so translating hooks loses reactivity and mistimes effects. Solid 1.x code has the same problem: effects, ownership and the props helpers changed in 2.0.
- **Assemble the test list first.** Start from the cases the WAI-ARIA Authoring Practices pattern requires, then add browser and assistive-technology behaviour, forms, SSR and hydration, and Menhir's own conventions. Write each test against Menhir's API.
- **Set the size budget with the component.** Its entry point gets a budget in `test/bundle-size` when it is added, and it imports only the layers it is allowed to (section 6).
- **Record the sources.** For each component, record the WAI-ARIA pattern and the date it was read, and check the pattern for changes at each release ([CONTRIBUTING.md](CONTRIBUTING.md)).
- **Licences.** Menhir's code and tests are its own; reading another project for ideas needs no notice. Code or test bodies are not copied from other projects. If that is ever unavoidable, the source's licence notice goes into LICENSE with the change.

### What does not translate directly

| From React or Solid 1.x                | Problem in Solid 2.0                                                                                     | Direction                                                                                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render` prop with element cloning     | Solid has no element cloning                                                                             | A `render` function prop ("Polymorphism" below)                                                                                                    |
| Destructured props                     | Breaks reactivity                                                                                        | Read `props.x` where it is used; split with `omit` and `merge`                                                                                     |
| `useEffect` / `useLayoutEffect` timing | Different scheduling, new effect model in 2.0                                                            | Re-derive from the intended behaviour                                                                                                              |
| Positioning hooks for React            | React-only                                                                                               | Rebuild on `@floating-ui/dom` in the `floating` layer                                                                                              |
| `aria-checked={false}`                 | Solid 2.0 removes an attribute set to `false`                                                            | Pass the strings `"true"` and `"false"`                                                                                                            |
| `setProps` in tests                    | Solid has no element cloning                                                                             | Change props through a signal, then `flush()`                                                                                                      |
| Controlled/uncontrolled via hooks      | Different idiom                                                                                          | One `core` helper used everywhere: `createControllableSignal`, which warns in development when a part switches mode, and falls back to its default |
| Solid 1.x code                         | `createEffect(fn)`, `on`, `onMount`, `splitProps`, `mergeProps`, `classList`, `use:` are gone or changed | Use the 2.0 equivalents in AGENTS.md                                                                                                               |

### Polymorphism

Decided on 2026-11-19 (#11): every part that renders an element takes a `render` prop, a function that receives the element's props and returns the element. There is no `as` prop.

```tsx
// The default element.
<Switch.Root class="switch" />

// Another element. Attributes only that element has go here.
<Switch.Root class="switch" render={(props) => <a {...props} href="/settings" />} />

// A component that spreads its props onto an element.
<Dialog.Trigger render={Button} />
<Dialog.Trigger render={(props) => <Button {...props} variant="ghost" />} />
```

In Solid a function from props to JSX is a component, so `render` is "the component to render this part with". It covers what an `as={Button}` prop does; only the tag-name form, `as="a"`, is left out.

Why not `as`, which the first two sources in the order above both point to. Passing a component as a prop is as much a Solid idiom as `as` is, so the order does not settle it, and size does (section 2, "Each component costs only what it uses"). Solid 2.0 documents the `as` pattern, `dynamic(() => props.as, { static: isStatic(props, "as") })`, and it worked in the prototype. But a tag name can only be rendered by `dynamic`, and the `@solidjs/web` types say what that costs: "one `dynamic` on a page retains the element runtime (create/claim, `spread`, the namespace tables) for everyone". A bundler cannot tell whether a tag name ever arrives, so every app that imports a Menhir part would pay it, whether or not it uses `as`. That is a flag, not a part (section 6, rule 6), and it is three times the size of the Switch budget (the budgets leave Solid out, so no budget would catch it). `@solidjs/router` 2.0.0 uses only `dynamicComponent`, the variant without the tag path, so an app with the router does not already have it. The same cost rules out offering both props, and a `render` that also takes a tag name.

Solid's creator, Ryan Carniato, makes the runtime case against `as` as a library pattern (spoken remarks in https://www.youtube.com/watch?v=SpJbyFzF6Ao, quoted from a transcript on 2026-11-19). It is "generally more expensive for everyone and it's especially more expensive for solid", because it introduces dynamic components and dynamic spreads, which revert fine-grained updates "to basically shallow diffing". `render` removes the dynamic component. It does not remove the spread: a part still spreads one merged props object onto its element, as any part that forwards arbitrary props does. Measured in #13 (below): in Solid 2.0.1 one element's dynamic attributes share one update with or without a spread, so the spread costs no more than the same attributes written in JSX. What does cost is building the spread object inside the JSX, and `dynamic`.

Measured on a throwaway Switch root, built with Vite 8 and minified (`solid-js` and `@solidjs/web` 2.0.1). "Solid's runtime" is the growth of a whole app, with Solid bundled in, over the same part with a fixed element:

|                                  | `as` through `dynamic()`             | `render` function              |
| -------------------------------- | ------------------------------------ | ------------------------------ |
| Menhir's own code, per part      | +14 B                                | +80 B (25 B gzipped)           |
| Solid's runtime, once per app    | +4.6 kB (1.6 kB gzipped)             | +0.1 kB                        |
| Server render, then hydration    | Adopts the server's element          | Adopts the server's element    |
| Dev diagnostics                  | None                                 | None                           |
| Types                            | A generic on every part; infers well | No generics                    |
| Element swapped while mounted    | Yes                                  | No, `render` is read once      |
| Consumer writes, for another tag | `as="a"`                             | `render={(p) => <a {...p} />}` |

Both were tested with a default element, another tag and a component, in jsdom and through the `hydrate` project.

What the choice costs:

- The common case is longer to write than `as="a"`.
- Styled layers written for a library with an `as` prop replace `as={Button}` with `render={Button}`, and `as="a"` with a function. Layers written for a library whose `render` takes a tag name, a JSX element, a `{ component, props }` descriptor or a `(props, state)` function turn it into a function of props.
- The element cannot change while the part is mounted. A consumer who needs that calls `dynamic` in their own render function, and only their app pays for it.

Rules for parts and for the docs:

- **Props go on the part.** `class`, `style`, `ref`, event handlers and `data-*` attributes are passed to the part, which merges them with its own (`core/mergeElementProps.ts`: both handlers run, the consumer's first; `class` and `style` combined; refs composed) and hands the render function one props object. The render function spreads it and adds only what the part cannot know, such as `href`.
- **Nothing cancels the part's handler.** Both always run, and `preventDefault()` only stops the browser's default action. A consumer who needs to stop a part's behaviour controls its state: a controlled part only asks for a change (`createControllableSignal`), and a popup passes a reason to its open-change callback (#26). Decided on 2026-11-19. If a case appears that neither covers, add an explicit opt-out, not a `defaultPrevented` check, which would cancel the part for consumers who only meant the browser.
- **The spread is not a merge.** Next to `{...props}`, the later attribute wins: a handler written after the spread replaces the part's handler, one written before it is never called, and `class` behaves the same way. Refs are the exception: one written before or after the spread runs, and so does the part's (`src/core/renderElement.test.tsx`).
- **`undefined` is a value.** In `merge`, a consumer's `undefined` replaces the part's own value, as for any prop. A wrapper that forwards `id={props.id}` without an id therefore removes a generated `id`; a part that needs its own value whatever the consumer passes keeps it out of the merge, for example `id={props.id ?? generated}` in its own props, with `id` omitted from the consumer's.
- **Merge in the part's body**, never inline in a spread (`{...mergeElementProps(own, props)}`). The compiler tracks a spread's expression, so an inline call runs the whole merge again on every change of any prop it reads.
- **`render` is read once**, untracked, when the part is created, as an event handler is (AGENTS.md: "`onClick={cond() ? a : b}` binds once").
- **The props object is reactive.** It is a `merge` view with getters, so the render function spreads it or reads from it in JSX, and never destructures it (AGENTS.md rule 1).
- **No state argument yet.** A part's state reaches the render function as the `data-*` and `aria-*` attributes in `props`. A second argument can be added later without breaking anything, once #12 has settled what state a part exposes.

### API conventions

Decided on 2026-11-20 (#12), worked out on Switch (#15), the first component. Generated ids were decided on Collapsible (#22), the first component that links its own parts (below). Revise after the first two or three components.

- **Form controls are native buttons.** Switch's Root is a `<button type="button" role="switch">`, then a visually hidden `<input type="checkbox" aria-hidden="true" tabindex="-1">` for forms. The button gives keyboard support (Enter on key down, Space on key up), focus, `disabled` and labelling by a `<label>` without code, and the label works in the server HTML before hydration. A `<span role="switch">` would re-implement the button and compute `aria-labelledby` after mounting; a hidden native checkbox as the control would put focus on an invisible element and need more parts. The same applies to Checkbox (`role="checkbox"`) and Radio. A control whose WAI-ARIA pattern names only Space, as Checkbox's does, cancels Enter on key down, which also matches the native control; decided on 2026-11-21 (#18).
- **`render` on such a part must render a `<button>`**, and on Toggle, a `<button type="button" aria-pressed>` with no hidden input, since a toggle button is not a form control (#16). Development builds warn otherwise. No `nativeButton` flag: emulating a button would ship in every app (section 6, rule 6).
- **Parts.** Only what a native element cannot do. Switch is `Root` and `Thumb`; labels are native `<label>` elements. Description and error message parts belong to Field (Phase 4), shared by every control.
- **Controlled state.** `<state>`, `default<State>` and `on<State>Change`: `checked`/`defaultChecked`/`onCheckedChange`, `pressed`/`onPressedChange`, `open`/`onOpenChange`, `value`/`onValueChange`. Never `onChange`, which is a DOM event in the JSX types and which `mergeElementProps` treats as a handler. An empty controlled value is `null`, since `undefined` means uncontrolled (`createControllableSignal`); a value that lists items, such as Toggle Group's pressed items or Accordion's open ones, is an array in every mode, and `[]` when empty (#17, #23; `core/listValue.ts`).
- **A part's own state is not held by its consumer's async work.** An uncontrolled part writes its state in `onFlush`, after the event's flush, so it changes even when the change callback starts a fetch or a transition; written inline, it would wait for that work to settle (Solid's RFC on reactivity, batching and effects, "Keeping a write out of another update's hold"). `createControllableSignal` does this. A controlled part's value is the consumer's, and so is its timing. Tests await `afterFlush()` from `#test-utils` before asserting such a change; `flush()` does not run `onFlush` callbacks. Decided on 2026-11-20.
- **Change callbacks receive the new value only.** A second argument, when a component needs one, is a details object `{ reason, event }`, with no `cancel()` ("Nothing cancels the part's handler" above).
- **The reasons a popup opens or closes** (decided on 2026-11-22 with dismissal, #26). Every popup passes `onOpenChange(open, { reason, event })`, where `event` is the key or pointer event that caused the change, or else the browser's own `cancel`, `close` or `beforetoggle`. The reasons are kebab-case strings, typed as `OpenChangeReason` in `floating/dismissal/reason.ts`; later components add to the list and do not rename. A set passes the details through `createControllableSignal`, whose setter takes them as a second argument and hands them to `onChange`.
  - `escape-key`: Escape.
  - `outside-press`: a press outside the popup, on a dialog's backdrop or in a popover's light dismiss.
  - `trigger-press`: the trigger, pressed by pointer or keyboard.
  - `close-request`: the browser closed the popup for another reason, such as the back gesture on Android, a `<form method="dialog">` or another popover opening.
  - `trigger-hover`: the pointer rested on the trigger, or left the trigger and the popup (#30). A group closing one popup because another opened reports the other trigger's `pointerenter`.
- **Dismissing a popup** (#26; `floating/dismissal/README.md`). A press outside closes on release, as the browser's light dismiss does, and only for a press that also started outside, so a text selection dragged out of the popup keeps it open. Tooltip's Escape calls `preventDefault()`, so a popup below it stays open, and does not stop propagation, so the app's own listeners still see the key. A refused close is opened again once the popup's state has settled, and reported once. Focus leaving closes no popup through dismissal; Tooltip's blur is its own (#34). Refusing a close needs the controlled form: the details have no `cancel()`.
- **Focus in a popup** (#27; `floating/focus/README.md`). **Initial focus is an `initialFocus` prop**, over the browser's choice, which `autofocus` steers at no cost (`tabindex="-1" autofocus` for a static element at the top of long content). The prop takes an element, or a function called on each opening with the element the browser focused inside the popup, or `null`; it covers what `autofocus` cannot: a lint rule that bans it, focusing the `<dialog>` itself, and an element reached through a ref, which goes in a function (`initialFocus={() => input}`) since refs inside the popup are assigned after its props are read. **Return focus is a `returnFocus` prop**: an element, or a function called when the popup closes with the element the browser focused, or `null` when it found none (`(focused) => focused ?? fallback`); without it the browser returns focus to the element focused before a dialog opened, or to a popover's trigger. A focus the user moved out of the popup while it was shown stays where it is. **Focus returns once the popup has closed**, not when its state turns false: a dialog still shown during an exit animation (#96) is still modal and the page inert.
- **Hover delays** (decided on 2026-11-22 with hover intent, #30; `floating/hover/README.md`). **`delay`** is how long the pointer rests on the trigger before the popup opens, default 600 ms, and **`closeDelay`** how long after it has left the trigger and the popup before it closes, default 0, since the safe area carries it across the gap; both in milliseconds, on the part that takes the popup's state, and a popup may set its own defaults. A delay of 0 opens or closes in the same event. **A touch opens nothing on hover**: compatibility mouse events are not pointer events, so a tap opens nothing either, and a long press, if Tooltip (#34) wants one, is a file of its own. **A pen opens like a mouse.** **A delay group is a part**, which takes `delay` (for members that set none) and `timeout`, how long after the last closing the next member still opens at once, default 400 ms; it provides the group through context. `interestfor` is not used: it is not Baseline (#94).
- **`data-*` attributes** are `""` when they apply and absent otherwise: `data-checked`/`data-unchecked`, or `data-indeterminate` instead of either while a Checkbox is partly checked, so exactly one of the three applies (#18), `data-pressed`/`data-unpressed` on a Toggle and a Toggle Group's items (#16, #17), `data-horizontal`/`data-vertical` on a part with an orientation, beside `aria-orientation` where the role takes one (#19), `data-indeterminate`/`data-progressing`/`data-complete` on every part of a Progress, where indeterminate means the value is unknown, not partly checked (#20), `data-open`/`data-closed` on every part of a Collapsible (#22) and of an Accordion's Item (#23) and on a popup (#96), `data-selected`/`data-unselected` on a Tabs' tabs and Panels (#24), `data-disabled`, `data-readonly`, `data-required`, on every part of the component. Validity and interaction attributes (`data-valid`, `data-invalid`, `data-touched`, `data-dirty`, `data-filled`, `data-focused`) come with Field. No `data-focus-visible`: `:focus-visible` matches the button. No further attribute marks a popup's entry or exit: `data-closed` while it is still shown is the exit, since a closed popup at rest is `display: none`, and its entry is the consumer's `@starting-style` or `@keyframes` on `[data-open]` (#96).
- **A group of items is one tab stop** (roving tabindex), as the WAI-ARIA keyboard interface practice prescribes for composite widgets: the item that last had focus, else the first enabled one, has `tabindex="0"` and arrow keys move focus. Items register with the group once mounted, so the order follows the document; the server HTML gives the first enabled item the tab stop. Worked out on Toggle Group (#17). `core/rovingFocus.ts` holds it since Tabs (#24), where the tab stop is the selected tab instead, as the tabs pattern says, and disabled tabs stay focusable, as the keyboard interface practice says of tabs.
- **A value along a range reaches CSS as a custom property**, the percentage of the range, which the root sets and every element inside it inherits: `--progress` on a Progress, such as `25%` (#20), and `--meter` on a Meter (#21). The part draws nothing, and the consumer sizes an indicator with it (`width`, `scale` or an inset), so a vertical or right-to-left bar needs no prop. An indicator is a part only when it carries state: Progress.Indicator has its `data-*` attributes, while a Meter, with none, takes a plain element. The value's text is formatted with `Intl.NumberFormat`, taking its options as `format` and a `locale`.
- **Boolean props are camelCase**, `readOnly`, because they are component props, not attributes.
- **`id` goes on the labelable element**, the button, which takes the consumer's `id`.
- **Generated ids belong to the root.** When one part names another part rendered after it, as a Collapsible's Trigger names its Panel in `aria-controls`, the root generates the id with Solid's `createUniqueId`, which the server render and hydration agree on, and shares it through context. The part that carries the id takes no `id` from the consumer (it is left out of its props type and of the merge): the server renders parts in document order, so a later part's own `id` could not reach an earlier part that names it, and the server HTML would link to nothing. A consumer who needs an anchor puts an `id` on an element inside the part. A part that links only its own elements, or is named by a part rendered after it, keeps `props.id ?? generated` ("`undefined` is a value" above). Decided on Collapsible (#22), the first component that links its own parts; revisit at Tabs, Dialog or Field if a case does not fit. In a component of repeated sections, the part that holds a section is its root: an Accordion's Item generates its Panel's and Trigger's ids, and the Trigger, which keeps `props.id ?? generated` since the Panel names it in `aria-labelledby`, hands its `id` to the Panel through the Item's context (#23). Where the linked parts sit in different containers, as a tab in the List and its Panel beside it, nothing holds both: Tabs' Root generates one id and derives each tab's and Panel's from the shared `value`, and a tab with the consumer's `id` hands it to its Panel through the Root's context, keyed by `value` (#24).
- **The hidden input is the form's view of the control.** It is always rendered and takes `name`, `value`, `form`, `required` and `disabled`. A change goes through it (the button clicks it), so the form sees a checkbox's native `input` and `change` events; its click is stopped before it bubbles, so ancestors see the user's click once. A form reset goes back to the default value, through the setter, so a controlled part asks. When the browser blocks a submission and focuses the input, focus moves to the button.
- **A part used outside its root throws** a descriptive error in development builds (`isDev`).
- **No state argument** for `render` or `children` yet (see "Polymorphism"); the `data-*` and `aria-*` attributes carry the state.
- **Positioned popups** (Popover, Tooltip, the list popups; decided on 2026-11-22 with positioning, #25, to be confirmed by Popover, #33). `floating/positioning/README.md` has the details.
  - **Placement props:** `side` (`"top"`, `"right"`, `"bottom"` or `"left"`) and `align` (`"start"`, `"center"` or `"end"`), not one `placement` string: each is one word, a consumer changes one without restating the other, and they are the values of `data-side` and `data-align`. Sides are physical; `start` and `end` follow the writing direction. `sideOffset` is the gap from the anchor and `alignOffset` the shift along it, in pixels; `collisionPadding` is the space kept from the viewport's edges. Defaults are the popup's own.
  - **The positioned element is the popup itself,** the `popover` element in the top layer (#94), not a wrapper around it: the top-layer element is the one whose box is placed, and a wrapper would be one more part in every popup.
  - **Written as `top` and `left`,** through `inset: <y>px auto auto <x>px`, rounded to device pixels, with the strategy `fixed`. Not `translate`, so that `transform`, `translate` and `scale` stay free for the consumer's entry and exit animations. A popup is placed before it is painted: it is shown first, and the placement lands in the same task.
  - **`data-*` attributes** on the popup: `data-side` and `data-align`, with the resolved values (after a flip), and `data-anchor-hidden`, `""` while the anchor is scrolled out of view.
  - **CSS variables** on the popup, short and unprefixed like `--progress` and `--meter`, since they are set on the popup and inherited only inside it: `--anchor-width` and `--anchor-height`, `--available-width` and `--available-height` (the space left in the viewport, for `max-width` and `max-height`), and `--transform-origin` (the point nearest the anchor, for `transform-origin`).

The helper, built in #13: `core/renderElement.tsx`.

```tsx
import type { JSX } from "@solidjs/web";
import { untrack } from "solid-js";

/** The props a part hands to its element, or to `render`. */
export type ElementProps = Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
  ref?: (element: HTMLElement) => void;
};

export type RenderProp = (props: ElementProps) => JSX.Element;

export function renderElement(
  props: { render?: RenderProp },
  elementProps: ElementProps,
  fallback: RenderProp,
): JSX.Element {
  const Render = untrack(() => props.render) ?? fallback;
  return <Render {...elementProps} />;
}
```

A part calls it last:

```tsx
export function SwitchRoot(props: SwitchRootProps) {
  // own: role, aria-checked, data-*, handlers, ref.
  const elementProps = mergeElementProps(own, omit(props, "render", "checked"));
  return renderElement(props, elementProps, (p) => <button {...p} />);
}
```

- `ElementProps` is typed for `HTMLElement`, not for the default element, so that it spreads onto any tag. Its `ref` is narrowed to a callback: `Ref<HTMLElement>` also allows a variable and an array, which makes it unassignable to `Ref<HTMLButtonElement>`, and `<button {...props} />` then fails to type-check. The part composes the consumer's ref and its own into that one callback.
- A part's public props are `JSX.HTMLAttributes<HTMLElement>`, its own props and `render?: RenderProp`. Attributes of a specific element are typed by the consumer's own JSX inside the render function, so parts need no generics.
- Parts whose default element is not an HTML element (an SVG part) need a second `ElementProps`; decide when the first one appears.
- No budget of its own: the helper is about 80 B minified, and its cost is counted in the budget of every entry point that uses it.
- Inlining the two lines in each part measured the same as calling the helper. The helper is preferred because it is the one place to add a state argument or a dev warning.
- Spread cost, measured in #13 (jsdom, counting attribute writes and getter reads; 2026-11-19). A part with two own attributes and a consumer `title`, built three ways: all props through the merged spread; own attributes written in JSX with the consumer's props spread; no spread at all. In all three, changing one value re-read every dynamic attribute of the element once and wrote only the changed ones. Writing own attributes in JSX next to a spread kept nothing separate, so parts keep them in the merge. Calling the merge inline in the spread gave the same writes but ran the merge again on every change. Timing was not measured, nor a spread over a store, whose keys can change.
- Tests (`src/core/renderElement.test.tsx`, `test/core/renderElement.hydrate.test.tsx`): the default element, another tag, a component; `render` passed as an expression is read once without a diagnostic; server render then hydration adopts the element in all three cases, and when the render function calls `dynamic` itself, with nothing logged; a handler, a `class` and a ref written before and after the spread, to pin down the rule above; a type test that `ElementProps` spreads onto `a`, `button` and `input`.

### What the browser does for popups

Decided on 2026-11-22 (#94; ADR 0006), for the browsers of section 5. Support was checked that day in `web-features` 3.47.0 and browser-compat-data 8.1.10. The spike built a modal dialog and an anchored non-modal popup twice, once on the platform and once by hand, and ran the same keyboard, focus and pointer cases against both in Chromium 159, Firefox 159 and WebKit 27.2. The engines agreed on every case except three, named below: where Shift+Tab goes from a modal dialog's first element, the exit transition, and where focus is after a refused Escape on a popover. The spike's code is not kept in the repository; the cases and results below are its record.

| Feature                                          | Baseline on 2026-11-22                          | Decision                                                                                                         |
| ------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<dialog>` with `showModal()`                    | Widely available (since 2024-09-14)             | **Use** for Dialog and Alert Dialog                                                                              |
| `popover` (`auto`, `manual`) and `popovertarget` | Newly available (2025-01-27); Widely 2027-07-27 | **Use**, as section 5's exception: `auto` for Popover and the menus, `manual` for Tooltip                        |
| `popover="hint"`                                 | Not Baseline (no Safari release)                | Do not use; Tooltip is `manual`                                                                                  |
| `inert`                                          | Widely available (since 2025-10-11)             | **Use**, not `aria-hidden`, if a modal popup is ever not a `<dialog>`; `showModal()` makes the page inert itself |
| The top layer                                    | With `<dialog>` and `popover`                   | **Use**; no portal                                                                                               |
| CSS anchor positioning                           | Not Baseline (no Firefox)                       | Do not use; `@floating-ui/dom` stays (section 5)                                                                 |
| `CloseWatcher`                                   | Not Baseline (Safari 27.3 is in beta)           | Do not use; a modal `<dialog>` and an `auto` popover already answer close requests                               |
| `closedby`                                       | Not Baseline (Safari 27.3 is in beta)           | Do not use; outside press is written                                                                             |
| `requestClose()`                                 | Newly available (2025-05-27)                    | Do not use                                                                                                       |
| `commandfor` / `command`                         | Newly available (2025-12-12)                    | Do not use                                                                                                       |
| `interestfor`                                    | Not Baseline (Chromium only)                    | Do not use                                                                                                       |
| `@starting-style`, `transition-behavior`         | Newly available (2024-08-06); Widely 2027-02-06 | Menhir needs neither; a consumer's CSS may use them for entry animations                                         |
| `overlay` (CSS)                                  | Not Baseline (Chromium only)                    | Do not rely on it; exit animations are presence's job (#96)                                                      |
| `:has()`                                         | Widely available (since 2026-06-19)             | Available for a scroll lock in CSS (#28)                                                                         |

No feature is used "where supported, with a fallback": the fallback would be the code the feature was meant to save (section 6, rule 6).

What `<dialog>` with `showModal()` did in all three engines, and what is left to write:

- **Done by the browser:** the top layer (above a `z-index: 9999` element), an inert page (a script cannot focus outside it, and Chromium's accessibility tree leaves the outside out), Escape (as a `cancel` event), initial focus on the first focusable element, return focus to the element focused before, nested dialogs closing one Escape at a time with focus returning step by step, `::backdrop`, and close requests, which include the back gesture on Android (HTML standard, "Close requests and close watchers").
- **Left to write:**
  - **Controlled state:** an effect calls `showModal()` and `close()`.
  - **Outside press:** a press on the `::backdrop` targets the `<dialog>` element itself. It closes only if the press both started and ended there, so a text selection dragged out of the dialog does not close it.
  - **The Tab wrap.** The browser lets Tab leave the last element for the browser's own UI, and Shift+Tab from the first. The WAI-ARIA pattern says "Tab and Shift + Tab do not move focus outside the dialog" (read on 2026-11-22), and it outranks size (sources above). The spike's version, a keydown handler over a tabbable search, made Tab and Shift+Tab cycle inside the dialog in all three engines. Without it, Tab from the last element went to the browser's UI in all three, and Shift+Tab from the first went there in Chromium and to the `<dialog>` itself in Firefox and WebKit. Built in #27 as `floating/focus/tabWrap.ts`.
  - **A refused Escape is held only once.** The spec makes `cancel` cancelable only with history-action activation. In all three engines the second Escape fired a `cancel` that could not be prevented, then `close`, even with a click inside the dialog between the two. A controlled Dialog that keeps its state at `true` calls `showModal()` again from `close`; it stays modal and focus stays where it was. Dismissal (#26) reports that close once, not twice.
  - **Scroll lock:** the page still scrolls behind a modal dialog in all three. `html:has(dialog:modal) { overflow: hidden }` stopped it in all three with no script; #28 starts from there. Built in #28 as `floating/scroll-lock/scrollLock.ts`: the same declaration as an inline style on `<html>`, set only while a modal popup that imports it is open, plus the padding for the scrollbar it takes away.
  - **Exit animations:** a CSS-only exit transition ran only in Chromium (`overlay`). Firefox and WebKit removed the dialog at once. Presence (#96) keeps the dialog open while it animates, then calls `close()`.
- **Constraints it brings:**
  - **The Popup part is a `<dialog>`.** A `render` function must return a `<dialog>`, since `showModal()` exists on no other element; a development build can check it.
  - **Server HTML can only say `<dialog open>`,** which is a non-modal dialog: the page stays focusable until hydration, and `showModal()` throws `InvalidStateError` on it, so hydration calls `close()` first. Dialog (#31) decides between that and rendering a `defaultOpen` dialog closed on the server.

What `popover="auto"` with `popovertarget` did in all three engines, rendered in place after its trigger:

- **Done by the browser:** the top layer (not clipped by an `overflow: hidden` ancestor, above a `z-index: 9999` element), light dismiss by a press outside, Escape, return focus to the trigger on Escape, `aria-expanded` on the trigger (Chromium's accessibility tree), Tab from the trigger into the popup and from its last element on to what follows the trigger, a press on the trigger closing it without reopening, and nested popovers closing one at a time.
- **Left to write:**
  - **Controlled state:** the `toggle` event reports the change. `beforetoggle` cannot be cancelled on close, so a controlled popover that refuses a close is shown again: in a microtask in the spike, and on `toggle`, once the popover is hidden, in dismissal (#26), since with real input a microtask runs inside the browser's hide. After an Escape, focus has already moved to the trigger in Chromium and Firefox; WebKit left it in the popup.
  - **The reason for the close.** One `toggle` event covers Escape, outside press and a trigger press. Dismissal (#26) tells them apart with its own Escape and pointer listeners.
  - **Positioning:** `@floating-ui/dom` with the `fixed` strategy, which is what the top layer is.
- **Constraints it brings:**
  - **`popovertarget` needs an id on the popup.** The root's generated id provides it ("Generated ids belong to the root").
  - **A closed popover is `display: none`** in the browser's own stylesheet, so server HTML with `defaultOpen` stays hidden until hydration calls `showPopover()`. The Popover (#33) decides how to handle it.
  - **Nesting follows the document tree,** or the `popovertarget` invoker. `showPopover({ source })` is not Widely available.
  - **Focus leaving does not close it:** Tab from the popup's last element to the page left it open in all three. A `manual` popover stayed open when an `auto` one opened and on a press outside, so Tooltip neither closes nor is closed by a Popover.

Sizes, measured as `test/bundle-size` measures (Rolldown through Vite 8, minified, gzipped, Solid left out with its production constants). Each is an app that renders the prototype, less an app with only a button (257 B). The hand-built prototypes are lower bounds: no radio groups or shadow roots in the tabbable search, no iOS handling, no padding for fixed elements in the scroll lock.

| Prototype                                                                          | Platform | By hand |
| ---------------------------------------------------------------------------------- | -------- | ------- |
| Modal dialog: controlled, Escape, outside press, initial and return focus, nesting | 487 B    | 1,130 B |
| The same with the Tab wrap                                                         | 780 B    | 1,130 B |
| Anchored popup, positioned with `@floating-ui/dom`                                 | 7,553 B  | 8,192 B |

Of the anchored popup, `@floating-ui/dom` is 6,989 B: `computePosition` with `offset`, `flip` and `shift`, and `autoUpdate`. `computePosition` alone is 4,583 B and `autoUpdate` alone 2,187 B. The hand-built popup is also still covered by an element with a high `z-index` outside its portal, which no number of bytes fixes. Positioning is the largest cost of any popup by far. It stays on `@floating-ui/dom` until CSS anchor positioning is Widely available. #25 measured each middleware (`floating/positioning/README.md`).

## 9. Roadmap

The component list is the set a modern headless library is expected to have. It decides which components exist, not how they are built.

**Phase 0: foundations**

- ~~Evaluate the existing Solid 2.0 libraries (section 4).~~ Done (#1).
- ~~The two tooling spikes (section 7).~~ Done: test renderer (#5), build (#6).
- ~~Repo, build, test runner, size budgets, import-boundary lint.~~ Done.
- ~~`core` layer.~~ Done. ~~Decide the polymorphism pattern.~~ Decided (#11): a `render` function prop (section 8, "Polymorphism").
- ~~Docs site in `website` (Solid 2.0, `pnpm create solid@latest`): component page template, generated size table, deployment.~~ Done: deployed at `menhir-ui.com` (#38).
- ~~Claim the npm name and GitHub org.~~ Done (#2): `menhir` 0.0.0 holds the npm name; no org; the domain is `menhir-ui.com` (section 3).

**Phase 1: simple components** (days each; settles API conventions)

- ~~Switch, Toggle, Toggle Group, Checkbox, Separator, Progress, Meter, Collapsible, Accordion, Tabs.~~ Done.
- First release, 0.1.0, without an announcement (#35): it puts the release pipeline to work and lets the API conventions meet users before Phase 2 builds on them.

**Phase 2: floating layer, then the first popups** (the bulk of the work)

- ~~First, decide what the browser does for popups, and which browsers are supported (#94).~~ Decided: Baseline Widely available plus `popover` (section 5); `<dialog>` and `popover` put every popup in the top layer, so there is no portal (section 8, "What the browser does for popups"). Beside it, set up the layer (#95): the folder, whether it is internal, how a module's size is measured, and where the stack of open popups lives.
- `floating` layer: positioning (#25), dismissal (#26), focus (#27), scroll lock (#28), hover intent (#30), presence (#96), which keeps a closing popup in the document until its exit animation has ended.
- Dialog (#31), which settles the popup conventions as Switch settled the first ones; then Alert Dialog (#32), Popover (#33), which settles the parts of a positioned popup, and Tooltip (#34).
- Announcement once Dialog and Popover are excellent (#88).

**Phase 3: list-based popups**

- List navigation (#97) and typeahead (#98).
- Menu (#99), which settles the list popup conventions; Context Menu (#100) and Menubar (#101), which build on it; Select (#102); Combobox (#103) and Autocomplete (#104), which builds on it; Navigation Menu (#105).
- These tickets were written before the floating layer existed (tracking issue #36). Each has a "Settle after Phase 2" list and is not started until that list is checked off.

**Phase 4: forms and the rest**

- Field, Fieldset, Form, Input, Number Field, Radio, Slider, Scroll Area, Toast, Toolbar, Avatar, Preview Card.

## 10. Definition of done, per component

- Its test suite, assembled as section 8 describes, passes in jsdom and Chromium. Cases left out are listed with a reason.
- Keyboard and screen-reader behaviour matches the WAI-ARIA pattern.
- No Solid dev diagnostics are reported while its tests run. `createRenderer` enforces this for every test.
- Works with SSR and hydration.
- Size budget set and met; only allowed layers imported.
- Docs page with an unstyled example and the measured size.
- Its sources are recorded (section 8), and which browsers and screen readers it was tried with.
- A changeset (AGENTS.md, "Changesets").

A module of the `floating` layer has no entry point, so no budget and no docs page of its own. It is done when:

- Its test list is in its README, with the cases left out and a reason for each, and its tests pass in jsdom and Chromium.
- No Solid dev diagnostics are reported while its tests run.
- It works with SSR and hydration: nothing reads `document` or `window` at import time or during a server render.
- A popup that does not use it does not bundle it, and its measured size is in its README (#95 decides how it is measured).
- It imports only what the `floating` layer may (section 6, rule 4).
- Its sources are recorded, and the decisions made on it are in this plan.

## 11. Risks

| Risk                                           | Mitigation                                                                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Solo maintainer burnout                        | Narrow scope; announce after Phase 2; no promise of full parity.                                                                                          |
| WAI-ARIA patterns change                       | Record the date each component's pattern was read and check it at each release, as section 8 describes.                                                   |
| React patterns leak in                         | Section 8 puts Solid 2.0 idioms first, and no library's source is translated. The diagnostics line in section 10 catches React-shaped effects.            |
| Solid 2.0 ecosystem and tooling still settling | Keep dependencies minimal; isolate 2.0-specific code in `core`.                                                                                           |
| Duplicating an existing Solid 2.0 library      | Differentiate on size and Solid-native design; measure Switch against the existing libraries and revisit before Phase 2 if Menhir is not clearly smaller. |
| Size creep                                     | CI budgets and published numbers.                                                                                                                         |

## 12. Open questions

1. ~~Build Menhir, or contribute to an existing port?~~ Decided on 2026-11-19 (#1): continue with Menhir, as a size-first library with its own design. Reasons in section 4; the size check that would reverse this is in section 11.
2. ~~Polymorphism: an `as` prop, a render function prop, or both?~~ Decided on 2026-11-19 (#11): a `render` function prop, and no `as` prop. An `as` prop that takes a tag name adds 1.6 kB gzipped of Solid's runtime to every app. Details in section 8 ("Polymorphism").
3. ~~Package shape~~ Decided: one `menhir` package with a subpath export per component, as in section 6 ("Package shape").
4. Public API conventions: part names, controlled-state props and `data-*` attributes. Follow an existing library's, or Menhir's own? Matching a library makes its styled layers and docs easier to port; Solid 2.0 idiom wins where they conflict (section 8). Decided on 2026-11-20 (#12), and generated ids on 2026-11-21 (#22): section 8, "API conventions". Menhir's own part names and `data-*` attributes, `on<State>Change` callbacks with the value only, native buttons for form controls.
5. ~~Is the `solid` export condition still needed in 2.0?~~ Decided on 2026-11-19 (#6): yes. The 2.0 library guide prescribes it, and an SSR app fails without it. No separate server build. Details in section 6.
6. ~~Test stack~~ Decided: Vitest 5.1, jsdom plus Chromium, `@solidjs/testing-library`, as in section 7.
7. ~~Tooling~~ Decided: follow the `pnpm create solid@latest` template (oxlint, TypeScript 7, `@solidjs/testing-library`).
8. ~~Which browsers are supported, and how much of a popup the browser does?~~ Decided on 2026-11-22 (#94; ADR 0006): Baseline Widely available, plus `popover` (section 5, "Browsers"). Details in section 8, "What the browser does for popups".
9. Is the `floating` layer internal, as `core` is, or does it get entry points for apps and styled layers that build their own popups (#95)?
10. May a popup import another popup? The lint rule allows `core` and `floating` only, and Alert Dialog builds on Dialog (#32). The answer also serves Context Menu, Menubar and Autocomplete.

## References

- Solid 2.0 docs: https://v2.solidjs.com
- Solid repo (migration guide, 2.0 RFCs): https://github.com/solidjs/solid
- WAI-ARIA Authoring Practices patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- Solid library guide: "Building a library" in the `@solidjs/vite-plugin` README, https://github.com/solidjs/solid-vite-plugin#building-a-library
- Vitest browser mode: https://vitest.dev/guide/browser/
- tsdown Solid recipe: https://tsdown.dev/recipes/solid-support
