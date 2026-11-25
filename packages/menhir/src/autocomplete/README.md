# Autocomplete

A text input with suggestions, such as a search box that offers "nor" as
"Norway" and "Normandy" but sends whatever is typed: the WAI-ARIA combobox
pattern, as its list autocomplete example applies it, with manual selection.
It builds on Combobox (`src/combobox/README.md`), whose decisions it keeps
unless this README says otherwise (#104; PLAN.md section 8, "API
conventions", "Autocompletes").

## When to use it

**A Combobox picks a value from a list; an Autocomplete is free text with
suggestions.** Use Combobox when the answer must be one of the items, such as
a country, and the form needs its value, not its label. Use Autocomplete when
any text is an answer and the list only saves typing, such as a search, a
tag or a city.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Read       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                              | 2026-11-23 |
| WAI-ARIA [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (no date on the page): an editable combobox "may either allow users to input any arbitrary value, or it may restrict its value to a discrete set of allowed values"; with list autocomplete and manual selection, "the character string the user has typed will become the value of the combobox unless the user selects a value in the popup". `aria-autocomplete` is `none`, `list` or `both` (inline completion) | 2026-11-23 |
| WAI-ARIA [list autocomplete example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/) (page last updated 12 August 2025): free text, "the typed string becomes the value of the combobox" when focus leaves without a choice; Enter sets the text to the active option and closes; Escape closes the open list, and clears the text when closed; `aria-selected="true"` only on the option `aria-activedescendant` names                                     | 2026-11-23 |
| Size: PLAN.md section 6, rules 3, 4 and 6. The budget was set before the behaviour (below)                                                                                                                                                                                                                                                                                                                                                                                                          | 2026-11-23 |

## Settled after Phase 2

The ticket was written on 2026-11-22, before the `floating` layer existed.
Checked on 2026-11-23 against what Phase 2 and Phase 3 built:

- **Popup conventions** (#31): as Combobox's, which keeps them: a Root that
  renders no element and holds `open`, `defaultOpen` and
  `onOpenChange(open, { reason, event })`, `data-open` and `data-closed`,
  ids the Root generates. No new reason.
- **What the browser does for popups** (#94): as for Combobox, a manual
  popover, closed by Escape and focus leaving the input. Nothing changed
  for this pattern.
- **Modules**: Combobox (#103) exists under that name, and `popupBases` in
  `packages/menhir/layers.ts` gains `autocomplete: "combobox"`. Positioning,
  presence and list navigation come through Combobox's parts.
- **How Combobox was built, and whether this is a component of its own**:
  yes. The difference is the value, not one prop: the text is the value,
  the input is the form's control, focus leaving keeps the text, and items
  have no selected state. As a flag on Combobox it would change the form's
  view, focus leaving, the items and the ItemIndicator, and every app with a
  Combobox would ship both (PLAN.md section 6, rule 6).

## The platform first

A native `<input list>` with a `<datalist>` is an autocomplete: free text,
with suggestions. But the browser draws its list, which no CSS reaches,
matches the text as it chooses (Chromium by substring, others by prefix),
cannot show a loading or empty message, and gives a screen reader no count.
So Autocomplete is built on Combobox, on `popover`.

## Shape

`Autocomplete.Root` renders no element: it holds the text and whether the
list is open. `Autocomplete.Input` renders an `<input type="text"
role="combobox">`, which is the form's control itself. `Autocomplete.Item`
renders a `<div role="option">`, a suggestion. The other parts are
Combobox's, re-exported: `Trigger`, `Clear`, `Popup`, `List`, `Group`,
`GroupLabel` and `Status`, and `includesText`.

```tsx
const cities = ["Oslo", "Bergen", "Trondheim", "Stavanger"];
const [query, setQuery] = createSignal("");
const shown = createMemo(() =>
  cities.filter((city) => includesText(city, query())),
);

<label for="city" id="city-label">City</label>
<Autocomplete.Root
  name="city"
  onValueChange={(text, { reason }) =>
    setQuery(reason === "input-change" ? text : "")
  }
>
  <Autocomplete.Input id="city" />
  <Autocomplete.Popup>
    <Autocomplete.List aria-labelledby="city-label">
      <For each={shown()}>
        {(city) => <Autocomplete.Item value={city}>{city}</Autocomplete.Item>}
      </For>
    </Autocomplete.List>
  </Autocomplete.Popup>
</Autocomplete.Root>
```

What the browser does, the `floating` layer adds, and the parts decide are
Combobox's (`src/combobox/README.md`, "Shape"): a manual popover in the top
layer, placed by `positioning`, with `list-navigation/activeDescendant` for
the items. `menhir/autocomplete` bundles no roving list, typeahead,
dismissal, focus, scroll lock or hover (`test/bundle-size/popupModules.ts`).

### Decisions

- **It builds on Combobox**, as Alert Dialog builds on Dialog (#32; PLAN.md
  section 6, rule 4): it re-exports Combobox's `Trigger`, `Clear`, `Popup`,
  `List`, `Group`, `GroupLabel`, `Status` and `includesText`, and has its
  own `Root`, `Input` and `Item`. Its Root shares a combobox through
  Combobox's context, so the re-exported parts work inside it unchanged.
  What the two Roots, Inputs and Items have in common is in Combobox's
  folder, and each calls it: `createComboboxBase` in
  `combobox/root/ComboboxContext.ts`, the open state, list navigation, the
  List's `id` and the `data-*` attributes; `createComboboxInput` in
  `combobox/input/createComboboxInput.ts`, the Input's keys, draft and focus
  handling, where focus leaving closes the list and calls back the Input
  that wants more, as Combobox's does to put the label back;
  `createComboboxItem` in `combobox/item/createComboboxItem.ts`,
  an item's entry, `id`, pointer and click. Its own parts add only the text,
  the form props and `aria-selected`. So an app that uses both pays for the
  shared code once (see "Size"). In development, a shared part outside
  either Root throws an error that names both components, and its own
  Input and Item throw inside a Combobox's Root, as Combobox's own throw
  inside an Autocomplete's: each Root says which it is.
- **The value is the text.** `value`, `defaultValue` (default `""`) and
  `onValueChange(text, { reason, event })` on the Root, with Combobox's
  reasons for its input value but `focus-out`: `input-change`,
  `item-press`, `escape-key`, `clear-press` and `reset`. A consumer that
  filters filters by the text for `input-change` only, as with Combobox,
  so a list opened after a choice shows every suggestion. There is no
  `inputValue`: the two are one.
- **The Input is the form's control.** It takes `name`, `form`, `required`
  and `disabled` from the Root, so the form receives the text, the browser
  validates it and focuses it when it blocks a submission, and no hidden
  input is rendered. `required` is the native attribute: any text satisfies
  it. A form reset puts the text back to `defaultValue`, through the setter,
  so a controlled Autocomplete asks, in a task after the `reset` event, as
  Combobox's does (`core/formReset.ts`, #165). `autocomplete="off"` keeps
  the browser's own suggestions from covering the list, as on Combobox; the
  consumer's wins.
- **Accepting a suggestion fills the input**: a click on an item, or Enter
  while it is active, sets the text to the item's `value` and closes the
  list (`item-press`). The caret goes to the end, where the browser puts it
  after a write. The item's content may differ from its `value`, such as a
  highlighted match or an icon. Text that matches no suggestion is kept.
- **Items have no selected state**: there is no selected item, only the
  text. As the example does, an item has `aria-selected="true"` while it is
  the active item, which the input names in `aria-activedescendant`, and no
  `aria-selected` otherwise; `data-active` carries it for CSS. No
  `data-selected` or `data-unselected`, and no ItemIndicator.
- **Focus leaving keeps the text**, whatever it is, and closes the list
  (`focus-out`), as the example does.
- **Escape** closes the open list and keeps the text; on a closed list it
  empties the text (`escape-key`), and is not cancelled when the text is
  already empty, so a dialog around it closes. Clear empties the text
  (`clear-press`).
- **Opening and the other keys** are Combobox's: typing opens the list with
  no item active, Down and Up open it on the first or last item and move,
  wrapping, Alt+Down opens and Alt+Up closes, Enter with no item active
  closes the list and lets a form submit, Tab closes and accepts nothing, a
  key down while an input method composes is the method's, and focus alone
  opens nothing.
- **List autocomplete, no inline completion**: `aria-autocomplete="list"`.
  Inline completion is left out (below).
- **The server renders the text** as the Input's `value`: unlike Combobox,
  it needs no item's label. A `defaultOpen` Autocomplete renders closed on
  the server, and hydration opens it.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part of its own
that renders an element. "A" marks a case the WAI-ARIA combobox pattern or
its list autocomplete example requires, "C" a case that runs only in
Chromium (`it.skipIf(isJSDOM)`). The re-exported parts are Combobox's, and
tested there; `Autocomplete.test.tsx` checks that they work inside an
Autocomplete.

`root/AutocompleteRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default, with `data-closed`; `defaultOpen` starts open, with `data-open` and no item active
- Uncontrolled open: the Trigger opens and closes it; `onOpenChange` gets each value with its reason and event
- Controlled open: the Trigger only asks
- The text is empty by default; `defaultValue` is the text at first
- Uncontrolled value: typing calls `onValueChange` with the text and `input-change`; accepting an item with its `value` and `item-press`
- Controlled value: typing and accepting only ask, and the input keeps the controlled text; follows a controlled value changed from outside
- Changes before async work that `onValueChange` starts settles (PLAN.md "API conventions")

`input/AutocompleteInput.test.tsx`

- Renders an `<input type="text">` with the `combobox` role, `aria-autocomplete="list"`, `aria-controls` naming the List and `autocomplete="off"`, and no hidden input after it; the consumer's `autocomplete` wins (A)
- `aria-expanded` is `"false"` while closed and `"true"` while open (A)
- Takes the consumer's `id`, and a `<label for>` names it (A)
- Typing opens the list with no item active, reporting `input-change` (A)
- Down Arrow opens the list on the first item, Up Arrow on the last; open, they move the active item, which the input names in `aria-activedescendant`, wrapping (A)
- Enter accepts the active item: the text becomes its `value`, the list closes reporting `item-press`, and the key is cancelled (A)
- Enter with no item active closes the list, keeps the text and is not cancelled (A)
- Escape closes the open list and keeps the text; on a closed list it empties the text, reporting `escape-key`; on an empty closed one it is not cancelled (A)
- Focus leaving closes the list, reporting `focus-out`, and keeps a typed text that matches no item (A)
- Tab closes the list and keeps the text (C)
- `disabled` on the Root disables the input, with `data-disabled`
- Throws a descriptive error outside `Autocomplete.Root`, and inside `Combobox.Root`

`input/AutocompleteInput.form.test.tsx`

- `name`, `form`, `required` and `disabled` go on the input
- Submits the text under `name`, typed or accepted; nothing while disabled
- `required` blocks submission while the text is empty, and not once any text is typed
- A form reset puts back `defaultValue`; when controlled, it asks
- By a real press of the reset button (Chromium only, since a script's click runs no microtask between the listeners): a reset taken puts back `defaultValue`, which the form submits; a reset declined keeps `value`; a reset a later listener cancels asks for nothing

`item/AutocompleteItem.test.tsx`

- Renders a `<div role="option">` with an `id`, the consumer's if given, and no `aria-selected` while not active (A)
- The active item has `aria-selected="true"` and `data-active`, only while the list is open (A)
- A click accepts the item, sets the text to its `value` and closes the list, reporting `item-press` (A)
- A press on an item keeps focus in the input and fills it in (C)
- An item whose content differs from its `value` fills in the `value`
- A disabled item has `aria-disabled` and `data-disabled`, is reached by the keys, and is not accepted by a click or Enter
- The pointer moving onto an item makes it active (C)
- Throws a descriptive error outside `Autocomplete.Root`, and inside `Combobox.Root`

`Autocomplete.test.tsx`, Combobox's parts inside an Autocomplete, and parts inside the other Root

- Clear empties the text, reporting `clear-press`, and focuses the input
- The Status counts the suggestions while the list is open
- Items in a Group, named by its GroupLabel, are reached in document order
- Combobox's own Input and Item throw inside `Autocomplete.Root`, and Autocomplete's inside `Combobox.Root`, naming the Root they were placed in

`Autocomplete.async.test.tsx`

- Suggestions from an async computation: the input shows each key as it is typed, `<Loading>` shows its fallback until the first answer lands, and the keys reach the suggestions once they have

`test/ssr-app` renders an Autocomplete on the server with its text, and accepts a suggestion after hydration.

`test/autocomplete/Autocomplete.hydrate.test.tsx`

- The server HTML has the Input with `defaultValue` as its value and `name`, and a hidden Popup with its List and items, linked by ids, and no item active
- A `defaultOpen` Autocomplete renders closed on the server, with `data-open`
- Hydration adopts the server's elements without warnings, and opens a `defaultOpen` Autocomplete
- Opens by click and by key after hydration, and accepts a suggestion (C)

## Left out

| Case                                                                                                 | Reason                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inline completion (`aria-autocomplete="both"`)                                                       | It writes the rest of the first match into the input, selected, which means managing the caret and the selection on every key, deletion and input method; an app that wants it pays for it in every Autocomplete (rule 6) |
| Automatic selection (the first suggestion active)                                                    | As Combobox: a screen reader would read a suggestion on every key, and Enter would replace the typed text with a suggestion the user never chose                                                                          |
| The text following the active item as the keys move                                                  | The example changes the text only on Enter; changing it on each arrow key would filter the list by a suggestion                                                                                                           |
| A selected item, `data-selected` and an ItemIndicator                                                | The value is the text, not an item (Decisions); an app can mark the item equal to the text itself                                                                                                                         |
| Hiding the list when no suggestion matches                                                           | The list opens as Combobox's does; a Status in the Popup says that nothing matches, or the app styles the Popup with `:has()` or controls `open`                                                                          |
| Several values, such as tags                                                                         | As Combobox: another keyboard model and a value of another type                                                                                                                                                           |
| `inputValue`, apart from the value                                                                   | The text is the value                                                                                                                                                                                                     |
| Built-in filtering, virtualised lists, PageUp and PageDown, a light-dismissed list, opening on focus | As Combobox (`src/combobox/README.md`, "Left out")                                                                                                                                                                        |
| `readOnly`                                                                                           | As Combobox: not asked for yet                                                                                                                                                                                            |
| Label, Description and error parts                                                                   | Field's (Phase 4, #141); until then a native `<label>` and `aria-describedby`                                                                                                                                             |
| Firefox and WebKit                                                                                   | Tests run in Chromium (PLAN.md section 5)                                                                                                                                                                                 |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite). No
screen reader has been tried yet, so the announcement of the active item and
of the Status is unverified, as for Combobox.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part and `includesText`, Rolldown, minified, gzipped, Solid left out.
Measured on 2026-11-25, after #165.

| App                                         | Size     | Budget  |
| ------------------------------------------- | -------- | ------- |
| `menhir/autocomplete`                       | 10,843 B | 11.5 kB |
| `menhir/combobox`                           | 11,655 B | 12.5 kB |
| `menhir/combobox` and `menhir/autocomplete` | 11,895 B |         |

The budget was set before the behaviour, at Combobox's less its hidden
input, value, labels and ItemIndicator. An app with both pays 233 B over
Combobox alone, Autocomplete's own Root, Input and Item, instead of
10,766 B for a second copy: the shared parts, the shared state, Input and
item code, and the `floating` modules are bundled once (`test/package`
checks it on the built package). Sharing that code cost Combobox 78 B
(11,490 B before #104). Most of either is `@floating-ui/dom`.

The two together were measured as `test/bundle-size/comparison.size-limit.js`
measures components together: an app that imports both entry points and
uses every part of each.

10,766 B before #165, which moved the form reset to `core/formReset.ts`.
The two together were 11,801 B. A control alone pays for the helper; an app
with several pays for it once (`src/input/README.md`, "Size").
