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

Root's form behaviour is a copy of Switch's: components do not import each
other, and the shared part moves to `core` once Radio shows its shape.

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

`indicator/CheckboxIndicator.test.tsx`

- Renders a `<span>` inside the checkbox, carrying the Root's `data-*` attributes
- Throws a descriptive error outside `Checkbox.Root`

`test/checkbox/Checkbox.hydrate.test.tsx`

- The server HTML has the button with its role and `aria-checked`, `"mixed"` included, the hidden input, the `data-*` attributes, and a name from a `<label for>` before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the checkbox toggles by click and by Space afterwards

## Left out

| Case                                                                            | Reason                                                                                                                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cycling a mixed checkbox through a remembered combination of its group          | The group's state is the consumer's; the checkbox reports the requested `checked` value. Checkbox Group, which could own it, is tracked with the Phase 4 form components |
| `aria-controls` from a parent checkbox to its group                             | The consumer passes it through; the checkbox does not know its group                                                                                                     |
| The `group` role and its label around a set of checkboxes                       | A `<fieldset>` and `<legend>` give both natively; Checkbox Group is Phase 4                                                                                              |
| `indeterminate` on the hidden input                                             | The input is hidden from sight and from assistive technology, and a form submits by `checked` alone                                                                      |
| Implicit form submission on Enter, as some browsers do for a native checkbox    | Not in the pattern; Enter does nothing                                                                                                                                   |
| Generated ids for the root and for ids derived from it                          | No generated ids: the button takes the consumer's `id`, and no part links to another                                                                                     |
| Label, Description and ErrorMessage parts, and their ids combined into `aria-*` | Those parts belong to Field (Phase 4); a native `<label>` labels the button                                                                                              |
| A validation state, `data-valid`, `data-invalid`                                | Validity comes with Field; until then a consumer passes `aria-invalid` through                                                                                           |
| Unmounting the Indicator while unchecked                                        | CSS hides it by its `data-*` attributes, at no cost in code                                                                                                              |
| Keyboard modifiers in the change callback, and canceling a change               | `onCheckedChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                      |
| A ref to the hidden input                                                       | Deferred until a form library needs it, as for Switch                                                                                                                    |
| A value submitted while unchecked                                               | Deferred, as for Switch                                                                                                                                                  |
