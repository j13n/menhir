---
name: menhir
description: Wire Menhir components (the `menhir` package for SolidJS 2.0) into an app. Use when adding a Menhir component, or changing one's props, state or form wiring.
---

# Wiring Menhir components

Menhir is a set of unstyled, accessible UI primitives for SolidJS 2.0. This skill has what holds for every component. A component's own parts, props and keyboard behaviour are on its page only: read them there. To style a component, follow the styling skill, `node_modules/menhir/skills/menhir-styling/SKILL.md`.

## Steps

1. **Read the component's page**, `https://menhir-ui.com/docs/components/<name>.md`, where `<name>` is its entry point's, such as `toggle-group`. `https://menhir-ui.com/llms.txt` lists every component. The page is the latest release's; the types in `node_modules/menhir/dist/source/<name>/` are the installed version's, and they win where the two differ. Done when you can name the part that takes each prop you will pass, and have the page's Keyboard table for step 5.
2. **Compose its parts** as the page's Anatomy nests them. Done when every part this use needs is rendered, in that nesting, imported from the component's own entry point.
3. **Wire its state.** Control a value when the app reads it or sets it; leave the rest uncontrolled. Done when every value the app reads or sets is controlled, with its callback writing it back.
4. **Join the form**, for a form control: give it a `name`. When its page has an "In a Field" section, put it in a Field as that section shows, with the `name` where it puts it. Done when the form's `FormData` has the control's value under that `name`, and, in a Field, its label, description and error come from the Field.
5. **Check it**: run the app's typecheck, then use the component in the browser with the keyboard alone, as its page's Keyboard table says. Done when the typecheck passes and every row of the table works.

## Rules for every component

### Imports and parts

- **One entry point per component**, `menhir/<name>`, exporting its parts as a namespace: `import { Switch } from "menhir/switch"`, then `<Switch.Root>` and `<Switch.Thumb>`. A component of one part is exported as itself, such as `Form`. Import only from the entry points in the package's `exports`; a page names anything else its entry point exports, such as `includesText` from `menhir/combobox`.
- **`render`** renders a part through another element or the app's own component, with the part's props: `<Dialog.Trigger render={Button}>`, or `render={(props) => <a {...props} href="/settings" />}`. Spread the props it receives onto the element.
- **Popups render where you write them.** Dialog, Popover, Menu, Select, Tooltip and the other popups open in the browser's top layer, so they stay in place in the component tree, with no `<Portal>`.

### State

- **Each piece of state is three props**: the value, its default and its change callback. A Switch has `checked`, `defaultChecked` and `onCheckedChange`; `open`, `value` and `pressed` follow the same pattern.
- **Uncontrolled**: pass the default, or nothing, and the component keeps the state. **Controlled**: pass the value, and write the new one in the callback; the component shows only the value you pass.
- **A controlled value is never `undefined`**, which means uncontrolled. Where its type allows `null`, `null` is empty: `value={selected() ?? null}`.
- **The callback's first argument is the new value.** Some callbacks, such as a popup's `onOpenChange`, also get `details`, with the `reason` (such as `"escape-key"`) and the `event`; the page's API reference types each callback.

### Forms

- **A form control takes `name`** and submits its value with the form, as a native control does, so a plain `<form>` and its `FormData` work.
- **Field** (`menhir/field`) gives a control its label, description and error, and reports the browser's validity. A control joins one as its page's "In a Field" section shows, through `Field.Control`'s `render`.
- **Form** (`menhir/form`) takes `errors` keyed by each Field's `name`, such as a server's, or a schema's turned into them with `issuesToErrors` from `menhir/form/standard-schema`. It holds no values: the app keeps them, in a store or the form's `FormData`. The guide: `https://menhir-ui.com/docs/forms`.

### Solid 2.0

Menhir runs on Solid 2.0 only. Write the app's code the 2.0 way: `node_modules/solid-js/skills/solid-2.0-cheatsheet/SKILL.md` has the whole of it. The rules that wiring a component touches:

- **Read props where they are used**, as `props.label`. A wrapper passes the rest on with `omit(props, "label")`, and adds defaults with `merge(defaults, props)`.
- **Pass values to state props**, called: `checked={on()}`. A callback prop takes the function itself: `onCheckedChange={setOn}`.
