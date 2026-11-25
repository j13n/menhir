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

## With a coding agent

The package ships two skills for coding agents:

- [`skills/menhir`](skills/menhir/SKILL.md) wires Menhir components into an app: entry points and parts, controlled and uncontrolled state, forms and Field.
- [`skills/menhir-styling`](skills/menhir-styling/SKILL.md) styles them in one consistent look, such as the shadcn look in Tailwind CSS. What to ask for, and how a look of your own works: [Styling](https://menhir-ui.com/docs/styling).

Point your agent at them with lines in your project's `AGENTS.md`, "To wire up Menhir components, follow `node_modules/menhir/skills/menhir/SKILL.md`" and "To style Menhir components, follow `node_modules/menhir/skills/menhir-styling/SKILL.md`", or copy the folders into your agent's skills folder.

## Docs

For everything else, go to the docs:

- [Getting started](https://menhir-ui.com/docs/getting-started)
- [Styling](https://menhir-ui.com/docs/styling)
- [Components](https://menhir-ui.com/docs/components)
- [Bundle size](https://menhir-ui.com/docs/bundle-size) of every entry point

## Status

Early 0.x versions: the API may change between minor versions. The form components come next; the plan and roadmap are in the [repository](https://github.com/j13n/menhir). Built so far:

- Components: Accordion, Alert Dialog, Autocomplete, Checkbox, Checkbox Group, Collapsible, Combobox, Context Menu, Dialog, Field, Form, Input, Menu, Menubar, Meter, Navigation Menu, Number Field, OTP Field, Popover, Progress, Radio, Select, Separator, Slider, Switch, Tabs, Toggle, Toggle Group and Tooltip.
- Utilities: color scheme and theme, each with local-storage and cookie storage.

## Licence

MIT. See [LICENSE](LICENSE).
