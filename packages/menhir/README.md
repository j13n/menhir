# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, with small and measurable bundles.

**Docs: [menhir-ui.com](https://menhir-ui.com)**, with every component's parts, props, keyboard behaviour, a live example and its measured size.

## Install

```sh
npm install menhir
pnpm add menhir
bun add menhir
vp add menhir
```

Menhir needs Solid 2.0: `solid-js` and `@solidjs/web` are peer dependencies.

## Usage

Each component has its own entry point, so an app ships only what it imports:

```tsx
import { Switch } from "menhir/switch";

export function AirplaneMode() {
  return (
    <label>
      <Switch.Root name="airplane-mode" class="switch">
        <Switch.Thumb class="thumb" />
      </Switch.Root>
      Airplane mode
    </label>
  );
}
```

Nothing is styled. Every part exposes its state as data attributes, such as `data-checked`, for your CSS to select:

```css
.switch[data-checked] {
  background: steelblue;
}
.thumb[data-checked] {
  transform: translateX(1.25rem);
}
```

For everything else, go to the docs:

- [Getting started](https://menhir-ui.com/docs/getting-started)
- [Components](https://menhir-ui.com/docs/components)
- [Bundle size](https://menhir-ui.com/docs/bundle-size) of every entry point

## Status

Early 0.x versions: the API may change between minor versions. Menu and the other list popups come next; the plan and roadmap are in the [repository](https://github.com/j13n/menhir). Built so far:

- Components: Accordion, Alert Dialog, Checkbox, Collapsible, Dialog, Meter, Popover, Progress, Separator, Switch, Tabs, Toggle, Toggle Group and Tooltip.
- Utilities: color scheme and theme, each with local-storage and cookie storage.

## Licence

MIT. See [LICENSE](LICENSE).
