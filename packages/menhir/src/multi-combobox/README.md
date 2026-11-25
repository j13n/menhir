# Multi Combobox

An input that selects several values out of a list, each shown as a chip in
the input's box, such as the toppings of a pizza typed as "ol" and selected as
"Olives": a Combobox (`src/combobox/README.md`) whose list stays open as
items are selected and whose value is an array. It selects from a list: typed
text that becomes a chip of its own, as in a box of free tags, is another
component. It builds on Combobox, whose decisions it keeps unless this
README says otherwise (#206; PLAN.md section 8, "API conventions", "Multi
comboboxes").

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1): `<For>` keyed by the value for the chips, `onFlush` for the work after a change has settled                                                                                                                                                                                                                                                                                                                                                  | 2026-11-25 |
| WAI-ARIA [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (no date on the page): as for Combobox. It calls a combobox "a single-select widget" and its listbox popup allows "only one suggested value to be selected at a time"; it says nothing of several. So the combobox's roles, states and keys are kept, and what changes for several values comes from the listbox pattern below                                                                                                                       | 2026-11-25 |
| WAI-ARIA [listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) (no date on the page): a listbox that allows several selections has `aria-multiselectable="true"`; each selected option `aria-selected="true"` and each other selectable one `"false"` (or `aria-checked`, one or the other in a listbox, kept the same across an app); selection is apart from focus. Its keys for several selections (Space, Shift with the arrows) are a focused listbox's: the input here keeps focus, and its Space types a space | 2026-11-25 |
| Neither pattern covers chips. What a chip is, its keys and what a screen reader is told are decided below                                                                                                                                                                                                                                                                                                                                                                                                                            | 2026-11-25 |
| Size: PLAN.md section 6, rules 3, 4 and 6. The budget was set before the behaviour (below)                                                                                                                                                                                                                                                                                                                                                                                                                                           | 2026-11-25 |

## The platform first

A native `<select multiple>` selects several values, but it is a list box with
no text to filter by, drawn by the browser, and a press without Ctrl or
Command selects one item and drops the rest. So Multi Combobox is built, on
Combobox.

## Shape

`MultiCombobox.Root` renders no element: it holds the values, the input's
text and whether the list is open. `MultiCombobox.Chips` renders the box, a
`<div>` around the chips and the input. `MultiCombobox.Value` renders no
element: it calls its function for each value, in order, keyed by the
value. `MultiCombobox.Chip` renders a `<div tabindex="-1">` that shows one
value, and `MultiCombobox.ChipRemove` a `<button type="button"
tabindex="-1">` inside it that takes the value out. `MultiCombobox.Input`
renders an `<input type="text" role="combobox">`. After its children, the
Root renders the form's view of the values. `MultiCombobox.Popup` renders the `popover`, placed against the
Chips, `MultiCombobox.List` the `listbox` with `aria-multiselectable`, and
`MultiCombobox.Item` an `option`. `Trigger`, `Clear`, `Group`, `GroupLabel`,
`Status` and `ItemIndicator` are Combobox's.

```tsx
const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "olives", label: "Olives" },
  { value: "onions", label: "Onions" },
];
const labelOf = (value: string) =>
  toppings.find((topping) => topping.value === value)?.label;
const [query, setQuery] = createSignal("");
const shown = createMemo(() =>
  toppings.filter((topping) => includesText(topping.label, query())),
);

<label for="toppings" id="toppings-label">Toppings</label>
<MultiCombobox.Root
  name="toppings"
  onInputValueChange={(text, { reason }) =>
    setQuery(reason === "input-change" ? text : "")
  }
>
  <MultiCombobox.Chips>
    <MultiCombobox.Value>
      {(value) => (
        <MultiCombobox.Chip value={value}>
          {labelOf(value)}
          <MultiCombobox.ChipRemove aria-label={`Remove ${labelOf(value)}`}>
            ×
          </MultiCombobox.ChipRemove>
        </MultiCombobox.Chip>
      )}
    </MultiCombobox.Value>
    <MultiCombobox.Input id="toppings" />
  </MultiCombobox.Chips>
  <MultiCombobox.Popup>
    <MultiCombobox.List aria-labelledby="toppings-label">
      <For each={shown()}>
        {(topping) => (
          <MultiCombobox.Item value={topping.value}>
            <MultiCombobox.ItemIndicator>✓</MultiCombobox.ItemIndicator>
            {topping.label}
          </MultiCombobox.Item>
        )}
      </For>
    </MultiCombobox.List>
  </MultiCombobox.Popup>
</MultiCombobox.Root>
```

### Decisions

- **A component of its own that builds on Combobox**, as Autocomplete does
  (#104; PLAN.md section 6, rule 4), not a flag or parts of Combobox: the
  value is an array, not `string | null`, the form receives an entry per
  value, the list stays open, and chips bring keys of their own. As a flag,
  every app with a single-value Combobox would ship all of it (rule 6), and
  as parts of Combobox its Root would still have to hold an array.
  `popupBases` names `"multi-combobox": "combobox"`. Its own `Root`,
  `Chips`, `Value`, `Chip`, `ChipRemove`, `Input`, `Popup`, `List` and
  `Item`; Combobox's `Trigger`, `Clear`, `Group`, `GroupLabel`, `Status`,
  `ItemIndicator` and `includesText`, re-exported. Its Root shares a
  combobox through Combobox's context, typed as `ComboboxBase`, and its
  Root, Input and Item call Combobox's `createComboboxBase`,
  `createComboboxInput` and `createComboboxItem`; its Popup and List render
  Combobox's with one prop more. Combobox did not grow: what it shares was
  already shared with Autocomplete. Each Root's `select` closes its own
  list, or keeps it open, instead of returning whether the shared Input and
  Item should close it.
- **The name** is Multi Combobox, `menhir/multi-combobox`: a combobox that
  selects several values, found beside Combobox.
- **The value** is `value`, `defaultValue` and `onValueChange` on the Root,
  an array of the items' `value`s in every mode, `[]` when empty, in the
  order they were selected; values with no Item are kept. No details
  argument, as Checkbox Group's. It is held in `createControllableSignal`,
  as Checkbox Group's is, not `core/listValue.ts`: a list value answers
  only whether it has an item and takes a set, while the chips, the hidden
  inputs and the items' `aria-selected` render from the array itself, and a
  removal reads, once the list has settled, whether a controlled consumer
  kept the value, to leave focus on its chip. Giving `ListValue` the array
  would grow Toggle Group and Accordion, which use it, for nothing they
  need.
- **The input value** is the text, `inputValue`, `defaultInputValue`
  (default `""`) and `onInputValueChange(text, { reason, event })`, with
  Combobox's reasons. It is only the filter: no label goes in it, so it is
  a string from the server HTML on. `item-press` empties it once an item is selected.
  `focus-out` empties it as focus leaves the input, but for a chip of its
  own: the text is not the value, and text left in the box after focus has
  gone would read as if it were.
- **Selecting an item adds it, keeps the list open and empties the text**
  (`item-press`): a click, or Enter on the active item. Selecting a selected item
  takes it out. The active item stays where it is, so the arrow keys go on
  from it. Enter with no item active closes the list (`enter-key`) and lets a
  form submit, as on Combobox. A disabled item is neither added nor taken
  out.
- **The listbox** has `aria-multiselectable="true"`, and each item
  `aria-selected` `"true"` or `"false"`, as the listbox pattern says,
  `data-selected` or `data-unselected`, which Combobox's ItemIndicator
  carries. `aria-selected`, not `aria-checked`: the same attribute as
  Combobox's and Select's items.
- **Chips**: the Chips box is a `<div>` with no role, since a box that holds
  an input and chips is no widget of its own; a press on its own background
  focuses the input. Each Chip is a `<div tabindex="-1">` with no role, out
  of the tab order and named by its text, which a screen reader reads as
  focus reaches it; it is the Value's to show, since only the app knows a
  value's label. ChipRemove is a native button the app names with
  `aria-label`, such as "Remove Olives": Menhir writes no text, since it
  does not know the app's language. Its press leaves focus where it was,
  then focuses the input.
- **Value** is a part, not a function on Chips or the Root, so that an
  uncontrolled Multi Combobox shows its chips: it calls its function for
  each value, keyed by the value, so a chip is created once and kept while
  its value is. A controlled app may render its own Chips from its array
  instead.
- **The keys between chips and input**:
  - **Backspace in an empty input focuses the last chip**, and a second
    Backspace removes it: nothing is removed by a key the user cannot see
    the target of, and focus shows what the next Backspace removes.
  - **Left with the caret at the start of the text**, with nothing
    selected, focuses the last chip; the text is kept.
  - On a chip, **Left** focuses the chip before it, if any, and **Right**
    the one after it, or the input after the last chip. Right to left, Left
    and Right are swapped, read from the chip's `direction`.
  - **Backspace on a chip removes it and focuses the chip before it**, else
    the one that took its place, else the input; **Delete removes it and
    focuses the one that took its place**, else the input. So Backspace held
    down removes the chips from the last.
  - Keys move nothing while the Root is disabled, nor with Shift, Ctrl, Alt
    or Meta held, on a chip or from the input.
- **What a screen reader is told**: the input is a combobox, as Combobox's,
  and the listbox says which items are selected. A chip is read as focus
  reaches it. A removal is not announced by Menhir, which writes no text:
  focus moves to a neighbour, which is read, and an app that wants to say
  what was removed says it in a live region of its own from
  `onValueChange`.
- **Escape** closes the open list and keeps the text; on a closed list it
  empties the text (`escape-key`), and never the values: Clear empties both.
  With neither, it is not cancelled, so a dialog around it closes.
- **Clear** empties the text and every value (`clear-press`).
- **What the form receives**: one `<input type="hidden">` per value under
  the Root's `name`, as Checkbox Group gives one entry per box (#146), with
  `form` and `disabled`; nothing for `[]`. The Root renders them after its
  children, not the Input after itself as Combobox's does: a chip and a
  hidden input added in one update, on either side of the Input inside the
  Chips, had Solid move the Input between them, and a moved input loses
  focus (found by the test that Enter keeps focus in the input). **`required`
  means at least one**: a visually hidden `<input type="radio">` with the
  same `name`, never checked, so it submits nothing, is `required` while
  the list is empty; the browser then blocks a submission with its message
  for a missing selection and focuses it, and it hands focus to the Input.
  Without a `name` it takes one from `createUniqueId`, since browsers find
  only a named radio missing. The Input has `aria-required`. Each change
  fires `input` and `change` from the radio once the hidden inputs are
  current, so a Field is touched and a Form hides its error under that
  `name`.
- **A form reset** puts the values back to `defaultValue` and the text to
  `defaultInputValue`, through the setters, in a task after the `reset`
  event unless the app cancels it (`core/formReset.ts`).
- **In a Field**: the Input joins as `Field.Control`'s `render`,
  `<Field.Control render={MultiCombobox.Input}>` inside the Root, as
  Select's Trigger does: it takes the field's `id`, `aria-describedby`,
  `aria-invalid` and `data-*`, and the Root keeps its own `name`, `required`
  and `disabled`; a `name` passed to the Input is dropped, since the text is
  not submitted. The Field reads the radio's `valueMissing`. The ticket said
  "as Combobox joins one", but Combobox's README has no Field case yet, and
  its Input keeps a `name` it is given: joined the same way, a Combobox
  would submit its text under the Field's `name` beside its hidden input.
  So this follows Select's Trigger instead, and the gap is Combobox's to
  close (`src/combobox/README.md`, "Left out").
- **`disabled`** on the Root disables the Input, the hidden inputs, the
  Trigger, Clear and every ChipRemove; the Chips, each Chip, the Input, the
  Trigger and the Popup get `data-disabled`.
- **The Popup** is Combobox's, placed against the Chips when rendered, else
  the Input; `anchor` still wins.
- **The server renders the chips** of `defaultValue` or `value` and the
  hidden inputs, closed; a `defaultOpen` Multi Combobox renders closed and
  hydration opens it, as Combobox's.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part of its own
that renders an element. "A" marks a case the WAI-ARIA combobox or listbox
pattern requires, "C" a case that runs only in Chromium
(`it.skipIf(isJSDOM)`). Combobox's re-exported parts are tested there;
`MultiCombobox.test.tsx` checks they work inside a Multi Combobox. The cases
of Combobox that hold unchanged through the shared Input and Item code
(Up Arrow, Alt+Down and Alt+Up, an input method's composition, Tab, a press
outside or in the input, the pointer on an item, scrolling into view, a
disabled item reached by the keys) are tested in Combobox's suites, which
run that code, and not again here.

`root/MultiComboboxRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default; `defaultOpen` starts open with no item active
- No values by default; `defaultValue` selects those items and shows their chips
- Uncontrolled value: selecting an item calls `onValueChange` with the list it is added to, and `onInputValueChange` with `""` and `item-press`
- Controlled value: selecting only asks; follows a controlled value changed from outside
- Controlled input value: typing only asks, and the input keeps the controlled text
- Changes before async work that `onValueChange` starts settles

`input/MultiComboboxInput.test.tsx`

- Renders an `<input type="text">` with the `combobox` role, `aria-autocomplete="list"`, `aria-controls` naming the List and `aria-expanded` (A)
- Typing opens the list with no item active, reporting `input-change`; Down Arrow opens it on the first item and moves (A)
- Enter on the active item adds it, keeps the list open, the item active and focus in the input, empties the text, and is cancelled (A)
- Enter on a selected item takes it out (A)
- Enter with no item active closes the list, reporting `enter-key`, and is not cancelled (A)
- Escape closes the open list and keeps the text; on a closed list it empties the text and keeps the values; on an empty closed one it is not cancelled (A)
- Focus leaving closes the list, reporting `focus-out`, and empties the text (A)
- Backspace in an empty input focuses the last chip; with text, it edits it, even with the caret at the start; with no chips, it does nothing
- Left with the caret at the start focuses the last chip and keeps the text; elsewhere it moves the caret (C)
- Right to left, Right with the caret at the start focuses the last chip (C)
- `disabled` on the Root disables the input and its hidden inputs; `required` gives `aria-required`
- A `name` passed to the Input is dropped
- Throws a descriptive error outside `MultiCombobox.Root`, and inside `Combobox.Root`

`input/MultiComboboxInput.form.test.tsx`

- One hidden input per value under `name`, in order; none for `[]`; the form submits each value, not the text, and nothing while disabled
- `form` goes on the hidden inputs
- Selecting and removing fire `input` and `change` that reach the form, once the hidden inputs are current; a change a controlled consumer declines fires neither
- `required` blocks submission while no value is selected, even with text, and not once one is; the radio submits nothing
- When the browser blocks the submission, focus moves to the Input (C)
- A form reset puts back `defaultValue` and `defaultInputValue`; when controlled, it asks
- A form reset by a real press puts back `defaultValue`, which the form submits (C)
- Joins a Field as `Field.Control`'s `render`: the label names the Input, the error shows once a submission is blocked, and hides once a value is selected; a Form's error under the `name` hides once a value is selected

`chips/MultiComboboxChips.test.tsx`

- Renders a `<div>` with `data-open` or `data-closed` and `data-disabled`
- A press on its background focuses the input (C)
- The Popup is placed against it, and against the Input without it (C)
- Throws a descriptive error outside `MultiCombobox.Root`

`value/MultiComboboxValue.test.tsx`

- Calls its function for each value, in order, and renders what it returns, no element of its own
- A chip is kept while its value is: selecting another value creates no chip again

`chip/MultiComboboxChip.test.tsx`

- Renders a `<div tabindex="-1">` with no role, named by its text, with `data-disabled` while the Root is disabled
- Left focuses the chip before it and stays on the first; Right the one after it, and the input after the last
- Right to left, Left and Right are swapped
- Backspace removes it and focuses the chip before it, else the one after it, else the input
- Delete removes it and focuses the chip that took its place, else the input
- Backspace held from an empty input removes the chips from the last
- A removal a controlled consumer declines keeps the chip, and focus on it
- No key removes or moves while the Root is disabled, or with Shift, Ctrl, Alt or Meta held
- Throws a descriptive error outside `MultiCombobox.Root`

`chip-remove/MultiComboboxChipRemove.test.tsx`

- Renders a `<button type="button" tabindex="-1">`, named by the consumer's `aria-label`
- A click takes its chip's value out and focuses the input; the list stays as it was
- A press keeps the list open and focus in the input (C)
- `disabled` on the Root disables it
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `MultiCombobox.Chip`

`list/MultiComboboxList.test.tsx`

- Renders a `<div role="listbox">` with `aria-multiselectable="true"` and the Root's `id`, named by the consumer (A)

`item/MultiComboboxItem.test.tsx`

- Renders a `<div role="option">` with `aria-selected` `"true"` while selected and `"false"` otherwise, and `data-selected` or `data-unselected` (A)
- A click adds it, keeps the list open and focus in the input, and a second takes it out (A)
- A press keeps the list open and focus in the input (C)
- A disabled item is neither added nor taken out
- Combobox's ItemIndicator inside it carries its `data-selected` or `data-unselected`
- Throws a descriptive error outside `MultiCombobox.Root`, and inside `Combobox.Root`

`MultiCombobox.test.tsx`, Combobox's parts inside a Multi Combobox

- Clear empties the text and every value, reporting `clear-press`, and focuses the input
- The Trigger opens and closes the list
- The Status counts the items while the list is open
- Items in a Group, named by its GroupLabel, are reached in document order
- Combobox's and Autocomplete's own Input and Item throw inside `MultiCombobox.Root`, naming it

`test/multi-combobox/MultiCombobox.hydrate.test.tsx`

- The server HTML has the chips of `defaultValue`, the Input with `defaultInputValue`, a hidden input per value and a hidden Popup with selected items, closed, linked by ids
- Hydration adopts the server's elements without warnings, and opens a `defaultOpen` Multi Combobox
- Adds a value and removes one after hydration (C)

## Left out

| Case                                                     | Reason                                                                                                                                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| A limit on the number of values                          | Not asked for; `onValueChange` in the controlled form declines a selection past a limit                                                               |
| Creating an item from the typed text                     | Free text that becomes a chip is another component (above)                                                                                            |
| Reordering chips                                         | Not asked for; the order is the order of selecting                                                                                                    |
| Backspace in an empty input removing the last chip       | It focuses it ("The keys between chips and input")                                                                                                    |
| The listbox's own keys for several selections            | Space, Shift and Ctrl with the arrows are a focused listbox's; focus stays in the input, whose Space types a space and whose Shift+arrows select text |
| Home and End on a chip, typing on a chip                 | Not in either pattern; Right goes back to the input, and Tab leaves                                                                                   |
| A removal announced by Menhir                            | Menhir writes no text; focus moves to a neighbour, which is read, and the app may say more in a live region of its own                                |
| A Chip with a role                                       | No ARIA role fits a chip in a text box: an `option` needs a listbox, which cannot hold the input, and a `button` would be pressed for nothing         |
| ChipRemove in the tab order or reached by the arrow keys | Backspace and Delete remove the focused chip; the button is for the pointer, as Combobox's Clear is                                                   |
| `aria-checked` on the items                              | The listbox pattern allows it for several selections, kept the same across an app: Menhir's list items use `aria-selected`                            |
| Hiding the selected items from the list                  | The app filters the items it renders, and can leave the selected ones out                                                                             |
| Autofill, `readOnly`, an Arrow, a modal list             | As Combobox (`src/combobox/README.md`, "Left out")                                                                                                    |
| Firefox and WebKit                                       | Tests run in Chromium (PLAN.md section 5)                                                                                                             |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite). No
screen reader has been tried yet, so how a chip is read as it is focused,
and the announcement of the active item and the selected state, are
unverified: #220 asks a person to try them, and touch.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part and `includesText`, Rolldown, minified, gzipped, Solid left out.
Measured on 2026-11-25.

| App                                           | Size     | Budget  |
| --------------------------------------------- | -------- | ------- |
| `menhir/multi-combobox`                       | 12,055 B | 13.5 kB |
| `menhir/combobox`                             | 11,652 B | 12.5 kB |
| `menhir/combobox` and `menhir/multi-combobox` | 12,853 B |         |

The budget was set before the behaviour, at 13.5 kB: Combobox's 12.5 kB,
less its single value, labels and focus-out revert, plus the chips, their
keys, the Value and a hidden input per value. An app with both pays 1,191 B
over Combobox alone (`pairs.size-limit.js`, margin 1,450 B in
`packages/menhir/layers.ts`, where Combobox alone measures 11,662 B, as in
PLAN.md's table, 10 B more than the budget check measures it): Multi
Combobox's own Root, Chips, Value, Chip, ChipRemove, Input and Item, and the
List and Popup that wrap Combobox's. The shared parts, the shared state, Input and item code and the `floating`
modules are bundled once (`test/package` checks it on the built package).
Combobox did not grow: 11,655 B before, 11,652 B after, since what Multi
Combobox calls was shared with Autocomplete already. Its changes are a type
and a development message in its context, and each Root's `select` closing
its own list, which took 3 B from Combobox and 8 B from Autocomplete. Its
Item and Multi Combobox's repeat the few lines of the selected state rather
than share them: a helper both called grew Combobox by 15 B, Multi Combobox
by 19 B and the two together by 2 B (measured on 2026-11-25, then dropped).
Most of either is `@floating-ui/dom`.
