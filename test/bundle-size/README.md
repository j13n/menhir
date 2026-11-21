# @menhir/bundle-size

The size checks of PLAN.md section 6, "Enforcement". This package depends on
`menhir` like an installed app, so it measures the built package through its
`exports`.

| Command          | What it does                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`      | Builds menhir, then runs both checks below. Fails if an entry point is over budget or has none.                                                      |
| `pnpm size`      | Builds menhir and prints each entry point's size against its budget.                                                                                 |
| `pnpm size:json` | Builds menhir and writes the same results to `dist/sizes.json`, for the docs site's sizes (#38), and the comparison below to `dist/comparison.json`. |
| `pnpm compare`   | Builds menhir and prints the sizes of the comparison below.                                                                                          |

## Size budgets

`.size-limit.js` holds one budget per entry point of `menhir`. `size-limit` 14
with `@size-limit/rolldown` bundles an app that imports the entry point and
uses every part of it, minifies it, and measures it gzipped, with `solid-js`
and `@solidjs/web` left out. It resolves the entry point with Node's `import`
condition, so it measures the compiled output in `dist`, which is what an app
bundles in the end.

The size is that of a production app. Menhir's development-only code sits
behind `isDev` of `@solidjs/web`, and its server-only code behind `isServer`;
Solid's production build for the browser defines both as `false`, and a
bundler drops that code (PLAN.md section 6, rule 2). With `@solidjs/web` left
out, Rolldown would see only an import and keep it all. So
`productionConstants.ts` has a Rolldown plugin that gives a module that is
left out the constants of its production build (`solidProduction`), while
every other export of it stays an import. `productionConstants.test.ts`
checks the plugin on `fixtures/development-only`, and that no entry point of
menhir still imports `isDev` or `isServer` when bundled with it.

Rolldown, not esbuild: esbuild keeps a whole `export * as` namespace even when
an app uses one part (PLAN.md section 6, rule 3), and the budgets
should measure what a Vite app gets.

`size.test.ts` runs `size-limit --json` and checks that every entry point in
menhir's `exports` has a budget and is within it.

### Adding a budget for a new component

1. Add the component's subpath to `exports` in `packages/menhir/package.json`,
   as PLAN.md section 7 ("Build") describes. `pnpm test` here now fails:
   the entry point has no budget.
2. Add a line for it to `budgets` in `.size-limit.js`, such as
   `"menhir/accordion": "600 B"`. The limit is the measured size plus about 20%,
   rounded: run `pnpm size` to see the size.
3. Run `pnpm test`.

A pull request that raises a budget says why in its description.

### `dist/sizes.json`

The JSON report of `size-limit`, one object per entry point:

```json
[{ "name": "menhir/switch", "passed": true, "size": 409, "sizeLimit": 500 }]
```

`size` and `sizeLimit` are in bytes, gzipped. The docs site reads the file
through `virtual:menhir-sizes` (`website/vite-plugin-sizes.ts`): its size
table and each component page's size come from here. `dist` is not
committed, so the site's `pnpm build` runs `pnpm size:json` first.

## Comparison with other libraries

The docs site's bundle-size page shows each component's size beside the same
component in other libraries. `comparison.ts` lists the libraries: for each,
its framework, the framework's packages, and the module of its version of each
menhir component, by the subpath of menhir's entry point. A component the
library does not have is left out.

`comparison.size-limit.js` measures each of those modules as `.size-limit.js`
measures menhir: an app that imports it and uses every part of it, bundled
with Rolldown, minified and gzipped. The library's framework packages are
left out instead of Solid. These are production sizes too: a Solid library
is measured with the production constants of its Solid (`production` in
`comparison.ts`), and the React libraries mark development-only code with
`process.env.NODE_ENV`, which Rolldown sets to `"production"` itself. The
checks have no limits: these sizes are shown, not enforced.

The same config measures totals: each library's components imported
together, and the same components of menhir, so that code the components
share is counted once, as in an app that uses them all. A library that lacks
a component is compared with menhir on the ones it has. size-limit cannot
import several modules whole in one check, so the config writes a module that
re-exports them to `dist/together` and measures that.

`measureComparison.ts` runs that config and, as a script, writes
`dist/comparison.json`:

```json
{
  "menhirTotal": 4216,
  "libraries": [
    {
      "name": "Radix",
      "framework": "React",
      "components": {
        "switch": {
          "module": "@radix-ui/react-switch",
          "version": "1.4.1",
          "size": 4690
        }
      },
      "total": { "size": 12427, "menhir": 4103 }
    }
  ]
}
```

`menhirTotal` is every compared component of menhir together. A library's
`total` is its components together (`size`) and menhir's same components
(`menhir`); a library with none of the components has no `total`.
`version` is that of the module's package installed here, and `size` is in
bytes, gzipped. The docs site reads the file through `virtual:size-comparison`
(`website/vite-plugin-sizes.ts`). `comparison.test.ts` checks that every
compared component is one menhir has, and that each module and each total
is measured.

To compare a component, add the library's package to `devDependencies` here
and its module to the library's `components` in `comparison.ts`.

## The floating-leak check

`findFloatingModules(specifier)` bundles an app that imports one entry point
alone, with Rolldown, and returns every module of menhir's `floating` layer and
every import of `@floating-ui/*` the bundle still has. `floating.test.ts`
asserts that the list is empty for every entry point in menhir's `exports`
except the popup components listed in `packages/menhir/layers.ts`, which the
lint config reads too: a simple component must not pull in positioning code
(PLAN.md section 6, rule 4). A new component is checked without editing the
test. The lint rules of
rule 4 catch a direct import; this catches one through any chain of modules.

An unresolved import fails the check instead of being left out, so a missing
build cannot pass as "no leak". `fixtures/leaky` is a package that does leak,
to show the check reports both kinds of module.
