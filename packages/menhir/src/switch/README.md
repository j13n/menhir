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

## In a Field

```tsx
<Field.Root name="terms">
  <Field.Label>Accept the terms</Field.Label>
  <Field.Control render={Switch.Root} required>
    <Switch.Thumb />
  </Field.Control>
  <Field.Description>You can read them on the next page.</Field.Description>
  <Field.Error />
</Field.Root>
```

Decided with #143, on 2026-11-23, after Field (`src/field/README.md`):

- **Switch reads nothing from the Field.** `Field.Control` hands the button
  the Field's `id`, `aria-describedby`, `aria-invalid` and `data-*`
  attributes, and the hidden input its `name` and `disabled`, through the
  props Switch passes on. Its code did not change, so a Switch with no
  Field around it behaves as before: its own tests are unchanged, and
  `test/bundle-size/fieldModules.test.ts` checks that it bundles no module
  of `src/field`.
- **The value props go on the Switch.** A controlled Switch is rendered
  with a function, `render={(p) => <Switch.Root {...p} checked={on()}
onCheckedChange={setOn} />}`: `Field.Control` is typed for an `<input>`,
  which has no `onCheckedChange`.
- **The Field's `data-invalid` and `data-touched` are on the button only**,
  not on the Thumb. The Thumb is always inside the button, so
  `[data-invalid] .thumb` reaches it; carrying them would make Switch
  read the props a Field hands it, in every Switch, for what one selector
  does. The Thumb keeps the switch's own `data-*`, `data-disabled`
  included, which a Field's `disabled` sets through the Switch's.
- **A `required` Switch that is off** is invalid by its hidden input's
  `valueMissing`. Its error shows once the Field is touched: focus left it,
  it was turned on and off, or a submission was attempted. An Error with no
  children shows the browser's message for the hidden input; children, or
  `match="valueMissing"`, show the app's. When the browser blocks a
  submission it focuses the hidden input, which moves focus to the button
  ("The hidden input is the form's view of the control", PLAN.md section
  8), and the button's accessible description then has the error.
- **A form reset** puts the Switch back to `defaultChecked` and clears the
  Field's touched state, so no error shows until it is touched again, even
  when its default is off. It asks in a task after the `reset` event,
  unless the app cancels it, and holds the hidden input through the
  browser's reset (`core/formReset.ts`, #165): a real press of a reset
  button runs microtasks before the browser resets the controls.

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
- Form: By a real press of the reset button (Chromium only, since a script's click runs no microtask between the listeners): a reset taken goes back to `defaultChecked`, which the form submits; a reset declined keeps `checked`; a reset a later listener cancels asks for nothing
- Form: the form's `change` listener and `FormData` see the new value
- Form: `required` blocks submission while off
- Form: when the browser blocks the submission, focus moves to the switch; Chromium only, since jsdom does not focus the invalid control
- `render` with a button component keeps the switch's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- The consumer's `class` and `ref` reach the button

`Switch.field.test.tsx`, in a Field through `Field.Control`'s `render`

- Labelled by the Label, which toggles it; described by the Description; submits under the Field's `name`
- `required` and off: no error before it is touched
- A submission while off is blocked, and the browser's message shows as its error, with `aria-invalid` on the button, `data-invalid` on the Root, the Label and the button, and the error in the button's accessible description
- The app's message shows instead; turning it on hides it, and the form then submits `"on"`
- Focus leaving it while off shows its error; so does turning it on and off
- The Thumb carries the switch's `data-*` and not the Field's, which are on the button around it
- The Field's `disabled`: the button and the hidden input are disabled, it ignores a label click, the form submits nothing, and the Thumb has `data-disabled`
- A reset goes back to `defaultChecked` and hides the error; a reset that leaves it off and invalid shows no error until it is touched again; a controlled Switch is asked, and the error hides
- A reset leaves the Field reading the reset switch's validity, though the Field listens first; also by a real press of the reset button (Chromium only)
- When the browser blocks the submission, focus moves to the switch, whose accessible description has the error; Chromium only, since jsdom does not focus the invalid control

`thumb/SwitchThumb.test.tsx`

- Renders a `<span>` carrying the Root's `data-*` attributes
- Throws a descriptive error outside `Switch.Root`

`test/switch/Switch.hydrate.test.tsx`

- The server HTML has the button with its role and `aria-checked`, the hidden input, the `data-*` attributes, and a name from a `<label for>` before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the switch toggles by click and by key afterwards
- In a Field: the server HTML has the Label's `for` matching the button's `id`, the Description in its accessible description, and no error
- In a Field: hydration adopts the server's elements without warnings; a blocked submission afterwards shows the error, and a label click turns it on and hides it

## Left out

| Case                                                                            | Reason                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generated ids for the root and for ids derived from it                          | No generated ids: the button takes the consumer's `id`, or a Field's, and no part links to another                                                                           |
| Label, Description and ErrorMessage parts, and their ids combined into `aria-*` | Field's: a Switch joins a Field through `Field.Control`'s `render` (In a Field); without one, a native `<label>` labels the button                                           |
| A validation state of its own, `data-valid`, `data-invalid`                     | A Field's: it reads the hidden input's validity and puts `data-invalid` and `data-touched` on the button (In a Field); without one, a consumer passes `aria-invalid` through |
| Computing `aria-labelledby` from a sibling or non-native label                  | Only an element that cannot be labelled needs it; a button is labelled natively                                                                                              |
| `aria-label` winning over an associated label                                   | The browser's name computation, with no code of Menhir's involved                                                                                                            |
| Keyboard modifiers in the change callback, and canceling a change               | `onCheckedChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                          |
| A ref to the hidden input                                                       | Deferred until a form library needs it                                                                                                                                       |
| A value submitted while off                                                     | Deferred                                                                                                                                                                     |
| The Field's `data-invalid` and `data-touched` on the Thumb                      | The Thumb is inside the button, which has them: `[data-invalid] .thumb` (In a Field)                                                                                         |
| Form errors and validation modes                                                | Form's (#144); a Field shows an error once touched, with no modes                                                                                                            |

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25, after #165.

| App             | Size    | Budget |
| --------------- | ------- | ------ |
| `menhir/switch` | 1,744 B | 1.9 kB |

1,623 B before #147, which moved the hidden input to `core`
(`core/hiddenInput.tsx`), shared with Radio: Switch alone pays about 30 B
for the call, and an app with Radio pays for the input once
(`src/radio/README.md`, "Size").

No growth from #143: Switch joins a Field with no change to its code, and
the size is the one measured before and after Field (#141).

1,651 B before #165, which moved the form reset to `core/formReset.ts`. A
control alone pays for the helper; an app with several pays for it once
(`src/input/README.md`, "Size").
