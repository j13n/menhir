# The Bootstrap look

The look of Bootstrap 5.3's default theme, in plain CSS: a CSS module for each component. Its declarations follow Bootstrap's stylesheet, rewritten for Menhir's parts and data attributes. The app does not load `bootstrap.css`: Bootstrap's component classes depend on state classes its own script sets, which Menhir's data attributes replace. The licence notice is in `LICENSE`, beside this file.

## Setup

Once per app. Check before adding: the app may already have it.

1. Copy `tokens.css` beside the app's main stylesheet and import it there, so that it has loaded before any component renders, one in a lazy route included:

   ```css
   @import "./tokens.css";
   ```

2. Put `data-look="bootstrap"` on `<html>`. The element that has the attribute gets the tokens and Bootstrap's body text and background, so a page can also take the look in one part only. The examples need no reset: each sets `box-sizing` and `font: inherit` where it depends on them.
3. Light and dark follow the CSS `color-scheme`: the tokens use `light-dark()`. With Menhir's color-scheme utility, which sets `data-color-scheme` on `<html>`:

   ```css
   :root[data-color-scheme="dark"] {
     color-scheme: dark;
   }
   ```

   Without the utility, `:root { color-scheme: light dark; }` follows the system. Use the first when the app already has the utility, and the second otherwise.

4. Each component's styles are a CSS module beside it, `<component>.module.css`, which the component imports: `import styles from "./switch.module.css"`. Class names in a module are one word or camelCase (`thumb`, `cornerClose`), so that `styles.thumb` works; a dashed name would need `styles["corner-close"]`. Two modules can each have a `.thumb`.
5. Copy `button.module.css` and `badge.module.css`, beside this file, to where the app keeps what its components share, the first time a component needs one. A component imports it beside its own module: `import button from "../button.module.css"`.

When the app does not use CSS modules, keep the same rules in a stylesheet per component, imported by the component, with each class prefixed by its component: `.switch-thumb`, `.dialog-popup`, `.button-primary`.

When the app is styled with Tailwind CSS, also import `tokens.tailwind.css`, beside this file, after `tokens.css`. It gives each token a Tailwind name, the token's own without `--bs-`: `var(--bs-secondary-bg)` is `bg-secondary-bg`, `var(--bs-border-radius-lg)` is `rounded-lg`, `var(--spacer-3)` is `p-spacer-3`. Translate each declaration of a recipe or a worked example into the class for it, with those names for the tokens. Three tokens have no Tailwind name: `--bs-border-width` is `border-(length:--bs-border-width)`, `--bs-focus-ring-width` is `ring-(length:--bs-focus-ring-width)`, and `--bs-body-font-weight` is `font-normal`.

## Tokens

Use these through `var()`, never as raw colours. A colour that is mixed from a token is written with `color-mix()` and two tokens, as the recipes show, and `transparent` and `currentColor` are not colours of the look.

| Token                                                                                            | For                                                                                         |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `--bs-body-bg`, `--bs-body-color`                                                                | The page, and every surface on it: a dialog, a popover, a field, a selected tab             |
| `--bs-emphasis-color`                                                                            | Text that stands out from the body's: a selected tab, the close icon                        |
| `--bs-secondary-color`                                                                           | Secondary text: a placeholder, a hint, a disabled tab                                       |
| `--bs-secondary-bg`                                                                              | A quiet background: a popover's header, a disabled field, a tab's border on hover           |
| `--bs-tertiary-bg`, `--bs-tertiary-color`                                                        | The active item of a list popup, and a menubar; a disabled item's text                      |
| `--bs-primary`                                                                                   | The main action, and the on state: a checked switch or checkbox                             |
| `--bs-secondary`                                                                                 | A second action, and a popup's Trigger                                                      |
| `--bs-success`, `--bs-danger`                                                                    | A badge that says so; `--bs-danger` also the action that deletes                            |
| `--bs-primary-bg-subtle`, `--bs-primary-text-emphasis`                                           | An open accordion item's Trigger                                                            |
| `--bs-link-color`, `--bs-link-hover-color`                                                       | Links, and tabs that are not selected                                                       |
| `--bs-border-color`                                                                              | Borders inside a surface and of fields                                                      |
| `--bs-border-color-translucent`                                                                  | The border of a surface that floats: a dialog, a popover, a toast                           |
| `--bs-form-invalid-color`, `--bs-form-invalid-border-color`                                      | An invalid field's message and border                                                       |
| `--bs-focus-ring-color`, `--bs-focus-ring-width`                                                 | The focus ring                                                                              |
| `--bs-white`, `--bs-black`                                                                       | Text on a filled button or badge, a checked thumb; what a shade or a backdrop is mixed with |
| `--bs-border-width`                                                                              | Every border                                                                                |
| `--bs-border-radius`, `-sm`, `-lg`, `-pill`                                                      | Controls; small controls; a dialog and a popover; a pill badge                              |
| `--bs-box-shadow`                                                                                | A surface that floats without a backdrop: a popover, a toast                                |
| `--spacer-1` to `--spacer-5`                                                                     | Padding and gaps: 0.25, 0.5, 1, 1.5 and 3rem                                                |
| `--bs-body-font-family`, `--bs-body-font-size`, `--bs-body-font-weight`, `--bs-body-line-height` | Set on the element that has `data-look`; controls take them with `font: inherit`            |

