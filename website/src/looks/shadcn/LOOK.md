# The shadcn look

The look of shadcn/ui's default theme (neutral, "new-york"), in Tailwind CSS v4. Its class strings follow shadcn/ui's components, rewritten for Menhir's parts and data attributes. The licence notice is in `LICENSE`, beside this file.

## Setup

Once per app. Check before adding: the app may already have it.

1. Copy `tokens.css` beside the app's main stylesheet and import it there, after Tailwind:

   ```css
   @import "tailwindcss";
   @import "./tokens.css";
   ```

2. Put `data-look="shadcn"` on `<html>`, and `class="bg-background text-foreground"` on `<body>`. The tokens apply inside the element that has the attribute, so a page can also take the look in one part only.
3. Light and dark follow the CSS `color-scheme`: the tokens use `light-dark()`. The `dark:` classes in the examples need Tailwind's `dark` variant on the same condition. With Menhir's color-scheme utility, which sets `data-color-scheme` on `<html>`:

   ```css
   @custom-variant dark (&:where([data-color-scheme="dark"], [data-color-scheme="dark"] *));

   :root[data-color-scheme="dark"] {
     color-scheme: dark;
   }
   ```

   Without the utility, `:root { color-scheme: light dark; }` follows the system, and the `dark` variant stays Tailwind's default, `prefers-color-scheme`. Use the first when the app already has the utility, and the second otherwise.

## Tokens

Use these through Tailwind classes (`bg-primary`, `text-muted-foreground`, `border-input`, `ring-ring/50`), never as raw colours. Two colours are not tokens, as in shadcn/ui, and are used only where their recipe says: black at 50% behind a dialog (`backdrop:bg-black/50`), and white text on `destructive` (`text-white`).

| Token                               | For                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `background`, `foreground`          | The page, and a surface that sits on it, such as a dialog                          |
| `card`, `card-foreground`           | A raised box in the page, such as a tab panel                                      |
| `popover`, `popover-foreground`     | A positioned popup: popover, tooltip, menu                                         |
| `primary`, `primary-foreground`     | The main action, and the on state: a checked switch                                |
| `secondary`, `secondary-foreground` | A second action                                                                    |
| `muted`, `muted-foreground`         | A quiet background (a tab list), and secondary text                                |
| `accent`, `accent-foreground`       | Hover on an outline or ghost control, a highlighted item                           |
| `destructive`                       | An action that deletes, and invalid fields                                         |
| `border`, `input`                   | Borders: `border` for surfaces (the default), `input` for fields and the off state |
| `ring`                              | Focus: `ring-ring/50`, and the focused field's border                              |

Spacing and shadows are Tailwind's own scales (`p-6`, `gap-2`, `shadow-xs` to `shadow-lg`), which the look leaves as they are, as shadcn/ui does; the recipes say which step each part takes, so do not add spacing or shadow tokens.

Radii come from `--radius`: `rounded-md` (0.5rem) for controls, `rounded-lg` for a dialog and a tab list, `rounded-xl` for a card, `rounded-full` for a switch and a badge.

## Recipes

Every component in the look is built from these. Extend them for a component without a worked example.

