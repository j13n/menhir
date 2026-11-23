# Context Menu

A menu of actions for an area of the page that opens at the pointer on a
secondary-button press, such as "Copy, Rename, Delete" for a file in a
list. It is Menu (`src/menu/README.md`) opened by the `contextmenu` event
from an area instead of by a button, so it follows the WAI-ARIA menu and
menubar pattern and the list popup conventions (PLAN.md section 8, "API
conventions", "List popups") (#100).

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Read       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 2026-11-23 |
| WAI-ARIA [menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) (no date on the page). There is no context menu pattern. This one names a menu opened "by invoking a command, such as Shift + F10 in Windows, that opens a context specific menu"; focus goes to the first item when a menu opens; Escape closes the menu that contains focus and returns focus to "the element or context … from which the menu was opened"; Tab closes every menu; a menu with no controlling button is named by `aria-label` | 2026-11-23 |
| What Chromium does, tried through the test suite (below): which events a secondary-button press, the Menu key and a touch long press fire, with which `button`, `pointerType` and point, and what light dismiss does with a secondary-button press                                                                                                                                                                                                                                                                                     | 2026-11-23 |
| Size: PLAN.md section 6, rules 3, 4 and 6. The budget was set before the behaviour (below)                                                                                                                                                                                                                                                                                                                                                                                                                                             | 2026-11-23 |

## Shape

`ContextMenu.Root` renders no element: it holds whether the menu is open.
`ContextMenu.Trigger` renders a `<div>`, the area that opens the menu.
`ContextMenu.Popup` renders Menu's `<div popover="auto" role="menu">`,
placed at the pointer. The items, groups and submenus are Menu's parts,
re-exported under the same names.

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger>Right-click here</ContextMenu.Trigger>
  <ContextMenu.Popup aria-label="File">
    <ContextMenu.Item onClick={copy}>Copy</ContextMenu.Item>
    <ContextMenu.Item onClick={rename}>Rename</ContextMenu.Item>
    <hr />
    <ContextMenu.Submenu>
      <ContextMenu.SubmenuTrigger>Share</ContextMenu.SubmenuTrigger>
      <ContextMenu.Popup>
        <ContextMenu.Item>Email</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Submenu>
  </ContextMenu.Popup>
</ContextMenu.Root>
```

### Decisions

- **It builds on Menu**, as Alert Dialog builds on Dialog (#32; PLAN.md
  section 6, rule 4): `popupBases` names the pair, so an app that uses
  both pays for the shared code once. Root, Trigger and Popup are its own.
  Item, CheckboxItem, ItemIndicator, Group, GroupLabel, RadioGroup,
  RadioItem, Submenu and SubmenuTrigger are Menu's, re-exported.
- **The Root** is Menu's state (`open`, `defaultOpen`, `onOpenChange`), plus
  where the menu was asked for, which the Trigger sets and the Popup is
  placed against.
- **The Popup is a thin wrapper over Menu's Popup**, which passes the point
  as its default `anchor`. Menu's Popup already takes an anchor (an
  element, a virtual element or a function), so it needs no split into a
  render function. Inside a Submenu the wrapper passes nothing, and the
  submenu is placed against its SubmenuTrigger, as in Menu. A consumer's
  `anchor` wins.
- **Opening.** The browser fires `contextmenu` for a secondary-button
  press, for Ctrl+click on macOS, for Shift+F10 and the Menu key, and on
  Android for a touch long press, so the Trigger listens for that one
  event. It calls `preventDefault()`, so the browser's own menu does not
  show, and opens the menu, reporting `trigger-press`: the area is the
  menu's Trigger, pressed. Focus goes to the first item, as the pattern
  says, whatever opened it.
- **Placement: at the pointer for a press, at the element for the
  keyboard.** A press puts the menu's top-left corner at the pointer
  (`side` `"bottom"`, `align` `"start"` against a point, Menu's defaults);
  `flip` and `shift` keep it in view, so near the bottom edge its
  bottom-left corner is at the pointer. A `contextmenu` from the keyboard
  places it below the focused element the event was fired at, aligned to
  its start, as a Menu sits below its Trigger. Chromium gives a key's
  `contextmenu` the middle of that element as its point, which would put
  the menu over it.
  - The keyboard is told apart by the event: Chromium sends a key's
    `contextmenu` with `button` `-1` and `pointerType` `"mouse"`, and the
    Pointer Events spec with `pointerType` `""` (a device it cannot
    detect). A long press also has `button` `-1` in Chromium, but
    `pointerType` `"touch"`, so it is placed at the finger. A browser that
    sends neither, such as one whose `contextmenu` is a `MouseEvent`,
    places the menu at the event's point.
- **Touch.** Where the browser fires `contextmenu` on a long press, as
  Chrome on Android does, the menu opens at the finger. iOS Safari fires
  none, so a long press there opens nothing, and the browser shows its own
  callout or selection. No long-press timer is written: it would cost a
  timer and pointer tracking in every app, fight the browser's text
  selection, and add a second way to open. An app that needs a menu on iOS
  gives the same actions a Menu button too.
- **The Trigger area is not a button.** It is a plain `<div>` with no
  role, and no `aria-haspopup`, `aria-expanded` or `aria-controls`, which
  ARIA does not allow on an element with no role. It has `data-open` and
  `data-closed`, so its look can follow the menu, and `data-disabled`. It
  takes no `tabindex`: the keyboard opens the menu from a focused element
  inside the area, or from the area itself if the consumer gives it
  `tabindex="0"`. A screen reader is not told that the area has a menu;
  there is no ARIA attribute for it.
- **`disabled`** on the Trigger: it calls no `preventDefault()`, so the
  browser's own menu shows instead, and opens nothing.
- **A second `contextmenu` while open moves the menu**: it closes the open
  submenus, places the menu at the new point and moves focus back to the
  first item, reporting nothing, since the menu stays open. Chromium's
  light dismiss leaves the menu open on a secondary-button press, even when
  the release lands outside the menu once it has moved, so no close and
  reopen happens (tried in Chromium).
- **A `contextmenu` inside the menu is cancelled**, by every Popup, so
  the browser's own menu does not show over it: a right-click on an item,
  or the Menu key with focus on one, does nothing. It does not move the
  menu, which already holds focus. The consumer's `onContextMenu` is still
  called.
- **The Popup is labelled by nothing by default.** The area is no label,
  so the Root has no trigger id to name. The consumer names the menu with
  `aria-label`, as the pattern says for a menu that no button controls.
- **Placed against the area before the first `contextmenu`.** A
  `defaultOpen` menu, or one opened by a controlled `open`, has no point
  yet, so it is placed below the area, aligned to its start. Afterwards it
  opens at the last point; pass `anchor` to place it elsewhere.
- **Focus returns where it was.** Escape and an activated item close the
  menu, and the browser returns focus to the element that had it when the
  menu opened: the element the keyboard opened it from, or after a press,
  the element the press focused, such as the area if it is focusable. Tab
  and Shift+Tab close every menu, as in Menu, and focus goes where the key
  sent it.
- **Menu's state takes the element the menu opens from as its trigger**:
  the Trigger hands it the focused element when it opens the menu, or
  nothing if focus was on the `<body>`. The browser does not
  return focus from a submenu, since only the first popover of a stack
  keeps the element focused before it, so after an item in a submenu, or
  Shift+Tab from one, Menu returns focus there itself. Without it focus was
  left on the `<body>`: Menu's submenu tests, run in a Context Menu, found
  it. A press on that element while the menu is open closes it as a press
  outside, but is reported as `trigger-press`, the press on the element it
  opened from.
- **Everything else is Menu's**: the items and their activation, checkbox
  and radio items, typeahead, submenus, wrapping, Escape, a press outside,
  `focus-out`, `side`, `align`, the offsets, `collisionPadding` and
  `returnFocus` (`src/menu/README.md`, "Decisions").
- **The server renders a `defaultOpen` Context Menu closed**, and hydration
  opens it, as Menu does.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the Trigger and the
Popup against the part conventions. "A" marks a case the WAI-ARIA menu
pattern requires, "C" a case that runs only in Chromium
(`it.skipIf(isJSDOM)`), with real input through the DevTools protocol.
In jsdom an opened popover gets `:popover-open` from a stub
(`test/popover/stubPopover.ts`).

`root/ContextMenuRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default: the Popup is not shown, and the Trigger and Popup have `data-closed`
- `defaultOpen` starts open, with `data-open`, focus on the first item, and placed below the Trigger (A, C for the placement)
- Uncontrolled: a `contextmenu` on the Trigger opens it; `onOpenChange` gets `true` with `trigger-press` and the event
- Controlled closed: a `contextmenu` only asks, and the menu stays closed
- Follows a controlled value changed from outside, with focus on the first item when it opens

`trigger/ContextMenuTrigger.test.tsx`

- Renders a `<div>` with no role, no `aria-haspopup`, `aria-expanded`, `aria-controls` or `tabindex`, and `data-closed` or `data-open`
- A `contextmenu` on it is cancelled and opens the menu with focus on the first item (A)
- A secondary-button press opens the menu with its top-left corner at the pointer, and it stays open once the button is released (C)
- Near the viewport's bottom edge, the menu flips above the pointer and still stays open on release (C)
- The Menu key on a focused element inside the area opens the menu below that element, with focus on the first item (A, C)
- A long press's `contextmenu`, as Chromium on macOS sends it (`button` `-1`, `pointerType` `"touch"`), opens the menu at the finger (C)
- A second secondary-button press while open moves the menu to the new point without closing it, closes its open submenu and focuses the first item (C)
- `disabled`: a `contextmenu` is not cancelled, the menu does not open, and the Trigger has `data-disabled`
- Calls the consumer's `onContextMenu`
- Throws a descriptive error outside `ContextMenu.Root`

`popup/ContextMenuPopup.test.tsx`

- Renders Menu's `<div popover="auto" role="menu">`, hidden until opened, labelled by nothing; an `aria-label` names it (A)
- Cancels a `contextmenu` inside it or a submenu's Popup, as the Menu key on a focused item sends it, and still calls the consumer's `onContextMenu`
- Placed against `anchor` instead of the point (C)
- Escape closes it, reporting `escape-key`, and returns focus to the element the keyboard opened it from (A, C)
- A press outside closes it, reporting `outside-press` (C)
- Tab closes it, reporting `focus-out` (A, C)
- A submenu's Popup is placed against its SubmenuTrigger, not the point (C)
- Throws a descriptive error inside a `Menu.Root`, and outside any Root

The items, groups and submenus are Menu's parts. Menu's tests for them
run twice, once in a Menu and once in a Context Menu (`test/menu/kinds.tsx`),
so each case below is checked in both:

- `item/MenuItem.test.tsx`: roles, the active item, the keys, wrapping, the pointer, typeahead, activation with `item-press` and focus returning, disabled items, links (A)
- `checkbox-item/MenuCheckboxItem.test.tsx`, `radio-group/MenuRadioGroup.test.tsx`, `group/MenuGroup.test.tsx`: checked state, Space and Enter, the indicator, groups and their labels (A)
- `submenu/MenuSubmenu.test.tsx` and `Menu.submenu.test.tsx`: opening and closing submenus by key, pointer and the safe area, Escape, Tab, typeahead, activating an item two levels deep (A, C)

`test/context-menu/ContextMenu.hydrate.test.tsx`

- The server HTML has the Trigger and a hidden Popup, with no item active
- A `defaultOpen` Context Menu renders closed on the server, with `data-open`
- Hydration adopts the server's elements without warnings, and opens a `defaultOpen` Context Menu
- Opens by a `contextmenu` and by the Menu key after hydration (C)

`test/package/build.test.ts`

- An app that uses Menu and Context Menu bundles the parts they share once

## Left out

| Case                                                | Reason                                                                                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A long-press timer for iOS Safari                   | Costs a timer and pointer tracking in every app, fights the browser's selection, and adds a second way to open (Decisions)                      |
| Nested Triggers, the innermost winning              | Not asked for; telling them apart needs a `defaultPrevented` check, which PLAN.md section 8 rules out, or a marker. Revisit if asked            |
| A secondary-button press outside the area closes it | Light dismiss counts only the primary button in Chromium; the browser's own menu shows there, and Escape or a press closes ours                 |
| Pressing, dragging to an item and releasing         | Not in the pattern; it needs pointer capture across the top layer, as for Menu                                                                  |
| A label for the Popup from the Trigger              | The area is no label; the consumer gives `aria-label` (Decisions)                                                                               |
| Telling a screen reader the area has a menu         | No ARIA attribute is allowed on an element with no role (Decisions)                                                                             |
| Firefox and WebKit                                  | Tests run in Chromium (PLAN.md section 5). Their `button` and `pointerType` for a key's `contextmenu` were not tried; the fallback is the point |

Menu's own left-out cases apply too (`src/menu/README.md`, "Left out").

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite),
on macOS and on Linux in CI: a secondary-button press and the Menu key,
sent through the DevTools protocol. Shift+F10 fires no `contextmenu` in
Chromium on macOS, so it was not tried. A long press sent the same way
fired a `contextmenu` on macOS but none on Linux, so the test dispatches
the event macOS fired, which is what the Trigger reads. No screen reader
has been tried yet (#135).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-23.

| Entry point                                      | Size     | Budget |
| ------------------------------------------------ | -------- | ------ |
| `menhir/context-menu`                            | 11,986 B | 13 kB  |
| `menhir/menu` and `menhir/context-menu` together | 12,154 B |        |

An app that already uses Menu pays 253 B for Context Menu: its Root,
Trigger and Popup wrapper (`test/package` checks that the shared parts are
bundled once). Context Menu did not change Menu's size (11,823 B then):
the longer error that names both Roots is development-only. Menubar's
fields in Menu's state added 61 B to Context Menu, from 11,925 B and
12,097 B together (#101).

The budget was set before the behaviour, at Menu's measured size
(11,823 B) without its Trigger, plus the Trigger's `contextmenu` handler
and the Popup's wrapper, with Menu's margin. Most of it is
`@floating-ui/dom`, as for Menu.
