# Input

A text input whose value can be controlled: a native `<input>` with
`value`, `defaultValue` and `onValueChange`, which joins a Field as
`Field.Control`'s `render` (#142; PLAN.md section 8, "API conventions",
"Inputs"). It follows the form conventions Field settled (`src/field/README.md`).

## Sources

In order of precedence (PLAN.md section 8). No WAI-ARIA pattern is needed
for a native text input.

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Read       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1); `@solidjs/web`'s `value` and `defaultValue` bindings on an `<input>` and a `<textarea>` (properties on the client, the `value` attribute in the server HTML)                                                                                                                                                                                                                                | 2026-11-23 |
| HTML standard, [the input element](https://html.spec.whatwg.org/multipage/input.html): the `value` IDL attribute in mode "value", the dirty value flag, the `defaultValue` (the `value` content attribute), and the reset algorithm, which sets the value back to the content attribute without firing `input`; the [form reset](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#resetting-a-form), whose `reset` event fires before the controls are reset | 2026-11-23 |
| HTML standard, [autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill): the `autocomplete` tokens, `one-time-code` among them; and [`inputmode`](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute)                                                                                                                                                                                            | 2026-11-23 |
| UI Events, [composition events](https://w3c.github.io/uievents/#events-compositionevents) and `InputEvent.isComposing`: an input method's edits fire `input` while it composes, and `compositionend` once it commits                                                                                                                                                                                                                                                                | 2026-11-23 |
| Size: PLAN.md section 6, rules 4 and 6                                                                                                                                                                                                                                                                                                                                                                                                                                              | 2026-11-23 |

## Settled after Field

Checked on 2026-11-23 against Field (#141, #160), as the ticket's "Settle
after Field" list records: `Field.Control` already renders a native
`<input>` with the field's attributes, and a `<textarea>` through `render`,
with no value API. So the question this component answers is whether a value
API beside the native `onInput` is worth an entry point of its own.

## The platform first

Checked on 2026-11-23, in the HTML standard and `@solidjs/web` 2.0.1.

| Feature                                                                                         | Decision                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<input>`, `<textarea>`                                                                         | **Use**: Input renders a native `<input>`, and a `<textarea>` through `render`. The role, the keys, the caret, focus, validity, autofill and the form's data are the browser's                  |
| `defaultValue` (the `value` content attribute)                                                  | **Use** for the uncontrolled value: Solid binds it on the client, and renders it as the `value` attribute on the server, so the form's reset puts it back with no code                          |
| The form's `reset`                                                                              | Reset is native for an uncontrolled Input; a controlled one asks its consumer, as every Menhir control does (Decisions)                                                                         |
| `:disabled`, `:read-only`, `:required`, `:placeholder-shown`, `:focus-visible`, `:user-invalid` | Instead of `data-disabled`, `data-readonly`, `data-required`, `data-filled`, `data-focused` and `data-invalid` of Input's own; inside a Field, the Field's `data-*` attributes apply (Left out) |
| `autocomplete="one-time-code"`, `inputmode`, `maxlength`, `pattern`                             | **Use** for a one-time code: one `<input>` that the platform fills from a message, and that takes a pasted code whole (Decisions)                                                               |

## Shape

```tsx
import { Input } from "menhir/input";

<Input.Root value={text()} onValueChange={setText} />
<Input.Root defaultValue="Oslo" name="city" />
<Input.Root render={(p) => <textarea {...p} />} value={text()} onValueChange={setText} />

<Field.Root name="email">
  <Field.Label>Email</Field.Label>
  <Field.Control
    type="email"
    render={(p) => <Input.Root {...p} value={email()} onValueChange={setEmail} />}
  />
  <Field.Error />
</Field.Root>
```

`Input.Root` renders an `<input>` and is the only part. It takes every
attribute of an `<input>`, and:

- `value`, a string: the controlled text.
- `defaultValue`, a string: the uncontrolled text, and the text a form reset
  puts back.
- `onValueChange(value, { reason, event })`: called with the new text, on
  each edit (`input-change`, the `input` event as `event`) and on a form
  reset (`reset`, the form's `reset` event).

### Decisions

- **An entry point of its own, not a recipe on `Field.Control`.** Solid
  writes `value={text()}` to the element's `value` property whenever
  `text()` changes, and only then. With `onInput` alone that is not a
  controlled input in three cases, each of which a recipe would have to
  repeat in every app:
  - **A declined edit stays on screen.** A consumer that keeps only digits
    and does not set its signal for a letter leaves the letter in the
    element, since the signal did not change and nothing writes it back.
  - **A form reset parts the element from the app's state.** The browser
    sets the element back to its `value` content attribute and fires no
    `input`: `""` for an element Solid rendered on the client, and the
    server's first value for one it hydrated. The app's signal keeps the old
    text.
  - **An input method composes.** Writing the element while an input method
    composes ends the composition, so the write back has to wait for
    `compositionend`.

  Input covers the three in 175 B over Separator, a part with nothing to
  do (Size). Not as a flag
  on `Field.Control`: a Field around a native `<select>` or a Switch would
  pay for it (PLAN.md section 6, rule 6).

- **The value is a string**: `value`, `defaultValue` and `onValueChange`,
  the names of PLAN.md section 8, "Controlled state", but not its empty
  value: the empty text is `""`, not `null`, since `""` is a text and the form submits it; `undefined` means
  uncontrolled. A wrapper's `value={undefined}` leaves the `value` key out
  of the element's props, since Solid writes `""` for it, which would hide
  `defaultValue`. The native `onInput` and `onChange` run as written, with
  their events, the consumer's before Input's own handler; there is no
  `onChange` prop.
- **`onValueChange` passes `{ reason, event }`**, with `input-change` and
  `reset`, the names Autocomplete's text uses, so a consumer can tell an
  edit from a reset.
- **Uncontrolled is native.** The uncontrolled text lives in the element,
  not in a signal: `defaultValue` goes to Solid's `defaultValue` binding,
  the browser keeps each edit, and a reset puts the default back. Input
  holds no state of its own, so it has no `createControllableSignal`.
- **Controlled holds.** After each edit's flush, a controlled Input puts the
  element back to `value` if the two differ, so a declined edit is undone
  and a changed one, such as upper-cased text, shows the consumer's text.
  It writes only when they differ, since a write moves the caret to the end.
  It writes nothing while an input method composes (`isComposing`), and puts
  the element back once it commits (`compositionend`).
- **A form reset asks.** The browser resets the element to its `value`
  attribute after the form's `reset` event. An uncontrolled Input lets it:
  its attribute is `defaultValue`. A controlled one keeps its text through
  the reset, by making its text its `value` attribute during the event, so
  the element never shows a text its consumer does not hold, such as the
  server's first text after hydration. Then, in a task after the event, an Input
  whose text was not `defaultValue` (`""` without one) calls `onValueChange`
  with `defaultValue` and the reason `reset`, controlled or not; a
  controlled one shows the new text if its consumer takes it. A task, not
  `onFlush`: when the user presses a reset button, the browser runs
  microtasks as each listener returns, before it resets the controls and
  before a later listener could cancel the reset. A reset the app cancels
  calls nothing: the reset is the event's default action, so its
  `defaultPrevented` is the app saying no (PLAN.md section 8, "Nothing
  cancels the part's handler", is about a part's own handler). An Input the
  reset removes before its task, such as a row of a list the app's
  `onReset` takes back to one, asks for nothing, so it does not write its
  row back (found with Form, #144). Every Menhir control listens this way,
  through `core/formReset.ts` (#165).
- **A textarea through `render`**, as `Field.Control` does, with
  `render={(p) => <textarea {...p} />}`. Every line of Input works on a
  `<textarea>` unchanged, so a part of its own would only repeat it.
- **It joins a Field as `Field.Control`'s `render`**, and reads no context of
  Field's (PLAN.md section 8, "Fields"), so an Input outside a Field pays
  nothing for it, and imports only `core`. The value props go on
  `Input.Root` inside the `render` function, where they are typed.
- **A one-time code is a recipe**, on the docs page: one `Input.Root` with
  `autocomplete="one-time-code"`, `inputmode="numeric"`, `maxlength` and
  `pattern`. One input is what the platform's autofill fills from a message,
  and a paste lands in it whole. A box per character is OTP Field
  (`menhir/otp-field`, #203), which draws the boxes from one such input.
- **Text types only.** Input is for the types whose value is a text the
  user edits: `text` (the default, which Input leaves to the browser),
  `email`, `password`, `search`, `tel`, `url`, and the date and time types,
  whose value is a string too. The other types are other components:
  `number` is Number Field (#149), `range` Slider (#148), `checkbox`
  Checkbox, `radio` Radio (#147). `file` is left out (Left out).
- **No `data-*` attributes of its own.** A native input matches
  `:disabled`, `:read-only`, `:required`, `:placeholder-shown` and
  `:focus-visible`; in a Field it gets the Field's `data-invalid`,
  `data-touched` and `data-disabled`.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the part against the
part conventions. No WAI-ARIA pattern applies, so no case is marked "A".

`root/InputRoot.test.tsx`

- Renders an `<input>` with the textbox role, and no attribute of its own
- Uncontrolled: shows `defaultValue`; each edit shows and calls `onValueChange` with the text, `input-change` and the `input` event
- A wrapper's `value={undefined}` keeps it uncontrolled, showing `defaultValue`
- Controlled: shows `value`, and follows the app's changes
- Controlled: an accepted edit shows the text
- Controlled: a declined edit is undone: the element shows `value`
- Controlled: a changed edit (upper-cased) shows the consumer's text
- Controlled: an accepted edit in the middle of the text keeps the caret where it was
- Controlled: while an input method composes, a declined edit is not undone; once it commits, it is
- The consumer's `onInput` and `onChange` run, with their events
- `render` renders a `<textarea>`, uncontrolled and controlled, a declined edit undone

`Input.form.test.tsx`

- Submits its text under its `name`, uncontrolled and controlled
- `required` blocks a submission while empty, and not once any text is typed
- A reset puts an uncontrolled Input back to `defaultValue`, and calls `onValueChange` with it and `reset`; at its default already, a reset calls nothing
- A reset of a controlled Input calls `onValueChange` with `defaultValue` (`""` without one); taken, the element shows it; declined, the element keeps `value`
- A reset the app cancels calls nothing
- An Input removed by the reset's own handler calls nothing
- By a real press of the reset button (Chromium only, since a script's click runs no microtask between the listeners): a reset taken shows `defaultValue`, a reset declined keeps `value`, and a reset a later listener cancels calls nothing
- Autofill: a value the browser fills in, with an `input` event, calls `onValueChange`
- In a Field, through `Field.Control`'s `render`: labelled by the Label, named by the Field's `name`, described by the Description, and its error shows once touched, while its value is controlled
- A `<textarea>` in a Field, through both `render`s
- In a Field, a reset its consumer declines, by a real press (Chromium only): the element keeps its text, and the Field's touched state clears without Solid writing the bound text back over the reset element

`test/input/Input.hydrate.test.tsx`

- The server HTML has the controlled text as the `value` attribute, labelled in a Field
- Hydration adopts the server's element without warnings; an edit calls `onValueChange`, and a reset afterwards puts the element back to the app's default, not to the server's text

`test/bundle-size/fieldModules.test.ts`

- `menhir/input` bundles no module of `src/field`

## Left out

| Case                                                                             | Reason                                                                                                                                                |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| A one-time code with a box per character                                         | OTP Field (`menhir/otp-field`, #203): one input, with the boxes drawn from its text (Decisions)                                                       |
| `type="number"`, `range`, `checkbox`, `radio`                                    | Their value is not a text the user edits: Number Field (#149), Slider (#148), Checkbox, Radio (#147)                                                  |
| `type="file"`                                                                    | Its value is a list of files the page cannot set, so it cannot be controlled; a native `<input type="file">` in `Field.Control` joins a Field already |
| `data-disabled`, `data-readonly`, `data-required`, `data-filled`, `data-focused` | The native input's pseudo-classes match (Decisions); a Field adds its own `data-*`                                                                    |
| A mask, or formatting that keeps the caret                                       | A changed edit shows the consumer's text with the caret at the end; keeping the caret through a format is a component of its own                      |
| A clear button                                                                   | `type="search"` has the browser's; otherwise a `<button>` that sets the value to `""`                                                                 |
| A warning when it switches between controlled and uncontrolled                   | Input holds no state of its own, so the switch breaks nothing: the element keeps its text                                                             |
| A declined edit while `readOnly` or `disabled`                                   | The browser makes no edit                                                                                                                             |
| The element's text after a value the browser sets without an event, by script    | The browser fires no event, so Input does not know; the app sets its state instead                                                                    |
| A form the Input joins after it has settled, or a `form` attribute that changes  | The `reset` listener goes on the form the element belongs to once it has settled, as Switch's and Field's do                                          |
| Composition in the browser's input methods, in the tests                         | No test runner drives an input method; the tests fire `input` with `isComposing` and `compositionend` as an input method does                         |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite). A
native `<input>` is announced by every screen reader with its label and
description; no screen reader has been tried with Input yet.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25, after #165.

| App                | Size  | Budget |
| ------------------ | ----- | ------ |
| `menhir/input`     | 993 B | 1 kB   |
| `menhir/separator` | 746 B | 900 B  |

Most of it is what every part has: `mergeElementProps` and `renderElement`
from `core`, which Separator, a part with nothing to do, is made of. Input's
own code is the 188 B over Separator: the write back after an edit, the
`compositionend` listener and the form's `reset` listener (13 B of it, from
921 B, the check that an Input the reset removed asks for nothing, #144). In an app with
any other Menhir component, `core` is there already.

934 B before #165, which moved the form reset to `core/formReset.ts`. The
budget was 950 B. Input's own code is now 247 B over Separator. The helper
holds the task after the `reset` event, the app's cancel and the check that
the reset removed the part, so a control alone pays for it, and an app with
several pays for it once: every form control together went from 19,811 B to
19,775 B, and Field, Input, Switch and Checkbox together from 3,042 B to
3,087 B, each set imported from its entry points.
