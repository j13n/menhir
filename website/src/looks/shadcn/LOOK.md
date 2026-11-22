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

Radii come from `--radius`: `rounded-md` (0.5rem) for controls, `rounded-lg` for a dialog and a tab list, `rounded-xl` for a card, `rounded-full` for a switch.

## Recipes

Every component in the look is built from these. Extend them for a component without a worked example.

- **Focus**: `outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50` on every focusable part, including a tab panel. A part without a border of its own also gets `border border-transparent`, for the focused border to colour.
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
- **Disclosures** (accordion, collapsible): an accordion's Item is `border-b last:border-b-0`, and its Header `m-0 flex`. The Trigger is `group flex flex-1 items-start justify-between gap-4 rounded-md border border-transparent py-4 text-left text-sm font-medium transition-all motion-reduce:transition-none hover:underline`, plus the focus and disabled recipes, and ends with the chevron down icon: `pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-open:rotate-180`. The Panel is `text-sm`, around an inner `<div class="pb-4">`: the Panel is hidden while closed, so it takes no `display` or spacing class, and it is not animated.
- **Icons** are inline SVG: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`, `size-4` unless a recipe says otherwise. Paths: check `M4 12l5 5L20 6`, dash `M5 12h14`, close `M18 6 6 18M6 6l12 12`, chevron down `m6 9 6 6 6-6`. A button with only an icon gets its name from `<span class="sr-only">`.
- **Corner close** (the icon button in a dialog's corner): `absolute top-4 right-4 rounded-xs opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- **Surfaces**: a dialog is `rounded-lg border bg-background p-6 shadow-lg` with `backdrop:bg-black/50`, a positioned popup `rounded-md border bg-popover p-4 text-popover-foreground shadow-md`, a card `rounded-xl border bg-card p-6 text-card-foreground shadow-sm`.
- **Text**: titles `font-semibold` (dialog, `text-lg leading-none`) or `font-medium` (popover); descriptions `text-sm text-muted-foreground`.
- **Motion**: popups fade and grow from 95%: `transition-[opacity,scale] data-closed:scale-95 data-closed:opacity-0 starting:data-open:scale-95 starting:data-open:opacity-0`, 150ms for a positioned popup and 200ms for a dialog. A dialog's backdrop fades with it: `backdrop:transition-opacity backdrop:duration-200 data-closed:backdrop:opacity-0 starting:data-open:backdrop:opacity-0`. Every `transition-*` gets `motion-reduce:transition-none`.

## From shadcn/ui's source

shadcn/ui's own components use other attribute, variable and part names. What each becomes in Menhir:

| shadcn/ui                                                   | Menhir                                                                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-[state=checked]`, `data-[state=unchecked]`            | `data-checked:`, `data-unchecked:`                                                                                 |
| `data-[state=open]`, `data-[state=closed]`                  | `data-open:`, `data-closed:`                                                                                       |
| `data-[state=active]` on a tab                              | `data-selected:`                                                                                                   |
| `data-[orientation=vertical]`, `data-[disabled]`            | `data-vertical:`, `data-disabled:`                                                                                 |
| `animate-in fade-in-0 zoom-in-95`                           | a transition, with `starting:data-open:opacity-0 starting:data-open:scale-95`                                      |
| `animate-out fade-out-0 zoom-out-95`                        | `data-closed:opacity-0 data-closed:scale-95`: Menhir keeps the popup shown until its transition ends               |
| `DialogOverlay` with `bg-black/50`                          | `backdrop:bg-black/50` on the Dialog's Popup: the backdrop is the browser's `::backdrop`                           |
| `fixed top-[50%] left-[50%] translate-…` on `DialogContent` | `m-auto`: a modal `<dialog>` centres itself                                                                        |
| `grid` or `flex` on `DialogContent` or `PopoverContent`     | an inner `<div>`: a `display` class on the Popup overrides the browser's `display: none` and shows it while closed |
| `[&[data-state=open]>svg]:rotate-180`                       | `group` on the Trigger, `group-data-open:rotate-180` on the icon                                                   |
| `animate-accordion-down`, `animate-accordion-up`            | nothing: a Panel is hidden while closed, and is not animated                                                       |
| `Portal`, `z-50`                                            | nothing: popups are in the top layer                                                                               |
| `--radix-popover-content-transform-origin`                  | `--transform-origin`                                                                                               |
| `--radix-popover-trigger-width`                             | `--anchor-width`                                                                                                   |
| `asChild`                                                   | the part's `render` prop                                                                                           |
| `cn()`, `cva()` variants, `data-slot`                       | plain class strings                                                                                                |
