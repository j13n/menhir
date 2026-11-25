# Select

A button that shows one value out of a list and opens the list to change
it, such as "Country: Norway ▾": the WAI-ARIA select-only combobox for the
Trigger and the listbox pattern for the list. A form control: a hidden
input is the form's view of it (#102; PLAN.md section 8, "API conventions",
"Selects").

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 2026-11-23 |
| WAI-ARIA [select-only combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) (page last updated 12 August 2025): the combobox keeps DOM focus and names the option the keys are on in `aria-activedescendant`; it has `aria-controls` and `aria-expanded`. Closed: Down Arrow, Alt+Down Arrow, Enter and Space open the list without changing the value; Up Arrow and Home open it on the first option, End on the last; a printable character opens it on the first option that matches. Open: Down and Up move without wrapping; Home and End; PageUp and PageDown move ten options; Enter, Space and Alt+Up Arrow set the value to the option the keys are on and close; Tab does the same and moves focus on; Escape closes and keeps the value. The script scrolls that option into view | 2026-11-23 |
| WAI-ARIA [listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) (no date on the page): `listbox` holds `option`s, directly or in a `group` with an accessible name; the selected option has `aria-selected="true"` and the others `"false"`; when a single-select list gets focus, it goes to the selected option, else the first; type-ahead is recommended; selection may follow focus, optionally. It does not mention disabled options                                                                                                                                                                                                                                                                                                                                                                                   | 2026-11-23 |
| Size: PLAN.md section 6, rules 3 and 6. The budget was set before the behaviour (below)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 2026-11-23 |

## The platform first

A `<select>` that can be styled (`appearance: base-select`, with
`::picker(select)` and `<selectedcontent>`) is "Customizable `<select>`" in
`web-features` 3.47.0, read on 2026-11-23: **not Baseline**. Chrome and
Edge have it since 135 and Safari since 27; no Firefox release has it. It
is not Widely available, and no exception is made for it, as one was for
`popover` (PLAN.md section 5): without it a browser shows its own picker,
which no CSS reaches, so a Select built on it would look two ways. No
feature is used "where supported, with a fallback" (PLAN.md section 8,
"What the browser does for popups"). So Select is built, on `popover`.
Check again once Firefox ships it.

## Shape

`Select.Root` renders no element: it holds the value and whether the list
is open. `Select.Trigger` renders a native `<button type="button"
role="combobox">`, then a visually hidden `<input>` beside it for forms.
`Select.Value` renders a `<span>` with the selected item's label, inside
the Trigger. `Select.Popup` renders a `<div popover="auto"
role="listbox">`, placed against the Trigger. Inside it, `Select.Item`
renders a `<div role="option">`, and `Select.ItemIndicator` a `<span>` that
shows whether its item is selected. `Select.Group` is a `<div
role="group">` named by its `Select.GroupLabel`.

```tsx
<label for="fruit">Fruit</label>
<Select.Root name="fruit" defaultValue="apple">
  <Select.Trigger id="fruit">
    <Select.Value placeholder="Pick a fruit" />
  </Select.Trigger>
  <Select.Popup>
    <Select.Item value="apple">
      <Select.ItemIndicator>✓</Select.ItemIndicator> Apple
    </Select.Item>
    <Select.Item value="banana">Banana</Select.Item>
    <Select.Group>
      <Select.GroupLabel>Citrus</Select.GroupLabel>
      <Select.Item value="lemon">Lemon</Select.Item>
      <Select.Item value="lime" disabled>Lime</Select.Item>
    </Select.Group>
  </Select.Popup>
</Select.Root>
```

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser** (`popover="auto"`, #94): the top layer, light dismiss by
  a press outside, Escape and other close requests. Focus never leaves the
  Trigger, so there is none to return.
- **The `floating` layer**: presence, `popoverClose` and `positioning` with
  `offset`, `flip`, `shift` and `size` from the Popup;
  `list-navigation/activeDescendant` and `typeahead` for the items.
  `menhir/select` bundles no roving list, return or initial focus, Tab
  wrap, scroll lock, dialog dismissal, Escape listener or hover
  (`test/bundle-size/popupModules.ts`).

### Decisions

- **Parts.** A list popup's Root, Trigger, Popup, Item, ItemIndicator,
  Group and GroupLabel (PLAN.md section 8, "List popups"), and a Value,
  which a menu has no use for. No Portal: the Popup is in the top layer.
  No separate list part: the Popup is the `listbox`, as Menu's is the
  `menu`. No part for the Trigger's icon or an item's text, which are plain
  elements. The parts are Select's own: it builds on no popup (PLAN.md
  section 6, rule 4), and its Group and GroupLabel repeat Menu's few lines.
