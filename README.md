# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, ported from [Base UI](https://base-ui.com) one component at a time, with small and measurable bundles.

## Status

Planning. Nothing is built yet and nothing is published to npm. [PLAN.md](PLAN.md) describes the goals, the bundle-size rules and the roadmap.

## Credits

Menhir ports the behaviour, accessibility work and tests of [Base UI](https://github.com/mui/base-ui) by the MUI team to Solid. Base UI is MIT licensed; its copyright notice is kept in [LICENSE](LICENSE) and applies to the ported code and tests.

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

## Licence

[MIT](LICENSE)
