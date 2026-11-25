# Menubar

A row of menus that stays on screen, such as "File, Edit, View" across the
top of an editor, one tab stop for the whole row. It is Menu
(`src/menu/README.md`) for each menu, opened from an item of the bar
instead of a button, so it follows the WAI-ARIA menu and menubar pattern
and the list popup conventions (PLAN.md section 8, "API conventions",
"List popups") (#101).

A menubar is for an application's commands. Links to a site's pages belong
in Navigation Menu (`src/navigation-menu/README.md`): WAI-ARIA's guidance is
that site navigation uses disclosure buttons and links, not `menubar` and
`menu` roles.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 2026-11-23 |
| WAI-ARIA [menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) (no date on the page). The bar has the `menubar` role, is named by `aria-labelledby` or `aria-label`, and is horizontal by default; in the roving form every item has `tabindex="-1"` but one, the first by default, and Tab into the bar focuses the first item, or optionally the one that last had focus. In the bar Right and Left move to the next and previous item, optionally wrapping; Down on an item with a menu opens it with focus on its first item, Up (optional) on its last; Enter and Space open it with focus on its first item; Home and End; a printable character moves to the next item that starts with it (optional). In a menu of the bar, Right on an item with no submenu closes the menus, moves to the next item of the bar, and "(Recommended)" opens its menu without moving focus into it; Left in a menu of the bar does the same toward the previous item, and in a submenu closes the submenu. Escape closes the menu that contains focus and returns focus to the item it opened from. Tab and Shift+Tab move focus out and close every menu | 2026-11-23 |
| WAI-ARIA [editor menubar example](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/) (last updated 2026-06-25): the keys of each item; Right and Left in a menu keep focus on the bar's item they open; a menu opens on hover "only if another submenu is already open", and focus then moves to the item hovered                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 2026-11-23 |
| WAI-ARIA [navigation menubar example](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/) (last updated 2025-08-12), its "Caution!": the disclosure pattern "is better suited for most web sites"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 2026-11-23 |
| Size: PLAN.md section 6, rules 3, 4 and 6. The budget was set before the behaviour (below)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 2026-11-23 |

## Shape

`Menubar.Root` renders the bar, a `<div role="menubar">`. Each menu in it
is a `Menubar.Menu`, which holds whether that menu is open and renders no
element; its `Menubar.Trigger` is an item of the bar, a native `<button
type="button" role="menuitem">`, and its `Menubar.Popup` is Menu's `<div
popover="auto" role="menu">`, right after it. The items, groups and
submenus are Menu's parts, re-exported under the same names.

```tsx
<Menubar.Root aria-label="Editor">
  <Menubar.Menu>
    <Menubar.Trigger>File</Menubar.Trigger>
    <Menubar.Popup>
      <Menubar.Item onClick={create}>New</Menubar.Item>
      <Menubar.Item onClick={open}>Open…</Menubar.Item>
    </Menubar.Popup>
  </Menubar.Menu>
  <Menubar.Menu>
    <Menubar.Trigger>Edit</Menubar.Trigger>
    <Menubar.Popup>
      <Menubar.Item onClick={copy}>Copy</Menubar.Item>
      <Menubar.Submenu>
        <Menubar.SubmenuTrigger>Share</Menubar.SubmenuTrigger>
        <Menubar.Popup>
          <Menubar.Item>Email</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Submenu>
    </Menubar.Popup>
  </Menubar.Menu>
</Menubar.Root>
```

### Decisions

- **It builds on Menu**, as Context Menu does (#100; PLAN.md section 6,
  rule 4): `popupBases` names the `menubar` → `menu` pair, so an app that
  uses both pays for the shared code once. Root, Menu and Trigger are its
  own. Popup, Item, CheckboxItem, ItemIndicator, Group, GroupLabel,
  RadioGroup, RadioItem, Submenu and SubmenuTrigger are Menu's,
  re-exported. Menu needed no split into a render function: its Popup is
  used as it is, and its Trigger is wrapped, as Context Menu wraps its
  Popup. Menu's state gained three fields, which only a menubar sets: a
  way for the opener to keep focus where it is (`keepFocus`), the key that
  points along the bar from inside a menu (`along`), and whether hover
  opened the menu under the pointer (`hoverOpened`), each below.
- **The Root renders the bar**, as Navigation Menu's renders its `<nav>`:
  the bar is what the keys move along and what Tab enters. It has the
  `menubar` role; the consumer names it with `aria-label` or
  `aria-labelledby`, as the pattern says.
- **`Menubar.Menu` is one menu of the bar**: Menu's Root, with its state
  (`open`, `defaultOpen`, `onOpenChange`) and no element. Each menu has its
  own state, as each Navigation Menu Item has its own Panel, so a menu
  controlled by the app is controlled on its own. The menus of a bar close
  one another (below), so at most one is open after any change the bar
  makes.
- **The Trigger is a native `<button type="button" role="menuitem">`**:
  Menu's Trigger, with the `menuitem` role the pattern gives an item of the
  bar, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` and
  `popovertarget`. A button gives Enter and Space a click and the
  `popovertarget` that light dismiss counts as a press on the menu, which
  only a button takes. `button` allows the `menuitem` role.
- **One tab stop** (PLAN.md section 8, "A group of items is one tab
  stop"): the item that last had focus has `tabindex="0"`, else the first,
  and the others `tabindex="-1"`. The server HTML gives the first item the
  tab stop, as Toggle Group does. The bar's items move with list
  navigation's roving form, horizontal and wrapping (`roving.ts`), not
  `core/rovingFocus.ts`, so that typeahead, which takes list navigation's
  items, works in the bar, and Menu already bundles both. The bar's active
  item lasts while the bar does: it is the tab stop. It carries no
  `data-active`, which in a list popup marks the item the keyboard acts on
  while open; `:focus-visible` and `data-open` style an item of the bar.
- **Keys in the bar.** Right and Left move to the next and previous item,
  wrapping, mirrored right to left; Home and End to the first and last; a
  printable character to the next item that starts with it (PLAN.md
  section 8, "Typeahead"). Down, Enter and Space open the item's menu with
  focus on its first item, and Up with focus on its last, as on Menu's
  Trigger. Enter and Space on an item whose menu is open move focus into
  it, where Menu's Trigger would close it: the pattern says they open it.
- **Once one menu is open, moving to another item opens its menu.** Right,
  Left, Home, End or a character in the bar close the open menu and open
  the one of the item moved to, with focus on that item (`arrow-key` for
  both). So do Right and Left inside a menu, as below.
- **Right and Left inside a menu move along the bar.** Right on an item
  with no submenu (Left right to left), at any depth, closes every menu,
  moves to the next item of the bar and opens its menu with focus on that
  item, as the pattern recommends; Left in a menu of the bar, not in a
  submenu, does the same toward the previous item. Left in a submenu
  closes it, as in Menu. Right on a SubmenuTrigger opens its submenu. In a
  bar of one menu they do nothing, as in Menu.
- **Focus on opening.** A press, Down, Enter or Space opens a menu with
  focus on its first item, as Menu's list popup convention says; a menu
  opened by moving along the bar or by hover leaves focus on its item in
  the bar, where Down moves into it. Menu's Popup moves focus to the first
  item whenever its menu opens; the menubar sets the menu's `keepFocus`
  before it opens one of these, and the Popup leaves focus where it is
  for that opening. The menubar clears it again on the next task, so a
  controlled menu that refused the opening takes focus to its first item
  when it opens later (found in review).
- **Hover**: the pointer moving onto another item of the bar while one
  menu is open opens that item's menu at once, closes the open one and
  moves focus to the item (`trigger-hover`), as the editor example does.
  While no menu is open, hover opens nothing: a menubar opens on a press,
  and a bar the pointer crosses would otherwise open menus over the page.
  Only a pointer that moves counts, as for Menu's submenus, so a menu
  opened by the keyboard under a still pointer does not switch. A touch
  opens nothing on hover.
- **A press on another item while a menu is open opens that item's
  menu.** The pointer reaches the item before it presses, so hover has
  already opened its menu by then: the press keeps it open and moves focus
  to its first item, as a press that opens a menu does, instead of
  closing it as a press on an open menu's item does. Once the pointer has
  left the item, a press on it closes its open menu, as on Menu's Trigger.
  A press on another item, as Chromium sends it, closed the open menu and
  then the one hover had just opened, before this (found in the tests).
- **No hover group.** `floating/hover/group.ts` (`createHoverGroup`)
  opens the next popup without its delay while one is open; a menubar has
  no hover delay to skip, since nothing opens on hover while the bar is
  closed, and the bar already knows which of its menus is open. As for
  Navigation Menu, a component that holds all its popups needs no group
  (PLAN.md section 8, "Hover delays").
- **Escape** closes the menu that has focus, which the browser does for
  `popover="auto"`, and focus returns to the item it opened from: a menu of
  the bar returns it to its item in the bar, a submenu to its trigger. With
  focus on an item of the bar whose menu is open, Escape closes the menu
  and focus stays on the item. With no menu open it does nothing.
- **Tab and Shift+Tab leave the bar and close every menu** (`focus-out`).
  Tab from a menu goes where the browser sends it, past the bar, as in
  Menu. Shift+Tab from a menu moves focus to the menu's item in the bar
  before the browser's own move, so it lands before the bar, not on the
  item, as the pattern says: focus out. From an item of the bar whose menu
  is open, both close the menu.
- **Horizontal only.** The pattern's default. A vertical bar of vertical
  menus sends Down to the bar and to Menu's Trigger at once, so Menu's
  Trigger would need a flag, and a flag is paid by every app (PLAN.md
  section 6, rule 6). A column of commands is a Menu, or Toolbar
  (Phase 4). No `orientation` prop, no `aria-orientation`, which defaults
  to horizontal on a `menubar`, and no `data-horizontal`.
- **Everything else is Menu's**: the items and their activation, checkbox
  and radio items, typeahead in a menu, submenus, wrapping, a press
  outside, `side`, `align`, the offsets, `collisionPadding` and
  `returnFocus` (`src/menu/README.md`, "Decisions"). A menu of the bar is
  placed below its item, aligned to its start.
- **The server renders a `defaultOpen` menu closed**, and hydration opens
  it, as Menu does.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the Root and the
Trigger against the part conventions. "A" marks a case the WAI-ARIA menu
and menubar pattern requires, "C" a case that runs only in Chromium
(`it.skipIf(isJSDOM)`), with real input through the DevTools protocol.
In jsdom an opened popover gets `:popover-open` from a stub
(`test/popover/stubPopover.ts`).

`root/MenubarRoot.test.tsx`

- Renders a `<div role="menubar">`, named by the consumer's `aria-label` (A)
- One tab stop: the first item has `tabindex="0"` and the others `"-1"`; the item that last had focus takes it (A)
- Right and Left move to the next and previous item, wrapping; Home and End to the first and last (A)
- Right to left, Left moves to the next item (C)
- A printable character moves to the next item that starts with it (A)
- Tab into the bar focuses its tab stop, and Tab from it leaves the bar (A, C)

`menu/MenubarMenu.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default; `defaultOpen` starts open, with focus on the first item (A)
- Uncontrolled: its Trigger opens and closes it; `onOpenChange` gets each value with its reason and event (`trigger-press`)
- Controlled: the Trigger only asks
- A controlled menu that refused an opening along the bar moves focus to its first item when it opens later
- Throws a descriptive error outside `Menubar.Root`

`trigger/MenubarTrigger.test.tsx`

- Renders a button of type `button` with the `menuitem` role, `aria-haspopup="menu"`, `aria-expanded`, and `popovertarget` and `aria-controls` naming its Popup, which it labels (A)
- Down Arrow, Enter and Space open its menu with focus on the first item, Up Arrow with focus on the last (A, C for Enter and Space)
- Enter and Space on an item whose menu is open move focus into it (A, C)
- A press opens its menu with focus on the first item, and a press while open closes it (C)
- With a menu open, Right and Left on the bar close it and open the next item's menu with focus on that item (`arrow-key`); Home, End and a character do the same (A)
- With a menu open, the pointer moving onto another item opens its menu at once, closes the open one and focuses that item (`trigger-hover`) (A, C)
- A press on another item while a menu is open, which hover opens first, keeps that item's menu open with focus on its first item; once the pointer has left and come back, a press closes it (C)
- With no menu open, the pointer moving over the items opens nothing (C)
- Escape closes its menu and returns focus to the item (A, C)
- With focus on the item and its menu open, Escape closes the menu and Tab closes it and leaves the bar (A, C)
- Calls the consumer's `onClick` and `onKeyDown`
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Menubar.Menu`

`Menubar.test.tsx`, flows between the bar and its menus

- Right on an item with no submenu closes the menu and opens the next item's, with focus on that item; from the last it wraps to the first (A)
- Left in a menu of the bar opens the previous item's menu, with focus on that item (A)
- Right in a submenu, on an item with no submenu, closes every menu and opens the next item's (A, C)
- Left in a submenu closes only the submenu (A, C)
- Right on a SubmenuTrigger opens its submenu, not the next menu (A)
- In a bar of one menu, Right and Left in its menu do nothing
- Activating an item closes the menu and returns focus to its item in the bar (A, C)
- Tab from a menu closes it and leaves the bar (A, C)
- Shift+Tab from a menu, or a submenu, closes every menu and moves focus to the element before the bar (A, C)

The items, groups and submenus are Menu's parts. Menu's tests for them
run three times, in a Menu, a Context Menu and a Menubar
(`test/menu/kinds.tsx`), so each case below is checked in a Menubar too:

- `item/MenuItem.test.tsx`: roles, the active item, the keys, wrapping, the pointer, typeahead, activation with `item-press` and focus returning, disabled items, links (A)
- `checkbox-item/MenuCheckboxItem.test.tsx`, `radio-group/MenuRadioGroup.test.tsx`, `group/MenuGroup.test.tsx`: checked state, Space and Enter, the indicator, groups and their labels (A)
- `submenu/MenuSubmenu.test.tsx` and `Menu.submenu.test.tsx`: opening and closing submenus by key, pointer and the safe area, Escape, Tab, typeahead, activating an item two levels deep (A, C)

`test/menubar/Menubar.hydrate.test.tsx`

- The server HTML has the bar with the first item as its tab stop, and hidden Popups linked by ids, with no item active
- A `defaultOpen` menu renders closed on the server, with `data-open`
- Hydration adopts the server's elements without warnings, and opens a `defaultOpen` menu
- Opens by a press and by Down Arrow after hydration

`test/package/build.test.ts`

- An app that uses Menu and Menubar bundles the parts they share once

## Left out

| Case                                                          | Reason                                                                                                                                                                                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A vertical bar                                                | Its keys clash with its menus'; Menu's Trigger would need a flag (Decisions)                                                                                                                                                        |
| A disabled item of the bar                                    | A native `disabled` button leaves the keys' reach, which the pattern advises against, and `aria-disabled` would need Menu's Trigger to refuse its own press. A menu whose items are all disabled serves meanwhile. Revisit if asked |
| An item of the bar with no menu, a plain command              | Not in the pattern's examples; it would be a second kind of bar item. Revisit if asked                                                                                                                                              |
| Hover opening a menu while none is open                       | The pattern opens on hover only while another menu is open (Decisions)                                                                                                                                                              |
| Focus moving into a menu opened by moving along the bar       | The pattern recommends keeping it on the bar's item (Decisions)                                                                                                                                                                     |
| A key that focuses the bar from the page, such as F10 or Alt  | The app's to bind: it calls `focus()` on an item                                                                                                                                                                                    |
| The exit animation of a menu closed by another opening        | Opening the next `auto` popover hides the open one at once, which the browser does                                                                                                                                                  |
| Keeping one menu open when a controlled menu refuses to close | Moving along the bar asks the open menu to close and the next to open; a controlled menu that refuses stays open, as the app decided                                                                                                |
| Firefox and WebKit                                            | Tests run in Chromium (PLAN.md section 5)                                                                                                                                                                                           |

Menu's own left-out cases apply too (`src/menu/README.md`, "Left out").

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite).
No screen reader has been tried yet.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25.

| Entry point                                 | Size     | Budget  |
| ------------------------------------------- | -------- | ------- |
| `menhir/menubar`                            | 12,426 B | 13.5 kB |
| `menhir/menu` and `menhir/menubar` together | 12,495 B |         |

An app that already uses Menu pays 588 B for Menubar: its Root, Menu and
Trigger wrapper (`test/package` checks that the shared parts are bundled
once). Menu's state gained the fields a menubar sets, which added 78 B to
Menu (11,823 B to 11,901 B) and 61 B to Context Menu. Context Menu's
`returnTo` in Menu's state added 9 B, from 12,417 B and 12,487 B
together, measured on main just before (#137).

The budget was set before the behaviour, at Menu's measured size
(11,823 B) plus the bar, its menu part and the Trigger's keys, with Menu's
margin. Most of it is `@floating-ui/dom`, as for Menu.
