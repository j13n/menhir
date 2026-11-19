# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, inspired by [Base UI](https://base-ui.com), with small and measurable bundles.

## Status

Planning. Nothing is built yet and nothing is published to npm. [PLAN.md](PLAN.md) describes the goals, the bundle-size rules and the roadmap.

## Inspiration and credits

Menhir is inspired by other open source projects, and we thank their authors for their work. In no particular order:

- [Base UI](https://base-ui.com)
- [Kobalte](https://kobalte.dev)
- [corvu](https://corvu.dev)
- [Radix](https://www.radix-ui.com)
- [Ark UI](https://ark-ui.com)
- [Floating UI](https://floating-ui.com)

[Base UI](https://github.com/mui/base-ui), by the MUI team, is the starting point for Menhir's behaviour, accessibility work and tests. It is MIT licensed; its copyright notice is kept in [LICENSE](LICENSE) and applies to the ported code and tests.

## Repository layout

| Folder             | Contents                                      |
| ------------------ | --------------------------------------------- |
| `packages/menhir`  | The library, one subpath export per component |
| `website`          | The docs site, a Solid 2.0 app                |
| `test/bundle-size` | Size budgets (planned)                        |
| `docs/research`    | Research notes behind decisions in PLAN.md    |

## Development

Use the Node version in `.nvmrc` and pnpm 12.

```sh
pnpm install
pnpm typecheck
pnpm format
```

## Licence

[MIT](LICENSE)
