---
name: menhir-styling
description: Style Menhir components (the `menhir` package for SolidJS) in one consistent look, such as the shadcn look or the Bootstrap look, or a look the user describes or shows. Use when adding styles to a Menhir component, or giving an app's Menhir components a look.
---

# Styling Menhir components

Menhir's components are unstyled: each part exposes its state as data attributes for CSS to select. A **look** is a complete visual style for them: tokens (colours and radii, and in a look in plain CSS also spacing and shadows), recipes for every kind of part, and worked examples built from both. Every component styled in a look uses that look's tokens and recipes, so components styled weeks apart still match.

## Looks

| Look                                 | Styling         | Worked examples                             |
| ------------------------------------ | --------------- | ------------------------------------------- |
| [shadcn](looks/shadcn/LOOK.md)       | Tailwind CSS v4 | Switch, Dialog, Tabs, Popover, Menu, Select |
| [Bootstrap](looks/bootstrap/LOOK.md) | CSS modules     | Switch, Dialog, Tabs, Popover, Menu, Select |

Each look's `LOOK.md` has its setup, what each token is for, its recipes, and the list of worked examples. When the app is styled with the other technology, translate the look into it, token for token: a class into the declarations it stands for, or a declaration into its class. The Bootstrap look's setup gives its tokens their Tailwind names.

## Steps

1. **Choose the look.** The one the user names, or the one the app already has: look for `data-look` and a look's `tokens.css` in the app. For a look the user describes or shows (a screenshot, a site, an existing design system), write its tokens first: copy the closest look's `tokens.css`, keep the token names, change the values. That look's recipes and worked examples then carry over. Done when the app has one tokens file for the look.
2. **Set up the look**, once per app, as its `LOOK.md` says. A look's tokens apply only inside its `data-look` attribute, and switch between light and dark with the CSS `color-scheme`, which the app sets from Menhir's color-scheme utility (`menhir/color-scheme/local-storage` or `/cookie`) or from the system. Done when the tokens apply where the components render, in light and dark.
3. **Style each component.** Read its parts and data attributes first, from its Markdown page, `https://menhir-ui.com/docs/components/<name>.md` (all of them are listed in `https://menhir-ui.com/llms.txt`); the types in `node_modules/menhir/dist/source/<name>/` are the installed version's. When the look has a worked example of it, start from that and change only the content. Otherwise build it from the look's recipes, taking their classes or declarations as written, and its nearest worked example: a control from Switch, a popup from Popover or Dialog, a composite from Tabs, a list popup (Context Menu, Menubar, Navigation Menu, Combobox, Autocomplete, Multi Combobox) from Menu or Select. What Menhir has no component for because it is only a styled element, such as a badge (a `<span>`), is in the look's recipes: do not look for a component. Where no recipe covers a part, say so in your reply, with the classes or declarations you chose. Done when every part the app renders has its styles, every colour and radius comes from a token, and sizes, spacing and shadows come from the look's recipes.
4. **Check it in the browser.** For each component: its states (on and off, selected, disabled), open and close animations, keyboard focus on every interactive part, text contrast against its background, and the same again in the dark color scheme. Done when each one looks like the look's worked examples in both color schemes.

## Menhir's contract

What holds for every component, and so is on no single component's page. A component's parts, props and data attributes are on its Markdown page only: read them there.

- **State is in data attributes**, present or absent, such as `data-checked` and `data-unchecked`; the component's page lists each part's. In Tailwind: `data-checked:bg-primary`. In CSS: `.track[data-checked]`.
- **Focus** is `:focus-visible` (`focus-visible:` in Tailwind). There is no focus attribute.
- **`class` and `style` merge** with the part's own. A part's `render` prop renders it through the app's own component.
- **A variant is set with the array or object form of `class`**: `class={["button", { primary: props.primary }]}`, or with a CSS module `class={[styles.button, { [styles.primary]: props.primary }]}`. A string built in a template replaces the whole attribute on each change; the object form adds and removes one class.
- **Popups are in the top layer**: a Dialog's Popup is a modal `<dialog>`, a Popover's Popup is a `popover` element. They need no portal and no `z-index`. The browser hides them while closed with `display: none`, so a `display` class (`flex`, `grid`) goes on an inner wrapper, never on the Popup.
- **A Collapsible's or an Accordion's Panel is `hidden` while closed**, in the page's flow. Tailwind's preflight hides `[hidden]` with `!important`, which outranks every class, so a closed Panel stays hidden whatever its classes say. A Panel that collapses only on narrow screens, such as a sidebar always shown on wide ones, takes `hidden={false}`, and the look hides it on `[data-closed]` below the breakpoint: `max-md:data-closed:hidden`, or in CSS `@media (width < 48rem) { .panel[data-closed] { display: none; } }`.
- **A Dialog's backdrop** is the browser's `::backdrop` (`backdrop:` in Tailwind), and `m-auto` centres the dialog.
- **Animation**: entry from `@starting-style` on `[data-open]` (`starting:data-open:`), exit to the `[data-closed]` styles: Menhir keeps a closing popup shown until its transition or animation ends. Guard motion with `prefers-reduced-motion` (`motion-reduce:transition-none`).
- **A positioned popup** (Popover, Tooltip) grows from its trigger: `origin-(--transform-origin)`. Its page lists its side and alignment attributes and its other CSS variables.
