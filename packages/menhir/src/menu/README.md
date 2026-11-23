# Menu

A list of actions or options that a button opens, such as "Copy, Paste,
Share ▸": the WAI-ARIA menu button pattern for the Trigger and the menu and
menubar pattern for the menu, its items and submenus. The first list popup,
which settles the parts and conventions that Context Menu, Menubar and
Select reuse (#99; PLAN.md section 8, "API conventions", "List popups").

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 2026-11-23 |
| WAI-ARIA [menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) (no date on the page): the button has `aria-haspopup` `menu` or `true`, `aria-expanded` `true` while the menu is shown, and optionally `aria-controls`; Enter and Space open the menu with focus on its first item; Down Arrow (optional) opens it with focus on the first item, Up Arrow (optional) on the last                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 2026-11-23 |
| WAI-ARIA [menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) (no date on the page): focus goes to the first item when a menu opens; Down and Up move, optionally wrapping; Home and End; Right on an item with a submenu opens it with focus on its first item, Left in a submenu closes it and returns focus to its parent item; a printable character moves to the next item whose label starts with it (optional); Enter activates an item and closes the menu; Space (optional) changes a checkbox or radio item without closing the menu; Escape closes the menu that contains focus and returns focus to its opener; Tab and Shift+Tab move focus out and close every menu. Disabled items are focusable and cannot be activated; a separator is not focusable. A submenu's `menu` element is the sibling right after its parent item, which has `aria-haspopup` and `aria-expanded`; a menu is labelled by the button or item that controls it | 2026-11-23 |
| Size: PLAN.md section 6, rules 3 and 6. The budget was set before the behaviour (below)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 2026-11-23 |

## Shape

`Menu.Root` renders no element: it holds whether the menu is open.
`Menu.Trigger` renders a native `<button type="button">` that opens and
closes it. `Menu.Popup` renders a `<div popover="auto" role="menu">`,
placed against the Trigger. Inside it, `Menu.Item` renders a `<div
role="menuitem">`, `Menu.CheckboxItem` a `menuitemcheckbox` and
`Menu.RadioItem` a `menuitemradio` inside `Menu.RadioGroup`, a `<div
role="group">`; `Menu.ItemIndicator` renders a `<span>` that shows a
checked item's state. `Menu.Group` is a `<div role="group">` named by its
`Menu.GroupLabel`. `Menu.Submenu` holds a submenu's state, like a Root;
its `Menu.SubmenuTrigger` is an item of the menu around it, and its own
`Menu.Popup` comes right after.

```tsx
<Menu.Root>
  <Menu.Trigger>Edit</Menu.Trigger>
  <Menu.Popup>
    <Menu.Item onClick={copy}>Copy</Menu.Item>
    <Menu.Item onClick={paste} disabled>Paste</Menu.Item>
    <hr />
    <Menu.CheckboxItem defaultChecked>
      <Menu.ItemIndicator>✓</Menu.ItemIndicator> Word wrap
    </Menu.CheckboxItem>
    <Menu.Submenu>
      <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
      <Menu.Popup>
        <Menu.Item>Email</Menu.Item>
        <Menu.Item>Messages</Menu.Item>
      </Menu.Popup>
    </Menu.Submenu>
  </Menu.Popup>
</Menu.Root>
```

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser** (`popover="auto"`, #94): the top layer, light dismiss by
  a press outside, Escape and other close requests, focus back on the
  Trigger when the menu closes with focus inside, and nested popovers, the
  submenus, closing one at a time.
- **The `floating` layer**: presence, `popoverClose`, `returnFocus` and
  `positioning` with `offset`, `flip` and `shift` from the Popup;
  `list-navigation/roving` and `typeahead` for each menu's items;
  `hover/safeArea` from a SubmenuTrigger. `menhir/menu` bundles no Tab
  wrap, scroll lock, dialog dismissal, Escape listener, hover delays or
  group, or `aria-activedescendant` list
  (`test/bundle-size/popupModules.ts`), and an app that renders no submenu
  bundles no safe area (`test/package`).

### Decisions

- **Parts.** A popup's Root, Trigger and Popup (PLAN.md section 8,
  "Popups"), and what a native element cannot do in a menu: the three item
  roles, the radio group that holds a value, a group named by its label,
  the indicator, and the submenu's state and its trigger. No Title,
  Description or Close: a menu is named by its Trigger and closes when an
  item is activated.
- **No Separator part**: a native `<hr>` has the `separator` role inside a
  `menu`, is not focusable, and list navigation never reaches it. Menu
  cannot import `menhir/separator`, a simple component (PLAN.md section 6,
  rule 4).
- **No Arrow**: menus seldom point at their trigger, and the Popup would
  carry the slot for it in every app. Add one as Popover's if asked.
- **Non-modal.** The page behind stays usable and scrolls: "Modal or not is
  a component, not a flag", and a modal popup is a Dialog (#33).
- **The Popup is `popover="auto"` with the `menu` role**, rendered right
  after its Trigger, its `id` the Root's, which the Trigger names in
  `popovertarget` and `aria-controls` (PLAN.md section 8, "Generated ids
  belong to the root"). It is labelled by its Trigger in
  `aria-labelledby`, as the pattern says; the consumer's `aria-labelledby`
  wins, and a Menu with no Trigger takes an `aria-label`. The Trigger
  keeps `props.id ?? generated`, since the Popup after it names it.
- **The Trigger** has `aria-haspopup="menu"`, `aria-expanded` by the state,
  `aria-controls` and `popovertarget`. Its click opens and closes the menu
  through the state and calls `preventDefault()`, as Popover's does
  (`src/popover/README.md`). Enter and Space click it; Down Arrow opens the
  menu, Up Arrow opens it with the last item active.
- **Focus goes to the first item whenever the menu opens**, by a press, a
  key, `defaultOpen` or a controlled `open`, as the pattern says; Up Arrow
  on the Trigger starts at the last. A submenu opened by a key or Enter
  starts at its first item; one opened by hover or a click leaves focus on
  its trigger, where Right Arrow moves into it.
- **The keys wrap** from the last item to the first and back. The pattern
  allows either, and a menu is short enough that wrapping costs no
  orientation. Not a prop.
- **Disabled items** have `aria-disabled="true"` and `data-disabled`, stay
  reachable by the keys and the pointer, and are not activated: their
  `onClick` is not called, and a disabled link's click is cancelled, so
  neither a press nor Enter follows it.
- **Activating an item**: Enter, Space and a click call its `onClick` and
  close every open menu, reporting `item-press` with the key event, or the
  click. A link rendered with `render` activates itself on Enter, which
  clicks it.
- **Checkbox and radio items**: a click and Enter change the state and close
  the menu; Space changes it and keeps the menu open, as the pattern's
  optional Space does. `Menu.CheckboxItem` takes `checked`,
  `defaultChecked` and `onCheckedChange`; `Menu.RadioGroup` takes `value`,
  `defaultValue` and `onValueChange`, `null` when none is checked, and each
  `Menu.RadioItem` a `value`. Both items have `aria-checked` and
  `data-checked` or `data-unchecked`, and so does `Menu.ItemIndicator`,
  always rendered and `aria-hidden`, as Checkbox's Indicator is.
- **Typeahead** in an open menu (PLAN.md section 8, "Typeahead"). An item
  whose content is not its label takes a `label`, which typeahead matches.
- **Submenus.** `Menu.Submenu` holds a submenu's state as a Root does
  (`open`, `defaultOpen`, `onOpenChange`). `Menu.SubmenuTrigger` is an item
  of the menu around it, with `aria-haspopup="menu"`, `aria-expanded` and
  `aria-controls`; the submenu's `Menu.Popup` follows it, a sibling, as the
  pattern places it, so the trigger's name is its own text and typeahead
  reads only that: a test reads Chromium's accessibility tree while the
  submenu is open, and the trigger is named "Share", not "ShareEmail…". The Popup sits in its parent's in the DOM, so the browser
  nests the popovers: Escape closes the topmost, and focus returns to the
  submenu's trigger, which the browser does not do for a nested popover.
  - Right Arrow (Left right to left), Enter and Space open it with focus on
    its first item; Left Arrow in it closes it and focuses its trigger,
    reporting `arrow-key`; the parent's list moves back to the trigger at
    once, so focus is there while the submenu's exit animation runs. A key
    that moves through the parent, Up, Down, Home, End or a typed
    character, closes its open submenus (`arrow-key`).
  - The pointer resting on the trigger opens it after `delay` (default
    100 ms), and leaving the trigger and the submenu closes it, across the
    safe area to the submenu (`trigger-hover`). `delay` and `closeDelay`
    are on `Menu.Submenu`. A click opens it at once. Only a pointer that
    moves counts (`pointermove`), as in list navigation: Chromium sends
    boundary events to an element that appears under a still pointer, so
    `createHover`, which opens on `pointerenter`, opened a submenu by itself
    when a menu opened by the keyboard under the mouse (found in the tests).
    The trigger keeps its own timer and calls `trackSafeArea`, which also
    keeps `hover/hover` out of the bundle.
  - It is placed on the inline end of its trigger, `"right"`, or `"left"`
    right to left, aligned to the start, flipping when there is no room.
- **Focus returns to the Trigger after an item in a submenu.** Hiding the
  submenus first moves focus out of the menu before its own `beforetoggle`,
  so a menu notes whether focus was inside when it begins to close with
  its submenus, and returns it to its trigger.
- **Closing.** Escape and a press outside are the browser's (`escape-key`,
  `outside-press`); the Trigger closes it (`trigger-press`); activating an
  item closes every menu (`item-press`); Tab and Shift+Tab out of the menu
  that has focus close every menu (`focus-out`), and focus goes where the
  key sent it. Shift+Tab from a submenu lands on its trigger, which keeps
  the parent's tab stop; focus goes on to the Trigger, outside the menus.
  Only a Tab closes on focus leaving: a press outside closes by light
  dismiss, with its own reason, and a focus moved by script leaves the menu
  open.
- **`data-open` and `data-closed`** are on the Trigger and the Popup, and a
  SubmenuTrigger carries its submenu's. Items carry `data-active`,
  `data-disabled`, and `data-checked` or `data-unchecked`.
- **Placement** as Popover's (PLAN.md section 8, "Positioned popups"):
  `side`, `align`, `sideOffset`, `alignOffset`, `collisionPadding` and
  `anchor` on the Popup; `offset`, `flip` and `shift`. A menu's `side`
  defaults to `"bottom"` and its `align` to `"start"`, so it lines up with
  its Trigger's edge.
- **`returnFocus`** is a prop of the Popup, as on Popover; there is no
  `initialFocus`, since focus goes to an item.
- **Shared with Context Menu and Menubar**: they import Menu's parts, as
  Alert Dialog does Dialog's (PLAN.md section 6, rule 4). The Popup takes
  its `anchor` from outside, so a Context Menu places it at the pointer.
  A Menubar wraps the Trigger and sets three fields of a menu's state that
  a Menu leaves alone (`src/menubar/README.md`): `keepFocus`, which leaves
  focus on the bar for the next opening instead of the first item;
  `along`, which Right Arrow on an item with no submenu and Left Arrow in
  the Root's menu call to move along the bar, where in a Menu they do
  nothing; and `hoverOpened`, with which a press on the Trigger of a menu
  that hover just opened keeps it open and moves focus into it.
- **The server renders a `defaultOpen` Menu closed**, and hydration opens
  it, as Popover does.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element against the part conventions. "A" marks a case the WAI-ARIA
menu button or menu pattern requires, "C" a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no `popover`, no layout and no real
input. In jsdom an opened popover gets `:popover-open` from a stub
(`test/popover/stubPopover.ts`).

`root/MenuRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default: the Popup is not shown, and the Trigger and Popup have `data-closed`
- `defaultOpen` starts open, with `data-open`, and focus on the first item (A)
- Uncontrolled: the Trigger opens it and closes it again; `onOpenChange` gets each value with its reason and event (`trigger-press`)
- Controlled open: the Trigger only asks, and the menu stays open
- Controlled closed: the Trigger only asks, and the menu stays closed
- Follows a controlled value changed from outside, with focus on the first item when it opens

`trigger/MenuTrigger.test.tsx`

- Renders a button with type `button`, `aria-haspopup="menu"`, `popovertarget` and `aria-controls` naming the Popup (A)
- `aria-expanded` is `"false"` while closed and `"true"` while open (A)
- Named by its content, and takes the consumer's `id`
- Enter and Space open the menu with focus on the first item (A, C)
- Down Arrow opens it with focus on the first item, Up Arrow with focus on the last (A)
- A press on the open menu's Trigger closes it and does not open it again (C)
- Calls the consumer's `onClick` once per click
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Menu.Root`

`popup/MenuPopup.test.tsx`

- Renders a `<div popover="auto">` with the `menu` role and the Root's `id`, hidden until opened (A)
- Labelled by its Trigger; the consumer's `aria-labelledby` wins; without a Trigger, an `aria-label` names it (A)
- Opened, it is in the top layer and not modal: a button outside can still be pressed (C)
- Placed below its Trigger, aligned to its start, with `data-side` and `data-align`; `side`, `align` and the offsets move it (C)
- Placed against `anchor` instead of the Trigger (C)
- Escape closes it, reporting `escape-key`, and returns focus to the Trigger (A, C)
- A press outside closes it, reporting `outside-press` (C)
- Tab closes it, reporting `focus-out`, and focus moves to the element after the Trigger (A, C)
- Shift+Tab closes it, and focus moves to the Trigger (A, C)
- `returnFocus` moves focus elsewhere once it has closed (C)
- Throws a descriptive error outside `Menu.Root`

`item/MenuItem.test.tsx`

- Renders a `<div role="menuitem">`; the active item has `tabindex="0"` and `data-active`, the others `tabindex="-1"` (A)
- Down and Up move to the next and previous item, wrapping; Home and End to the first and last (A)
- The pointer moving onto an item makes it active (C)
- A printable character moves to the next item that starts with it; `label` is matched instead of the content (A)
- Click, Enter and Space call `onClick` and close the menu, reporting `item-press`, with focus back on the Trigger (A)
- A disabled item has `aria-disabled` and `data-disabled`, is reached by the keys, and neither calls `onClick` nor closes the menu when activated (A)
- An item rendered as a link follows it on Enter, once (C)
- A disabled item rendered as a link is not followed on a click or Enter

`checkbox-item/MenuCheckboxItem.test.tsx`

- Renders a `menuitemcheckbox` with `aria-checked` and `data-checked` or `data-unchecked` (A)
- Uncontrolled: a click checks it and closes the menu; `onCheckedChange` gets the value
- Space changes it and keeps the menu open; Enter changes it and closes the menu (A)
- Controlled: activating it only asks
- `Menu.ItemIndicator` inside it carries its state and is `aria-hidden`

`radio-group/MenuRadioGroup.test.tsx`

- Renders a `<div role="group">`, named by its `Menu.GroupLabel`
- Uncontrolled: a click on a RadioItem checks it, unchecks the others and closes the menu; `onValueChange` gets the value (A)
- Space checks a RadioItem and keeps the menu open (A)
- Controlled: activating a RadioItem only asks; `null` checks none
- A RadioItem has `aria-checked`, `data-checked` or `data-unchecked`, and its `Menu.ItemIndicator` the same (A)

`group/MenuGroup.test.tsx`

- Renders a `<div role="group">` named by its `Menu.GroupLabel` while one is rendered; the consumer's `aria-labelledby` wins
- A GroupLabel takes the consumer's `id`; the server HTML names none (it registers once mounted)

`submenu/MenuSubmenu.test.tsx`

- A SubmenuTrigger is a `menuitem` of the parent menu, with `aria-haspopup="menu"`, `aria-expanded` and `aria-controls` naming its Popup, labelled by it (A)
- Its trigger keeps its own text as its name while the submenu is open, in Chromium's accessibility tree (A, C)
- Right Arrow, Enter and Space open the submenu with focus on its first item, reporting `arrow-key` or `trigger-press` (A, C)
- Left Arrow closes it and focuses its trigger, reporting `arrow-key` (A, C)
- Left Arrow focuses its trigger at once, while the submenu's exit animation runs (C)
- Right to left, Left Arrow opens it and Right Arrow closes it, and it is placed on the left (C)
- Escape closes the submenu only, and focus returns to its trigger (A, C)
- Down Arrow in the parent closes its open submenu (C)
- Typing that moves through the parent closes its open submenu (C)
- A click opens it, and leaves focus on its trigger (C)
- Activating an item in a submenu closes every menu, with focus back on the Trigger (A, C)
- Placed at the inline end of its trigger, aligned to its start (C)
- A disabled SubmenuTrigger opens nothing

`Menu.submenu.test.tsx`, flows across menus, with real input (C)

- The pointer resting on a SubmenuTrigger opens its submenu after `delay`, and leaving to a sibling item closes it (`trigger-hover`)
- The pointer crossing the safe area diagonally, over a sibling item, reaches the submenu without closing it
- Submenus two levels deep open and close by keyboard: Right, Right, Left, Left, back on the first trigger
- Submenus two levels deep open by pointer, and an item in the deepest closes every menu
- Tab from a submenu closes every menu
- Shift+Tab from a submenu closes every menu, with focus on the Trigger
- Typeahead in a submenu moves in the submenu only

`test/menu/Menu.hydrate.test.tsx`

- The server HTML has the Trigger and a hidden Popup, linked by ids, with no item active
- A `defaultOpen` Menu renders closed on the server, with `data-open`
- Hydration adopts the server's elements without warnings, and opens a `defaultOpen` Menu
- Opens by click and by Enter after hydration (C)

## Left out

| Case                                                    | Reason                                                                                                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A Separator part                                        | A native `<hr>` is a separator inside a `menu` (Decisions)                                                                                      |
| An Arrow                                                | Menus seldom point; the Popup would carry its slot in every app (Decisions)                                                                     |
| A modal Menu                                            | A Dialog; a flag would ship the Tab wrap and the scroll lock in every app (PLAN.md section 6, rule 6)                                           |
| A click on a checkbox or radio item that keeps it open  | Space does it, as the pattern's optional Space; a prop would be a flag. Revisit if asked                                                        |
| Typing on a closed Menu's Trigger                       | The pattern types in an open menu only (`floating/typeahead/README.md`)                                                                         |
| A press on the Trigger, dragged to an item and released | Not in the pattern; it needs pointer capture across the top layer                                                                               |
| An exit animation after Escape or a press outside       | The browser hides the popover, and `beforetoggle` cannot be cancelled on closing (`src/popover/README.md`)                                      |
| `initialFocus`                                          | Focus goes to an item (Decisions)                                                                                                               |
| `size` and `hide` (`--available-height`)                | No part carries them, and a prop would be a flag; `flip` and `shift` keep the menu in view. Add with a long menu that scrolls, such as Select's |
| A Trigger outside the Root, several Triggers            | As for Popover: control `open` and pass `anchor`                                                                                                |
| A focus moved out by script closes the menu             | Only Tab closes on focus leaving; a press outside is light dismiss (Decisions)                                                                  |
| Horizontal menus                                        | No Phase 3 menu is horizontal; Menubar's bar is horizontal, and its menus are Menu's (#101)                                                     |
| Firefox and WebKit                                      | Tests run in Chromium (PLAN.md section 5)                                                                                                       |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite).
No screen reader has been tried yet.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-23.

| Entry point   | Size     | Budget  |
| ------------- | -------- | ------- |
| `menhir/menu` | 11,901 B | 13.5 kB |

Menubar's fields in a menu's state (Decisions, "Shared with Context Menu
and Menubar") added 78 B, from 11,823 B: the arrow keys' path to the bar,
the opening that keeps focus, and the Trigger's press after hover (#101).

The budget was set before the behaviour, at about Popover's (9.6 kB)
without its Title, Description, Close and Arrow, plus `roving` (1,005 B),
`typeahead` (598 B), the safe area and the item parts. Most of it is
`@floating-ui/dom`, as for Popover. An app that renders no Submenu bundles
neither the SubmenuTrigger nor the safe area (`test/package`).
