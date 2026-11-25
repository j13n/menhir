# Checkbox Group

Several checkboxes that hold one list of values: the user checks any number
of options, and the form receives one entry per checked box. An optional
parent checkbox checks all of them, none, or shows that some are checked:
the WAI-ARIA checkbox pattern and its mixed-state example.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                            | Read       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                            | 2026-11-24 |
| [WAI-ARIA checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/): Space toggles; a group with a visible label is a `group` named by it; a system may remember the last mixed combination and recreate it on the third activation                                   | 2026-11-24 |
| [WAI-ARIA mixed-state checkbox example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/) (updated 2025-08-12), and its script: the children in a `<fieldset>` with a `<legend>`; the cycle and the remembered combination (Decisions); `aria-controls` | 2026-11-24 |
| HTML standard, [constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints) and [the fieldset element](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element)                                            | 2026-11-24 |
| Checkbox's decisions (`src/checkbox/README.md`), Field's (`src/field/README.md`) and the Fieldset recipe (`src/fieldset/README.md`)                                                                                                                                               | 2026-11-24 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                           | 2026-11-24 |

## Shape

```tsx
<CheckboxGroup.Root name="toppings" defaultValue={["cheese"]}>
  <legend>Toppings</legend>
  <label>
    <CheckboxGroup.Parent values={["cheese", "olives"]}>
      <CheckboxGroup.Indicator />
    </CheckboxGroup.Parent>
    All toppings
  </label>
  <label>
    <CheckboxGroup.Item value="cheese">
      <CheckboxGroup.Indicator />
    </CheckboxGroup.Item>
    Cheese
  </label>
  <label>
    <CheckboxGroup.Item value="olives">
      <CheckboxGroup.Indicator />
    </CheckboxGroup.Item>
    Olives
  </label>
</CheckboxGroup.Root>
```

- `CheckboxGroup.Root` renders a `<fieldset>`, named by the `<legend>`
  inside it, and holds the list of values. A visually hidden input after it
  carries the group's `required` (Decisions).
- `CheckboxGroup.Item` is a `Checkbox.Root` with a `value`, checked while
  the list has it, submitted under the group's `name`.
- `CheckboxGroup.Parent` is a `Checkbox.Root` over the `values` it is given:
  checked while the list has all of them, mixed while it has some.
- `CheckboxGroup.Indicator` is `Checkbox.Indicator`, re-exported.

### Decisions

- **It builds on Checkbox.** Item and Parent render `Checkbox.Root`, so the
  button, the hidden input, the keys, `readOnly`, `render` and the dev
  warning are Checkbox's, and an app with both pays for them once.
  `simpleBases` in `packages/menhir/layers.ts` names `"checkbox-group":
"checkbox"`, the one simple component it may import besides `core`, as
  `popupBases` does for popups (PLAN.md section 6, rule 4). Checkbox reads
  no context of the group's, so `menhir/checkbox` bundles nothing of it
  (`test/bundle-size/checkboxGroupModules.test.ts`), and a Checkbox outside
  a group pays nothing.
- **The value** is `value`, `defaultValue` and `onValueChange` on the Root:
  an array of the checked Items' values in every mode, `[]` when empty
  (PLAN.md section 8, "Controlled state"). A box checked is added at the
  end, so the list is in the order the user checked; the form's data is in
  the document's order, as the browser builds it. Values the list holds
  with no Item for them are kept. The list is held with
  `createControllableSignal`, not `core/listValue.ts`, whose `set` takes
  one item: the Parent and a reset set the whole list.
- **What the form receives:** each Item's hidden input takes the group's
  `name` and `form` and its own `value`, so the form has one entry per
  checked box under the name (`formData.getAll(name)`), and nothing when
  none is checked, as for native checkboxes. The Parent's hidden input has
  no name, so it submits nothing.
- **The element is a `<fieldset>`**, named by a native `<legend>` inside
  it, as the mixed-state example and the Fieldset recipe have it: the
  `group` role and its name are in the server HTML, with no id to link.
  The group's `disabled` is the fieldset's too, so it disables every
  control in it, an app's own "Other" input included. `render` makes it a
  `<div role="group" aria-labelledby>` for a group named by an element
  outside it.
