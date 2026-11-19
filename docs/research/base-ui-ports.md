# Existing Base UI ports for Solid

Evaluation for [#1](https://github.com/j13n/menhir/issues/1), carried out on 2026-11-19. It answers open question 1 in [PLAN.md](../../PLAN.md): build Menhir, or contribute to an existing port?

## Decision

**Continue with Menhir, as a size-first library with its own design. Do not contribute it to an existing port.** Decided on 2026-11-19.

Three findings carry it:

1. **Nobody competes on size.** In all five published ports a Switch costs 15 to 22 kB minified, and in the three where Dialog was measured it costs 54 to 90 kB. The cause is structural: each port keeps Base UI's architecture, so every component carries the render helper, a prop merger, button behaviour and Field integration, and every popup carries the full interaction layer.
2. **Behaviour parity is already available.** ZerNico/base-ui-solid has all of Base UI 1.9.0's components on Solid 2.0, with upstream's tests ported and passing in CI. Menhir cannot differentiate on "Base UI for Solid 2.0 exists"; that is done.
3. **The one viable port has the opposite goal.** ZerNico's `PORTING.md` states "The goal is a file-by-file port: same folder layout, file names, exports, data attributes, CSS variables, event reasons and behavior as upstream". Menhir's rule is "port behaviour and tests, not code" (PLAN.md section 8). A layered, size-budgeted design cannot be contributed to a project whose structure must mirror upstream.

How Menhir differs from ZerNico's port, the closest alternative:

|             | ZerNico/base-ui-solid                                                                                 | Menhir                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Goal        | Mirror upstream file by file, track every release                                                     | Port behaviour and tests; pin an upstream version per component |
| Size        | Not a goal; Switch 22.4 kB minified                                                                   | Enforced budget per entry point                                 |
| Shared code | Upstream's: render helper, prop merger, store, Field in every form control                            | `core` and `floating` layers with an import-boundary rule       |
| Reactivity  | React-shaped: 286 calls to a `useIsoLayoutEffect(effect, () => [deps])` shim, 8 direct `createEffect` | Written for Solid 2.0's split effects                           |
| Coverage    | All 38 components today                                                                               | A few components at first release                               |

### Check the bet early

The decision rests on Menhir being much smaller, and that is unproven. The build spike (#6) and Switch (#15) give the first real number. The smallest existing Switch is 14.7 kB minified, 5.5 kB gzipped (msviderok, on Solid 1.x and an older Base UI), and only about 3.5 kB of that is Switch itself. The smallest on Solid 2.0 is 17.9 kB (quoin-ui). If Menhir's Switch, with the same behaviour, is not clearly below that, revisit this decision before Phase 2 and consider contributing size work to ZerNico's port instead.

Part of the existing weight is Field and Form integration, which Menhir also needs in Phase 4. Rule 6 in PLAN.md (expensive behaviour is a part, not a flag) has to cover it, or Menhir's Switch grows to the same size later.

## Method and limits

- Each project's repository was cloned and its published npm tarball unpacked and read. The repositories are untrusted, so **nothing from the projects was installed, built or run** (esbuild, Rollup, Rolldown and `@floating-ui/*` were installed in a separate directory for measuring). "Tests pass" below means the project's public CI status, never a local run.
- Sizes were measured on the published tarballs with esbuild: bundled, minified, ESM, `solid-js` and `@solidjs/*` external, `@floating-ui/*` bundled in, gzip level 9. Each entry imports one whole component namespace, so a figure is the cost of using every part of that component.
- The measurements were made by four separate scripts (esbuild 0.25.10, 0.25.12 and 0.28.2). The quoin-ui figures were re-run with the settings used for ZerNico's port and came out identical. The nayupls1 and unstyled-solid figures include 1 to 2 kB of duplicated external import lines. Treat differences under about 10% as noise.
- File and test counts were taken per project with different globs, so they are comparable within a project, not across projects (upstream's own test-file count came out as 384 to 395).
- ZerNico's sizes are from the published 0.3.1 (2026-10-19). Its Base UI 1.9.0 tracking and CI status describe `main`, which is 121 commits ahead of that release.
- npm versions, peer ranges and dependencies were checked against the registry on 2026-11-19.
- Statements about how a project was written (machine translation, AI assistance) and about how open a maintainer is are inferences from comments, commit patterns and one or two data points each.

## Summary

|                          | ZerNico                                   | quoin-ui                   | unstyled-solid                  | nayupls1                | msviderok                                | Script-Augur     |
| ------------------------ | ----------------------------------------- | -------------------------- | ------------------------------- | ----------------------- | ---------------------------------------- | ---------------- |
| npm package              | `base-ui-solid` 0.3.1                     | `quoin-ui` 0.6.0           | `@unstyled-solid/base-ui` 0.0.3 | `base-ui-solidjs` 0.1.0 | `@msviderok/base-ui-solid` 1.0.0-beta.12 | not on npm       |
| Solid peer range         | `^2.0.0-rc.15`                            | exactly `2.0.0-rc.18`      | exactly `2.0.0-rc.20`           | `^2.0.0-rc.21`          | `^1.8`                                   | `^1.9.0`         |
| Accepts `solid-js` 2.0.1 | yes                                       | no                         | no                              | yes                     | no (1.x)                                 | no (1.x)         |
| Base UI version          | 1.9.0                                     | not stated                 | 1.8.0                           | 1.9.0                   | 1.0.0-beta.1                             | 1.7.0            |
| Components               | 38 of 38                                  | 40 entries                 | 38                              | 38                      | 6 missing                                | 24 of 38         |
| Last commit              | 2026-11-11                                | October 2026               | 2026-11-02                      | 2026-11-10              | 2026-06-22                               | 2026-09-17       |
| Commits, authors         | 302, 2                                    | 21, 1 human                | 21, 1                           | 43, 1                   | 317 by 1                                 | 38, 1 human      |
| Upstream tests ported    | yes, 402 files, name parity checked in CI | no, own suite of 190 files | yes, 411 files                  | no, 27 files of its own | yes, 182 of 184 files                    | partly, 73 files |
| Test environment         | jsdom, Chromium, e2e                      | happy-dom; browser opt-in  | jsdom, node SSR, Playwright     | jsdom                   | jsdom only                               | jsdom only       |
| CI                       | passing                                   | none                       | passing                         | fails at startup        | failing, runs no tests                   | failing          |
| `solid` export condition | yes                                       | yes                        | no                              | no                      | no                                       | no               |
| SSR                      | server build, 38 fixtures                 | opt-in tests               | server build, hydration harness | unsupported             | untested                                 | none             |
| Licence, Base UI notice  | MIT, kept                                 | MIT, **not kept**          | MIT, kept                       | MIT, kept               | MIT, kept                                | MIT, NOTICE      |
| Verdict                  | the incumbent                             | ideas only                 | ideas, test reference           | ideas only              | ideas, test reference                    | ignore           |

"Accepts 2.0.1" is what the peer range allows. Whether any of them works on stable 2.0.1 was not tested.

## Sizes

Minified / gzipped, in kB. A dash means the entry was not measured.

| Entry     |    msviderok |     quoin-ui |     nayupls1 | unstyled-solid |      ZerNico |
| --------- | -----------: | -----------: | -----------: | -------------: | -----------: |
| Separator |    4.3 / 1.8 |    2.6 / 1.1 |    6.0 / 2.4 |      9.3 / 3.7 |    7.7 / 3.3 |
| Toggle    |    9.0 / 3.5 |   11.4 / 4.3 |   14.1 / 5.5 |     18.2 / 6.7 |   18.3 / 7.4 |
| Switch    |   14.7 / 5.5 |   17.9 / 6.2 |   18.3 / 7.2 |     21.5 / 7.9 |   22.4 / 9.0 |
| Dialog    |  54.0 / 18.8 |  72.0 / 22.9 |            – |              – |  90.4 / 31.8 |
| Popover   |  86.8 / 30.2 |            – | 129.6 / 44.9 |   133.9 / 44.7 | 145.3 / 50.8 |
| Select    | 113.3 / 39.3 | 126.7 / 41.8 |            – |              – | 156.7 / 56.3 |

The msviderok figures are for Solid 1.x and Base UI 1.0.0-beta.1, which had less behaviour to carry; it also leaves `solid-js/store` external.

What the bundles contain:

- **The layering already works everywhere.** No port pulls positioning code into Switch (0 to 236 bytes of `@floating-ui/utils`). All use `sideEffects: false`, one file per module and `export * as` namespaces, never `Object.assign`. Menhir's rules 1 to 3 are the norm, not a differentiator.
- **Simple components are heavy because of shared helpers.** In msviderok's Switch (14.7 kB), Switch itself is 3.5 kB; Field integration is 4.0 kB, the Proxy-based `mergeProps` 2.6 kB, utilities 2.6 kB and `useButton` 1.2 kB, with small modules making up the rest. The prop merger is in every component, including Separator. quoin-ui's Switch carries two prop mergers (2.0 and 1.7 kB) and `use-button` (2.2 kB). The render helper alone is 2.9 kB in nayupls1 and 5.3 kB in unstyled-solid.
- **Dialog pays for a floating layer it does not use.** Dialog positions nothing, yet carries 22.3 kB (msviderok) and 36.3 kB (quoin-ui) of ported Floating UI interaction code. ZerNico's popups carry 27 to 45 kB of its floating layer plus about 17.6 kB of `@floating-ui/*`.
- **Whether unused parts are dropped depends on the consumer's bundler.** Checked on quoin-ui's Dialog, which uses the `export * as Dialog` pattern of PLAN.md rule 3: importing `{ Dialog }` and using only `Dialog.Title` gives 2.8 kB with Rollup 4.68 and 3.1 kB with Rolldown 1.3, but 74.3 kB with esbuild 0.28, which keeps the whole namespace. Vite apps are fine; esbuild-bundled apps are not. This also matters for #9: the small-library preset of `size-limit` measures with esbuild, so a budget for "one part" needs a Rollup or Rolldown measurement.

For Menhir this means the budget is won or lost in `core` (prop merging, the polymorphism helper, button behaviour) and in splitting `floating` so that Dialog imports dismissal and focus trap without list navigation, hover or positioning.

## Per project

### ZerNico/base-ui-solid

The only port that is complete, current, tested and has a peer range that admits stable Solid 2.0.

- Created 2026-10-05; 302 commits, 296 by one author; 5 stars. Published 0.3.1 on 2026-10-19; `main` is 121 commits ahead of it.
- Tracks upstream commit `5aacdbb` (2026-11-10, `@base-ui/react` 1.9.0). Has `pnpm upstream:sync` and a CI job (`scripts/compareUpstreamTests.mjs`) that fails when a test name present upstream is missing.
- Export conditions: `solid` (JSX source), `node`/`worker`/`deno` (a separate server build) and `browser`/`default` (DOM build).
- `render` accepts a function, a tag string or a component, through `useRenderElement(element, componentProps, { state, ref, props, stateAttributesMapping, enabled })`. A JSX element is not supported.
- `useControlled({ controlled: Accessor, default, name, state? })` returns `[Accessor, setter]`.
- Uses Solid 2.0 APIs correctly (`omit`, `merge`, `dynamic`, no destructured props) but keeps React's shape: 701 `untrack` calls and 1,606 "Port note" comments.
- Risks: one maintainer, six weeks old, 57 npm downloads in the last week.

### quoin-ui

Smaller bundles than the other 2.0 ports, but not something to build on.

- 0.6.0 published 2026-10-23, ten versions since 2026-06-02. 21 commits; the last is a 317-file squash. Hosted on gitcafe.dev, built with Bun and Biome, type-checked with `tsgo`.
- Peers pinned to exactly `2.0.0-rc.18` for `solid-js`, `@solidjs/web` and `@solidjs/signals`. The one outside pull request (#5), which widens the range and reports a `SERVER_WRITE` diagnostic on rc.20, had no response after about 17 days.
- No CI: the pipeline was removed in the 0.6.0 commit.
- Its `exports` map has 43 keys: 40 components, `.`, `./package.json` and `./internals`. The issue and the earlier plan said 42.
- Polymorphism is an `as?: ValidComponent` prop through `dynamic()`, with no render function.
- `createControlledState<T>(options): [Accessor<T>, (next: T) => void]`.
- Floating layer: its own port of Base UI's vendored hooks, 12,419 lines in 38 files, in a source tree of 84,141 lines.
- 167 of 172 `createEffect` calls are split, but there are 219 `useX` functions, 957 `.current` accesses and no use of `onSettled`.
- **Licence caution:** the source describes files as ports of Base UI, but Base UI's MIT notice is not in the package. Do not copy code from it; read it for ideas only.

### unstyled-solid/base-ui

The most idiomatic of the 2.0 ports and the best second reference for tests.

- 21 commits by one author; the second commit adds 5,722 files. Built with an agent workflow (`AGENTS.md`, `.beads`, `.opencode` in the repo).
- Peers pinned to exactly `2.0.0-rc.20`; dependencies pinned to exact versions.
- 411 test files, run in three lanes (317 jsdom, 44 node SSR, 59 browser; some files run in more than one).
- Not a contribution target either: an exact release-candidate pin, one author, a history that starts with a 5,722-file commit, and the same architecture and sizes as ZerNico's port, which is further along on each of those points.
- No `solid` condition: `browser` maps to a DOM build and everything else to a server build.
- `render` is function-only. `createControlled({ value, defaultValue, onChange })` returns `{ value, request, reset }`.
- 150 `createX` functions, 25 `onSettled` calls and a written reactivity contract in `docs/solid2-contract.md`.
- Open issue #12 reports `SERVER_WRITE` on Popover under SSR, unanswered.

### nayupls1/base-ui-solid

A two-day port (2026-11-09 to 2026-11-10) produced largely by scripts (`scripts/port.py`).

- 27 test files of its own against upstream's 395. CI fails at startup. Its notes admit about 100 type errors.
- Keeps React semantics by force: a `createSyncSignal` for synchronous reads after writes (30 uses), an `ownedProps` Proxy on every component, 991 `.current` accesses.
- SSR is documented as unsupported.

### @msviderok/base-ui-solid

A careful Solid 1.x port, now nearly dormant. Not a base for a 2.0 library.

- A copy of the Base UI monorepo with `packages/solid` added; 101 stars. Three commits since January 2026. An unmerged `1.2.0` branch is still on `solid-js` 1.9.7. No reference to Solid 2.0 anywhere.
- Nine minor versions behind upstream. Missing autocomplete, button, combobox, csp-provider, drawer and otp-field.
- Tests ported almost completely (1,334 cases against upstream's 1,348), but browser mode is commented out, so 83 browser-only cases never run.
- Six runtime dependencies, three unused in the output (`@babel/runtime`, `@solidjs/router`, `@solid-primitives/props`).
- Floating layer (`packages/solid/src/floating-ui-solid/`): 5,887 lines in 29 files against 6,243 in Base UI's vendored React fork, with every hook present. Largest files: `useListNavigation` 1,043 lines, `FloatingFocusManager` 767, `useHover` 502, `useDismiss` 440, `safePolygon` 406. Depends on `@floating-ui/dom`, `@floating-ui/utils` and `tabbable`.
- The translation is line for line: options become `MaybeAccessor`, refs become `let` variables, effects are single auto-tracking `createEffect` bodies with nested `onCleanup`, and `useInteractions` keeps React's prop getters. It assumes synchronous updates (52 `batch` calls), which Solid 2.0 does not give. Adapting it to 2.0 means re-deriving each of about 160 effects, so it is a map of what the layer must do, not code to adapt.

### Script-Augur/base-ui-solid

Solid 1.x, 24 of 38 components, no commits to `main` since 2026-09-17, 16 open pull requests untouched, failing CI, published only to a restricted GitHub Packages registry. Nothing further is needed from it.

## Worth borrowing, by issue

Paths are relative to each project's repository. Everything except quoin-ui keeps Base UI's MIT notice; keep theirs too if code is copied, not just read.

**#5, #7 Test renderer and infrastructure**

- ZerNico `scripts/compareUpstreamTests.mjs`: CI check that every upstream test name exists in the port. Fits "a component is done when its ported tests pass".
- unstyled-solid's three lanes (jsdom, node SSR, Playwright) match the Vitest projects planned in PLAN.md section 7.
- msviderok `packages/solid/test/`: `describeConformance` and floating fixtures already adapted to Solid.
- quoin-ui `test/hydration/hydration.test.tsx` and ZerNico's SSR fixtures, for the render-then-hydrate project.

**#6 Build spike, and open question 5 (`solid` condition)**

- ZerNico `scripts/buildPackage.mjs`: emits JSX source, a DOM build and a server build. Two ports (ZerNico, unstyled-solid) ship a separate server build under `node`/`worker`/`deno`; PLAN.md plans only `solid` plus `import`. The spike should decide whether a server build is needed for consumers that do not compile the `solid` source.
- unstyled-solid `distribution/README.md` on export-condition order; quoin-ui `scripts/build.ts` for dual output.

**#11 Polymorphism**

| Port           | Pattern                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| quoin-ui       | `as` prop through `dynamic()` only                                          |
| ZerNico        | `render`: function, tag string or component                                 |
| msviderok      | `render`: tag string, `{ component, ...props }`, or `(props, state) => JSX` |
| nayupls1       | `render`: tag string, function or DOM element                               |
| unstyled-solid | `render`: function only                                                     |
| Script-Augur   | `render`: `{ component, props }` descriptor                                 |

- Nobody found an equivalent of React's element cloning. Four ports accept a render function; Script-Augur takes a descriptor and quoin-ui only `as`.
- The helper is a fixed cost in every part: 2.9 kB (nayupls1) to 5.3 kB (unstyled-solid) minified. Budget it.
- nayupls1 has a dev warning for reading `state` untracked inside a render function, worth copying as an idea.

**#12 API closeness**

- All six ports keep Base UI's part names and data attributes, and five keep `render` (quoin-ui replaces it with `as`). A styled layer written for any of them, or for Base UI, would port to Menhir most easily if Menhir does the same.

**#13 `core` layer**

- Prop merging is the largest avoidable cost: a Proxy-based merger is 2.6 kB in every component. Solid 2.0's `merge` and `omit` should be tried first.
- quoin-ui `src/internals/merge-root-props.ts` and `compose-refs.ts` for what the helpers must handle (event handler chaining, ref composition).
- Controlled state: one helper per port, returning an accessor and a setter in five of them (`useControlled` in ZerNico, nayupls1 and msviderok, `createControlledState` in quoin-ui, `createControlled` in Script-Augur). unstyled-solid's `createControlled(...).request()` separates "ask for a change" from "state changed", which suits controlled components. quoin-ui's helper writes a signal at creation; Solid 2.0 does not allow writes in a component body, so check how it gets away with that before copying the shape.
- ZerNico `packages/utils/src/cleanup.ts`.

**#14 Porting process**

- Trap lists written by people who hit them: ZerNico `PORTING.md` (577 lines), nayupls1 `PORTING.md`, unstyled-solid `docs/solid2-contract.md`, msviderok `packages/solid/SolidStuff.md`, quoin-ui `src/internals/solid/bugs.md`.
- Two projects report `SERVER_WRITE` diagnostics under SSR (quoin-ui PR #5, unstyled-solid issue #12). Add an SSR case for popups early.

**#25 to #30 `floating` layer**

- Five ports (all but Script-Augur) port Base UI's vendored Floating UI React hooks onto `@floating-ui/dom`; Script-Augur has a 179-line `useFloating` wrapper plus `tabbable`. None builds on Kobalte, corvu or solid-floating-ui.
- Split it so Dialog does not import list navigation, hover or positioning; that is 22 to 36 kB in existing ports.
- #25 positioning: unstyled-solid `createFloating.ts` lines 40 to 77 guards async position results with a generation counter; quoin-ui `src/internals/floating-ui/hooks/use-floating.ts`.
- #26 dismissal: msviderok `useDismiss` (440 lines) as the behaviour list.
- #27 focus trap: quoin-ui `src/internals/floating-ui/components/floating-focus-manager.tsx`; msviderok `utils/markOthers.ts` and `utils/tabbable.ts` are framework-free.
- #28 scroll lock: quoin-ui `src/internals/popups/use-scroll-lock.ts`.
- #30 hover intent: msviderok `safePolygon.ts` is framework-free.

**#36 List-based popups**

- msviderok `utils/composite.ts` (framework-free) and `useListNavigation` (1,043 lines) show the size of that problem.

## Not determined

- Whether any port's tests pass when run locally, and whether any works on `solid-js` 2.0.1.
- Which Base UI version quoin-ui ports from; its demo depends on `@base-ui/react` 1.5.0.
- Whether hydration is correct in any port.
- A per-module breakdown of the shared layer for ports other than msviderok and quoin-ui, and any bundle figures for Script-Augur (not on npm).
- npm download counts, except ZerNico's.