- **Focus stays on the Trigger**, which names the active item in
  `aria-activedescendant`, as the select-only combobox example does. So
  typing on a closed Select and on an open one is one handler on one
  element, Tab leaves from where the user was, nothing returns focus, and
  the list is `list-navigation/activeDescendant`. A press in the Popup
  moves no focus: its `mousedown` is cancelled.
- **The Trigger** is a native `<button type="button">` with
  `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`,
  `aria-controls` and `popovertarget` naming the Popup, and
  `aria-activedescendant` while an item is active. The `combobox` role
  takes no name from its content, so the content is its value and a label
  names it: a native `<label>`, `aria-label` or `aria-labelledby`. A click
  on a `<label for>` presses the button, so it opens the Select.
- **Keys on the closed Trigger.** Down Arrow, Alt+Down Arrow, Enter and
  Space open the list on the selected item, else the first. Up Arrow and
  Home open it on the first item, End on the last. A printable character
  opens it on the first item that matches, and the value does not change
  (PLAN.md section 8, "Typeahead").
- **Keys while open.** Down and Up move without wrapping, Home and End to
  the first and last, PageUp and PageDown by ten items; typeahead as in a
  menu. Enter, Space and Alt+Up Arrow select the active item and close.
  Tab and Shift+Tab select it, close, and focus moves on. Escape closes
  and keeps the value (the browser's). Every key is handled on key down
  and Enter and Space are cancelled, so the button's own click does not
  toggle the list after them: with Space's key down cancelled, no click
  follows its key up (tried on 2026-11-23 in Chromium 159, Firefox 159 and
  WebKit 27.2).
- **Selection does not follow the active item.** The value changes on
  Enter, Space, Alt+Up Arrow, Tab and a click, as in the example; the
  listbox pattern's selection that follows focus is optional.
- **The value** is `value`, `defaultValue` and `onValueChange` on the Root:
  an item's `value`, a string, or `null` when none is selected. Selecting
  the selected item only closes the list.
- **Whenever the list opens, the selected item is active**, else the
  first: by a press, a key, `defaultOpen` or a controlled `open`, unless
  the key that opened it chose another. It is scrolled into view. That
  item is derived from the open state and the value, not written to the
  list by an effect once it has opened: the Trigger, which reads both
  `aria-expanded` and the active item, then runs once per opening, and
  Solid reports no relayed value (`EFFECT_RELAY_TEAR`, found with the
  docs site's diagnostics). The list holds an active item of its own from
  the first key or pointer move on.
- **Items** have `aria-selected` `"true"` or `"false"`, and
  `data-selected` or `data-unselected`, which `Select.ItemIndicator`
  carries too, always rendered and `aria-hidden`. An item takes
  the consumer's `id`, else a generated one, which the Trigger names once
  it is active; `id={false}` does not remove it. A
  disabled item has `aria-disabled="true"` and `data-disabled`, stays
  reachable by the keys and the pointer, and is not selected; Tab on it
  closes without selecting.
- **An item's text** is its text content without what is `aria-hidden`,
  such as its ItemIndicator's check mark, which is no part of its name
  either: what typeahead matches and the Value shows. An item whose
  content is not its label, such as a flag beside a country, takes a
  `label` instead.
- **`Select.Value`** shows the `placeholder` while the value is `null`,
  with `data-placeholder`. Else it shows the selected item's label: its
  `label`, else its text ("An item's text" above), read once the items have mounted. The
  items are rendered after the Value, so the server HTML and the first
  render of hydration cannot know a label: they show the value itself. A
  Select whose labels differ from its values passes the Value a function
  as its children, `(value) => label`, which the server calls too.
- **The hidden input is the form's view** (PLAN.md section 8): a visually
  hidden `<input>` right after the Trigger, `aria-hidden` and out of the
  tab order, that takes `name`, `form`, `required`, `disabled` and
  `autocomplete` from the Root and holds the value, `""` for `null`. Not
  `type="hidden"`, which takes no part in validation or autofill. Not a
  native `<select>`, which needs an `<option>` per item, in the server
  HTML too, where the items are not known to the Trigger.
  - A selection goes through it: the input gets the value and fires
    `input` and `change`, which bubble to the form, and the Select reads
    the value from the `change`. So a value the browser fills in takes the
    same path.
  - **Autofill**: a `change` with the `value` of an item selects it; else
    with an item's label, compared without case; else it is put back.
  - A form reset goes back to `defaultValue`, through the setter, so a
    controlled Select asks, in a task after the `reset` event, unless the
    app cancels it; the input is held through the browser's reset
    (`core/formReset.ts`, #165).
  - When the browser blocks a submission and focuses the input, focus
    moves to the Trigger.
- **`disabled`** on the Root disables the Trigger and the input, so the
  Select opens by nothing and submits nothing. **`required`** gives the
  Trigger `aria-required` and the input `required`. Both are `data-*`
  attributes on the Trigger and the Popup. No `readOnly`: a native
  `<select>` has none.
- **The Popup** is `popover="auto"` with the `listbox` role and the Root's
  `id`, labelled by the Trigger in `aria-labelledby`; the consumer's wins.
  Non-modal, like a menu.
- **Placement** as Menu's: `side` (default `"bottom"`), `align` (default
  `"start"`), `sideOffset`, `alignOffset`, `collisionPadding` and `anchor`
  on the Popup; `offset`, `flip`, `shift` and `size`. A list is often
  longer than the space below its Trigger, so the Popup always passes
  `size`, and the consumer's CSS limits it with `max-height:
var(--available-height)` and `overflow-y: auto`.
- **The popup's width** is the consumer's CSS: `min-width:
var(--anchor-width)`, the variable `createPosition` writes on every
  positioned popup (#25).
- **Closing.** Escape and a press outside are the browser's (`escape-key`,
  `outside-press`); the Trigger closes it (`trigger-press`); selecting an
  item closes it (`item-press`); Tab closes it (`focus-out`). Opening by
  any key reports `trigger-press`.
- **`data-open` and `data-closed`** are on the Trigger and the Popup.
- **The server renders a `defaultOpen` Select closed**, and hydration
  opens it, as Menu does. The closed Popup and its items are in the server
  HTML, the selected one with `aria-selected="true"`.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element against the part conventions. "A" marks a case the WAI-ARIA
select-only combobox example or the listbox pattern requires, "C" a case
that runs only in Chromium (`it.skipIf(isJSDOM)`): jsdom has no `popover`,
no layout and no real input. In jsdom an opened popover gets
`:popover-open` from a stub (`test/popover/stubPopover.ts`).

`root/SelectRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default: the Popup is not shown, and the Trigger and Popup have `data-closed`
- `defaultOpen` starts open, with `data-open`, and the selected item active, else the first (A)
- Uncontrolled open: the Trigger opens it and closes it again; `onOpenChange` gets each value with its reason and event (`trigger-press`)
- Controlled open and controlled closed: the Trigger only asks
- Follows a controlled `open` changed from outside
- No value by default: no item is selected; `defaultValue` selects one (A)
- Uncontrolled value: selecting an item calls `onValueChange` with its value and changes the selection
- Controlled value: selecting an item only asks; the selection and the hidden input stay
- Follows a controlled value changed from outside; `null` selects none
- Selecting the selected item closes the list and calls no `onValueChange`
- Changes before async work that `onValueChange` starts settles (PLAN.md "API conventions")

`trigger/SelectTrigger.test.tsx`

- Renders a button of type `button` with the `combobox` role, `aria-haspopup="listbox"`, `popovertarget` and `aria-controls` naming the Popup (A)
- `aria-expanded` is `"false"` while closed and `"true"` while open (A)
- Takes the consumer's `id`; a `<label for>` names it, and so does a wrapping `<label>` (A)
- Names the active item in `aria-activedescendant` while open, and none while closed (A)
- Names the active item as the list opens, with no value relayed through an effect: no diagnostic with attribution on
- Names no item, and no item has `data-active`, while a controlled Select refuses to open
- Focus stays on the Trigger while the list is open and the keys move (A)
- Down Arrow, Alt+Down Arrow, Enter and Space open the list on the selected item, else the first, and change no value (A)
- Up Arrow and Home open it on the first item, End on the last (A)
- A printable character on the closed Trigger opens it on the first item that matches, and changes no value (A)
- Enter and Space with real keys open it once, and select and close once (C)
- A press on the open Select's Trigger closes it and does not open it again (C)
- `disabled` on the Root: the button is disabled, with `data-disabled`, and a click opens nothing
- `required` on the Root: `aria-required` and `data-required`
- Calls the consumer's `onClick` once per click
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Select.Root`

`trigger/SelectTrigger.form.test.tsx`, the hidden input

- Is a visually hidden input after the button, `aria-hidden` and out of the tab order, holding the value, `""` for none
- `name`, `form`, `required`, `disabled` and `autocomplete` go on the input only
- Submits the value under `name`; nothing while disabled; to the form named by `form`
- Selecting an item fires `input` and `change` that reach the form, whose `FormData` has the new value
- `required` blocks submission while no item is selected, and not once one is
- When the browser blocks the submission, focus moves to the Trigger (C)
- A form reset goes back to `defaultValue`, and to none without one; when controlled, it asks with `onValueChange`
- By a real press of the reset button (Chromium only, since a script's click runs no microtask between the listeners): a reset taken goes back to `defaultValue`, which the form submits; a reset declined keeps `value`; a reset a later listener cancels asks for nothing
- Autofill: a `change` of the input with an item's value selects it; with an item's label, in another case, selects it; with neither, the input is put back

`value/SelectValue.test.tsx`

- Renders a `<span>` with the `placeholder` and `data-placeholder` while no item is selected
- Shows the selected item's text content, and follows a selection
- Shows an item's `label` instead of its content
- Leaves an item's `aria-hidden` content, such as its ItemIndicator, out of the label
- With a function as children, shows what it returns for the value
- Throws a descriptive error outside `Select.Root`

`popup/SelectPopup.test.tsx`

- Renders a `<div popover="auto">` with the `listbox` role and the Root's `id`, hidden until opened (A)
- Labelled by the Trigger; the consumer's `aria-labelledby` wins
- Carries `data-open` or `data-closed`, `data-disabled` and `data-required`
- Opened, it is in the top layer and not modal: a button outside can still be pressed (C)
- Placed below its Trigger, aligned to its start, with `data-side` and `data-align`; `side` and `align` move it (C)
- Writes `--anchor-width` and `--available-height`, so CSS can match the Trigger's width and limit the height (C)
- Escape closes it, reporting `escape-key`, keeps the value and leaves focus on the Trigger (A, C)
- A press outside closes it, reporting `outside-press` (C)
- A press on an item leaves focus on the Trigger (C)
- Tab selects the active item, closes it reporting `focus-out`, and focus moves to the element after the Trigger (A, C)
- Throws a descriptive error outside `Select.Root`

`item/SelectItem.test.tsx`

- Renders a `<div role="option">` with `aria-selected` and `data-selected` or `data-unselected`, and an `id`, the consumer's if given (A)
- Down and Up move the active item, which has `data-active`, without wrapping; Home and End to the first and last (A)
- PageDown and PageUp move ten items, stopping at the ends (A)
- A printable character moves to the next item that starts with it; `label` is matched instead of the content (A)
- A typed character matches an item's text without its ItemIndicator
- The pointer moving onto an item makes it active (C)
- The active item is scrolled into view in a list that scrolls (A, C)
- A click selects the item and closes the list, reporting `item-press` (A)
- Enter, Space and Alt+Up Arrow select the active item and close the list (A)
- Space while a string is being typed joins it, and selects nothing
- Tab selects the active item and closes the list, reporting `focus-out` (A)
- A disabled item has `aria-disabled` and `data-disabled`, is reached by the keys, and is not selected by a click, Enter or Tab
- `Select.ItemIndicator` inside it carries its `data-selected` or `data-unselected` and is `aria-hidden`
- Throws a descriptive error outside `Select.Root`; the ItemIndicator outside an Item

`group/SelectGroup.test.tsx`

- Renders a `<div role="group">` named by its `Select.GroupLabel` while one is rendered; the consumer's `aria-labelledby` wins (A)
- A GroupLabel takes the consumer's `id`, and throws a descriptive error outside a Group
- The keys move through the items of groups in document order

`Select.performance.test.tsx`, a Select with 500 items (C)

- Opens on the selected item, moves, types and selects, each step under 50 ms; "Performance" below records the times measured

`test/select/Select.hydrate.test.tsx`

- The server HTML has the Trigger, the hidden input with the value and a hidden Popup with its items, linked by ids, the selected one with `aria-selected="true"`, and no item active
- The server HTML shows the value as the Value's text, or what its function returns
- A `defaultOpen` Select renders closed on the server, with `data-open`
- Hydration adopts the server's elements without warnings, shows the selected item's label, and opens a `defaultOpen` Select
- Opens by click and by key after hydration, and selects an item (C)

## Left out

| Case                                                 | Reason                                                                                                                                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Several selected items (`multiple`)                  | The select-only combobox selects one. Several need the listbox pattern's second keyboard model, a list that stays open and a value of another type, an array (`core/listValue.ts`): a component, or a part, not a flag |
| A styled native `<select>`                           | Not Baseline on 2026-11-23 ("The platform first")                                                                                                                                                                      |
| The selected item placed over the Trigger            | It needs the list scrolled and sized around the Trigger, with scroll arrows; the Popup is placed as a menu is                                                                                                          |
| Scroll arrow parts                                   | The Popup scrolls natively (`overflow-y: auto`)                                                                                                                                                                        |
| Selecting when focus leaves by other means than Tab  | The example sets the value when focus moves out; a press outside is light dismiss, which closes without selecting, as Escape does. Only Tab selects                                                                    |
| Selection that follows the active item               | Optional in the listbox pattern, and the example does not do it (Decisions)                                                                                                                                            |
| `aria-selected` only on the active item              | The example's attribute table says so; the listbox pattern says the selected option has it, which a screen reader announces as the value                                                                               |
| A label kept reactive from an item's content         | The Value reads an item's text content when the items or the value change; content that changes later needs `label` or the Value's function                                                                            |
| An item whose `value` is `""`                        | The hidden input's `""` is no value: use `null` for none                                                                                                                                                               |
| A label click that focuses without opening           | A `<label>` clicks its button, which the Trigger cannot tell from a press                                                                                                                                              |
| Label, Description and error parts, `data-invalid`   | Field's (#141): the Trigger joins a Field as `<Field.Control render={Select.Trigger}>` inside the Root, which keeps `name`, `required` and `disabled` (`src/field/README.md`)                                          |
| `readOnly`                                           | A native `<select>` has none                                                                                                                                                                                           |
| An Arrow, a modal Select, a Trigger outside the Root | As for Menu (`src/menu/README.md`, "Left out")                                                                                                                                                                         |
| An exit animation after Escape or a press outside    | The browser hides the popover, and `beforetoggle` cannot be cancelled on closing (`src/popover/README.md`)                                                                                                             |
| The browser's own autofill                           | No test can start it: the tests change the input and fire `change`, as the browser does. Not tried by hand yet (below)                                                                                                 |
| Firefox and WebKit                                   | Tests run in Chromium (PLAN.md section 5)                                                                                                                                                                              |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite).
No screen reader has been tried yet, nor a browser's own autofill.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25, after #165.

| Entry point     | Size     | Budget  |
| --------------- | -------- | ------- |
| `menhir/select` | 11,898 B | 12.5 kB |

The budget was set before the behaviour, at about Menu's (11.9 kB) without
its submenus, checkbox and radio items, safe area and return focus, plus
`size`, the Value and the hidden input. Most of it is `@floating-ui/dom`,
as for Menu.

11,801 B before #165, which moved the form reset to `core/formReset.ts`. A
control alone pays for the helper; an app with several pays for it once
(`src/input/README.md`, "Size").

## Performance

A Select with 500 items, measured on 2026-11-23 in Chromium 159 (headless,
on an Apple silicon laptop) by `Select.performance.test.tsx`: the time from
a key down to the end of the layout it causes, the flush and the list's
scroll into view included. Two runs:

| Step                                              | Time          |
| ------------------------------------------------- | ------------- |
| Enter opens the list on item 400, scrolled to it  | 5.3 to 8.0 ms |
| The first Down Arrow after opening                | 1.8 to 2.0 ms |
| End, Home, PageDown                               | 0.0 to 0.5 ms |
| A typed character moves to its match              | 3.0 to 7.2 ms |
| Enter selects the active item and closes the list | 2.0 to 4.3 ms |

Each is within one frame at 60 Hz (16.7 ms). A move re-runs two items, not
500: each item reads its own active signal (`floating/list-navigation`).
Opening, closing and the first move re-read every item's `data-active`
once, as the item the list opened on changes.
Typing reads every item's text content, and a selection re-reads every
item's `aria-selected`. The test fails a step over 50 ms. The items are
all in the document, closed too; a list of thousands needs a Combobox that
filters, or virtual scrolling, which Select does not have.