- **`disabled`** on the Root disables the fieldset and every Item and the
  Parent through the group's context, so each box and its Indicator get
  `data-disabled`; the Root has `data-disabled` too. `disabled` on an Item
  disables that box alone. The form submits no disabled box.
- **`required` means at least one.** The browser has no such constraint,
  so the Root renders a visually hidden `<input type="radio">` right after
  the fieldset, never checked, and `required` while the list is empty: the
  browser then blocks a submission and focuses it, and the input hands
  focus to the group's first enabled box. A radio, for its message: "Please
  select one of these options." (Chromium and Firefox; "Select one of these
  options" in WebKit), where a checkbox's asks to check "this box", which
  points at nothing in a bubble after the group. Browsers find a radio
  missing only when it has a name, so it takes one from `createUniqueId`,
  which the server render and hydration agree on, unique so that two
  groups' radios never form one radio group, where one group's `required`
  would make the other's radio invalid too. An unchecked radio submits
  nothing; the name is in `form.elements`, the one trace it leaves. Its
  `required` follows the list, not its checkedness, which a form reset
  would put back to its `checked` attribute behind the binding's back. The
  app still gives its own message where it can say what the group is
  (Where the group's error goes).
  No box is `required` itself: each would be announced as required, and
  checking one would take it off the others. The Root has `data-required`;
  the boxes do not, and no `aria-required` is set, since the `group` role
  takes none. The legend says it is required, in the app's words.
- **`required` counts the list, not the form's data.** A value the list
  keeps with no Item for it, or the value of a checked box that is
  disabled, satisfies it although the form submits no entry for it, since
  the group's value, which the app reads, still has it. Counting only the
  boxes the form submits would need every Item to register with the group,
  or the Root to read the DOM after each change, which the server cannot,
  and the browser would then disagree with the app's own
  `value().length > 0`. A box that must stay checked and be submitted, such
  as "Essential cookies", is `readOnly`, not `disabled`: it cannot be
  unchecked, and its hidden input is submitted. The docs page says so.
- **Where the group's error goes:** the group joins a Field as its Control,
  `<Field.Control render={CheckboxGroup.Root}>`, as the Fieldset recipe's
  `<fieldset>` does: the fieldset gets the Field's `aria-describedby`,
  `aria-invalid`, `data-*`, `id`, and the `name` and `disabled` the group
  passes to its boxes. Field reads the hidden radio's `valueMissing` as the
  group's validity, since it is inside the Field's Root, and an Error with
  no children shows the browser's message; `match="valueMissing"` or
  children show the app's. The Error goes inside the fieldset, after the
  boxes, and a native `<legend>` names the group, not `Field.Label`, which
  cannot name a fieldset.
- **The Parent is a part**, so a group without one does not bundle it
  (PLAN.md section 6, rule 6). It takes the `values` it checks, not every
  Item's: a list given as a prop is in the server HTML, where Items
  registering once mounted would leave the Parent's state wrong until
  hydration, and registration would cost every Item. A Parent may cover a
  subset of the group. Its state is derived: checked while the list has
  every value of `values`, mixed while it has some, unchecked while none.
  It checks and unchecks the boxes the app gave it, disabled ones included:
  an app that keeps a disabled box out leaves its value out of `values`.
- **The remembered combination**, as the mixed-state example does it, and
  as the pattern allows ("activating the overall checkbox a third time
  recreates that partially checked state"): a click on a mixed Parent
  checks all; a click on a checked Parent unchecks all; a click on an
  unchecked Parent brings back the combination of its `values` the user
  made last, through the boxes, a reset or the first render, or checks all
  when that is none. A change the Parent makes, all or none, leaves the
  combination as it was. The example's script keeps each box's last state,
  written by the user's clicks and whenever the parent is mixed, which comes
  to the same combination. The Parent derives it in a memo from the list,
  telling its own changes by the list it set; the Root and Item pay
  nothing.
- **A form reset** puts the list back to `defaultValue` through the setter,
  once, so a controlled group asks with one `onValueChange`, in a task
  after the `reset` event, unless the app cancels it (`core/formReset.ts`,
  #165). The Items do
  not ask on their own: each passes its Checkbox a `defaultChecked` equal to
  its current state, so Checkbox's own reset asks for nothing, and puts the
  hidden input back to the box's state.
- **A part used outside its Root throws** a descriptive error in
  development builds.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the Root, the Item and
the Parent against the part conventions. "A" marks a case the WAI-ARIA
pattern or its mixed-state example requires.

`root/CheckboxGroupRoot.test.tsx`

- Renders a `<fieldset>`, a `group` named by its `<legend>` (A)
- `render` renders it as a `<div role="group">` named by `aria-labelledby` (A)
- Uncontrolled: starts at `defaultValue`, `[]` without one, and calls `onValueChange` with each new list, a box checked added at the end
- Controlled: stays put, asks with the requested list, and follows a `value` changed from outside
- Two boxes changed in one turn build on each other, not on the list the first change left unread
- Checks before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- Keeps a value the list holds with no Item for it
- Form: submits one entry per checked box under the group's `name`, in the document's order, and nothing when none is checked
- Form: submits to the form named by `form`
- Form: a form reset goes back to `defaultValue`, and the boxes' hidden inputs with it; when controlled, it asks once with `defaultValue`
- Form: By a real press of the reset button (Chromium only, since a script's click runs no microtask between the listeners): a reset taken goes back to `defaultValue`, which the form submits; a reset declined asks once and keeps `value`; a reset a later listener cancels asks for nothing
- Form: the form's `change` listener and `FormData` see the new value
- `disabled`: disables the fieldset, every box and its hidden input, with `data-disabled` on the Root, each box and its Indicator; no box changes; the form submits nothing; follows changes while rendered
- `required`: blocks a submission while no box is checked; one box checked lets it submit; `data-required` on the Root, and no box is `required` or `aria-required`
- `required`: the browser's message is its message for a missing selection; Chromium only, since jsdom has no messages
- `required`: two required groups in one form are validated each on its own, their hidden radios named apart
- `required`: a form reset to an empty `defaultValue` blocks again, and one to a non-empty `defaultValue` does not
- `required` and `disabled`: never blocks a submission
- `required`: when the browser blocks the submission, focus moves to the first enabled box; Chromium only, since jsdom does not focus the invalid control

`item/CheckboxGroupItem.test.tsx`

- Renders a `Checkbox.Root`: a button with role `checkbox`, checked while the list has its `value` (A)
- Toggles on click and with Space, adding and removing its value (A)
- Its hidden input has the group's `name`, its own `value`, and the group's `form`
- `disabled` on one Item disables that box alone and keeps its value in the list
- The consumer's props reach the Checkbox: `id`, `class`, `aria-label`, `readOnly`, `render`
- A `readOnly` box stays checked, is submitted and satisfies `required`; a disabled one is not submitted
- The Indicator carries the box's `data-checked` and `data-unchecked`
- Throws a descriptive error outside `CheckboxGroup.Root`

`parent/CheckboxGroupParent.test.tsx`

- Unchecked while the list has none of `values`, mixed while some, checked while all, with `data-checked`, `data-indeterminate` or `data-unchecked` (A)
- Follows the boxes as the user checks them (A)
- Checked: a click unchecks every box of `values` (A)
- Mixed: a click checks every box of `values` (A)
- Unchecked with no remembered combination: a click checks every box (A)
- The remembered combination: mixed, checked, unchecked, then the combination of the last mixed state again (A)
- The combination the user makes by changing a box is the one remembered (A)
- Unchecked, after the user's last change left none checked: a click checks every box (A)
- Covers only its `values`: other values in the list are kept, and do not make it mixed
- Submits nothing: its hidden input has no name
- Disabled with the group, and by its own `disabled`
- Controlled group: a click asks with the whole new list
- Throws a descriptive error outside `CheckboxGroup.Root`

`CheckboxGroup.field.test.tsx`, as a Field's Control

- Described by the Field's Description; the boxes submit under the Field's `name`
- `required` and empty: no error before it is touched
- A submission while empty is blocked, and the browser's message shows as its error, with `aria-invalid` and `data-invalid` on the fieldset and the error in its accessible description
- The app's message shows instead (`match="valueMissing"`); checking a box hides it
- Focus leaving the group empty shows its error; focus moving between its boxes does not
- Checking and unchecking a box, which leaves it empty, shows its error
- The Field's `disabled` disables the group and every box
- A Form's error under the Field's `name` shows at once, and hides on the next change of a box
- A reset hides the error and goes back to `defaultValue`

`test/checkbox-group/CheckboxGroup.hydrate.test.tsx`

- The server HTML has the `group` named by its legend, each box's `aria-checked`, the Parent's `"mixed"`, the hidden inputs with the group's `name` and the checked ones checked, before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings; a click on a box and on the Parent change the list afterwards, and the form's data with it

Outside `src`:

- `test/bundle-size/checkboxGroupModules.test.ts`: `menhir/checkbox` bundles no module of `src/checkbox-group`, and `menhir/checkbox-group` does, so the check can fail
- `test/workspace/lint.test.ts`: Checkbox Group may import Checkbox, and Checkbox may not import it back, nor Checkbox Group another simple component

## Left out

| Case                                                                         | Reason                                                                                                                                                                           |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aria-controls` from the Parent to its boxes                                 | The consumer passes it through, as on Checkbox: the Parent knows values, not ids, and generating every Item's id for it would cost every group; screen readers do little with it |
| One tab stop and arrow keys among the boxes                                  | The checkbox pattern names Space only, and Tab moves between checkboxes, as in the mixed-state example                                                                           |
| `aria-required` on the group or the boxes                                    | The `group` role takes none, and on each box it would say each one is required (Decisions)                                                                                       |
| `data-required` on the boxes                                                 | The group is required, not a box; `[data-required]` on the Root, or `:has()`, reaches them                                                                                       |
| A minimum or maximum number of boxes other than "at least one"               | An error from outside: a memo the app passes as the Field's `error`, as the Fieldset recipe does                                                                                 |
| `readOnly` on the group                                                      | Each Item takes Checkbox's `readOnly`; the ticket names none for the group                                                                                                       |
| The Parent registering the Items instead of taking `values`                  | Wrong in the server HTML until hydration, and a cost to every Item (Decisions)                                                                                                   |
| `Field.Label` as the group's name                                            | A `<label for>` cannot name a fieldset; the legend does (Decisions)                                                                                                              |
| A Checkbox that reads the group's context, so `Checkbox.Root` joins directly | Every Checkbox would pay the read and bundle the group's context, which the ticket rules out (`menhir/checkbox` bundles nothing of the group)                                    |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite).
The hidden radio was also tried in Playwright 1.65's Firefox and WebKit
builds on 2026-11-24, with a page of its own outside the suite: in all
three, a named, unchecked, `required` radio is missing and an unnamed one
is not, it submits nothing, and focus moves to the first box when a
submission is blocked; the messages are quoted in Decisions. The rest of
the group has not been tried in Firefox or WebKit. No screen reader has
been tried yet: the group's name from its legend, the Parent's "mixed"
state and its cycle, and the error in the group's description are still to
be heard in VoiceOver, NVDA and JAWS.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25, after #165.

| App                     | Size    | Budget |
| ----------------------- | ------- | ------ |
| `menhir/checkbox-group` | 2,472 B | 2.5 kB |
| `menhir/checkbox`       | 1,799 B | 2 kB   |

The group is 673 B over Checkbox, whose Root and Indicator it bundles, so
an app with both pays for Checkbox once. Both grew with #147, which moved
Checkbox's hidden input to `core` (2,338 B and 1,677 B before;
`src/radio/README.md`, "Size"). An app that renders no Parent
bundles about 180 B less: 2,071 B for Root, Item and Indicator against
2,252 B with the Parent, each measured from an app that uses those parts
alone.

2,391 B before #165, which moved the form reset to `core/formReset.ts`. The
budget was 2.4 kB. A control alone pays for the helper; an app with several
pays for it once (`src/input/README.md`, "Size").
