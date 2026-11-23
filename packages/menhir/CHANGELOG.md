# menhir

## 0.1.8

### Patch Changes

- 28c4818: Add Field (menhir/field): a form control's label, description and error message, with its validity from the browser or from outside, shown once the field is touched.

## 0.1.7

### Patch Changes

- a15c892: Add Autocomplete, menhir/autocomplete: a text input with suggestions, whose value is the text. It builds on Combobox, so an app that uses both pays for the shared parts once.

## 0.1.6

### Patch Changes

- f2be058: Add Select, as `menhir/select`: a button that shows one value out of a list and opens the list to change it, with a hidden input for forms.
- cab274e: Add Combobox (`menhir/combobox`): an input that picks one value out of a list you filter as the user types, with `includesText` for filtering, a hidden input for forms, and a Status for empty lists and screen readers.

## 0.1.5

### Patch Changes

- e6dc76e: Adds Menu (`menhir/menu`): a list of actions that a button opens, with Root, Trigger, Popup, Item, CheckboxItem, RadioGroup, RadioItem, ItemIndicator, Group, GroupLabel, Submenu and SubmenuTrigger parts. The arrow keys, Home, End and typing move through the items; Enter, Space or a click activates one and closes every menu, except that Space changes a checkbox or radio item and leaves the menu open; submenus open by Right Arrow, Enter, Space or the pointer resting on their trigger, and stay open while the pointer crosses to them. `onOpenChange` reports two new reasons, `"item-press"` and `"arrow-key"`.
- d1366e9: Adds Context Menu (`menhir/context-menu`): Menu's menu, opened from an area by the `contextmenu` event, with Root, Trigger and Popup parts of its own and Menu's items, groups and submenus. A right-click, a Ctrl+click on macOS or a long press on Android opens it at the pointer; Shift+F10 or the Menu key opens it below the focused element; a right-click while it is open moves it. `disabled` on the Trigger lets the browser's own menu show. An app that uses Menu too pays for the shared parts once.
- babcfc2: Add Menubar (`menhir/menubar`): a row of menus that is one tab stop, built on Menu's parts, where moving along the bar while one menu is open opens the next.

## 0.1.4

### Patch Changes

- 9b9bceb: Ship a styling skill for coding agents, in the package's `skills/menhir-styling` folder, with the shadcn look: tokens, recipes and worked examples for Switch, Dialog, Tabs and Popover.
- 0e79a64: Adds Navigation Menu (`menhir/navigation-menu`): a site's navigation, with Root (a `<nav>`), Item, Trigger, Panel and Link parts. A Panel opens on a press and when the pointer rests on its Trigger, moving along the bar opens the next at once, and Escape, focus leaving the `<nav>`, a press outside and a Link close it. Panels are in the page's flow, `hidden` while closed, so their links are in the server HTML. `onValueChange` reports two new reasons, `"focus-out"` and `"link-press"`.

## 0.1.3

### Patch Changes

- 747bbb2: Adds Tooltip (`menhir/tooltip`): a description of its trigger, on a `popover="manual"` element, shown on hover after a delay and at once on keyboard focus, with Root, Trigger, Popup, Arrow and Group parts. `onOpenChange` reports the new reason `"trigger-focus"`.
- 566dc2a: Adds Dialog (`menhir/dialog`): a modal dialog on a native `<dialog>`, with Root, Trigger, Popup, Title, Description and Close parts.
- cdee2a7: Adds Alert Dialog (`menhir/alert-dialog`): a modal dialog with the `alertdialog` role that a press on the backdrop does not close, built on Dialog's parts, so an app with both pays for them once.
- 157eda0: Adds Popover (`menhir/popover`): a non-modal popup placed against its trigger, on a `popover="auto"` element, with Root, Trigger, Popup, Arrow, Title, Description and Close parts.

## 0.1.2

### Patch Changes

- 289963c: menhir now depends on `@floating-ui/dom` 1.8, for the positioned popups to come. Installs download it; an app bundles it only through a popup that is positioned.

## 0.1.1

### Patch Changes

- c79ff31: README: links to the docs at menhir-ui.com, and install commands for npm, pnpm, bun and vp

## 0.1.0

### Minor Changes

- 1cdf5eb: Initial release
