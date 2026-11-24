# Checkbox

A control that the user checks or unchecks, with an optional partly checked
state: the WAI-ARIA checkbox pattern.

## Sources

| Source                                                                          | Read       |
| ------------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) | 2026-11-21 |

## Shape

`Checkbox.Root` renders a native `<button type="button" role="checkbox">`,
then a visually hidden `<input type="checkbox">` beside it for forms, as
Switch does (PLAN.md section 8, "API conventions").
`Checkbox.Indicator` renders a `<span>` for the check mark, always present,
carrying the Root's `data-*` attributes so that CSS shows or hides it.

The partly checked state is the consumer's `indeterminate` prop, typically
worked out from a group of checkboxes. While it is set, `aria-checked` is
`"mixed"`. A click still turns `checked` to its opposite, as on a native
checkbox, so a mixed checkbox whose `checked` is false asks to be checked.

Only Space toggles it. The pattern names no other key, and a native checkbox
does not toggle on Enter, so the button cancels Enter.

Root's form behaviour is a copy of Switch's: Switch does not import
Checkbox, and the shared part moves to `core` once Radio shows its shape.
Checkbox Group builds on Checkbox (`simpleBases` in
`packages/menhir/layers.ts`, #146): its Item and Parent render
`Checkbox.Root`, which reads nothing of the group, so this entry point
bundles none of it.

## In a Field

```tsx
<Field.Root name="terms">
  <Field.Control render={Checkbox.Root} required>
    <Checkbox.Indicator />
  </Field.Control>
  <Field.Label>Accept the terms</Field.Label>
  <Field.Description>You can read them on the next page.</Field.Description>
  <Field.Error />
</Field.Root>
```

Decided with #143, on 2026-11-23, after Field (`src/field/README.md`), as
for Switch:

- **Checkbox reads nothing from the Field.** `Field.Control` hands the
  button the Field's `id`, `aria-describedby`, `aria-invalid` and `data-*`
  attributes, and the hidden input its `name` and `disabled`, through the
  props Checkbox passes on. Its code did not change, so a Checkbox with no
  Field around it behaves as before: its own tests are unchanged, and
  `test/bundle-size/fieldModules.test.ts` checks that it bundles no module
  of `src/field`.
- **The value props go on the Checkbox.** A controlled Checkbox is
  rendered with a function, `render={(p) => <Checkbox.Root {...p}
checked={accepted()} onCheckedChange={setAccepted} />}`: `Field.Control`
  is typed for an `<input>`, which has no `onCheckedChange`.
- **The Field's `data-invalid` and `data-touched` are on the button only**,
  not on the Indicator. The Indicator is always inside the button, so
  `[data-invalid] .indicator` reaches it; carrying them would make
  Checkbox read the props a Field hands it, in every Checkbox, for what one
  selector does. The Indicator keeps the checkbox's own `data-*`,
  `data-disabled` included, which a Field's `disabled` sets through the
  Checkbox's.
- **A `required` Checkbox that is unchecked** is invalid by its hidden
  input's `valueMissing`, mixed or not, since the form reads `checked`
  alone. Its error shows once the Field is touched: focus left it, it was
  checked and unchecked, or a submission was attempted. An Error with no
  children shows the browser's message for the hidden input; children, or
  `match="valueMissing"`, show the app's. When the browser blocks a
  submission it focuses the hidden input, which moves focus to the button
  ("The hidden input is the form's view of the control", PLAN.md section
  8), and the button's accessible description then has the error.
- **A form reset** puts the Checkbox back to `defaultChecked` and clears
  the Field's touched state, so no error shows until it is touched again,
  even when its default is unchecked.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks both parts against the
part conventions. "A" marks a case the WAI-ARIA pattern requires.

`root/CheckboxRoot.test.tsx`

- Renders a button with role `checkbox` and type `button` (A)
- `aria-checked` is `"false"` by default and `"true"` with `defaultChecked` (A)
- `aria-checked` is `"mixed"` while `indeterminate`, whatever `checked` is, and follows `indeterminate` changing (A)
- The hidden input is a checkbox, hidden from assistive technology and the tab order, and mirrors `checked`
- `name` and `value` are set only on the input; `value` is absent by default, so the browser submits `"on"`
- `id` goes on the button
- The consumer's attributes override the part's own
- `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-errormessage` pass through (A: label, description)
- A wrapping `<label>` names the checkbox and toggles it (A: label)
- A `<label for>` names the checkbox and toggles it (A: label)
- Toggles on click
- Focuses with Tab and toggles with Space (A)
- Enter does not toggle it, nor call `onCheckedChange`; the consumer's `onKeyDown` still runs
- Uncontrolled: calls `onCheckedChange` with each new value
- `defaultChecked` starts checked and toggles off
- Controlled checked and unchecked: stays put, asks with the requested value, the hidden input stays in step
- Follows a controlled value changed from outside
- Mixed and unchecked: a click asks for `true`; mixed and checked: a click asks for `false`
- A mixed parent of a group: checking it checks every child and the parent leaves the mixed state; unchecking it unchecks every child; one child checked makes it mixed again (A: tri-state example)
- Checks before async work that `onCheckedChange` starts settles, and the hidden input with it (PLAN.md "API conventions")
- Toggles when the hidden input is clicked
- Ignores a hidden-input click canceled before it is handled
- Fires native `input` and `change` events that reach the form
- One user click reaches ancestors once; a consumer's `stopPropagation()` stops it but the checkbox still toggles
- Calls the consumer's `onClick`
- Tolerates a ref callback that clicks before the hidden input exists
- `disabled`: native `disabled` on the button and the input, no toggle, not focusable; absent when not set; follows changes while rendered
- `readOnly`: `aria-readonly`; a click, Space or a label click does not toggle or call `onCheckedChange`; absent when not set
- `required`: `aria-required` on the button, `required` on the input; absent when not set
- `data-checked`, `data-unchecked` and `data-indeterminate`, exactly one at a time, then `data-disabled`, `data-readonly`, `data-required`, on Root and Indicator, and they follow changes
- Form: submits `"on"` when checked and nothing when unchecked, as a native checkbox does; a mixed checkbox submits by its `checked`
- Form: submits a custom `value`
- Form: submits to the form named by `form`
- Form: a disabled checkbox submits nothing
- Form: a form reset goes back to `defaultChecked`; when controlled, it asks with `onCheckedChange`
- Form: the form's `change` listener and `FormData` see the new value
- Form: `required` blocks submission while unchecked
- Form: when the browser blocks the submission, focus moves to the checkbox; Chromium only, since jsdom does not focus the invalid control
- `render` with a button component keeps the checkbox's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- The consumer's `class` and `ref` reach the button

`Checkbox.field.test.tsx`, in a Field through `Field.Control`'s `render`

- Labelled by the Label, which toggles it; described by the Description; submits under the Field's `name`
- `required` and unchecked: no error before it is touched
- A submission while unchecked is blocked, and the browser's message shows as its error, with `aria-invalid` on the button, `data-invalid` on the Root, the Label and the button, and the error in the button's accessible description
- The app's message shows instead; checking it hides it, and the form then submits `"on"`
- Mixed and unchecked, a submission is blocked and its error shows, as the form reads `checked` alone
- Focus leaving it unchecked shows its error; so does checking and unchecking it
- The Indicator carries the checkbox's `data-*` and not the Field's, which are on the button around it
- The Field's `disabled`: the button and the hidden input are disabled, it ignores a label click, the form submits nothing, and the Indicator has `data-disabled`
- A reset goes back to `defaultChecked` and hides the error; a reset that leaves it unchecked and invalid shows no error until it is touched again; a controlled Checkbox is asked, and the error hides
- When the browser blocks the submission, focus moves to the checkbox, whose accessible description has the error; Chromium only, since jsdom does not focus the invalid control

`indicator/CheckboxIndicator.test.tsx`

- Renders a `<span>` inside the checkbox, carrying the Root's `data-*` attributes
- Throws a descriptive error outside `Checkbox.Root`

`test/checkbox/Checkbox.hydrate.test.tsx`

- The server HTML has the button with its role and `aria-checked`, `"mixed"` included, the hidden input, the `data-*` attributes, and a name from a `<label for>` before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the checkbox toggles by click and by Space afterwards
- In a Field: the server HTML has the Label's `for` matching the button's `id`, the Description in its accessible description, and no error
- In a Field: hydration adopts the server's elements without warnings; a blocked submission afterwards shows the error, and a label click checks it and hides it

## Left out

| Case                                                                            | Reason                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cycling a mixed checkbox through a remembered combination of its group          | The group's state is the consumer's; the checkbox reports the requested `checked` value. Checkbox Group's Parent owns it (`src/checkbox-group/README.md`, #146)              |
| `aria-controls` from a parent checkbox to its group                             | The consumer passes it through; the checkbox does not know its group                                                                                                         |
| The `group` role and its label around a set of checkboxes                       | A `<fieldset>` and `<legend>` give both natively; Checkbox Group renders them around a list of values (#146)                                                                 |
| `indeterminate` on the hidden input                                             | The input is hidden from sight and from assistive technology, and a form submits by `checked` alone                                                                          |
| Implicit form submission on Enter, as some browsers do for a native checkbox    | Not in the pattern; Enter does nothing                                                                                                                                       |
| Generated ids for the root and for ids derived from it                          | No generated ids: the button takes the consumer's `id`, or a Field's, and no part links to another                                                                           |
| Label, Description and ErrorMessage parts, and their ids combined into `aria-*` | Field's: a Checkbox joins a Field through `Field.Control`'s `render` (In a Field); without one, a native `<label>` labels the button                                         |
| A validation state of its own, `data-valid`, `data-invalid`                     | A Field's: it reads the hidden input's validity and puts `data-invalid` and `data-touched` on the button (In a Field); without one, a consumer passes `aria-invalid` through |
| The Field's `data-invalid` and `data-touched` on the Indicator                  | The Indicator is inside the button, which has them: `[data-invalid] .indicator` (In a Field)                                                                                 |
| Unmounting the Indicator while unchecked                                        | CSS hides it by its `data-*` attributes, at no cost in code                                                                                                                  |
| Keyboard modifiers in the change callback, and canceling a change               | `onCheckedChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                          |
| A ref to the hidden input                                                       | Deferred until a form library needs it, as for Switch                                                                                                                        |
| A value submitted while unchecked                                               | Deferred, as for Switch                                                                                                                                                      |

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-23, after #143.

| App               | Size    | Budget |
| ----------------- | ------- | ------ |
| `menhir/checkbox` | 1,677 B | 2 kB   |

No growth from #143: Checkbox joins a Field with no change to its code,
and the size is the one measured before and after Field (#141).
