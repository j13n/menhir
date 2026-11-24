# Form

A `<form>` that hands errors to its Fields and blocks a submission while a
control is invalid, focusing it. It holds no values: they stay in the
controls, read from `FormData`, or in the app's own state (PLAN.md section 8,
"Forms").

## Sources

In order of precedence (PLAN.md section 8). No WAI-ARIA pattern covers a
form.

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1): actions, `createOptimistic` for a process flag such as "saving", writable derived signals                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 2026-11-23 |
| The Solid 2.0 forms guide, [docs.solidjs.com/guides/forms](https://docs.solidjs.com/guides/forms), and the router's [data guide](https://docs.solidjs.com/routing/solid-router/data) (v2.solidjs.com redirects to docs.solidjs.com, whose index names Solid Router 2 and `@solidjs/vite-plugin` 3.0): uncontrolled inputs read as `FormData`, `<form method="post" action={formAction(fn)}>`, errors keyed by field name with the first message winning, `aria-busy` set on the form by the router while it submits                                                                                                                            | 2026-11-23 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) 3.3.1 Error Identification (the item in error is identified and the error described in text) and 3.3.3 Error Suggestion (a known correction is suggested)                                                                                                                                                                                                                                                                                                                                                                                                                                            | 2026-11-23 |
| HTML standard (Living Standard, 2026-11-23): [form submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm) (a submitter's no-validate state skips interactive validation, and `submit` still fires), [constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints) (`checkValidity()` fires a cancelable `invalid` at each invalid control and shows nothing), [resetting a form](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#resetting-a-form) (`reset` is cancelable, fired before the controls are reset) | 2026-11-23 |
| [Standard Schema](https://standardschema.dev/) V1: an `Issue` is a `message` and an optional `path` of keys or `{ key }` segments; the types may be copied instead of depended on                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 2026-11-23 |
| Size: PLAN.md section 6, rules 4 and 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 2026-11-23 |

## The platform first

Checked on 2026-11-23, in the HTML standard.

| Feature                                                 | Decision                                                                                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<form>`, `FormData`, `method`, `action`                | **Use**: Form renders a `<form>` and passes every attribute through, so a router's form action and a submission before hydration work as on a plain form |
| Interactive validation (the bubble, focusing a control) | Before hydration only: the server HTML has no `novalidate`, so the browser validates a submission made before the scripts run                            |
| `novalidate`                                            | **Set once hydrated**, so the Fields show the errors instead of the bubble                                                                               |
| `checkValidity()`, the `invalid` event                  | **Use** on submit: it fires `invalid` at each invalid control, which touches its Field, and shows nothing                                                |
| `formnovalidate` on a submit button                     | **Honoured**: that button submits without validation, as the browser does                                                                                |
| The `reset` event                                       | **Use**: the browser resets the controls; Form hides its errors, Field clears touched, and a reset the app cancels keeps both                            |
| `aria-busy` on the form                                 | The router's, or the app's: Form passes it through                                                                                                       |

## Shape

```tsx
import { Form } from "menhir/form";
import { issuesToErrors } from "menhir/form/standard-schema";

<Form errors={errors()} onSubmit={submit}>
  <Field.Root name="email">
    <Field.Label>Email</Field.Label>
    <Field.Control type="email" required />
    <Field.Error />
  </Field.Root>
  <button type="submit">Send</button>
</Form>;
```

- `Form` renders a `<form>`. It is one part, so it is exported as itself,
  not as a namespace (decided in #144: a namespace re-export only for more
  than one part). Input and Separator, built before that rule, are
  `Input.Root` and `Separator.Root`, and stay so.
- `errors` is an object keyed by a Field's `name`, each value one message.
- `onSubmit` is the `<form>`'s own, called only when the submission is not
  blocked.
- `issuesToErrors(issues)`, in `menhir/form/standard-schema`, turns a
  schema's issues into `errors`.

### Decisions

- **Not a form-state library.** Form holds no values, no dirty state and no
  touched state of its own. The values stay in the controls and are read
  from `FormData` on submit, as in the Solid 2.0 forms guide, or live in
  the app's own store, written through the draft, where nested and array
  values are plain data. Holding them would make Form a second source of
  each value beside the control, need a type per control (a string, a
  boolean, a list), and grow every form by a store engine. What an app
  with nested and array values, a schema run on submit and errors shown
  once touched needs from Menhir is where an error goes and when it shows:
  that is Field's touched state and Form's `errors`. The guide "Forms
  without a library" on the docs site builds that app.
- **Errors reach each Field through a context in `core`** (decided with the
  maintainer on 2026-11-23). Form provides it, and each `Field.Root` reads the
  error under its `name`. The context is in `core/formContext.ts`, so Form
  imports no module of Field and Field none of Form, and a Field outside a
  Form reads `null`. It costs every Field the read (Size). The other way,
  the app writing `error={errors().email}` on each Field, costs Field
  nothing but leaves to every app the two things only a context can do:
  showing the errors in the server HTML after a submission made before
  hydration, and hiding an error once its control is edited.
- **The key is the Field's `name`**, and for a nested or repeated value
  the path joined with dots, `content.year` and `sources.0`, which is also
  the control's `name` in the submitted `FormData`. One message per key:
  Field shows one message, and the first is the one to fix first.
- **An error from `errors` shows at once, touched or not.** It is the
  answer to a submission: a client-side submission has touched every Field
  already, and one made before hydration comes back as server HTML in which
  nothing is touched. An error to show as the user types, once a field is
  touched, goes on the Field's own `error`, as before Form. Once the Field
  is touched, its own `error` wins the message over the Form's; before,
  the Form's shows alone, so the Field's own still waits for touched.
- **An error from `errors` hides on its control's next edit** (an `input`
  or `change` event from a control with that `name`), and every one hides
  on a reset, until the app passes a new `errors` object. An edit hides
  only the object it was made against: one passed in the same update is
  the answer to a later submission. `errors` is held in a memo, so an
  object written inline, `errors={{ email: message() }}`, which a prop
  getter makes anew on each read, is the same errors until `message()`
  changes. The answer is to
  the values that were submitted; once the user changes one, it is stale,
  and an app whose errors come from a router's submissions cannot clear
  them itself. It is a writable derived signal (`createSignal(fn)`), reset
  by each new `errors`. Form never writes the app's `errors`.
- **A submission is blocked while a control is invalid.** On `submit`, Form
  calls the form's `checkValidity()`; if it fails, Form cancels the event,
  does not call `onSubmit`, and focuses the first invalid control in tree
  order. `checkValidity()` fires `invalid` at each invalid control, so every
  such Field is touched and shows its error, and Field touches the rest on
  the `submit` event. A Switch's, a Checkbox's and a Select's hidden input
  hands focus to its button, so the user lands on the control they know.
  A submit button with `formnovalidate` skips the check. A router that
  intercepts submissions on the document checks `defaultPrevented`, as
  Solid's does, so a blocked submission never reaches it.
- **An error from outside never blocks a submission**, as in Field: no
  `setCustomValidity()`. The errors answer the last submission; the next
  one is the user's attempt to fix them.
- **`novalidate` is set once hydrated**, not in the server HTML. Before
  hydration the browser validates a submission itself, with its bubble,
  and focuses the first invalid control; after, Form does, and the bubble
  would only repeat the Field's error. The consumer's `noValidate` is
  passed through: with it, the server HTML has it too.
- **When validation runs is the app's, and the browser's.** The browser's
  constraint validation is always current, and Field shows it once
  touched; a schema runs where the app calls it: on submit in `onSubmit`,
  or in a memo of the app's values, whose result goes on a Field's
  `error`. Form runs nothing but `checkValidity()` on submit.
- **Submission the Solid 2.0 way.** `onSubmit` is the native handler and
  receives the `SubmitEvent`; Form does not cancel a valid submission, since
  a router's form action and a submission to the server need the event as
  it is. A client-side submission cancels it and calls an `action(...)`
  with the `FormData` or the store's values. The pending state is Solid's
  and the router's: the router sets `aria-busy` on the form while it
  submits, and an app's own action sets a `createOptimistic(false)` flag,
  which reverts when the transition settles, as the cheatsheet does for a
  process flag. Form holds no pending state.
- **A schema's issues become `errors` through a util of its own**,
  `issuesToErrors` in `menhir/form/standard-schema`, so a Form without a
  schema does not bundle it (PLAN.md section 6, rule 6). It reads the
  Standard Schema `Issue` (`message` and `path`), whose shape it declares
  for itself, so
  one function serves every schema library that implements the interface
  and depends on none. A path's keys, and the `key` of a segment object,
  are joined with dots. Several issues on one path: the first wins, as in
  the forms guide. An issue with no path, or an empty one, is an error of
  the whole form, under the key `""`, which no Field reads: the app renders
  it, such as `errors()[""]` above the submit button.
- **Reset.** The browser resets the controls to their defaults, Input and
  Menhir's controls follow it, Field clears touched, and Form hides its
  errors. An app whose values are in a store resets the store in
  `onReset`, as it wrote it.
- **Errors rendered by the server.** The app reads them from the
  submission (the router keeps the thrown value of a submission made
  before hydration for the next server render) and passes them as
  `errors`, so the server HTML has each Error rendered and the control's
  `aria-invalid="true"`.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks Form against the part
conventions.

`Form.test.tsx`

- Renders a `<form>`, with the consumer's attributes (`method`, `action`, `aria-busy`)
- Sets `novalidate` once mounted
- A valid submission calls `onSubmit` with the `SubmitEvent`, and does not cancel it
- An invalid submission is blocked: the event is cancelled, `onSubmit` is not called, every invalid Field shows its error, and a valid Field shows nothing
- A blocked submission focuses the first invalid control in tree order: a text input, and a Switch's, a Checkbox's and a Select's button through their hidden input
- A submit button with `formnovalidate` submits an invalid form
- A listener on the document that checks `defaultPrevented`, as a router's does, gets a valid submission and not a blocked one
- `errors` shows each message in the Field with that `name`, untouched, with `aria-invalid="true"`, and a nested key (`content.year`) in the Field so named
- The Form's error shows over a Field's own `error` until the Field is touched; then the Field's wins
- An error passed as an object written inline (`errors={{ email: message() }}`) hides on an edit, and shows again when its message changes
- An error from `errors` does not block a submission
- An error from `errors` hides on its control's next edit, and the others stay; a new `errors` object shows them again
- An edit hides only the errors it was made against: a new `errors` object passed before the edit's flush still shows
- A reset puts the controls back to their defaults, hides the errors and the touched errors; a reset the app cancels keeps them
- A Field outside a Form reads no errors (and throws nothing)

`Form.store.test.tsx`: the app's own state

- A form on a store with a nested value and an array value, submitted through `action(...)`, validated by a schema in `onSubmit` whose issues go through `issuesToErrors`: the errors show under `content.year` and `sources.0`; fixing a value hides its error; a valid submission saves the store's values
- An error checked as the user types, on a Field's own `error`, shows once the field is touched
- A pending flag (`createOptimistic`) set in the action shows on the submit button until the action settles

`standard-schema/issuesToErrors.test.ts`

- Joins a path's keys with dots: `["content", "year"]` is `content.year`, `["sources", 0]` is `sources.0`
- Reads the `key` of a path segment object
- The first issue on a path wins
- An issue with no path, or an empty one, goes under `""`
- No issues give an empty object
- A key named like an `Object.prototype` member is an own key, and not read from the prototype
- The issues of two schema libraries (zod and valibot, devDependencies) map to the same errors

`test/form/Form.hydrate.test.tsx`

- The server HTML has no `novalidate`, so the browser validates a submission before hydration, and the errors passed in rendered in their Fields with `aria-invalid="true"`
- Hydration adopts the server's elements without warnings, sets `novalidate`, and an edit after hydration hides that field's error

`test/bundle-size/fieldModules.test.ts` and `formModules.test.ts`

- `menhir/form` bundles no module of `src/field`
- `menhir/form` bundles no `issuesToErrors`; `menhir/form/standard-schema` does, so the check can fail

## Left out

| Case                                                                              | Reason                                                                                                                                              |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Values, dirty state, a `validate` prop, a `schema` prop                           | Not a form-state library (Decisions); a schema runs in the app's `onSubmit` or memo                                                                 |
| Several messages per key                                                          | Field shows one message; the first issue on a path wins                                                                                             |
| A part for the form's own error (`""`)                                            | The app renders it where it wants, as `errors()[""]`; a part would cost every Form                                                                  |
| An `onSubmit` that receives `FormData` and cancels the event                      | A router's form action and a submission to the server need the event uncancelled; `new FormData(event.currentTarget)` is one line                   |
| A pending state of Form's own                                                     | The router sets `aria-busy`; an action sets a `createOptimistic` flag (Decisions)                                                                   |
| Errors of a submission blocking the next                                          | An error from outside never blocks a submission (Decisions)                                                                                         |
| The Error named in `aria-describedby` in the server HTML                          | Field registers an Error once mounted; before hydration the Error is shown and the control has `aria-invalid="true"`, and it is named once hydrated |
| Focusing the first invalid control when the submission is made by `form.submit()` | `submit()` fires no `submit` event and validates nothing, in the browser as in Form                                                                 |
| Errors keyed by a control's own `name` when it differs from its Field's           | Form hands errors to Fields, which have one `name`                                                                                                  |
| A real submission before hydration, to a server                                   | The test renders the server HTML and checks it has no `novalidate`; the post itself is the browser's and the router's                               |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite). No
screen reader has been tried yet: the announcement of the focused control's
error after a blocked submission is still to be heard in VoiceOver, NVDA and
JAWS (the definition of done in #144).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
all of it, Rolldown, minified, gzipped, Solid left out.
Measured on 2026-11-24.

| App                           | Size    | Budget |
| ----------------------------- | ------- | ------ |
| `menhir/form`                 | 1,003 B | 1.1 kB |
| `menhir/form/standard-schema` | 230 B   | 300 B  |
| `menhir/field`                | 1,799 B | 1.8 kB |

Most of Form is what every part pays, `core`'s merging and `render`
(Separator, which is all of that, is 746 B). Its own are the submit check
that focuses the first invalid control, and the hidden errors, a writable
derived signal. Field grew by 33 B, from 1,727 B, for reading Form's
context, which a Field outside a Form pays too (Decisions).
`test/bundle-size/formModules.test.ts` checks that `menhir/form` bundles no
`issuesToErrors`, and `fieldModules.test.ts` that it bundles no module of
Field.
