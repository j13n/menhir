# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, with small and measurable bundles.

## Status

Planning. Nothing is built yet; `menhir` on npm is a 0.0.0 placeholder that holds the name. [PLAN.md](PLAN.md) describes the goals, the bundle-size rules and the roadmap.

## Repository layout

| Folder             | Contents                                      |
| ------------------ | --------------------------------------------- |
| `packages/menhir`  | The library, one subpath export per component |
| `website`          | The docs site, a Solid 2.0 app                |
| `test/bundle-size` | Size budgets (planned)                        |

## Development

Use the Node version in `.nvmrc` and pnpm 12.

```sh
pnpm install
pnpm typecheck
pnpm format
```

The library's tests run in jsdom, or in Chromium through Playwright:

```sh
pnpm --filter menhir test
pnpm --filter menhir exec playwright install chromium   # once
pnpm --filter menhir test:chromium
```

## Licence

[MIT](LICENSE)
