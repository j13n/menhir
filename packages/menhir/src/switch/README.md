# Switch

A control that turns a setting on or off: the WAI-ARIA switch pattern.

## Sources

| Source                                                                      | Read       |
| --------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) | 2026-11-20 |

## Shape

`Switch.Root` renders a native `<button type="button" role="switch">`, then
a visually hidden `<input type="checkbox">` beside it for forms.
`Switch.Thumb` renders a `<span>`. Why a button and not a `<span>` with the
switch role, or a hidden checkbox that takes focus: PLAN.md section 8, "API
conventions".

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks both parts against the
part conventions. "A" marks a case the WAI-ARIA pattern requires.

`root/SwitchRoot.test.tsx`

- Renders a button with role `switch` and type `button` (A)
- `aria-checked` is `"false"` by default and `"true"` with `defaultChecked` (A)
- The hidden input is a checkbox, hidden from assistive technology and the tab order, and mirrors the state
- `name` and `value` are set only on the input; `value` is absent by default, so the browser submits `"on"`
- `id` goes on the button
- The consumer's attributes override the part's own
- `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-errormessage` pass through
- A wrapping `<label>` names the switch and toggles it
- A `<label for>` names the switch and toggles it
- Toggles on click
- Focuses with Tab, toggles with Enter and with Space (A)
- Uncontrolled: calls `onCheckedChange` with each new value
- `defaultChecked` starts on and toggles off
- Controlled on and controlled off: stays put, asks with the requested value, the hidden input stays in step
- Follows a controlled value changed from outside
- Turns on before async work that `onCheckedChange` starts settles, and the hidden input with it (PLAN.md "API conventions")
- Toggles when the hidden input is clicked
- Ignores a hidden-input click canceled before it is handled
- Fires native `input` and `change` events that reach the form
- One user click reaches ancestors once; a consumer's `stopPropagation()` stops it but the switch still toggles
- Calls the consumer's `onClick`
- Tolerates a ref callback that clicks before the hidden input exists (without a `focus()` call: user-event's patched `focus` throws for an element not yet in a document)
- `disabled`: native `disabled` on the button and the input, no toggle, not focusable; absent when not set; follows changes while rendered
- `readOnly`: `aria-readonly`; a click or a label click does not toggle or call `onCheckedChange`; absent when not set
- `required`: `aria-required` on the button, `required` on the input; absent when not set
- `data-checked`/`data-unchecked`, `data-disabled`, `data-readonly`, `data-required` on Root and Thumb, and they follow changes
- Form: submits `"on"` when on and nothing when off, as a native checkbox does
- Form: submits a custom `value`
- Form: submits to the form named by `form`
- Form: a disabled switch submits nothing
- Form: a form reset goes back to `defaultChecked`; when controlled, it asks with `onCheckedChange`
- Form: the form's `change` listener and `FormData` see the new value
- Form: `required` blocks submission while off
- Form: when the browser blocks the submission, focus moves to the switch; Chromium only, since jsdom does not focus the invalid control
- `render` with a button component keeps the switch's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- The consumer's `class` and `ref` reach the button

`thumb/SwitchThumb.test.tsx`

- Renders a `<span>` carrying the Root's `data-*` attributes
- Throws a descriptive error outside `Switch.Root`

`test/switch/Switch.hydrate.test.tsx`

- The server HTML has the button with its role and `aria-checked`, the hidden input, the `data-*` attributes, and a name from a `<label for>` before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the switch toggles by click and by key afterwards

## Left out

| Case                                                                            | Reason                                                                                              |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Generated ids for the root and for ids derived from it                          | No generated ids: the button takes the consumer's `id`, and no part links to another                |
| Label, Description and ErrorMessage parts, and their ids combined into `aria-*` | Those parts belong to Field (Phase 4); a native `<label>` labels the button                         |
| A validation state, `data-valid`, `data-invalid`                                | Validity comes with Field; until then a consumer passes `aria-invalid` through                      |
| Computing `aria-labelledby` from a sibling or non-native label                  | Only an element that cannot be labelled needs it; a button is labelled natively                     |
| `aria-label` winning over an associated label                                   | The browser's name computation, with no code of Menhir's involved                                   |
| Keyboard modifiers in the change callback, and canceling a change               | `onCheckedChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8) |
| A ref to the hidden input                                                       | Deferred until a form library needs it                                                              |
| A value submitted while off                                                     | Deferred                                                                                            |
| Field and Form errors and validation modes                                      | Field and Form are Phase 4                                                                          |
