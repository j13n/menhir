# Toggle Group

A set of toggle buttons that share one value: the user presses one to choose
it, or several when the group allows it. Each button is a Toggle; the group
gives them one tab stop and arrow-key navigation, as the WAI-ARIA toolbar
pattern does.

## Sources

| Source                                                                                                    | Read       |
| --------------------------------------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)                             | 2026-11-21 |
| [WAI-ARIA keyboard interface practice](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)     | 2026-11-21 |
| [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), for the items, as for Toggle | 2026-11-21 |

## Shape

`ToggleGroup.Root` renders a `<div role="group">`. `ToggleGroup.Item`
renders a native `<button type="button" aria-pressed>` with a `value`, built
as `Toggle.Root` is: both take their props from `core/toggleButton.ts`, since
components do not import each other (PLAN.md section 6, rule 4).

- **The value is an array** of the pressed items' values, in both modes, so
  that `value`, `defaultValue` and `onValueChange` have one type. Nothing
  pressed is `[]`. By default one item at a time is pressed: pressing another
  releases it, and pressing it again releases it. With `multiple`, each item
  presses on its own.
- **`role="group"`, not `toolbar`.** The toolbar pattern decides the keyboard
  behaviour, but its role is for a group of three or more controls, and a
  toggle group usually sits inside a toolbar (Toolbar, PLAN.md section 9),
  which a nested toolbar role would break. A toggle group that is the whole
  toolbar passes `role="toolbar"`, and the group then writes
  `aria-orientation="vertical"` when vertical, which the `group` role does
  not take.
- **One tab stop** (roving tabindex): the item that last had focus has
  `tabindex="0"` and the others `-1`. Before any item has focus, it is the
  first enabled item, as the keyboard interface practice names for toolbars.
  When that item is disabled or removed, the first enabled item takes over.
  The server HTML gives the first enabled item `tabindex="0"`. The roving
  focus is `core/rovingFocus.ts`, shared with Tabs.
- **Arrow keys move focus and wrap**: Left and Right in a horizontal group,
  Up and Down in a vertical one, and Home and End to the first and last
  item. They do not press anything; Enter and Space press the focused item,
  natively. In a right-to-left horizontal group, Left moves to the next item.
  With Alt, Control, Meta or Shift held, the keys are left to the browser
  and the app, such as Alt+Left for back.
- **Disabled items are skipped**, natively `disabled` as on Toggle. The
  group's `disabled` disables every item.
- **`data-*` attributes**: `data-horizontal`/`data-vertical` and
  `data-disabled` on the group; `data-pressed`/`data-unpressed` and
  `data-disabled` on each item, as on Toggle (PLAN.md section 8).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks both parts against the
part conventions. "A" marks a case the WAI-ARIA toolbar pattern, or the
button pattern for an item, requires.

`root/ToggleGroupRoot.test.tsx`

- Renders a `<div>` with role `group`
- `aria-label` and `aria-labelledby` pass through (A: label)
- The consumer's `role` replaces the part's own, for a group that is the whole toolbar
- A vertical toolbar has `aria-orientation="vertical"`; a group has no `aria-orientation` (A: orientation)
- `data-horizontal` by default, `data-vertical` with `orientation="vertical"`, and they follow changes
- Single by default: pressing an item presses it and releases the one pressed before; pressing it again releases it; `onValueChange` gets each value
- `multiple`: items press on their own; `onValueChange` gets each value
- `multiple`: two presses in one turn, before the flush, both count
- `defaultValue` presses the items with those values
- Controlled: stays put and asks with the requested value
- Follows a controlled value changed from outside
- Presses before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- `disabled`: every item is natively disabled, with `data-disabled` on the group and the items, and they follow changes

`item/ToggleGroupItem.test.tsx`

