# menhir

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