- **Focus**: `outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` on every focusable part, including a tab panel. Buttons aside, a part without a border of its own, such as a tab or an accordion's Trigger, also gets `border border-transparent`, for the focused border to colour.
- **Disabled**: `data-disabled:pointer-events-none data-disabled:opacity-50` on a part that has `data-disabled` (form controls, tabs, toggles, accordion items: see the component's page); `disabled:pointer-events-none disabled:opacity-50` on a plain button, such as a popup's Trigger or Close.
- **Controls** are `h-9` with `text-sm font-medium`. A small one is `h-8`.
- **Buttons**, all `inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-all motion-reduce:transition-none` plus the focus and disabled recipes. A popup's Trigger and a Cancel are outline, the main action is primary, and the button that carries out a deletion is destructive; a Trigger that only opens the confirmation stays outline:
  - primary: `bg-primary text-primary-foreground hover:bg-primary/90`
  - outline: `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50`
  - secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
  - ghost: `hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50`
  - destructive: `bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60`
- **Fields**: `h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] motion-reduce:transition-none md:text-sm dark:bg-input/30 placeholder:text-muted-foreground`, plus focus.
- **On and off** (switch, checkbox): on is `data-checked:bg-primary` with `text-primary-foreground` inside; off is `data-unchecked:bg-input` or `border-input`. A checkbox's partly checked state, `data-indeterminate:`, takes the on classes.
- **Tracks** (switch): `inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all`, with the on and off classes and `dark:data-unchecked:bg-input/80`, plus the focus and disabled recipes. The thumb is `pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0 dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground`.
- **Boxes** (checkbox): `size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow dark:bg-input/30`; on, and the same for `data-indeterminate:`: `data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary` (the `dark:` one keeps `dark:bg-input/30` from covering the fill). Plus the focus and disabled recipes. The Indicator is `group flex items-center justify-center data-unchecked:hidden` and holds two icons, `size-3.5`: a check with `group-data-indeterminate:hidden` and a dash with `hidden group-data-indeterminate:block`.
- **Pressed** (toggle, toggle group item): `inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium transition-[color,box-shadow] hover:bg-muted hover:text-muted-foreground data-pressed:bg-accent data-pressed:text-accent-foreground`, plus focus and disabled.
- **Selected** (tab): `data-selected:bg-background data-selected:text-foreground data-selected:shadow-sm`, and in dark `dark:data-selected:border-input dark:data-selected:bg-input/30 dark:data-selected:text-foreground`, on a `rounded-lg bg-muted p-[3px] text-muted-foreground` track. A tab that is not selected is `border border-transparent text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground`.
- **Disclosures** (accordion, collapsible): an accordion's Root is `w-full`, as wide as what holds it; its Item is `border-b last:border-b-0`, and its Header `m-0 flex`. The Trigger is `group flex flex-1 items-start justify-between gap-4 rounded-md border border-transparent px-2 py-4 text-left text-sm font-medium transition-all motion-reduce:transition-none hover:underline`, plus the focus and disabled recipes, and ends with the chevron down icon: `pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-open:rotate-180`. The Panel is `text-sm`, around an inner `<div class="px-2 pt-1 pb-4">`, which lines its text up with the Trigger's and keeps it clear of the Trigger's focus ring, as the Trigger's own padding does for its text: the Panel is hidden while closed, so it takes no `display` or spacing class, and it is not animated.
- **Toolbars**: the Root `flex items-center gap-1`; its buttons and toggles are small ghost buttons, `h-8 px-2`, or the pressed recipe at `h-8 min-w-8`; a Separator between groups `mx-1 h-4 w-px bg-border`. Its disabled items stay focusable and take the disabled recipe through `data-disabled`.
- **Toasts**: the Region `fixed right-4 bottom-4 m-0 w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 overflow-visible border-0 bg-transparent p-0 open:flex` (a popover lays out only once shown), plus the focus recipe. A toast is a card: `relative rounded-md border bg-popover p-4 pr-10 text-sm text-popover-foreground shadow-lg transition-opacity data-closed:opacity-0 starting:data-open:opacity-0 motion-reduce:transition-none`, with `translate-x-(--toast-swipe-x,0)` when it takes `Toast.swipe`, and `data-[priority=high]:border-destructive` for one that cannot wait. Its Title is `font-semibold`, its Description `text-muted-foreground`, its Action a small outline button, its Close the corner close.
- **List popups** (Menu, Context Menu, Menubar, Navigation Menu, Select, Combobox, Autocomplete, Multi Combobox): a positioned popup that holds a list of items, as in the Menu and Select examples. Each component's page names its parts and attributes; what each part takes:
  - **Popup**: `min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md`, with the positioned popup's motion, at `sideOffset={4}`. A submenu's Popup is `shadow-lg`, at `alignOffset={-5}` and no `sideOffset`, so that its first item lines up with its trigger. The Popup of Select, Combobox, Autocomplete and Multi Combobox takes `max-h-(--available-height) min-w-(--anchor-width)` in place of `min-w-32`; a combobox's List, inside it, takes nothing.
  - **Item** (a menu's Item, CheckboxItem, RadioItem and SubmenuTrigger, and the Item of Select and the comboboxes): `relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none`, with an icon in it at `size-4`.
  - **Active item**: `data-active:bg-accent data-active:text-accent-foreground`. One style for both kinds of list: the active item has focus in a menu, and is named in `aria-activedescendant` in Select and the comboboxes, where focus stays on the Trigger or the Input. It stands in for the focus recipe on an item, and for hover: the pointer makes the item under it active.
  - **Disabled item**: `data-disabled:opacity-50`, without the disabled recipe's `pointer-events-none`: the keys and the pointer still reach a disabled item, and it shows as active.
  - **Checked and selected**: the ItemIndicator is always rendered, and hides by its state. In a menu's CheckboxItem or RadioItem, the item adds `ps-8` and the indicator is `pointer-events-none absolute inset-s-2 flex size-3.5 items-center justify-center data-unchecked:hidden`; in the Item of Select, Combobox and Multi Combobox, the item has `ps-2 pe-8` and the indicator, after the text, the same classes with `inset-e-2` and `data-unselected:hidden`. It holds the check icon, or in a RadioItem a dot, `<span class="size-2 rounded-full bg-current">`. The item takes no other class for it: the active item's background stays the only fill.
  - **Group label**: in a menu `px-2 py-1.5 text-sm font-medium`, in Select and the comboboxes `px-2 py-1.5 text-xs text-muted-foreground`.
  - **Separator**: `-mx-1 my-1 h-px border-0 bg-border` on an `<hr>` in a menu. In Select and the comboboxes, whose lists hold only options and groups, a `<div aria-hidden="true">` with `pointer-events-none -mx-1 my-1 h-px bg-border`.
  - **Submenu trigger**: an item, with `data-open:bg-accent data-open:text-accent-foreground` while its submenu is open, ending with the chevron right icon, `ms-auto rtl:rotate-180`.
  - **Bars**: Menubar's Root is `flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs`, and its Trigger `flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none focus-visible:bg-accent focus-visible:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground`; its Popup is `min-w-48`, at `sideOffset={8} alignOffset={-4}`. Navigation Menu's list, a `<ul>` in the Root, is `m-0 flex list-none items-center gap-1 p-0`, and its Item `relative`. Its Trigger is a ghost button with `group data-open:bg-accent/50`, ending with the chevron down icon at `size-3 transition-transform duration-300 group-data-open:rotate-180 motion-reduce:transition-none`. Its Panel is not a popup but sits in the page: `absolute inset-s-0 top-full mt-1.5 min-w-48 rounded-md border bg-popover p-2 text-popover-foreground shadow`, hidden while closed, so with no `display` class and no animation. A Link in it is `flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent/50 motion-reduce:transition-none`, and one beside the Triggers a ghost button.
  - **Fields that open a list**: a Select's Trigger is a field, as a button: `flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] dark:bg-input/30 dark:hover:bg-input/50 motion-reduce:transition-none`, plus the focus and disabled recipes. Its Value is `truncate data-placeholder:text-muted-foreground`, and it ends with the chevron down icon, `shrink-0 opacity-50`. The Input of Combobox and Autocomplete is a field. Its Trigger and Clear go inside the field's end: a `relative` wrapper around the Input and a `<div class="absolute inset-y-0 inset-e-0 flex items-center pe-1">` that holds them, each a ghost icon button at `size-7` with `text-muted-foreground`, around the chevron down icon or the close icon; the Input adds `pe-8` for each.
  - **Chips** (Multi Combobox): the Chips box is a field with `flex h-auto min-h-9 flex-wrap items-center gap-1 px-1.5 py-1`, and the focus recipe on `focus-within:` in place of `focus-visible:`, since focus is on the Input inside it. The Input is `h-7 min-w-16 flex-1 bg-transparent px-1.5 outline-none`. A Chip takes the badge recipe's classes with the secondary variant, plus the focus recipe and `data-disabled:opacity-50`; its ChipRemove is `rounded-full opacity-70 hover:opacity-100` around the close icon at `size-3`.
  - **Empty list**: the Status beside a combobox's List is `py-6 text-center text-sm empty:hidden`, taking no room while it says nothing. A Status that only counts for a screen reader, beside the Input, is `sr-only`.
- **Scrollers**: try a native one first, with no component: `overflow-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] [scrollbar-gutter:stable]` on an element with `tabindex="0"`, `role="region"` and a name, plus the focus recipe. A browser without one of these properties shows the system's scrollbar. For a scrollbar that overlays the content and shows on hover or while scrolling, use Scroll Area: the Root `group relative`, the Viewport `size-full overflow-auto overscroll-contain rounded-[inherit]` plus the focus recipe, a vertical Scrollbar `absolute inset-y-0 end-0 flex w-2.5 border-l border-l-transparent p-px opacity-0 transition-opacity delay-600 group-hover:opacity-100 group-hover:delay-0 data-scrolling:opacity-100 data-scrolling:delay-0 motion-reduce:transition-none` (a horizontal one swaps `inset-y-0 end-0 w-2.5 border-l border-l-transparent` for `inset-x-0 bottom-0 h-2.5 border-t border-t-transparent` and keeps the rest), and its Thumb `absolute inset-x-px top-[calc((100%-max(var(--thumb-size),1.5rem))*var(--thumb-position))] h-[max(var(--thumb-size),1.5rem)] rounded-full bg-border` (across, `inset-y-px start-[calc((100%-max(var(--thumb-size),1.5rem))*var(--thumb-position))] w-[max(var(--thumb-size),1.5rem)] rounded-full bg-border`).
- **Badges**: a badge is a `<span>`, not a Menhir component: `inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap`, with an icon inside it at `size-3`, and one variant. A badge that is a link also takes the focus recipe and the hover of the button of its variant.
  - primary: `border-transparent bg-primary text-primary-foreground`
  - secondary: `border-transparent bg-secondary text-secondary-foreground`
  - destructive: `border-transparent bg-destructive text-white dark:bg-destructive/60`
  - outline: `text-foreground`

  A count adds `tabular-nums`. A count that changes while the page is open and should be announced has `role="status"`, is rendered before it changes, at zero too, and says what it counts in a `<span class="sr-only">`. A count on an icon button is in the button's name, its `<span class="sr-only">` ("Messages, 3 unread"); the badge is `aria-hidden="true"`, with `absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1` in place of `w-fit gap-1 px-2 py-0.5`, on a `relative` button. A badge whose colour means something says it in visible text as well, or with an icon: colour alone is not enough (WCAG 1.4.1). The chips of a Multi Combobox are that component's parts, not badges; they may take the secondary variant's classes. More: https://menhir-ui.com/docs/badge.

- **Icons** are inline SVG: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`, `size-4` unless a recipe says otherwise. Paths: check `M4 12l5 5L20 6`, dash `M5 12h14`, close `M18 6 6 18M6 6l12 12`, chevron down `m6 9 6 6 6-6`, chevron right `m9 18 6-6-6-6`. A button with only an icon is `size-9` in place of `h-9 px-4 py-2`, and gets its name from `<span class="sr-only">`.
- **Corner close** (the icon button in a dialog's corner): `absolute top-4 right-4 rounded-xs opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- **Surfaces**: a dialog is `rounded-lg border bg-background p-6 shadow-lg` with `backdrop:bg-black/50`, a positioned popup `rounded-md border bg-popover p-4 text-popover-foreground shadow-md`, a card `rounded-xl border bg-card p-6 text-card-foreground shadow-sm`.
- **Text**: titles `font-semibold` (dialog, `text-lg leading-none`) or `font-medium` (popover); descriptions `text-sm text-muted-foreground`.
- **Motion**: popups fade and grow from 95%: `transition-[opacity,scale] data-closed:scale-95 data-closed:opacity-0 starting:data-open:scale-95 starting:data-open:opacity-0`, 150ms for a positioned popup and 200ms for a dialog. A dialog's backdrop fades with it: `backdrop:transition-opacity backdrop:duration-200 data-closed:backdrop:opacity-0 starting:data-open:backdrop:opacity-0`. Every `transition-*` gets `motion-reduce:transition-none`.

## From shadcn/ui's source

shadcn/ui's own components use other attribute, variable and part names. What each becomes in Menhir:

| shadcn/ui                                                     | Menhir                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-[state=checked]`, `data-[state=unchecked]`              | `data-checked:`, `data-unchecked:`                                                                                 |
| `data-[state=open]`, `data-[state=closed]`                    | `data-open:`, `data-closed:`                                                                                       |
| `data-[state=active]` on a tab                                | `data-selected:`                                                                                                   |
| `data-[orientation=vertical]`, `data-[disabled]`              | `data-vertical:`, `data-disabled:`                                                                                 |
| `animate-in fade-in-0 zoom-in-95`                             | a transition, with `starting:data-open:opacity-0 starting:data-open:scale-95`                                      |
| `animate-out fade-out-0 zoom-out-95`                          | `data-closed:opacity-0 data-closed:scale-95`: Menhir keeps the popup shown until its transition ends               |
| `DialogOverlay` with `bg-black/50`                            | `backdrop:bg-black/50` on the Dialog's Popup: the backdrop is the browser's `::backdrop`                           |
| `fixed top-[50%] left-[50%] translate-…` on `DialogContent`   | `m-auto`: a modal `<dialog>` centres itself                                                                        |
| `grid` or `flex` on `DialogContent` or `PopoverContent`       | an inner `<div>`: a `display` class on the Popup overrides the browser's `display: none` and shows it while closed |
| `[&[data-state=open]>svg]:rotate-180`                         | `group` on the Trigger, `group-data-open:rotate-180` on the icon                                                   |
| `animate-accordion-down`, `animate-accordion-up`              | nothing: a Panel is hidden while closed, and is not animated                                                       |
| `Portal`, `z-50`                                              | nothing: popups are in the top layer                                                                               |
| `--radix-popover-content-transform-origin`                    | `--transform-origin`                                                                                               |
| `--radix-popover-trigger-width`                               | `--anchor-width`                                                                                                   |
| `asChild`                                                     | the part's `render` prop                                                                                           |
| `cn()`, `cva()` variants, `data-slot`                         | plain class strings                                                                                                |
| `data-[highlighted]`, `focus:bg-accent` on an item            | `data-active:`: the item the keys or the pointer reached, focused or named in `aria-activedescendant`              |
| `data-[state=checked]` on a select item                       | `data-selected:`                                                                                                   |
| `data-[disabled]:pointer-events-none` on an item              | nothing: the keys and the pointer still reach a disabled item                                                      |
| `ItemIndicator`, rendered only while checked                  | an ItemIndicator always rendered, with `data-unchecked:hidden` or `data-unselected:hidden`                         |
| `data-[inset]:pl-8`, `left-2`, `right-2`                      | `ps-8` on the item; `inset-s-2`, `inset-e-2` on the indicator                                                      |
| `DropdownMenuLabel`, `SelectLabel`                            | the GroupLabel                                                                                                     |
| `DropdownMenuSeparator`, `SelectSeparator`                    | an `<hr>` in a menu, a `<div aria-hidden="true">` in a list                                                        |
| `DropdownMenuSub`, `DropdownMenuSubTrigger`, `…SubContent`    | `Submenu`, `SubmenuTrigger`, and the submenu's `Popup`                                                             |
| `--radix-…-content-available-height`                          | `--available-height`, on the Popup of Select and the comboboxes; a Menu's Popup has none                           |
| `--radix-select-trigger-width`                                | `--anchor-width`                                                                                                   |
| `data-[placeholder]` on `SelectTrigger`                       | `data-placeholder:` on the Value                                                                                   |
| `SelectViewport`, `SelectScrollUpButton`, `…ScrollDownButton` | nothing: the Popup scrolls, with `overflow-y-auto`                                                                 |
| `position="item-aligned"` on `SelectContent`                  | nothing: the Popup is placed against the Trigger, as `position="popper"` places it                                 |
| `CommandEmpty`                                                | a combobox's Status, beside its List                                                                               |
| `NavigationMenuViewport`, `navigationMenuTriggerStyle()`      | nothing: each Panel sits under its Item; the Trigger's classes written out                                         |
