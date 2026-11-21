# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, with small and measurable bundles.

## Status

In development and not released yet: `menhir` on npm is a 0.0.0 placeholder that holds the name. Built so far:

- Components: Accordion, Checkbox, Collapsible, Meter, Progress, Separator, Switch, Tabs, Toggle and Toggle Group.
- Utilities: color scheme and theme, each with local-storage and cookie storage.

Each has its own entry point, such as `menhir/switch`, and a page with a live example and its measured size at [menhir-ui.com](https://menhir-ui.com). [PLAN.md](PLAN.md) describes the goals, the bundle-size rules and the roadmap; [CONTRIBUTING.md](CONTRIBUTING.md) describes how a component is built.

## Repository layout

| Folder             | Contents                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| `packages/menhir`  | The library, one subpath export per component                              |
| `website`          | The docs site, a Solid 2.0 app                                             |
| `test/bundle-size` | Size budgets, the comparison with other libraries, the floating-leak check |
| `test/ssr-app`     | Server rendering and hydration of the built package                        |
| `docs/adr`         | Architecture decision records                                              |

## Development

Use the Node version in `.nvmrc` and pnpm 12.

```sh
pnpm install
pnpm typecheck
pnpm lint
pnpm format
```

The library's tests run in jsdom, or in Chromium through Playwright:

```sh
pnpm --filter menhir test
pnpm --filter menhir exec playwright install chromium   # once
pnpm --filter menhir test:chromium
```

The other checks build the library first:

```sh
pnpm --filter menhir check:package        # publint and "are the types wrong"
pnpm --filter menhir test:package         # the built package's exports
pnpm --filter @menhir/bundle-size test    # size budgets
pnpm --filter @menhir/ssr-app test        # server rendering and hydration
pnpm --filter website test
pnpm --filter website dev                 # the docs site on port 3100
```

## Licence

[MIT](LICENSE)
