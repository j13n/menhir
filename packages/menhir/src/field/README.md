# Field

A form control's label, description and error message, and its validity:
what every form control shares. It is the first component of Phase 4 and
settles the form conventions (PLAN.md section 8, "Fields").

## Sources

In order of precedence (PLAN.md section 8). No WAI-ARIA pattern covers a
field.

| Source                                                                                                                                                                                                                                                             | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                             | 2026-11-23 |
| [WAI-ARIA practice: Providing Accessible Names and Descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/): a visible label, a visible description referenced by `aria-describedby`                                                       | 2026-11-23 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) 3.3.1 Error Identification (the error is described to the user in text) and 3.3.2 Labels or Instructions                                                                                                                 | 2026-11-23 |
| HTML standard, [constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints): `validity`, `validationMessage`, `willValidate`, the `invalid` event, interactive validation of a submission, and canceling `invalid` | 2026-11-23 |
| Support: `web-features` 3.47.0, and [a11ysupport.io](https://a11ysupport.io/tech/aria/aria-errormessage_attribute)'s data for `aria-errormessage` (its repository, results dated 2023-06-20 to 2025-12-24)                                                         | 2026-11-23 |
| Size: PLAN.md section 6, rules 4 and 6                                                                                                                                                                                                                             | 2026-11-23 |

## The platform first

Checked on 2026-11-23, in `web-features` 3.47.0 and the HTML standard.

| Feature                                                                   | Baseline                                    | Decision                                                                                                                                                                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<label for>`                                                             | Widely available (since 2018-01-29)         | **Use**: Label is a `<label for>` the control's `id`, linked in the server HTML; a label names any labelable element, Menhir's buttons included                                                                     |
| Constraint validation: `validity`, `validationMessage`, `checkValidity()` | Widely available (since 2021-06-11)         | **Use** as one source of validity: Field reads it, and ships no validators of its own                                                                                                                               |
| The `invalid` event, and interactive validation of a submission           | Widely available                            | **Use**: it marks a submission attempt; Field does not cancel it, so the browser keeps its bubble and focuses the first invalid control                                                                             |
| `setCustomValidity()`                                                     | Widely available                            | Not called by Field: an error from outside must not block a submission (Decisions)                                                                                                                                  |
| `:invalid`, `:valid`                                                      | Widely available (since 2018-01-29)         | The consumer's: they match from the start, before the user has done anything                                                                                                                                        |
| `:user-invalid`, `:user-valid`                                            | Widely available (since 2026-05-02)         | The consumer's, for the browser's validity; `data-invalid` adds errors from outside, which the browser does not know                                                                                                |
| `:has()`                                                                  | Widely available (since 2026-06-19)         | Makes `data-focused`, `data-filled`, `data-required` unnecessary: `.field:has(:focus-visible)`, `:has(:placeholder-shown)`, `:has(:required)`                                                                       |
| `:focus-within`, `:placeholder-shown`                                     | Widely available                            | Instead of `data-focused` and `data-filled`                                                                                                                                                                         |
| `aria-describedby`                                                        | Every screen reader                         | **Use** for the description and the error                                                                                                                                                                           |
| `aria-invalid`                                                            | Every screen reader                         | **Use**, `"true"` while the error shows                                                                                                                                                                             |
| `aria-errormessage`                                                       | Read while `aria-invalid="true"` everywhere | Not used: a11ysupport.io found JAWS with Firefox, NVDA with Edge, Narrator and VoiceOver on macOS reading it while the field is valid too, and `aria-describedby` already names the error only while it is rendered |

## Shape

```tsx
<Field.Root name="email">
  <Field.Label>Email</Field.Label>
  <Field.Control type="email" required />
  <Field.Description>We never share it.</Field.Description>
  <Field.Error />
</Field.Root>
```

- `Field.Root` renders a `<div>`. It holds the field's `name`, `disabled`, the
  error from outside (`invalid`, `error`), whether the field was touched, and
  the browser's validity of the controls inside it. It generates the
  control's `id` and the Description's.
- `Field.Label` renders a `<label for>` the control's `id`.
- `Field.Control` renders an `<input>` with the field's `id`, `name`,
  `disabled`, `aria-describedby`, `aria-invalid` and `data-*` attributes.
  `render` makes it a `<textarea>`, a `<select>` or a Menhir control.
- `Field.Description` renders a `<p>` the control names in
  `aria-describedby`.
- `Field.Error` renders a `<p>` while the field shows an error, and nothing
  otherwise. The control names it in `aria-describedby` while it is
  rendered. Without children it shows the error from outside, else the
  browser's message.

### Decisions

- **Label is a part**, not a native `<label>` left to the consumer, because
  it is rendered before the control it names: the Root generates the
  control's `id` ("Generated ids belong to the root", PLAN.md section 8) and
  Label writes it in `for`, so the server HTML is labelled before
  hydration. `for`, not `aria-labelledby`: every control a Field holds is
  labelable, Menhir's buttons included (PLAN.md, "Form controls are native
  buttons").
- **A control joins a Field as `Field.Control`'s `render`.** `render` hands
  any component the control's props (PLAN.md, "Polymorphism"), and every
  Menhir control passes the props it does not know to its focusable
  element, so `<Field.Control render={Switch.Root}>` gives the Switch's
  button the `id`, `aria-describedby`, `aria-invalid` and `data-*`
  attributes and its hidden input the `name` and `disabled`, with no change
  to Switch. Children go through: `<Field.Control render={Checkbox.Root}>
<Checkbox.Indicator /></Field.Control>`. A Select's Trigger joins the same
  way, `<Field.Control render={Select.Trigger}>`, inside `Select.Root`, which
  keeps its own form props (`name`, `required`, `disabled`): its hidden
  input is the Root's, not the Trigger's.
- **No control reads Field's context**, so a control outside a Field pays
  nothing: `menhir/switch` and `menhir/checkbox` are the same size as before
  Field (1,623 B and 1,677 B on 2026-11-23, measured before and after), and `test/bundle-size/fieldModules.test.ts`
  checks that neither bundles a module of `src/field`. A context in `core`,
  read by each control, was the alternative: it costs every control the
  read, and a native `<input>` cannot read a context, so a Control part is
  needed anyway.
- **Field's validity comes from every control inside the Root**, not from
  one element: Switch, Checkbox and Select validate a hidden input, not the
  button that has focus. On each `input`, `change`, `focusout` and `invalid`
  inside it, the Root reads the `validity` of each `input`, `select` and
  `textarea` the browser validates (`willValidate`), and the first invalid
  one is the field's. `invalid` does not bubble, so the Root listens for it
  in the capture phase. The Root keeps a copy of that control's flags and
  message, compared by value: an element's `validity` is live, the same
  object as its flags change, so keeping the element meant waking every
  reader on each event, such as each `invalid` of a submission, which fires
  at every control of the form.
- **Three sources of validity, one rule.** The field is invalid when the
  browser's constraint validation says so, or when the app passes
  `invalid`, or an `error` message. The message shown is the app's `error`,
  else the browser's `validationMessage`: the app's is in its own language
  and knows more, such as a server's answer. Errors from outside work
  without the browser's validation: an app that keeps its form state in a
  library of its own passes `invalid` and `error` in.
- **An error from the Form around it** (#144, `src/form/README.md`). The
  Root reads Form's context, which is in `core/formContext.ts`, and looks
  up the error under its `name`. It is the answer to a submission, so it
  shows at once, touched or not, including in the server HTML after a
  submission made before hydration; Form hides it once the control is
  edited. Once the Field is touched, its own `error` wins the message over
  it; before, the Form's shows alone. The browser's `validationMessage`
  comes last. A Field outside a Form reads
  `null`, and pays the 33 B of the read (Size).
- **No `validate` prop.** A validate function is a memo in Solid, and its
  result is an error from outside: `error={passwordsDiffer()}`. An async
  check is an async memo, `createMemo(async () => …)`, whose pending state
  is `isPending`, both Solid's, so Field would only wrap them. Field ships
  neither.
- **An error from outside does not block a submission.** Field does not
  pass it to `setCustomValidity()`: an app that validates on submit clears
  its errors on its next submit, and a submission blocked by an error the
  user has already fixed could never be made. Form (#144) blocks a
  submission only while a control is invalid to the browser.
- **Field holds no value.** The value stays in the control, read from the
  form, or in the app's state. Holding it would make Field a form-state
  library and a second source of the value beside the control, and each
  control has its own type of value (a string, a boolean, a list). So Field
  tracks no dirty state, which needs the value and its default.
- **Field tracks touched itself** (decided on 2026-11-23). A field is
  touched once focus has left it, to an element outside the Root or to none,
  such as a press on the page, but not when the window loses focus, to
  another window or tab, which leaves the control focused; once a control
  inside it has fired `change`, which a text input fires as the user commits
  an edit and a checkbox, a native `<select>`, a Switch, a Checkbox and a
  Select on each change, so a press that does not focus a button (Safari on
  macOS does not, by MDN's account; not tried here) still touches it; and
  once a submission of its form was attempted, by its `submit` event or an
  `invalid` event in the form. A form reset clears it, unless the app
  cancels the reset. The app writes no
  touched state, and a submission touches every Field of the form, so an
  error from outside shows after a submit too.
- **The error shows once the field is touched**, never before: on the first
  render, the browser's `:invalid` matches an empty required field the user
  has not reached. After that it follows each change: fixing the value
  hides it at once, and breaking it again shows it.
- **`data-*` attributes**: `data-invalid` while the error shows,
  `data-touched` once touched, `data-disabled` with `disabled`, on every
  part. Not `data-valid`: it is `[data-touched]:not([data-invalid])`, and
  `:user-valid` for the browser's validity. Not `data-dirty`, which needs the
  value. Not `data-filled` or `data-focused`: `:placeholder-shown`,
  `:focus-within` and `:has()` cover them.
- **`aria-invalid="true"` while the error shows**, and absent otherwise, so
  a screen reader does not call a field invalid before the user has
  touched it.
- **The Error part** is rendered only while the field shows an error. With
  `match`, a key of `ValidityState` such as `"valueMissing"`, it shows only
  while the browser's validity has that flag, so an app writes its own
  message per state, in its own language. It registers with the Root once
  mounted, as a popup's Title does, and the control names it in
  `aria-describedby` only while it is rendered. It is not a live region:
  after a blocked submission the browser focuses the first invalid control,
  which then names its error, and an error announced while the user is in
  the next field would interrupt. A consumer adds `role="alert"` if they
  want it announced.
- **The browser's bubble is kept.** Canceling `invalid` hides the bubble
  but also stops the browser focusing the first invalid control, so the
  code that hides it must focus. Form (#144) does both: it sets
  `novalidate` once hydrated and focuses the first invalid control of a
  blocked submission. A Field outside a Form leaves both to the browser.
- **The Description is linked in the server HTML.** The Root generates its
  `id`, and the control names it from the first render, before the
  Description is rendered; once mounted, the control names it only while a
  Description is rendered, so a Field without one names nothing. Until
  hydration, a Field without a Description names an `id` that is not in
  the page, which a screen reader skips. The
  Description takes no `id` from the consumer ("Generated ids belong to the
  root"). The Error is named only once mounted, and the server HTML shows
  none, since no field is touched before hydration.
- **The consumer's `aria-describedby` on the Control wins**, as on a popup:
  it is kept out of the merge, so a wrapper's `undefined` does not remove
  the Field's.
- **Root's `name` and `disabled` go to the control.** `name` is on the Root
  so that Form (#144) hands the Field its errors by name. The Control's
  own `name` or `disabled` wins, as any prop does.
- **The Field's own state is written after the event's flush** (`onFlush`),
  as an uncontrolled part's is, so a submission that starts async work does
  not hold the touched state back (PLAN.md, "A part's own state is not held
  by its consumer's async work").

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. No WAI-ARIA pattern applies, so no case is marked "A".

`root/FieldRoot.test.tsx`

- Renders a `<div>` with no role
- `data-disabled` on every part with `disabled`, and absent without
- `disabled` reaches the control, and follows changes
- `name` reaches the control
- No part throws outside a Root but the parts, which throw a descriptive error

`label/FieldLabel.test.tsx`

- Renders a `<label>` whose `for` is the control's `id`, so it names the control
- A click on the Label focuses the control
- Names a `<textarea>`, a `<select>`, a Switch and a Select's Trigger rendered through `Field.Control`

`control/FieldControl.test.tsx`

- Renders an `<input>` with a generated `id`; two Fields get different ids
- Takes the consumer's input attributes: `type`, `required`, `placeholder`
- `render` renders a `<textarea>` and a `<select>` with the field's attributes
- `render={Switch.Root}` gives the button the `id` and `aria-describedby`, and the hidden input the `name`; its children (`Switch.Thumb`) are rendered inside it
- `render={Select.Trigger}` inside `Select.Root` gives the Trigger the `id` and the label
- The consumer's `aria-describedby` wins, and a wrapper's `undefined` does not remove the Field's

`description/FieldDescription.test.tsx`

- Renders a `<p>` that describes the control (`aria-describedby`, accessible description)
- A Field without a Description names nothing in `aria-describedby` once mounted
- A Description in a `<Show>` is named while rendered, and not once removed
- Takes no `id` from the consumer

`error/FieldError.test.tsx` and `Field.validity.test.tsx`

Labelling of the error:

- Renders nothing while the field shows no error
- Renders nothing, and is not named, while it has no children and no message, such as `invalid` alone
- Renders a `<p>` while it does, and the control names it after the Description in `aria-describedby`, so the accessible description has both
- Without children, shows the error from outside, else the browser's `validationMessage`
- With children, shows them instead
- `match="valueMissing"` shows only while the value is missing; `match="typeMismatch"` only for a mismatch
- Takes the consumer's `id`, else a generated one

The browser's validity:

- A `required` empty input is not shown as invalid before it is touched: no `data-invalid`, no `aria-invalid`, no Error
- Touched by focus leaving: `data-touched` on every part; with an invalid value, `data-invalid`, `aria-invalid="true"` and the Error
- Focus moving within the Root (a Switch's button to its hidden input, a Select's Trigger) does not touch it
- Touched by a press elsewhere on the page; not touched when the window loses focus, which leaves focus on the control
- Fixing the value hides the error at once; breaking it again shows it
- A `change` touches it: a native checkbox clicked without focus
- A Switch with `required`, through `Field.Control`, shows its error once it was turned on and off
- `pattern` and `type="email"` errors show their `validationMessage`
- A disabled control is never invalid (`willValidate`)

When an error shows:

- An error from outside (`error`) shows only once the field was touched
- `invalid` with no message: `data-invalid` and `aria-invalid`, and an Error with children shows
- An error from outside wins the message over the browser's
- Changing `error` while touched follows at once; clearing it hides the Error
- A submission attempt touches every Field of the form: with `novalidate`, a Field with an error from outside shows it after the submit event; without it, a blocked submission touches the Field whose control is invalid and a valid Field with an error from outside
- A form reset clears touched, and hides the errors; a reset the app cancels keeps them
- An error from an async memo shows once it resolves, under `<Loading>`

In a form, with a native control (`Field.form.test.tsx`):

- An `<input required>`, a `<textarea required>` and a `<select required>`: the submission is blocked while invalid and the errors show; once filled, the form submits the values under the Field's `name`
- A reset empties the controls and hides the errors
- When the browser blocks a submission, it focuses the first invalid control, whose accessible description has the error; Chromium only, since jsdom focuses nothing
- An error from outside does not block a submission
- A submission that leaves a Field's validity as it was wakes no reader of its state

`test/field/Field.hydrate.test.tsx`

- The server HTML has the Label's `for` matching the control's `id`, and the control named by the Description in `aria-describedby`, with no Error and no `data-invalid` (PLAN.md section 10)
- Hydration adopts the server's elements without warnings; leaving the empty required control afterwards shows its error

`test/bundle-size/fieldModules.test.ts`

- `menhir/switch` and `menhir/checkbox` bundle no module of `src/field`

## Left out

| Case                                                                          | Reason                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `validate` prop, sync or async                                              | A memo is Solid's validate function, and an async memo with `isPending` its async one; its result goes in as `error` (Decisions)                                                                                           |
| Dirty state, `data-dirty`                                                     | Field holds no value, and dirty needs the value and its default (Decisions)                                                                                                                                                |
| `data-valid`, `data-filled`, `data-focused`, `data-required`                  | `[data-touched]:not([data-invalid])`, `:user-valid`, `:placeholder-shown`, `:focus-within` and `:has(:required)` (Decisions)                                                                                               |
| `aria-errormessage`                                                           | Read while the field is valid in several screen readers (The platform first); `aria-describedby` names the error only while it is rendered                                                                                 |
| Hiding the browser's bubble                                                   | Whoever hides it must also focus the first invalid control: Form does both (#144)                                                                                                                                          |
| Errors rendered by the server, after a submission made before hydration       | No field is touched in the server HTML; an error Form hands the Field shows untouched, so Form shows them (#144, tested in `test/form/Form.hydrate.test.tsx`)                                                              |
| Several Descriptions in one Field                                             | The Root generates one Description `id`, linked in the server HTML; one Description holds all the text                                                                                                                     |
| Several error messages as a list                                              | `error` is one message; an app with several renders them as the Error's children                                                                                                                                           |
| Validity changed without an event: a value set by the app, `required` toggled | The browser fires no event; Field reads the validity again on the next `input`, `change`, `focusout` or `invalid` inside it                                                                                                |
| A control associated with another form by its `form` attribute                | Field listens on the form its first control belongs to; a Field whose controls belong to different forms is not supported                                                                                                  |
| Switch, Checkbox and Select reading the Field around them                     | Not needed: they join through `Field.Control`'s `render` (Decisions). The Field's `data-*` stay on the button, not on a Thumb or an Indicator inside it (#143, "In a Field" in `src/switch/README.md`)                     |
| A `minlength` error in the tests                                              | Browsers set `tooShort` only after an edit by the user, which a scripted edit is not, in jsdom and Chromium alike; Field reads it as any other flag                                                                        |
| A Field's `id` for the control, given by the consumer                         | "Generated ids belong to the root": Label is rendered before the control, so the server HTML could not link a later part's own `id`; an anchor goes on an element inside a part                                            |
| A label that is not a `<label>`, `aria-labelledby`                            | Every control a Field holds is labelable                                                                                                                                                                                   |
| A control associated with several Fields, or a Field around other Fields      | A group of Fields is a plain `<fieldset>`, each Field with its own error; a group of options with one error is a `<fieldset>` rendered as the Field's Control (`src/fieldset/README.md`, #145), or a Checkbox Group (#146) |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite),
where Testing Library's accessible description of each control has the
Description and, while it shows, the Error. No screen reader has been tried
yet: the label, the description and the error of a control are still to be
heard in VoiceOver, NVDA and JAWS (the definition of done in #141).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-24.

| App               | Size    | Budget |
| ----------------- | ------- | ------ |
| `menhir/field`    | 1,799 B | 1.8 kB |
| `menhir/switch`   | 1,623 B | 1.9 kB |
| `menhir/checkbox` | 1,677 B | 2 kB   |

Switch and Checkbox are the same size as before Field: no control reads
Field's context, and neither bundles a module of `src/field`
(`test/bundle-size/fieldModules.test.ts`). Most of Field is the Root: the
listeners that read the controls' validity and track touched, and the
registry of the Description and the Errors that the control's
`aria-describedby` follows. Reading Form's context (#144) took Field from
1,727 B to 1,760 B, and copying the invalid control's validity, so that an
event that changes nothing wakes no reader (Decisions), to 1,799 B.
