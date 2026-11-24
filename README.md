# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, with small and measurable bundles.

**Website: [menhir-ui.com](https://menhir-ui.com)**, with every component's parts, props, keyboard behaviour, a live example and its measured size.

## Status

Released on npm as [`menhir`](https://www.npmjs.com/package/menhir), in early 0.x versions: the API may change between minor versions. The form components come next. Built so far:

- Components: Accordion, Alert Dialog, Autocomplete, Checkbox, Checkbox Group, Collapsible, Combobox, Context Menu, Dialog, Field, Form, Input, Menu, Menubar, Meter, Navigation Menu, Number Field, Popover, Progress, Radio, Select, Separator, Switch, Tabs, Toggle, Toggle Group and Tooltip.
- Utilities: color scheme and theme, each with local-storage and cookie storage.

Each has its own entry point, such as `menhir/switch`, and a page on the website. [PLAN.md](PLAN.md) describes the goals, the bundle-size rules and the roadmap; [CONTRIBUTING.md](CONTRIBUTING.md) describes how a component is built.

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
