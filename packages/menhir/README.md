# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, with small and measurable bundles.

## Install

```sh
pnpm add menhir
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

The docs, with a live example and the measured size of each entry point, are at [menhir-ui.com](https://menhir-ui.com).

## Status

Early 0.x versions: the API may change between minor versions. Dialog, Popover and the other popups come next; the plan and roadmap are in the [repository](https://github.com/j13n/menhir). Built so far:

- Components: Accordion, Checkbox, Collapsible, Meter, Progress, Separator, Switch, Tabs, Toggle and Toggle Group.
- Utilities: color scheme and theme, each with local-storage and cookie storage.

## Licence

MIT. See [LICENSE](LICENSE).