- Renders a button with type `button` and `aria-pressed` (A: toggle button)
- Named by its content; `aria-label` passes through (A: name)
- `data-pressed`/`data-unpressed` and `data-disabled`
- `disabled`: native `disabled`, not pressed by a click
- Calls the consumer's `onClick`, `onKeyDown` and `onFocus` with its own
- `render` with a button component keeps the item's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `ToggleGroup.Root`

`ToggleGroup.keyboard.test.tsx`

- Tab focuses the first item, and Tab again leaves the group: one tab stop (A)
- Tab skips a disabled first item (A: first control that is not disabled)
- Shift+Tab back into the group focuses the item that last had focus (A: optional)
- Right and Left move focus in a horizontal group and wrap at the ends (A)
- Down and Up move focus in a vertical group and wrap at the ends (A: note 1)
- Up and Down do nothing in a horizontal group; Left and Right do nothing in a vertical one
- Home and End focus the first and the last item (A: optional)
- Arrow keys skip disabled items (A: note 2)
- Arrow keys move focus without pressing; Enter and Space press the focused item (A)
- Arrow keys cancel their default action, so the page does not scroll
- With Alt, Control, Meta or Shift, arrow keys, Home and End are left to the browser
- Right to left: Left moves to the next item and Right to the previous one (Chromium: jsdom computes no `direction`)
- The tab stop moves to the first enabled item when the item that had it is disabled, or removed
- An item added later takes its place in the order of the document

`test/toggle-group/ToggleGroup.hydrate.test.tsx`

- The server HTML has the group, the items with `aria-pressed`, their names and `data-*` attributes, and one tab stop on the first enabled item, before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings; arrow keys, wrapping past a disabled item, and pressing work afterwards

## Left out

| Case                                                                            | Reason                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="toolbar"` by default                                                     | See "Shape": the role is for three or more controls and does not nest. A consumer passes it for a group that is the whole toolbar                                                                                                                         |
| Disabled items that stay focusable (`aria-disabled`)                            | The keyboard interface practice's first convention: an item is skipped when the user can infer it from its neighbours, as in a group of toggles. Focusable disabled items would need click blocking that every app would ship (PLAN.md section 6, rule 6) |
| Up and Down duplicating Left and Right in a horizontal group                    | The pattern allows either, and keeps them free for controls that need them. Each orientation answers its own pair of keys                                                                                                                                 |
| Turning wrapping off                                                            | Optional in the pattern; a flag would cost every app bytes for a case nobody has asked for yet                                                                                                                                                            |
| A shortcut key that moves focus to the group                                    | The pattern recommends one for an app's toolbar, which the app documents and binds                                                                                                                                                                        |
| `role="radio"` in a single group                                                | Items are toggle buttons with `aria-pressed` in both modes, so a group changes mode without changing roles. A choice of one among options that reads as a radio group is Radio (PLAN.md section 9)                                                        |
| Pressing the item that receives focus                                           | Toolbar controls act on Enter and Space; focus only moves                                                                                                                                                                                                 |
| The tab stop on the pressed item                                                | The keyboard interface practice names the first control for toolbars; the pressed item is the rule for radio groups                                                                                                                                       |
| The tab stop following items that move in the document before any has had focus | Items are ordered when they register and when a key moves focus, so arrow keys always follow the document. Moving items without remounting them is rare in a group of toggles                                                                             |
| Roving focus across a Toolbar's other controls                                  | Comes with Toolbar, which decides how its own navigation and a group's combine                                                                                                                                                                            |
| A name and value submitted with a form                                          | Toggle buttons are not form controls, as for Toggle                                                                                                                                                                                                       |
| `readOnly`                                                                      | `aria-readonly` is not allowed on the button role or the group role; a consumer who needs a fixed group controls `value`                                                                                                                                  |
| Keyboard modifiers in the change callback, and canceling a change               | `onValueChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                                                                                                         |
| Generated ids                                                                   | No part links to another; the group is named by the consumer's `aria-label` or `aria-labelledby`                                                                                                                                                          |