A control's own padding is Bootstrap's and is not on the spacer scale (a button's is `0.375rem 0.75rem`): the recipes give it.

## Recipes

Every component in the look is built from these. Extend them for a component without a worked example.

- **Focus**: on every focusable part, `outline: 0; box-shadow: 0 0 0 var(--bs-focus-ring-width) var(--bs-focus-ring-color)` under `:focus-visible`. A part with a border, such as a field, a switch or a checkbox, also gets `border-color: color-mix(in srgb, var(--bs-white) 50%, var(--bs-primary))`. A button's ring takes its own colour: see `button.module.css`.
- **Disabled**: `pointer-events: none` with `opacity: 0.65` on a button, `opacity: 0.5` on a switch, a checkbox or a radio, and `background-color: var(--bs-secondary-bg)` with full opacity on a field. The selector is `[data-disabled]` on a part that has it (form controls, tabs, toggles, accordion items: see the component's page) and `:disabled` on a plain button, such as a popup's Trigger or Close. A disabled tab is `color: var(--bs-secondary-color)` and keeps its opacity.
- **Buttons** are `button.module.css`: `button` with one variant, set with the array form of `class`, `class={[button.button, button.primary]}`. A popup's Trigger and a Cancel are `secondary`, the main action is `primary`, and the button that carries out a deletion is `danger`; a Trigger that only opens the confirmation stays `secondary`. `outline` is a quiet action: a toolbar's button, a popover's Close. `small` makes any of them small.
- **Fields**: Bootstrap's `.form-control`, the `control` class of the Dialog example: `display: block; box-sizing: border-box; width: 100%; padding: 0.375rem 0.75rem; border: var(--bs-border-width) solid var(--bs-border-color); border-radius: var(--bs-border-radius); background-color: var(--bs-body-bg); color: var(--bs-body-color); font: inherit; appearance: none`, with `transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out`, the focus recipe with its border, and `::placeholder { color: var(--bs-secondary-color); opacity: 1 }`. Its label is a block above it, `var(--spacer-2)` away. An invalid field is `border-color: var(--bs-form-invalid-border-color)` under `[data-invalid]`, and its error message `margin-top: var(--spacer-1); font-size: 0.875em; color: var(--bs-form-invalid-color)`.
- **On and off** (switch, checkbox): on is `border-color` and `background-color` `var(--bs-primary)` under `[data-checked]`, with `var(--bs-white)` inside; off is `var(--bs-body-bg)` inside a `var(--bs-border-color)` border. A checkbox's partly checked state, `[data-indeterminate]`, takes the on declarations.
- **Tracks** (switch): the Switch example. The track is `2em` by `1em`, so it follows the size of the text beside it.
- **Boxes** (checkbox): the Root is a square, `1em`, beside its label as the switch's track is:

  ```css
  .box {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 1em;
    height: 1em;
    padding: 0;
    border: var(--bs-border-width) solid var(--bs-border-color);
    border-radius: 0.25em;
    background-color: var(--bs-body-bg);
    color: var(--bs-white);
    font: inherit;
    transition:
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  .box[data-checked],
  .box[data-indeterminate] {
    border-color: var(--bs-primary);
    background-color: var(--bs-primary);
  }

  .indicator[data-unchecked] {
    display: none;
  }
  ```

  Plus the focus recipe with its border, and the disabled one. The Indicator holds two icons, `0.75em` wide: the check, hidden under `.box[data-indeterminate]`, and the dash, shown only there. A radio is the same box with `border-radius: 50%`, and a dot, `0.5em` and `var(--bs-white)`, for its indicator.

- **Pressed** (toggle, toggle group item): a `button` with the `outline` variant. `button.module.css` gives `[data-pressed]` the declarations of `:active`, as Bootstrap's `.active` does. A toggle group's items are joined: `border-radius: 0` but for the first item's start corners and the last one's end corners, and `margin-inline-start: calc(-1 * var(--bs-border-width))` on every item after the first.
- **Selected** (tab): the Tabs example. A tab that is not selected is a link in colour, `var(--bs-link-color)`; the selected one is `var(--bs-emphasis-color)` on `var(--bs-body-bg)`, with a border on three sides that joins it to its panel.
- **Disclosures** (accordion, collapsible): Bootstrap's accordion. The Panel is hidden while closed, so it takes no `display` or spacing of its own and is not animated: its padding is on an inner `<div>`.

  ```css
  .item {
    border: var(--bs-border-width) solid var(--bs-border-color);
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
  }

  .item:not(:first-of-type) {
    border-top: 0;
  }

  .item:first-of-type {
    border-radius: var(--bs-border-radius) var(--bs-border-radius) 0 0;
  }

  .item:last-of-type {
    border-radius: 0 0 var(--bs-border-radius) var(--bs-border-radius);
  }

  .header {
    margin: 0;
  }

  .trigger {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: var(--spacer-3) 1.25rem;
    border: 0;
    border-radius: inherit;
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  .trigger[data-open] {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
    box-shadow: inset 0 calc(-1 * var(--bs-border-width)) 0
      var(--bs-border-color);
  }

  .chevron {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    margin-inline-start: auto;
    transition: rotate 0.2s ease-in-out;
  }

  .trigger[data-open] .chevron {
    rotate: -180deg;
  }

  .content {
    padding: var(--spacer-3) 1.25rem;
  }
  ```

  The Trigger also takes the focus recipe, with `position: relative; z-index: 1` under `:focus-visible` so that the ring shows over the next item, and the disabled recipe at `opacity: 0.65`. It ends with the chevron down icon. The Root is as wide as what holds it. A collapsible's Trigger is a button, `secondary`.

- **Toolbars**: the Root is `display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacer-1)`. Its buttons and toggles are `outline` and `small`. A Separator between groups is Bootstrap's `.vr`: `align-self: stretch; width: var(--bs-border-width); margin-inline: var(--spacer-1); background-color: currentColor; opacity: 0.25`. Its disabled items stay focusable and take the disabled recipe through `[data-disabled]`.
- **Toasts**: the Region is `position: fixed; inset: auto var(--spacer-3) var(--spacer-3) auto; width: min(350px, calc(100vw - 2 * var(--spacer-3))); margin: 0; padding: 0; overflow: visible; border: 0; background: transparent`, and `display: flex; flex-direction: column; gap: var(--spacer-2)` under `:popover-open` only (a popover lays out only once shown), plus the focus recipe. A toast is `position: relative; padding: 0.75rem; padding-inline-end: calc(0.75rem + 2em); border: var(--bs-border-width) solid var(--bs-border-color-translucent); border-radius: var(--bs-border-radius); background-color: color-mix(in srgb, var(--bs-body-bg) 85%, transparent); background-clip: padding-box; font-size: 0.875rem; box-shadow: var(--bs-box-shadow)`, fading as the motion recipe says, with `translate: var(--toast-swipe-x, 0)` when it takes `Toast.swipe`, and `border-color: var(--bs-danger)` under `[data-priority="high"]` for one that cannot wait. Its Title is `font-weight: 700`, its Description `color: var(--bs-secondary-color)`, its Action a `small` `outline` button, its Close the corner close.
- **List popups** (Menu, Context Menu, Menubar, Navigation Menu, Select, Combobox, Autocomplete, Multi Combobox): a positioned popup that holds a list of items, Bootstrap's dropdown, as in the Menu and Select examples. Each component's page names its parts and attributes; what each part takes:
  - **Popup**: `box-sizing: border-box; min-width: 10rem; padding: var(--spacer-2) 0; border: var(--bs-border-width) solid var(--bs-border-color-translucent); border-radius: var(--bs-border-radius); background-color: var(--bs-body-bg); background-clip: padding-box; color: var(--bs-body-color); font-size: 1rem; text-align: start; box-shadow: var(--bs-box-shadow)`, fading as the motion recipe says, at `sideOffset={2}`. A submenu's Popup is the same, at `alignOffset={-9}` so that its first item lines up with its trigger. The Popup of Select, Combobox, Autocomplete and Multi Combobox has `min-width: var(--anchor-width)` in place of `10rem`, with `max-height: var(--available-height); overflow-y: auto`; a combobox's List, inside it, takes nothing. A Menu's Trigger is a `secondary` button with the caret of Bootstrap's `.dropdown-toggle` on its `::after`: `content: ""; display: inline-block; margin-inline-start: 0.255em; vertical-align: 0.255em; border-top: 0.3em solid; border-inline: 0.3em solid transparent`.
  - **Item** (a menu's Item, CheckboxItem, RadioItem and SubmenuTrigger, and the Item of Select and the comboboxes): `display: flex; align-items: center; gap: var(--spacer-2); padding: var(--spacer-1) var(--spacer-3); color: var(--bs-body-color); white-space: nowrap; cursor: default; user-select: none`. A menu's items, which take focus, also take the focus recipe drawn inside them, so that the Popup's edge cannot clip it: `outline: 0`, and `box-shadow: inset 0 0 0 var(--bs-focus-ring-width) var(--bs-focus-ring-color)` under `:focus-visible`. Pressed, `:active:not([data-disabled])`, it is `background-color: var(--bs-primary); color: var(--bs-white)`, as Bootstrap's `.dropdown-item:active`.
  - **Active item**: `background-color: var(--bs-tertiary-bg)` under `[data-active]`, Bootstrap's hover and focus. One style for both kinds of list: the active item has focus in a menu, and is named in `aria-activedescendant` in Select and the comboboxes, where focus stays on the Trigger or the Input. It stands in for hover: the pointer makes the item under it active. Its background is faint, so in a menu the focus ring above marks the item the keyboard reached; in Select and the comboboxes the ring stays on the Trigger or the Input.
  - **Disabled item**: `color: var(--bs-tertiary-color)` under `[data-disabled]`, without the disabled recipe's `pointer-events: none`: the keys and the pointer still reach a disabled item, and it shows as active.
  - **Checked and selected**: the ItemIndicator is always rendered, and hides by its state with `visibility: hidden`, which keeps its room so that the items' texts line up: `display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 1em; height: 1em`, with `visibility: hidden` under `[data-unchecked]` before the text of a menu's CheckboxItem or RadioItem, and under `[data-unselected]` after the text of the Item of Select, Combobox and Multi Combobox, with `margin-inline-start: auto`. It holds the check icon, or in a RadioItem a dot, a `<span>` with `width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor`. The item takes nothing else for it, as Bootstrap's `.active` would: its fill would hide the active item.
  - **Group label**: Bootstrap's `.dropdown-header`, `padding: var(--spacer-2) var(--spacer-3); color: var(--bs-secondary-color); font-size: 0.875rem; white-space: nowrap`.
  - **Separator**: Bootstrap's `.dropdown-divider`, `height: 0; margin: var(--spacer-2) 0; overflow: hidden; border: 0; border-top: var(--bs-border-width) solid var(--bs-border-color-translucent)`, on an `<hr>` in a menu. In Select and the comboboxes, whose lists hold only options and groups, a `<div aria-hidden="true">` with the same margin and border.
  - **Submenu trigger**: an item, with the active item's background under `[data-open]` while its submenu is open, ending with the chevron right icon, `flex-shrink: 0; margin-inline-start: auto`, and `scale: -1 1` under `:dir(rtl)`.
  - **Bars**: Bootstrap's navbar. Menubar's Root is `display: flex; flex-wrap: wrap; align-items: center; padding: var(--spacer-2); border-radius: var(--bs-border-radius); background-color: var(--bs-tertiary-bg)`, and its Trigger a `.nav-link`: `padding: var(--spacer-2); border: 0; border-radius: var(--bs-border-radius); background: transparent; color: color-mix(in srgb, var(--bs-emphasis-color) 65%, transparent); font: inherit; cursor: pointer`, `color: color-mix(in srgb, var(--bs-emphasis-color) 80%, transparent)` under `:hover`, and `color: var(--bs-emphasis-color)` under `[data-open]`, plus the focus recipe; its Popup is at `sideOffset={2}`. Navigation Menu's list, a `<ul>` in the Root, is the same bar with `margin: 0; list-style: none`, its Item `position: relative`, and its Trigger the same `.nav-link`, with a Menu Trigger's caret on its `::after`. Its Panel is not a popup but sits in the page: the Popup's declarations with `position: absolute; inset-inline-start: 0; top: 100%; margin-top: 0.125rem`, hidden while closed, so with no `display` and no animation. A Link in it is an item with `text-decoration: none`, with the active item's background under `:hover` and `:focus-visible`, the focus recipe, and `background-color: var(--bs-primary); color: var(--bs-white)` under `[aria-current="page"]`; a Link beside the Triggers is a `.nav-link`, `var(--bs-emphasis-color)` under `[aria-current="page"]`.
  - **Fields that open a list**: a Select's Trigger is Bootstrap's `.form-select`, a field as a button: the field recipe with `display: flex; align-items: center; justify-content: space-between; gap: var(--spacer-2); text-align: start`, and the disabled field's background under `[data-disabled]`. Its Value is `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`, with `color: var(--bs-secondary-color)` under `[data-placeholder]`, and it ends with the chevron down icon, `1rem` wide. The Input of Combobox and Autocomplete is a field in Bootstrap's `.input-group`: a wrapper `display: flex`, the Input `flex: 1; min-width: 0` with no end radii, and its Clear and Trigger after it, each an `outline` button around the close icon or the chevron down icon, with `margin-inline-start: calc(-1 * var(--bs-border-width))` and no start radii, and the last one keeping its end radii.
  - **Chips** (Multi Combobox): the Chips box is a field with `display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacer-1); padding: 0.25rem 0.5rem`, and the focus recipe with its border under `:focus-within` in place of `:focus-visible`, since focus is on the Input inside it. The Input is `flex: 1; min-width: 4rem; padding: 0.125rem 0.25rem; border: 0; outline: 0; background: transparent; color: inherit; font: inherit`. A Chip takes the declarations of `badge.module.css`'s `badge` and `secondary`, with `display: inline-flex; align-items: center; gap: var(--spacer-1)`, plus the focus recipe and `opacity: 0.65` under `[data-disabled]`; its ChipRemove is `display: flex; padding: 0; border: 0; background: transparent; color: inherit; opacity: 0.75; cursor: pointer`, `opacity: 1` under `:hover`, around the close icon.
  - **Empty list**: the Status beside a combobox's List is Bootstrap's `.dropdown-item-text`, `padding: var(--spacer-1) var(--spacer-3); color: var(--bs-secondary-color)`, with `display: none` under `:empty`, taking no room while it says nothing. A Status that only counts for a screen reader, beside the Input, is `visuallyHidden` from `button.module.css`.
- **Scrollers**: try a native one first, with no component: `overflow: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: var(--bs-secondary-color) transparent; scrollbar-gutter: stable` on an element with `tabindex="0"`, `role="region"` and a name, plus the focus recipe. A browser without one of these properties shows the system's scrollbar. For a scrollbar that overlays the content and shows on hover or while scrolling, use Scroll Area: the Root `position: relative`; the Viewport `width: 100%; height: 100%; overflow: auto; overscroll-behavior: contain; border-radius: inherit`, plus the focus recipe; a vertical Scrollbar `position: absolute; inset-block: 0; inset-inline-end: 0; width: 0.625rem; padding: 1px; opacity: 0; transition: opacity 0.15s linear 0.6s`, and `opacity: 1; transition-delay: 0s` under the Root's `:hover` and its own `[data-scrolling]` (a horizontal one swaps `inset-block: 0; inset-inline-end: 0; width` for `inset-inline: 0; bottom: 0; height`); its Thumb `position: absolute; inset-inline: 1px; top: calc((100% - max(var(--thumb-size), 1.5rem)) * var(--thumb-position)); height: max(var(--thumb-size), 1.5rem); border-radius: var(--bs-border-radius-pill); background-color: var(--bs-secondary-color)` (across, `inset-block: 1px`, with `inset-inline-start` and `width` in place of `top` and `height`).
- **Badges** are `badge.module.css`: a badge is a `<span>`, not a Menhir component, with `badge` and one variant, `primary`, `secondary`, `success` or `danger`, and `pill` for a rounded one. It takes its size from the text around it. A badge that is a link also takes the focus recipe.

  A count adds `font-variant-numeric: tabular-nums`. A count that changes while the page is open and should be announced has `role="status"`, is rendered before it changes, at zero too, and says what it counts in a visually hidden `<span>`. A count on an icon button is in the button's name, its visually hidden `<span>` ("Messages, 3 unread"); the badge is `aria-hidden="true"`, with `corner` and `pill`, on a button that is `position: relative`. A badge whose colour means something says it in visible text as well, or with an icon: colour alone is not enough (WCAG 1.4.1). The chips of a Multi Combobox are that component's parts, not badges; they may take the secondary variant's declarations. More: https://menhir-ui.com/docs/badge.

- **Icons** are inline SVG: `viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`, `1em` wide and high unless a recipe says otherwise. Paths: check `M3 8.5 6.5 12 13 4.5`, dash `M3.5 8h9`, close `M2 2l12 12M14 2 2 14`, chevron down `m3 6 5 5 5-5`, chevron right `m6 3 5 5-5 5`. A button with only an icon gets its name from a `<span>` with `visuallyHidden`, from `button.module.css`.
- **Corner close** (the icon button in a dialog's or a toast's corner): `close` from `button.module.css`, around the close icon and its name, and positioned by the component: `position: absolute`, at the top and the end of the surface.
- **Surfaces**: a dialog is `padding: 0; border: var(--bs-border-width) solid var(--bs-border-color-translucent); border-radius: var(--bs-border-radius-lg); background-color: var(--bs-body-bg); color: var(--bs-body-color)`, `500px` wide at most and `1.75rem` from the top of the page, over a backdrop of `color-mix(in srgb, var(--bs-black) 50%, transparent)`. It has three parts, each padded `var(--spacer-3)`: a header and a footer, with a `var(--bs-border-color)` border towards the body between them. A positioned popup is the same surface with `box-shadow: var(--bs-box-shadow)`, `font-size: 0.875rem` and a width of `276px`; its header is `background-color: var(--bs-secondary-bg)`, padded `var(--spacer-2) var(--spacer-3)`. A card is `padding: var(--spacer-3); border: var(--bs-border-width) solid var(--bs-border-color-translucent); border-radius: var(--bs-border-radius); background-color: var(--bs-body-bg)`.
- **Text**: a dialog's title is `margin: 0; font-size: 1.25rem; font-weight: 500; line-height: 1.5`, a popover's `font-size: 1rem; font-weight: 500; line-height: 1.2`. Descriptions are body text, `margin: 0`; a hint below a field is `margin-top: var(--spacer-1); font-size: 0.875em; color: var(--bs-secondary-color)`.
- **Motion**: popups fade, `transition: opacity 0.15s linear`, from `opacity: 0` in `@starting-style` under `[data-open]`, and back to it under `[data-closed]`. A dialog also slides down: `transform: translateY(-50px)` in both places, with `transform 0.3s ease-out`, and its backdrop fades with it. Colours and shadows change over `0.15s ease-in-out`. Every transition is `none` under `@media (prefers-reduced-motion: reduce)`.

## From Bootstrap's source

Bootstrap's own components use other markup, classes and attributes. What each becomes in Menhir:

| Bootstrap                                                 | Menhir                                                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `.show` on a modal, a popover, a toast or a collapse      | `[data-open]`                                                                                                              |
| `.fade` without `.show`                                   | `[data-closed]` for the exit, and `@starting-style` under `[data-open]` for the entry                                      |
| `.active` on a `.nav-link`                                | `[data-selected]` on the Tab                                                                                               |
| `.active` on a `.btn`, `.btn-check:checked + .btn`        | `[data-pressed]` on a Toggle                                                                                               |
| `.form-check-input:checked`, `:indeterminate`             | `[data-checked]`, `[data-indeterminate]`: the Root is a button, not an `<input>`                                           |
| A switch's or a checkbox's `background-image`             | The Thumb, or the Indicator with an icon in it                                                                             |
| `.accordion-button:not(.collapsed)`                       | `[data-open]` on the Trigger                                                                                               |
| `.accordion-button::after` with a background image        | The chevron down icon inside the Trigger                                                                                   |
| `.accordion-collapse`, `.collapsing`                      | nothing: a Panel is hidden while closed, and is not animated                                                               |
| `:disabled`, `.disabled`                                  | `[data-disabled]` on a part that has it, `:disabled` on a plain button                                                     |
| `.is-invalid`, `.was-validated :invalid`                  | `[data-invalid]`, and `[data-touched]` where the component's page shows it                                                 |
| `.modal`, `.modal-dialog`, `.modal-content`               | the Dialog's Popup alone: a modal `<dialog>` is in the top layer and places itself                                         |
| `.modal-backdrop`                                         | `::backdrop` on the Dialog's Popup                                                                                         |
| `.modal-dialog-centered`                                  | `margin: auto` on the Popup                                                                                                |
| `.popover-arrow` with `::before` and `::after`            | the Popover's Arrow: a rotated square, placed on the Popup's edge by `[data-side]`                                         |
| `.bs-popover-top`, `data-popper-placement`                | `[data-side]` and `[data-align]`                                                                                           |
| `z-index`, `--bs-modal-zindex`, `--bs-popover-zindex`     | nothing: popups are in the top layer                                                                                       |
| `.btn-close`, with a background image and a `filter`      | `close` in `button.module.css`, around the close icon, in `var(--bs-emphasis-color)`                                       |
| `.btn-primary`, `.btn-outline-secondary`, `.btn-sm`       | `primary`, `outline`, `small` in `button.module.css`                                                                       |
| `.text-bg-primary`, `.rounded-pill` on a `.badge`         | `primary`, `pill` in `badge.module.css`                                                                                    |
| `.visually-hidden`                                        | `visuallyHidden` in `button.module.css`                                                                                    |
| `data-bs-theme="dark"`                                    | the CSS `color-scheme`: the tokens use `light-dark()`                                                                      |
| `rgba(var(--bs-primary-rgb), 0.25)`                       | `color-mix(in srgb, var(--bs-primary) 25%, transparent)`                                                                   |
| `shade-color($primary, 15%)`, `tint-color($primary, 50%)` | `color-mix(in srgb, var(--bs-black) 15%, var(--bs-primary))`, `color-mix(in srgb, var(--bs-white) 50%, var(--bs-primary))` |
| `$spacer * .5`, `.p-3`, `.gap-2`                          | `var(--spacer-2)`, `padding: var(--spacer-3)`, `gap: var(--spacer-2)`                                                      |
| `data-bs-toggle`, `data-bs-target`, `data-bs-dismiss`     | nothing: the Trigger and Close parts do it                                                                                 |
| `.dropdown-menu`                                          | a list popup's Popup                                                                                                       |
| `.dropdown-item`                                          | an item: a menu's Item, CheckboxItem, RadioItem and SubmenuTrigger, the Item of Select and the comboboxes                  |
| `.dropdown-item:hover`, `.dropdown-item:focus`            | `[data-active]`: the item the keys or the pointer reached, focused or named in `aria-activedescendant`                     |
| `.active` on a `.dropdown-item`                           | the ItemIndicator of an item with `[data-checked]` or `[data-selected]`: a fill would hide the active item                 |
| `.dropdown-item.disabled`, `.dropdown-item:disabled`      | `[data-disabled]`, which the keys and the pointer still reach                                                              |
| `.dropdown-header`, `.dropdown-divider`                   | the GroupLabel; an `<hr>` in a menu, a `<div aria-hidden="true">` in a list                                                |
| `.dropdown-item-text`                                     | a combobox's Status, beside its List                                                                                       |
| `.dropdown-toggle`, `.dropend`                            | a Menu's Trigger, with the caret on its `::after`; a Submenu, which Bootstrap 5 does not have                              |
| `.form-select`, with a background image for its arrow     | a Select's Trigger, a button around the Value and the chevron down icon                                                    |
| `.navbar`, `.nav-link`, `.nav-link.show`, `.active`       | Menubar's Root and Trigger, or Navigation Menu's list, Trigger and Link; `[data-open]`; `[aria-current="page"]`            |
| `.input-group`                                            | a wrapper around a combobox's Input, Clear and Trigger                                                                     |
| Popper's `--bs-position`, `data-bs-offset`                | the Popup's `side`, `align`, `sideOffset` and `alignOffset`                                                                |
