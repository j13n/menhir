# Combobox

An input that picks one value out of a list, such as a country typed as
"nor" and picked as "Norway": the WAI-ARIA combobox pattern, as its list
autocomplete example applies it, with manual selection. Typing filters the
list, focus stays in the input, and a form receives the picked value (#103;
PLAN.md section 8, "API conventions", "Comboboxes").

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1), "Async" in particular: an async memo under `<Loading>`, `createDeferred`, `isPending`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 2026-11-23 |
| WAI-ARIA [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (no date on the page): DOM focus stays on the `combobox` element, which names the option the keys are on in `aria-activedescendant` and has `aria-controls`, `aria-expanded` and `aria-autocomplete` (`none`, `list` or `both`); `aria-haspopup` is `listbox` by default; the selected option has `aria-selected="true"`. Keys: Down Arrow moves into the list; Up Arrow (optional) to its last option; Alt+Down Arrow (optional) opens the list without moving; Alt+Up Arrow (optional) closes it; Escape closes the list, and optionally clears the combobox when it is already closed; Enter accepts the option; standard text editing keys are not intercepted                                    | 2026-11-23 |
| WAI-ARIA [list autocomplete example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/) (page last updated 12 August 2025): `<input type="text" role="combobox" aria-autocomplete="list">`, the listbox appears when typed characters match, with no option active; Down and Up open an empty textbox's list on the first or last option and move, wrapping; Right, Left, Home, End and printable characters go back to the text; Enter sets the text to the active option and closes; Escape closes the open list, and clears the text when it is closed; a button with `tabindex="-1"`, `aria-label`, `aria-controls` and `aria-expanded` opens the list for touch; the script scrolls the active option into view. It mentions no live region | 2026-11-23 |
| Size: PLAN.md section 6, rules 3, 5 and 6. The budget was set before the behaviour (below)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 2026-11-23 |

## Settled after Phase 2

The ticket was written on 2026-11-22, before the `floating` layer existed.
Checked on 2026-11-23 against what Phase 2 and Phase 3 built:

- **Popup conventions** (#31): a `Root` that renders no element and holds
  `open`, `defaultOpen` and `onOpenChange(open, { reason, event })`; a
  `Trigger`; a `Popup` in the top layer; `data-open` and `data-closed`; ids
  the Root generates. Combobox keeps them and adds two reasons
  to `OpenChangeReason`: `input-change` (typing opened the list) and
  `enter-key` (Enter closed it with no item active).
- **What the browser does for popups** (#94): it changed for this pattern.
  A list popup is `popover="auto"`, but the input is not the popover's
  invoker, since `popovertarget` exists only on buttons: a press in the
  input, to move the caret, would light-dismiss the list. So the Popup is
  `popover="manual"`, and closing is the Combobox's own: Escape on the
  input, and focus leaving the input, which a press outside does.
- **Modules** under the names used: positioning (#25), presence (#96) and
  list navigation (#97) exist. Dismissal (#26) is not used, since a manual
  popover's Escape reaches the input, which handles it. There is no portal
  (#29): the top layer is one. No typeahead (#98): typing filters.
- **List navigation** keeping focus on the input is
  `list-navigation/activeDescendant.ts`, as Select's Trigger.
- **The selected item's label**: Select's Value reads it from the item once
  mounted, and from a function on the server. Here the input shows it, so
  the same holds for the input's text: the selected item's label once the
  items have mounted, else `defaultInputValue`.

## The platform first

A native `<input list>` with a `<datalist>` suggests values, but the
browser shows its own list, which no CSS reaches, matches as it chooses,
and keeps the text, not a picked value; it is Autocomplete's question at
most (#104). So Combobox is built, on `popover`, as Select is.

## Shape

`Combobox.Root` renders no element: it holds the value, the input's text
and whether the list is open. `Combobox.Input` renders an `<input
type="text" role="combobox">`, then a visually hidden `<input>` for forms.
`Combobox.Trigger` and `Combobox.Clear` render native `<button
type="button" tabindex="-1">`s. `Combobox.Popup` renders a `<div
popover="manual">`, placed against the input. Inside it, `Combobox.List`
renders a `<div role="listbox">`, `Combobox.Item` a `<div role="option">`,
and `Combobox.ItemIndicator` a `<span>` that shows whether its item is
selected. `Combobox.Group` is a `<div role="group">` named by its
`Combobox.GroupLabel`. `Combobox.Status` is a `<div role="status">` with
the number of items.

```tsx
const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];
const [query, setQuery] = createSignal("");
const shown = createMemo(() =>
  fruits.filter((fruit) => includesText(fruit.label, query())),
);

<label for="fruit" id="fruit-label">Fruit</label>
<Combobox.Root
  name="fruit"
  onInputValueChange={(text, { reason }) =>
    setQuery(reason === "input-change" ? text : "")
  }
>
  <Combobox.Input id="fruit" />
  <Combobox.Trigger aria-label="Show fruits">▾</Combobox.Trigger>
  <Combobox.Popup>
    <Combobox.List aria-labelledby="fruit-label">
      <For each={shown()}>
        {(fruit) => (
          <Combobox.Item value={fruit.value}>
            <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
            {fruit.label}
          </Combobox.Item>
        )}
      </For>
    </Combobox.List>
    <Combobox.Status>{(count) => count === 0 && "No fruit found"}</Combobox.Status>
  </Combobox.Popup>
</Combobox.Root>
```

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser** (`popover="manual"`, #94): the top layer. A manual
  popover is not light-dismissed and does not close the page's other
  popovers.
- **The `floating` layer**: presence and `positioning` with `offset`,
  `flip`, `shift` and `size` from the Popup;
  `list-navigation/activeDescendant` for the items. `menhir/combobox`
  bundles no roving list, typeahead, dismissal, focus, scroll lock or
  hover (`test/bundle-size/popupModules.ts`).

### Decisions

- **Parts.** A list popup's Root, Trigger, Popup, Item, ItemIndicator,
  Group and GroupLabel (PLAN.md section 8, "List popups"), and:
  - **Input**, the combobox itself.
  - **List**, the `listbox`, inside the Popup. Unlike Select's, the Popup
    is not the list: a message for an empty list and a `<Loading>`
    fallback go in the Popup, and a `listbox` may hold only options and
    groups.
  - **Clear**, a button that empties the text and the value, for the
    pointer: Escape does it from the keyboard.
  - **Status**, a live region with the number of items, for an empty list
    and for a screen reader (below).
  - No Portal: the Popup is in the top layer. No Value: the input shows
    the selected item's label. No Empty part: a Status whose function
    returns text for no items is one. The parts are Combobox's own: it
    builds on no popup (PLAN.md section 6, rule 4), and its Item, Group
    and GroupLabel repeat Select's few lines.
- **Focus stays in the input**, which names the active item in
  `aria-activedescendant`, as the pattern says. The Trigger, Clear and the
  Popup cancel their `mousedown`, so a press on them moves no focus.
- **The Input** is an `<input type="text" role="combobox">` with
  `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` naming the
  List, and `aria-activedescendant` while an item is active. It takes the
  consumer's `id`, so a `<label for>` names it. `autocomplete="off"` keeps
  the browser's own suggestions from covering the list; the consumer's
  wins. No `aria-haspopup`: `listbox` is the role's default.
- **Two values.** **`value`**, `defaultValue` and `onValueChange` on the
  Root: the selected item's `value`, a string, `null` for none. **The
  input value** is the text in the input: `inputValue`,
  `defaultInputValue` and `onInputValueChange(text, { reason, event })`.
  The form receives the value, not the text: the text is a label, and a
  half-typed one picks nothing.
  - **Reasons** for a change of the text: `input-change` (the user typed
    or edited it), `item-press` (an item was selected, and the text is its
    label), `escape-key` and `clear-press` (emptied), `focus-out` (put
    back to the selected item's label as focus left), `reset` (a form
    reset). A consumer that filters by the text filters by it only for
    `input-change`, so that a list opened after a selection shows every
    item.
  - **The text follows the selection**: selecting an item sets it to the
    item's label (its `label`, else its text content without what is
    `aria-hidden`, as Select's). Until the user types, an uncontrolled
    Combobox without `defaultInputValue` shows the selected item's label,
    read once the items have mounted: the server HTML, and the first
    render of hydration, show `defaultInputValue`, else nothing.
  - **Focus leaving puts the text back**: to the selected item's label, or
    empty when none is selected. A text the user emptied clears the value
    as focus leaves. A typed text that matches an item exactly selects
    nothing: the user selects.
- **Filtering is the consumer's.** The Combobox renders the items it is
  given, and the consumer renders those that match, with `<For>`, as the
  example above does. So the list may come from a server, a fuzzy search
  or a fixed order, and an app that filters on the server ships no
  filter. **`includesText(text, query)`**, a separate import from
  `menhir/combobox`, is the filter for the usual case: whether `text`
  contains `query`, case and accents ignored, with the built-in
  `Intl.Collator` made on the first call (PLAN.md section 6, rules 5 and
  6). An empty query matches everything. Items that leave the list leave
  list navigation, and the active item with them.
- **Items that arrive asynchronously**: the list is an async computation,
  `createDeferred(() => search(query()))`, its items rendered under
  `<Loading>` in the List, and the Status in a `<Loading>` beside it
  whose fallback says the list is loading. The first answer shows the
  fallback; after it, a new query keeps the last items shown until its
  answer lands, and `isPending(() => results())` in the Status's function
  says a search is in flight. The Combobox writes its own text and open
  state in `onFlush` (`createControllableSignal`), so a fetch the query
  starts holds neither: the input shows each key as it is typed. Items
  register as they mount, so the keys reach them once they land, and the
  Status counts them (`Combobox.async.test.tsx`).
- **The input's `value` binds to a draft** of the text, a signal derived
  from the Combobox's text and written on each edit. The Combobox's own
  write comes after the edit's flush, and a binding of the input that
  re-ran in that flush, such as `aria-activedescendant` as typing empties
  the active item, would write the old text over the edit (Solid's
  `UNCOMMITTED_INPUT_OVERWRITTEN`). A refused edit, by a controlled
  `inputValue`, and a form reset put the draft and the element back.
- **Opening.** Typing opens the list (`input-change`), with no item
  active. Down Arrow opens it on the first item, Up Arrow on the last,
  and Alt+Down Arrow with no item active (`arrow-key`). A press on the
  Trigger opens and closes it (`trigger-press`) and focuses the input.
  **Focus alone opens nothing**, nor does a press in the input, which
  places the caret: a keyboard user tabbing through a form would get a
  list over the next field at each stop.
- **Keys while open.** Down and Up move, wrapping, as the example does,
  since Home and End belong to the text. Left, Right, Home, End and
  printable characters edit the text, which empties the active item.
  Enter selects the active item, closes the list and keeps the key from
  submitting the form (`item-press`); with no item active it closes the
  list (`enter-key`) and lets the key through, so a form submits as it
  would from a text input. Alt+Up Arrow closes (`arrow-key`). Tab closes
  (`focus-out`) and selects nothing, as the example: manual selection.
- **Escape** closes the open list and keeps the text (`escape-key`). On a
  closed list it empties the text and the value, as the example does; the
  pattern makes that optional. Either way it calls `preventDefault()`, so
  a dialog around the Combobox stays open; Escape on an empty, closed
  Combobox does neither, and the dialog closes.
- **An input method's composition** selects nothing: a key down while
  composing (`isComposing`) is the method's, such as Enter committing the
  composed text.
- **Closing.** Escape (`escape-key`), Alt+Up Arrow (`arrow-key`), the
  Trigger (`trigger-press`), selecting an item (`item-press`), Enter with
  no item active (`enter-key`), and focus leaving the input (`focus-out`),
  which a press outside does. Focus lost to another window, with
  `document.hasFocus()` false, closes nothing and keeps the text. Nothing
  else closes a manual popover: a list opened by `defaultOpen` or a
  controlled `open` before the input has had focus closes by these too.
- **The Trigger** has `aria-controls` naming the List and `aria-expanded`,
  as the example's button; `tabindex="-1"`, since its keys are the
  input's; and needs a name, `aria-label`. **Clear** has `tabindex="-1"`
  for the same reason, empties the text (`clear-press`) and the value, and
  focuses the input; it leaves the list as it was.
- **Items** as Select's: `aria-selected` `"true"` or `"false"`,
  `data-selected` or `data-unselected`, which the ItemIndicator carries;
  `data-active` on the active item while the list is open; the consumer's
  `id`, else a generated one; a disabled item stays reachable and is not
  selected. A click selects an item and closes the list. The pointer
  moving onto an item makes it active.
- **The List** has the Root's `id`, which the Input names before the List
  is rendered, and is named by the consumer, `aria-labelledby` or
  `aria-label`, as the example names its listbox: labelled by the input,
  it would be named by the input's text.
- **The Status** is a `<div role="status">`, a polite live region, whose
  children are a function of the number of items, `(count) => …`, shown
  while the list is open; closed, it is empty. The function is called
  while closed too: one that reads pending data, `isPending(() =>
results())`, then reads it from the start, so `<Loading>` shows its
  fallback, while a first read on opening would hold the opening until the
  data landed (found by the async test). Menhir writes no text, since
  it does not know the app's language. In the Popup, it shows a message
  for an empty list; visually hidden beside the input, it announces the
  count as the user types, which the pattern leaves to the app. The
  active item is announced through `aria-activedescendant`.
- **The hidden input is the form's view** (PLAN.md section 8): a visually
  hidden `<input>` right after the Input, `aria-hidden` and out of the tab
  order, that takes `name`, `form`, `required` and `disabled` from the Root
  and holds the value, `""` for none. A selection goes through it, so the
  form sees `input` and `change`. A form reset puts the value back to
  `defaultValue` and the text to `defaultInputValue`, else that item's
  label, in a task after the `reset` event, unless the app cancels it; both
  inputs are held through the browser's reset (`core/formReset.ts`, #165).
  When the browser blocks a submission and focuses it, focus moves to the
  Input. No autofill: the Input has `autocomplete="off"`.
- **`disabled`** on the Root disables the Input, the Trigger, Clear and
  the hidden input. **`required`** gives the Input `aria-required` and the
  hidden input `required`, so the form needs a selected item, not text.
  Both are `data-*` attributes on the Input, the Trigger and the Popup,
  with `data-open` or `data-closed`.
- **The Popup** is `popover="manual"` with no role, placed against the
  Input, or the consumer's `anchor`, such as a box around the Input and
  the Trigger. Placement as Select's: `side` (default `"bottom"`),
  `align` (default `"start"`), `sideOffset`, `alignOffset`,
  `collisionPadding`, with `offset`, `flip`, `shift` and `size`, and
  `--anchor-width` and `--available-height` for its CSS.
- **The server renders a `defaultOpen` Combobox closed**, and hydration
  opens it, as Select does.
- **Autocomplete builds on it** (#104; `src/autocomplete/README.md`), and
  so does Multi Combobox (#206; `src/multi-combobox/README.md`): each Root
  shares a combobox through this context, typed as `ComboboxBase`, so the
  Trigger, Clear, Popup, List, Group, GroupLabel and Status work inside it
  unchanged. What the Roots, Inputs and Items share is here, and
  each calls it: `createComboboxBase` (the open state, list navigation, the
  List's `id`, the `data-*` attributes), `input/createComboboxInput.ts` and
  `item/createComboboxItem.ts`. In development, a shared part outside
  every Root throws an error that names each component, since it cannot
  tell which was meant; the Input and the Item take only a Combobox's Root,
  and throw inside the others', which `Autocomplete.test.tsx` and
  `MultiCombobox.test.tsx` check.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element against the part conventions. "A" marks a case the WAI-ARIA
combobox pattern or its list autocomplete example requires, "C" a case that
runs only in Chromium (`it.skipIf(isJSDOM)`): jsdom has no `popover`, no
layout and no real input. In jsdom an opened popover gets `:popover-open`
from a stub (`test/popover/stubPopover.ts`).

`root/ComboboxRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default, with `data-closed`; `defaultOpen` starts open, with `data-open` and no item active
- Uncontrolled open: the Trigger opens and closes it; `onOpenChange` gets each value with its reason and event (`trigger-press`)
- Controlled open and controlled closed: the Trigger only asks; follows a controlled `open` changed from outside
- No value by default; `defaultValue` selects an item, and the input shows its label once mounted (A)
- `defaultInputValue` is the text at first
- Uncontrolled value: selecting an item calls `onValueChange` with its value, and `onInputValueChange` with its label and `item-press`
- Controlled value: selecting an item only asks; follows a controlled value changed from outside; `null` selects none
- Controlled input value: typing only asks, and the input keeps the controlled text
- Changes before async work that `onValueChange` starts settles (PLAN.md "API conventions")

`input/ComboboxInput.test.tsx`

- Renders an `<input type="text">` with the `combobox` role, `aria-autocomplete="list"`, `aria-controls` naming the List and `autocomplete="off"`; the consumer's `autocomplete` wins (A)
- `aria-expanded` is `"false"` while closed and `"true"` while open (A)
- Takes the consumer's `id`, and a `<label for>` names it (A)
- Typing opens the list with no item active, reporting `input-change`, and calls `onInputValueChange` with the text and `input-change` (A)
- Down Arrow opens the list on the first item, Up Arrow on the last; Alt+Down Arrow opens it with no item active, reporting `arrow-key` (A)
- Open, Down and Up move the active item, which the input names in `aria-activedescendant`, wrapping; focus stays in the input (A)
- Home, End, Left and Right are not taken from the text; typing empties the active item (A)
- Enter selects the active item, sets the text to its label, closes reporting `item-press`, and is cancelled (A)
- Enter with no item active closes the list, reporting `enter-key`, and is not cancelled (A)
- A key down while an input method composes selects nothing
- Alt+Up Arrow closes the list, reporting `arrow-key` (A)
- Escape closes the open list, keeps the text and is cancelled; on a closed list it empties the text and the value, reporting `escape-key`; on an empty closed one it is not cancelled (A)
- Focus leaving closes the list, reporting `focus-out`, and puts the text back to the selected item's label, kept while the item is filtered out, or empties it with none (A)
- A text emptied by the user clears the value as focus leaves; an untouched Combobox changes nothing
- Tab closes the list and selects nothing (C)
- A press outside closes the list (C)
- A press in the input, which moves the caret, keeps the list open and the text as typed (C)
- `disabled` on the Root: the input is disabled, with `data-disabled`; `required`: `aria-required` and `data-required`
- Throws a descriptive error outside `Combobox.Root`

`input/ComboboxInput.form.test.tsx`, the hidden input

- Is a visually hidden input after the Input, `aria-hidden` and out of the tab order, holding the value, `""` for none
- `name`, `form`, `required` and `disabled` go on the hidden input; the Input has no `name`
- Submits the value under `name`, not the text; nothing while disabled
- Selecting an item fires `input` and `change` that reach the form
- `required` blocks submission while no item is selected, even with text, and not once one is
- When the browser blocks the submission, focus moves to the Input (C)
- A form reset puts back `defaultValue` and `defaultInputValue`, else the default item's label; when controlled, it asks
- By a real press of the reset button (Chromium only, since a script's click runs no microtask between the listeners): a reset taken puts back `defaultValue` and its label, which the form submits; a reset declined keeps `value` and `inputValue`; a reset a later listener cancels asks for nothing

`trigger/ComboboxTrigger.test.tsx`

- Renders a `<button type="button" tabindex="-1">` with `aria-controls` naming the List and `aria-expanded` (A)
- A click opens the list with no item active and focuses the input; a second closes it (A)
- A press keeps focus in the input, and the text as typed (C)
- `disabled` on the Root disables it
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Combobox.Root`

`clear/ComboboxClear.test.tsx`

- Renders a `<button type="button" tabindex="-1">`
- A click empties the text and the value, reporting `clear-press`, and focuses the input
- `disabled` on the Root disables it
- Throws a descriptive error outside `Combobox.Root`

`popup/ComboboxPopup.test.tsx`

- Renders a `<div popover="manual">` with no role, hidden until opened (A)
- Carries `data-open` or `data-closed`, `data-disabled` and `data-required`
- Opened, it is in the top layer and not modal (C)
- Placed below the Input, aligned to its start, with `data-side` and `data-align`; `anchor` places it against another element (C)
- Writes `--anchor-width` and `--available-height` (C)
- A press on an item leaves focus in the input, and selects it (C)
- Escape inside a modal dialog closes the list, then empties the text, and the dialog stays open; a third Escape closes the dialog (C)
- Throws a descriptive error outside `Combobox.Root`

`list/ComboboxList.test.tsx`

- Renders a `<div role="listbox">` with the Root's `id`, named by the consumer's `aria-labelledby` (A)
- Throws a descriptive error outside `Combobox.Root`

`item/ComboboxItem.test.tsx`

- Renders a `<div role="option">` with `aria-selected`, `data-selected` or `data-unselected`, and an `id`, the consumer's if given (A)
- The active item has `data-active`, only while the list is open
- The pointer moving onto an item makes it active (C)
- The active item is scrolled into view in a list that scrolls (A, C)
- A click selects the item, sets the text to its label and closes the list, reporting `item-press` (A)
- An item's `label` is the text instead of its content; its `aria-hidden` content is left out
- A disabled item has `aria-disabled` and `data-disabled`, is reached by the keys, and is not selected by a click or Enter
- Items the consumer filters out leave the list: the keys skip them, and the active item is emptied when it leaves
- `Combobox.ItemIndicator` inside it carries its `data-selected` or `data-unselected` and is `aria-hidden`
- Throws a descriptive error outside `Combobox.Root`; the ItemIndicator outside an Item

`group/ComboboxGroup.test.tsx`

- Renders a `<div role="group">` named by its `Combobox.GroupLabel`; the consumer's `aria-labelledby` wins (A)
- The keys move through the items of groups in document order

`status/ComboboxStatus.test.tsx`

- Renders a `<div role="status">`, empty while the list is closed
- While open, shows what its function returns for the number of items, and follows filtering
- Throws a descriptive error outside `Combobox.Root`

`filter/includesText.test.ts`

- Whether a text contains a query, case and accents ignored; an empty query matches everything

`Combobox.async.test.tsx`, items from an async computation

- Opening is not held by the first answer; `<Loading>` shows its fallback until it lands, then its items register and the keys reach them
- A new query keeps the input's text current while its answer is in flight, `isPending` reports it, and the Status counts the new items once they land

`test/ssr-app` renders a Combobox on the server, with its text and value, and selects an item after hydration.

`test/combobox/Combobox.hydrate.test.tsx`

- The server HTML has the Input with `defaultInputValue`, the hidden input with the value, the Trigger and a hidden Popup with its List and items, linked by ids, and no item active
- A `defaultOpen` Combobox renders closed on the server, with `data-open`
- Hydration adopts the server's elements without warnings, shows the selected item's label in a Combobox without `defaultInputValue`, and opens a `defaultOpen` Combobox
- Opens by click and by key after hydration, and selects an item (C)

## Left out

| Case                                                       | Reason                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Several selected items                                     | Multi Combobox's (#206; `src/multi-combobox/README.md`): another keyboard model, chips in the input and a value of another type, an array, so a component that builds on this one, not a flag (PLAN.md section 6, rule 6)                                      |
| Inline completion (`aria-autocomplete="both"`)             | It writes the rest of the first match into the input, selected, which needs the caret managed on every key; free text with suggestions is Autocomplete's question (#104)                                                                                       |
| Automatic selection (the first match active as you type)   | The example selects manually; with automatic selection a screen reader reads an option on every key, and Tab or blur would pick an item the user never chose                                                                                                   |
| Virtualised lists                                          | Items register from the document, and filtering keeps the list short; a list of thousands is filtered on the server                                                                                                                                            |
| Built-in filtering in the component                        | The consumer renders the items that match ("Filtering is the consumer's"); `includesText` is the filter                                                                                                                                                        |
| Opening on focus or on a press in the input                | Decisions, "Opening"                                                                                                                                                                                                                                           |
| Selecting a typed text that matches an item exactly        | The user selects; on blur the text goes back to the selection                                                                                                                                                                                                  |
| A light-dismissed list (`popover="auto"`)                  | A press in the input would close it ("Settled after Phase 2")                                                                                                                                                                                                  |
| PageUp and PageDown                                        | Not in the pattern or the example for an editable combobox, where the list is short once filtered                                                                                                                                                              |
| The text following a controlled value changed from outside | The text is the consumer's then: a controlled value changed from outside comes with `inputValue`, or the text follows once focus leaves                                                                                                                        |
| `readOnly`                                                 | As Select: not asked for yet                                                                                                                                                                                                                                   |
| Autofill                                                   | The Input has `autocomplete="off"`, so the browser's own suggestions do not cover the list; the hidden input holds a value, not text the browser could fill                                                                                                    |
| Label, Description and error parts, `data-invalid`         | Field's (#141). Joining a Field is not built or tested yet: as `Field.Control`'s `render`, the Input would take the Field's `name` and submit its text beside the hidden input; Multi Combobox's Input drops it (`src/multi-combobox/README.md`, "In a Field") |
| An Arrow, a modal Combobox, parts outside the Root         | As for Menu and Select (`src/menu/README.md`, "Left out")                                                                                                                                                                                                      |
| Firefox and WebKit                                         | Tests run in Chromium (PLAN.md section 5)                                                                                                                                                                                                                      |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite),
and the docs page's example driven in headless Chromium on 2026-11-23:
typing, the arrow keys, Enter, the Trigger, Escape and Tab, with no
diagnostic or warning logged. No screen reader has been tried yet, so the
announcement of the active item and of the Status is unverified. A Status
inside the Popup gets its text in the update that shows the Popup, which
some screen readers do not announce: for the count, the README's advice
is a visually hidden Status beside the input, always in the document; no
example shows one yet. #245 asks a person to try it.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part and `includesText`, Rolldown, minified, gzipped, Solid left out.
Measured on 2026-11-25, after #165.

| Entry point       | Size     | Budget  |
| ----------------- | -------- | ------- |
| `menhir/combobox` | 11,655 B | 12.5 kB |

The budget was set before the behaviour, at Select's (12.5 kB): Combobox
has no typeahead, Value or autofill path, and adds the Input's keys, the
List, Clear, Status and `includesText`. Most of it is `@floating-ui/dom`,
as for Select. Sharing its state, Input and item code and the context with
Autocomplete (#104) added 78 B (11,490 B before).

11,568 B before #165, which moved the form reset to `core/formReset.ts`. A
control alone pays for the helper; an app with several pays for it once
(`src/input/README.md`, "Size").

11,652 B after #206, where each Root's `select` closes its own list instead
of returning whether the shared Input and Item should, for Multi Combobox,
whose list stays open.
