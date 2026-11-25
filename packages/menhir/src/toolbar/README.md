# Toolbar

A row of controls, such as the buttons above a text editor, that is one
tab stop, with arrow keys between them. Controls of other components join
it through `render`, as a control joins a Field, and keep their own keys
(#209). It follows the WAI-ARIA toolbar pattern and imports only `core`;
the tab stop is `core/rovingFocus.ts`, as in Toggle Group and Tabs.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Read       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 2026-11-25 |
| WAI-ARIA [toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) (no date on the page). The role `toolbar`, for three or more controls, named by `aria-labelledby` or `aria-label`, with `aria-orientation="vertical"` when vertical. One tab stop: the first control that is not disabled, and optionally the one that last had focus. Left and Right in a horizontal toolbar, Up and Down in a vertical one, optionally wrapping; Home and End optional. The other pair may duplicate them or stay free for controls that need it, such as a spin button. Avoid a control that needs the toolbar's own arrows; if one is needed, make it the last, such as a text field at the end of a horizontal toolbar. Disabled controls may stay focusable where discoverability matters | 2026-11-25 |
| WAI-ARIA [toolbar example](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/examples/toolbar/) (last updated 2025-08-12): toggle buttons, a radio group whose Left and Right are the toolbar's and whose Up and Down move among its radios and wrap, Cut, Copy and Paste with `aria-disabled` so that they stay focusable, a menu button that opens on Enter, Space, Down and Up, a spin button that keeps Up and Down, a checkbox and a link; Left and Right wrap, Home and End move to the ends, and do nothing while focus is in the open menu                                                                                                                                                                                                                                             | 2026-11-25 |
| WAI-ARIA [keyboard interface practice](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), "Focusability of disabled controls": native `disabled` where a control's presence can be inferred from its neighbours, `aria-disabled="true"` where it must stay discoverable, naming the toolbar example's Cut, Copy and Paste; Tab into a toolbar focuses its first control                                                                                                                                                                                                                                                                                                                                                                                                          | 2026-11-25 |
| Size: PLAN.md section 6, rules 3, 4 and 6. Tabs and Toggle Group do not grow: `core/rovingFocus.ts` is used as it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 2026-11-25 |

## Shape

`Toolbar.Root` renders a `<div role="toolbar">`. Each control in it is an
item: `Toolbar.Button` (a `<button type="button">`), `Toolbar.Link` (an
`<a>`) or `Toolbar.Input` (an `<input>`). A control of another component
is an item through `render`.

### Decisions

- **Parts: Root, Button, Link and Input.** An item is a part because it
  takes part in the tab stop: it registers with the Root once mounted and
  carries the roving `tabindex`. The three differ only in their element:
  Button sets `type="button"`, which would turn an `<input>` into a
  button, and a link and a text field are the toolbar example's other
  kinds of control. Each is bundled only by an app that renders it.
- **No Group part.** A `<div role="group" aria-label>` around some items
  is native and needs nothing from the Root; Toggle Group's Root renders
  one.
- **No Separator part.** A separator between items is Menhir's own,
  `Separator.Root` from `menhir/separator`, imported by the app, with the
  orientation across the toolbar's: `orientation="vertical"` in a
  horizontal toolbar. It is not an item, so arrow keys pass it. Toolbar
  imports only `core`, so it cannot render one itself, and a copy in a
  part would make an app with both pay twice.
- **A control of another component joins through `render`**, as a control
  joins a Field: `<Toolbar.Button render={Toggle.Root}>`, or a function
  that adds the control's own props,
  `render={(p) => <Toggle.Root {...p} pressed={bold()} />}`. Toolbar's
  props reach the control as a consumer's: its `tabindex` wins over the
  control's own, and the control's handlers run after Toolbar's. No
  control reads a context of Toolbar's, so a control outside a toolbar
  pays nothing.
- **The controls that join**, each keeping its own keys:
  - **Toggle**: `render={Toggle.Root}`. Enter and Space press it, natively.
  - **Toggle Group**: `ToggleGroup.Root` inside the toolbar, around items
    that are each `<Toolbar.Button render={(p) => <ToggleGroup.Item {...p} value="left" />}>`.
    Its items are the toolbar's: one tab stop for the whole toolbar, and
    the toolbar's arrow keys move into, through and out of the group, as
    the radio group in the toolbar example. The group still holds the
    value. A vertical group in a horizontal toolbar keeps Up and Down
    among its own items, wrapping, as the example's radio group does.
  - **A Menu's Trigger**: `render={Menu.Trigger}` inside `Menu.Root`.
    Down, Up, Enter and Space open the menu, as outside a toolbar. Keys in
    the open menu are the menu's, since its items are not the toolbar's.
  - **A Select's Trigger**: `render={Select.Trigger}` inside `Select.Root`.
    Down, Up, Enter, Space and typing open the list. Home and End, which
    open it outside a toolbar, are the toolbar's while it is closed; while
    it is open every key is the Select's, since focus stays on the
    Trigger.
  - **Input**: `Toolbar.Input`, or `<Toolbar.Input render={(p) => <Input.Root {...p} />}>`.
    A text field keeps Home and End, and the toolbar's arrow keys while its
    caret can move that way: Left (or Up) moves on to the previous control
    only with the caret at the start, Right (or Down) to the next only with
    it at the end, and a selection keeps both. An arrow key that moves
    focus into a text field puts the caret on the side focus came from,
    at the end from the right and at the start from the left, so the next
    arrow key moves the caret. So it may sit anywhere, though the pattern
    advises the end. These rules are `Toolbar.Input`'s, handed to the Root
    when it registers, so a toolbar without one bundles none of them; a
    text field rendered through `Toolbar.Button` has none.
  - Any other button, such as a Popover's, Tooltip's, Switch's or
    Checkbox's, joins the same way through `Toolbar.Button`.
- **The toolbar's keys are its own.** The Root listens for `keydown` in
  the capture phase, before any control, and acts only on a key pressed
  on one of its items. Left and Right in a horizontal toolbar, mirrored
  right to left, or Up and Down in a vertical one, then Home and End, move
  focus and wrap; the default action is cancelled and the event goes no
  further, so the control under focus does not act on it too (a Toggle
  Group item would move focus again). Every other key is the control's:
  Up and Down in a horizontal toolbar open a Menu or a Select and step a
  Number Field. With Alt, Control, Meta or Shift held, the keys are left to
  the browser and the app.
- **Except a control that keeps focus while its popup is open:** an item
  with `aria-activedescendant`, which a Select's Trigger and a Combobox's
  input name their active item in only while open, gets every key. Not
  every open popup: a Popover's Trigger with its popover open, or a Menu's
  after Escape, moves on with the arrow keys.
- **Orientation:** `orientation`, horizontal by default, as the role is;
  `aria-orientation="vertical"` only when vertical. `data-horizontal` or
  `data-vertical` on the Root.
- **Right to left:** the toolbar's computed `direction`, as in Toggle
  Group.
- **Wrapping always; no `loop` prop.** The pattern makes wrapping optional
  and the example wraps. `core/rovingFocus.ts` always wraps, and a flag
  would grow Tabs and Toggle Group, or need a copy of the roving focus.
  A toolbar of several rows wraps from row to row in document order.
- **Home and End** move to the first and last item that can take focus.
- **Disabled controls stay reachable.** `disabled` on an item renders
  `aria-disabled="true"` and `data-disabled`, not native `disabled`, as
  the toolbar example's Cut, Copy and Paste and the keyboard interface
  practice's second convention. The item keeps its place in the arrow
  order, so a screen reader user finds it. `disabled` on the Root disables
  every item, and puts `data-disabled` on the Root.
- **A disabled item does nothing.** In the capture phase, the Root cancels
  a click on it and stops the event, so neither the consumer's `onClick`
  nor a joined control's own handler runs, and Enter and Space, which
  click a button, do nothing either; a link does not navigate, nor open in
  a new tab on a middle click (`auxclick`). A key
  without Alt, Control or Meta, other than Tab and the toolbar's own,
  stops there too, so Down does not open a disabled Menu, and Enter is
  cancelled, so a disabled text field submits no form. A disabled Input is
  `readonly` as well, so typing changes nothing.
- **The tab stop** is the item that last had focus, else the first item
  that is not disabled, else the first item. The server HTML gives it to
  the first item that is not disabled, or to the first item of a toolbar
  disabled on its Root. Tab into the toolbar from either side lands on
  it.
- **An exception to "Nothing cancels the part's handler"** (PLAN.md
  section 8), recorded there: the keys the toolbar uses, and every event
  on a disabled item, stop in the Root before any handler of the item,
  the consumer's included. A joined control's handler would otherwise act
  on the same key, and a disabled control's on the same click.
- **A control disabled natively**, such as a Toggle Group's item with its
  own `disabled`, cannot take focus, so arrow keys skip it.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part against
the part conventions. "A" marks a case the WAI-ARIA toolbar pattern
requires, "E" one the toolbar example shows.

`root/ToolbarRoot.test.tsx`

- Renders a `<div>` with role `toolbar` (A)
- `aria-label` and `aria-labelledby` pass through (A: label)
- No `aria-orientation` by default, `aria-orientation="vertical"` when vertical (A)
- `data-horizontal` by default, `data-vertical` with `orientation="vertical"`, and they follow changes
- `disabled`: `data-disabled` on the Root, and every item `aria-disabled`, following changes

`button/ToolbarButton.test.tsx`

- Renders a `<button>` of type `button`, named by its content
- `disabled`: `aria-disabled="true"` and `data-disabled`, not natively disabled, and still focusable (E)
- A click calls the consumer's `onClick`; a click on a disabled button does not (E)
- Enter and Space on a disabled button call no `onClick` (E)
- `render` with a button component keeps the item's behaviour (PLAN.md "Polymorphism")
- Throws a descriptive error outside `Toolbar.Root`

`link/ToolbarLink.test.tsx`

- Renders an `<a>` with the consumer's `href`, named by its content (E)
- `disabled`: `aria-disabled="true"`, and a click neither navigates nor calls `onClick`; a middle click is cancelled
- Throws a descriptive error outside `Toolbar.Root`

`input/ToolbarInput.test.tsx`

- Renders an `<input>`, named by `aria-label`
- `disabled`: `aria-disabled="true"`, `readonly`, focusable; Enter is cancelled
- Throws a descriptive error outside `Toolbar.Root`

`Toolbar.keyboard.test.tsx`

- Tab focuses the first item, and Tab again leaves the toolbar: one tab stop (A)
- Tab skips a disabled first item (A: first control that is not disabled)
- Shift+Tab back in focuses the item that last had focus (A: optional)
- Right and Left move focus in a horizontal toolbar and wrap at the ends (A, E)
- Down and Up move focus in a vertical toolbar and wrap (A: note 1)
- Up and Down do nothing in a horizontal toolbar; Left and Right do nothing in a vertical one
- Home and End focus the first and the last item (A: optional; E)
- Arrow keys reach a disabled item (A: note 2; E)
- Arrow keys skip an item disabled natively
- Arrow keys cancel their default action, so the page does not scroll
- With Alt, Control, Meta or Shift, arrow keys, Home and End are left to the browser
- Passes a separator between items, which takes no focus
- The consumer's `onKeyDown` on an item gets the keys the toolbar leaves, not those it uses
- Keys on an element inside the toolbar that is not an item are left alone
- Right to left: Left moves to the next item and Right to the previous one (Chromium: jsdom computes no `direction`)
- The tab stop moves on when the item that had it is removed
- An item added later takes its place in the order of the document
- Text field: Left and Right move the caret; Left at the start moves to the previous item, Right at the end to the next (A: text field)
- Text field: an arrow key that moves focus into it puts the caret on the side focus came from
- Text field: Home and End move the caret, not focus; a selection keeps the arrow keys

`Toolbar.controls.test.tsx`

- Toggle: joins the tab stop and the arrow keys; Space presses it; disabled, it stays focusable and neither a click nor Space presses it (E)
- Toggle Group: its items are the toolbar's, one tab stop for the toolbar, and Right moves into, through and out of the group and wraps; Space presses an item in the group (E: radio group)
- Toggle Group: a vertical group in a horizontal toolbar moves among its own items with Down and Up, and the toolbar with Right and Left (E: radio group)
- Menu: Right and Left pass its Trigger; Down opens the menu on its first item; Right in the open menu does not move the toolbar; Escape returns focus to the Trigger (E: menu button)
- Menu: a disabled Trigger stays focusable, and neither a click nor Down opens the menu
- Popover: Right and Left move on from its Trigger while its popover is open
- Select: Right and Left pass its Trigger; Down opens the list; while it is open, Right, Left, Home and End are the Select's and focus stays on the Trigger
- Input: `Input.Root` joins through `Toolbar.Input`'s `render` and keeps its caret keys (A: text field)

`test/toolbar/Toolbar.hydrate.test.tsx`

- The server HTML has the toolbar, its name, its orientation's `data-*` attribute, the items' `aria-disabled`, and one tab stop on the first item that is not disabled, before any script runs (PLAN.md section 10)
- The server HTML of a toolbar disabled on its Root has one tab stop, on the first item
- Hydration adopts the server's elements without warnings; arrow keys, reaching a disabled item, and a press work afterwards

## Left out

| Case                                                       | Reason                                                                                                                                                                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Turning wrapping off (`loop`)                              | See "Decisions": `core/rovingFocus.ts` always wraps, and a flag would grow Tabs and Toggle Group or copy the roving focus                                                                                        |
| Up and Down duplicating Left and Right                     | The pattern allows either, and keeps them free for the controls that need them: a Menu's and a Select's Trigger open on Down, a Number Field steps on Up and Down                                                |
| A Group or Separator part                                  | See "Decisions": a native group, and Menhir's Separator                                                                                                                                                          |
| A shortcut key that moves focus to the toolbar             | The pattern recommends one for an editor's toolbar, which the app documents and binds                                                                                                                            |
| `aria-controls` naming what the toolbar acts on            | The example names its text area; the consumer passes it to the Root                                                                                                                                              |
| Typeahead                                                  | Not in the pattern                                                                                                                                                                                               |
| A Slider in a horizontal toolbar                           | Its Left and Right are the toolbar's, as the pattern advises against controls that need the toolbar's arrows; it keeps Up and Down                                                                               |
| The tab stop following a control disabled natively         | Toolbar does not see a joined control's own `disabled`, so the tab stop, in the server HTML too, may be on a control that cannot take focus; Toolbar's `disabled`, which keeps the control focusable, is the way |
| A server tab stop when every item is disabled on its own   | An item cannot know, when it is rendered, whether a later one is enabled; a toolbar whose every control is disabled passes `disabled` to its Root, and gets one                                                  |
| Keys on a disabled item reaching the app's own listeners   | Stopped with those of the control, but keys with Alt, Control or Meta, which shortcuts use, and Tab                                                                                                              |
| `data-*` attributes for an item's orientation              | The Root carries the orientation, which CSS reaches from the item as `[data-vertical] .item`                                                                                                                     |
| Keyboard modifiers in a callback, and canceling navigation | No callback for navigation, and no opt-out of the toolbar's keys; a control that needs them is placed last, or in a vertical toolbar                                                                             |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite)
and jsdom. Other browsers and screen readers have not been tried yet: that
needs a person (#226).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25.

| Entry point                       | Size    | Budget |
| --------------------------------- | ------- | ------ |
| `menhir/toolbar`, every part      | 2,028 B | 2.3 kB |
| `menhir/toolbar`, Root and Button | 1,783 B |        |
| `menhir/tabs`                     | 2,019 B | 2.4 kB |
| `menhir/toggle-group`             | 1,902 B | 2.3 kB |

The text field's caret rules are `Toolbar.Input`'s: moving them out of the
Root saved a toolbar without one 44 B (1,827 B before), and cost a toolbar
with every part 55 B (1,973 B before), for handing them over.

Tabs and Toggle Group are unchanged: Toolbar uses `core/rovingFocus.ts` as
it is, and changes nothing in `core` but a comment. The Root has a copy of
the keys that move to the previous and the next item (Left and Right,
mirrored right to left, or Up and Down), which it needs before the roving
focus is asked. A helper shared from `core/rovingFocus.ts` instead grew
Tabs and Toggle Group by 6 B each and Radio by 11 B (measured on
2026-11-25), so the two copies stay, each naming the other.
