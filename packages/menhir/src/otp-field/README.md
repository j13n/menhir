# OTP Field

A one-time code shown as a box per character, of digits, letters or both
(#203, part of #150). The user types, pastes or lets the phone fill the code
into one real `<input autocomplete="one-time-code">`, which is invisible and
lies over the boxes; the boxes show its text, its caret and its selection.
The form receives the code as one value. It follows the form conventions
Field settled (`src/field/README.md`).

## Sources

In order of precedence (PLAN.md section 8). There is no WAI-ARIA pattern:
the control is a text input, and is announced as one.

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Read       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1), "Form inputs": a bound `value` is written again whenever its template's other attributes change, so a field that rejects or transforms input writes the result back itself                                                                                                                                                                                                | 2026-11-25 |
| HTML standard, [autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill): `one-time-code` is the token for "one-time code used for verifying user identity", on a control whose value is text                                                                                                                                                                                                                                  | 2026-11-25 |
| HTML standard, [`inputmode`](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute): `numeric` asks for a keypad of digits, `text` for the locale's text keyboard                                                                                                                                                                                                                                                     | 2026-11-25 |
| HTML standard, [the `pattern` attribute](https://html.spec.whatwg.org/multipage/input.html#the-pattern-attribute) (compiled as `^(?:` value `)$` with the `v` flag, not checked on an empty value), [`maxlength` and `minlength`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#setting-minimum-input-length-requirements:-the-minlength-attribute): "too short" applies only to a value "last changed by a user edit", not by a script | 2026-11-25 |
| HTML standard, [text control selection APIs](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#textFieldSelection): `selectionStart`, `selectionEnd`, `setSelectionRange()`, and the `select` event                                                                                                                                                                                                                                         | 2026-11-25 |
| Input Events Level 2, [`beforeinput`](https://w3c.github.io/input-events/#event-type-beforeinput) and its `inputType`s (`insertText`, `insertFromPaste`, `insertReplacementText`, `deleteContentBackward`, …); UI Events, composition events and `isComposing`                                                                                                                                                                                                    | 2026-11-25 |
| Input's decisions (`src/input/README.md`) and Number Field's (`src/number-field/README.md`): the value attribute as the bound text, the form reset, joining a Field with the Root as the Control                                                                                                                                                                                                                                                                  | 2026-11-25 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                                                                                                                                                                                                           | 2026-11-25 |

## The platform first

Checked on 2026-11-25, in the HTML standard and in Playwright's Chromium,
Firefox and WebKit, with a throwaway page (not kept): each engine typed and
inserted text through its own editing, as a paste and an autofill do.

What one `<input autocomplete="one-time-code">` does, with nothing written:

| Feature                   | What it does                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The fill from a message   | The phone offers the code above the keyboard (iOS, Android) or under the field (Safari on macOS) for a focused field with the token, and fills that field                                             |
| A paste of the whole code | Lands in the field whole, at the caret or over the selection                                                                                                                                          |
| One value for the form    | `FormData` has the code under `name`; `required` and `pattern` are validated by the browser, which focuses the field when it blocks a submission; a form whose only text field it is submits on Enter |
| An input method           | Composes into the field, and the field takes the committed text                                                                                                                                       |
| The keys                  | Every editing key, the selection, undo, the context menu's Paste, a screen reader's text navigation                                                                                                   |
| `maxlength`               | Cuts an insertion to fit, before the page sees it: `123-456` inserted into an empty field with `maxlength="6"` landed as `123-45` in all three engines                                                |
| `minlength`               | "Too short" only after a user's edit: three characters typed were too short, and the same field after a script wrote two was not, in all three engines, as the standard says                          |
| An invisible input on top | An `<input>` with `opacity: 0`, stretched over its parent and above its siblings (`z-index: 1`), took focus from a click on the parent in all three engines                                           |
| Tab                       | Focus by Tab selected the whole text in all three engines                                                                                                                                             |
| `select`                  | Fired after `setSelectionRange()` in all three engines, and after Shift+Left in Chromium and WebKit, not in Firefox                                                                                   |

An input per character was tried against it, three `<input maxlength="1">`:
the same insertion of `123` into the first box landed as `1` there, and
nothing in the others, in all three engines. Every row of the table above
would have to be written again: a paste, an autofill and an input method
split across the boxes, focus moved from box to box on each key and on
Backspace, one value put together for the form and its validation, a
label for each box, and a screen reader that reads six text fields where
there is one code. **So it lost: the OTP Field is one real `<input>`, and
the boxes are drawn from its text, its caret and its selection.** The input
is invisible and lies over the boxes, so a press on a box lands on it, and
the phone's fill, a paste and the context menu are the browser's.

## Shape

```tsx
import { Repeat } from "solid-js";
import { OtpField } from "menhir/otp-field";

<label for="code">Code</label>
<OtpField.Root id="code" name="code" length={6} onComplete={verify}>
  <OtpField.Input />
  <Repeat count={6}>{(index) => <OtpField.Slot index={index} />}</Repeat>
</OtpField.Root>

<Field.Root name="code">
  <Field.Label>Code</Field.Label>
  <Field.Control
    required
    render={(p) => <OtpField.Root {...p} length={6} pattern="[0-9A-Z]" />}
  >
    <OtpField.Input />
    <Repeat count={6}>{(index) => <OtpField.Slot index={index} />}</Repeat>
  </Field.Control>
  <Field.Error match="patternMismatch">Enter all six characters.</Field.Error>
</Field.Root>
```

- `OtpField.Root` renders a `<div>` around the parts, and holds the value.
- `OtpField.Input` renders the `<input>`, invisible, over the Root.
- `OtpField.Slot` renders a `<div aria-hidden="true">` with the character at
  its `index`.

### Decisions

- **Three parts: Root, Input and Slot.** The Root holds the value, as every
  component's Root does, and is the box the Input lies over. The Input is
  the control: it takes the input's attributes, such as `autofocus` or
  `aria-label`, and the consumer's handlers. A Slot is a part because it
  shows state the Root holds: its character, whether it is in the
  selection, and whether the caret is in it. The consumer renders one per
  character, with `index` from 0, so it can put anything between them.
  **No Separator part**: a mark between two groups of boxes carries no
  state, so it is a plain element, `<span aria-hidden="true">-</span>`; a
  press on it goes to the nearest box.
- **The Input is invisible and lies over the Root.** Its inline style is
  `position: absolute`, stretched over the Root, `opacity: 0`, so neither
  its text, its caret, its selection nor its focus ring paint, and
  `z-index: 1`, so it stays above the Slots when the consumer positions
  them, as a caret drawn with `position: absolute` needs; and
  `font-size: 16px`, since iOS zooms the page into a focused field whose
  text is smaller. The Root's inline style is `position: relative`, so the
  Input lies over the Root and nothing else. The consumer's `style` wins a
  conflict, as with any part. Not `color: transparent`, which leaves the
  selection's highlight and the focus ring painted, and no inline style
  reaches `::selection`. The focus is shown by the Slots (`data-active`)
  or the Root's `:focus-within`.
- **Which characters are allowed is one prop, `pattern`**: a regular
  expression, as a string, that each character must match, as the native
  `pattern` attribute takes one (compiled with the `v` flag), default
  `[0-9]`. Digits only, letters and digits (`[0-9A-Za-z]`) and upper case
  only (`[0-9A-Z]`) are the docs' examples. Not a flag per alphabet, which
  would ship every alphabet's test in every app.
- **A character the pattern refuses is tried in upper case, then in lower
  case**, so `[0-9A-Z]` takes a typed or pasted `a` as `A`, and `[a-z]` an
  `A` as `a`. Codes in one case are read in either: a user who types a
  lower-case letter means the letter.
- **Every edit keeps only the characters the pattern takes**, so a pasted
  `123-456`, `123 456` or "Your code is 123456" is `123456` in a field of
  digits; spaces and hyphens need no rule of their own. Text over `length`
  is cut. **A typed character the pattern refuses is declined**: the field
  and its selection stay as they were, so a letter typed over a selected
  digit does not delete the digit. Likewise any insertion with no
  character the pattern takes.
- **An insertion of a whole code replaces the value**, wherever the caret
  was: a paste or an autofill of at least `length` characters the pattern
  takes. A user who typed two digits, then pasted the code, gets the code,
  not the two digits and the code's first four.
- **No `maxlength` and no `minlength` on the Input**: `maxlength` cuts a
  paste before the field could clean it (`123-456` landed as `123-45`), and
  `minlength`'s "too short" counts only a user's edit, not the field's own
  write after cleaning a paste, nor an app's value. **The Input's `pattern`
  attribute is the code's**: `(?:P){length}` for the Root's `pattern` P, so
  the browser reports a code that is not full, or has a character the
  pattern refuses, as `patternMismatch`, and `required` an empty one as
  `valueMissing`, from the server HTML on and for an app's value. A Field
  shows the browser's message, or the app's with `match="patternMismatch"`.
- **The value** is `value`, `defaultValue` and `onValueChange` on the Root:
  a string, `""` when empty, as Input's text, since an empty code is a text
  and the form submits it; `undefined` means uncontrolled. `onValueChange`
  gets the new value only, as Number Field's does. `length`, the number of
  characters, is required. **`onComplete(value)`** is called when a user's
  edit fills the last box: after `onValueChange`, once the value has
  settled, and only if it is that full code, so a controlled field that
  declines the edit is not told it is complete. An app's value or a form
  reset calls it never: the app knows what it set.
- **The value is the Root's, and the Input's text follows it.** Unlike
  Input, which keeps an uncontrolled text in the element only, the Slots
  render the value, so the Root holds it in `createControllableSignal`.
  Each `input` event cleans the element's text and sets the value; after
  the flush the element is put back to the value if they differ, with the
  caret where the edit left it, so a declined or cleaned edit shows what
  the field holds.
- **The Input's text is its `value` attribute**, bound as `defaultValue`,
  and written as a property only when the value changes, as Number
  Field's. A bound `value` would be written again whenever another
  attribute changes, such as a Field's `aria-invalid` as the user types
  (Solid's `UNCOMMITTED_INPUT_OVERWRITTEN`). The attribute is also the
  server's text, and the text a form reset puts back.
- **While an input method composes, the value follows and the element is
  not written**: the Slots show the text as it is composed, which matters
  on Android, whose keyboards compose every word typed in a text field,
  and the element is put back once the composition ends, since a write
  would end it.
- **Selection and the caret.** The Slots show the Input's selection while
  it has focus. A selection of several characters gives each of its Slots
  `data-active`. A caret (a selection of none) gives `data-active` to the
  Slot it is before, and `data-caret` too: the consumer draws a caret
  there, in the middle of an empty box. After the last character of a full
  code the last Slot is active, with no caret: there is nowhere to type.
- **The field types over its characters, as boxes do.** One text cannot
  have a gap, so a press, an arrow key or typing inside the code selects
  the character in that box, and the next character typed replaces it:
  - **Focus** puts the caret in the first empty box, or selects the last
    character of a full code, over the browser's choice (Tab selects the
    whole text in every engine).
  - **A press on a box** focuses the Input and selects that box's
    character, or puts the caret in the first empty box for a box after
    it. The box is the one nearest the press, so a press on a gap or a
    separator goes to a box. A mouse press is canceled, so the browser
    neither places its own caret in the invisible text nor starts a
    selection; a touch is not, so the phone focuses the field and opens
    its keyboard as for any field, and the box is selected on the click.
  - **Typing inside the code** replaces the selected character and selects
    the next, until the caret reaches the first empty box.
    At a caret the field did not widen, inside a full code, as Up or a
    screen reader places it, a character typed types over the one after
    it, instead of pushing the last one out.
  - **Left and Right** select the box before and after, Home the first and
    End the first empty one (or the last character of a full code), each
    canceled. Right to left, Left and Right are swapped, since the boxes
    run from the right, as the Root's `direction` reads. With Shift, Ctrl,
    Alt or Meta, the keys are the browser's, so Shift extends the
    selection. Up and Down are the browser's.
  - **Backspace and Delete** are the browser's: Backspace deletes the
    selected character, else the one before the caret, and the characters
    after it move back a box, since the code is one text. After a deletion
    the caret stays where it is, and is not widened to a character, so a
    second Backspace deletes the one before.
- **`inputmode` follows the pattern unless set**: `numeric` when the
  pattern takes `0` and neither `a` nor `A`, for a keypad of digits, else
  `text`. `autocomplete="one-time-code"`, so the phone offers the code.
  The consumer overrides either on the Input.
- **What the form receives: the code**, from the Input itself, which takes
  the Root's `name`, `form`, `required`, `disabled` and `readOnly`, so the
  browser validates it, focuses it when it blocks a submission, and
  submits a form whose only text field it is on Enter. No hidden input.
- **A form reset asks:** the Root calls `onValueChange` with
  `defaultValue` (`""` without one) when the value is not that already, so
  a controlled field asks, in a task after the `reset` event, as every
  control does (`core/formReset.ts`). Nothing is held through the
  browser's reset: the Input's `value` attribute is the value.
- **It joins a Field as `Field.Control`'s `render`, with the Root as the
  Control**, as Number Field does: the Root takes the Field's `name`,
  `disabled` and `data-*`, and hands its `id`, `aria-describedby` and
  `aria-invalid` to the Input, the labelable element. No part names the
  Input, so the Root generates no `id`. The Root reads no context of
  Field's, so an OTP Field outside a Field pays nothing for it.
- **`data-*` attributes**: `data-disabled`, `data-readonly` and
  `data-required` on every part; on a Slot, `data-filled` while it has a
  character, `data-active` and `data-caret` (above).
- **The Slots and the Input element are plain fields of the Root's
  context**, as Number Field's Input is: the Input reads them only in its
  handlers. The selection is a signal, since the Slots render from it.
- **A part used outside its Root throws** a descriptive error in
  development builds.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. No WAI-ARIA pattern applies, so no case is marked "A".
Focus, selection, layout and pointer cases with the real browser's
behaviour run in Chromium only (`it.skipIf(isJSDOM)`).

`root/OtpFieldRoot.test.tsx`

- Renders a `<div>` around its parts, `position: relative`
- Uncontrolled: starts at `defaultValue`, empty without one, and calls `onValueChange` with each new value
- Controlled: shows `value`, follows the app's changes, and a declined edit is undone
- Changes before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- `id`, `aria-describedby` and `aria-invalid` go on the Input
- `disabled`: disables the Input, with `data-disabled` on every part
- `readOnly`: the Input is read-only, with `data-readonly` on every part
- `required`: the Input is required, with `data-required` on every part
- `onComplete` is called once a user's edit fills the last box, with the code, after `onValueChange`; not for an app's value; not when a controlled field declines the edit
  `OtpField.form.test.tsx`

- Submits the code under `name`, and to the form named by `form`
- `required` blocks a submission while empty; a code that is not full is `patternMismatch`, and blocks it too
- A form whose only text field it is submits on Enter
- A reset goes back to `defaultValue`, the Slots with it; at its default already, it calls nothing
- A reset of a controlled field asks for `defaultValue`, `""` without one; declined, it keeps the value; taken, it shows the default
- A reset the app cancels calls nothing
- By a real press of the reset button (Chromium only, since a script's click runs no microtask between the listeners): a reset taken shows `defaultValue`, a reset declined keeps `value`

`input/OtpFieldInput.test.tsx`

- Renders an `<input type="text">` with the textbox role, `autocomplete="one-time-code"`, invisible over the Root, which the consumer overrides
- `inputmode` is `numeric` for digits and `text` for a pattern with letters, unless set
- The `pattern` attribute is the code's: `(?:P){length}`
- Named by a `<label for>` the Root's `id`
- Typing: each character shows in its Slot, and the value follows
- Allowed characters: a typed character the pattern refuses is declined, and a selected character stays
- Allowed characters: a refused letter is taken in the other case (`[0-9A-Z]` takes `a` as `A`)
- Allowed characters: a custom `pattern` takes letters and digits
- Typing past `length` changes nothing
- Paste: keeps only the characters the pattern takes, so spaces and hyphens go
- Paste: a whole code replaces the value wherever the caret was, and calls `onComplete`
- Paste: more than `length` characters, not a whole code with the caret, is cut to `length`
- Autofill: a value the browser fills in, with an `input` event, is taken, and calls `onComplete`
- Backspace deletes the character before the caret, and the selected one; the characters after it move back
- Delete deletes the character after the caret
- A deletion leaves the caret where it was, so a second Backspace deletes the one before
- Typing inside the code replaces the selected character and selects the next
- Typing at a caret inside a full code, as Up or a screen reader places it, types over the character after it
- While an input method composes, the value follows and the element is not written; once it commits, the element shows the value
- The typed text stays when another attribute of the Input changes
- The consumer's `onInput`, `onKeyDown` and `onFocus` run, and its `autocomplete`, `inputmode` and `style` win

`OtpField.selection.test.tsx`

- Not focused: no Slot is active
- Focus puts the caret in the first empty box (`data-active`, `data-caret`); with a full code, selects the last character
- A selection of several characters makes each of its Slots active, with no caret
- After the last character of a full code, the last Slot is active, with no caret
- A caret before a character, as after a deletion inside the code, is on that character's Slot
- Left and Right select the box before and after; Home the first; End the first empty one, or the last character of a full code
- Right from a caret before a character selects the next box
- Right to left, Left and Right are swapped (Chromium only, since jsdom has no `direction`)
- Shift with an arrow is the browser's, and the Slots follow the selection it makes (Chromium only)
- A press on a filled box focuses the Input and selects its character; on an empty box, puts the caret in the first empty box (Chromium only)
- A press between two boxes goes to the nearest (Chromium only)
- A touch is not canceled: the browser focuses the field, and the click selects the box (Chromium only)
- Blur: no Slot is active

`slot/OtpFieldSlot.test.tsx`

- Renders a `<div aria-hidden="true">` with the character at `index`, and `data-filled`; empty without one
- Renders the consumer's children after the character
- Throws a descriptive error outside `OtpField.Root`

`OtpField.field.test.tsx`, as a Field's Control

- Labelled by the Field's Label, described by its Description, and submits under the Field's `name`
- `required` and empty: the error shows once touched, with `aria-invalid` on the Input; typing the code hides it
- A code that is not full shows the `patternMismatch` error once touched
- The Field's `disabled` disables the Input
- A Form's error under the Field's `name` shows at once, and hides on the next edit

`test/otp-field/OtpField.hydrate.test.tsx`

- The server HTML has the input with the code as its `value` attribute, its `pattern`, its label, and each Slot's character, before any script runs
- Hydration adopts the server's elements without warnings; typing and a paste change the value and the form's data afterwards

Outside `src`:

- `test/bundle-size/fieldModules.test.ts`: `menhir/otp-field` bundles no module of `src/field`
- `test/bundle-size/floating.test.ts` covers `menhir/otp-field` with every simple component
- `test/bundle-size/comparison.ts`: OTP Field's row

## Left out

| Case                                                                            | Reason                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An input per character                                                          | Tried against one input, and lost: every feature of the platform would be written again (The platform first)                                                                                                                  |
| Masking the characters                                                          | Left out by the ticket unless asked; a Slot's character can be hidden by the consumer's CSS, and a masked code needs no autofill                                                                                              |
| A timer to send the code again                                                  | Left out by the ticket unless asked; it is the app's button and the app's clock                                                                                                                                               |
| A Separator part                                                                | Carries no state: a plain `aria-hidden` element (Decisions)                                                                                                                                                                   |
| A gap in the code: a character typed into a box after an empty one              | The value is one text, as the form submits it; a press on a later box puts the caret in the first empty one                                                                                                                   |
| `minlength` and `maxlength` on the Input                                        | `maxlength` cuts a paste before it is cleaned; "too short" counts only a user's edit. The `pattern` attribute covers both (Decisions)                                                                                         |
| The details argument of `onValueChange` (`reason`, `event`)                     | Not asked for, as on Number Field; a second argument can be added later without breaking a consumer                                                                                                                           |
| Digits of other scripts, such as Arabic-Indic, turned into ASCII                | The default pattern refuses them; a `pattern` of `\p{Nd}` takes them as they are. Not asked for                                                                                                                               |
| Characters outside the Basic Multilingual Plane                                 | A Slot reads one UTF-16 unit of the value, so an emoji would take two boxes; no code is written in them                                                                                                                       |
| Text typed, pasted or restored by the browser before hydration                  | The Input works before hydration, and its `pattern` validates a submission, but the Slots show nothing until then, and text in the element at hydration is not read into the value; a code is typed after the page has loaded |
| Dragging a selection across the boxes with the mouse                            | The press is canceled, so the browser does not select across the invisible text; Shift with the arrow keys, and a select-all, select several characters                                                                       |
| A form the field joins after it has settled, or a `form` attribute that changes | The `reset` listener goes on the Input's form once it has settled, as every control's does                                                                                                                                    |
| Switching between controlled and uncontrolled                                   | Warned of by `createControllableSignal` in development, as for every control                                                                                                                                                  |
| Composition in the browser's input methods, in the tests                        | No test runner drives an input method; the tests fire `input` with `isComposing` and `compositionend` as an input method does                                                                                                 |
| The fill from a message, in the tests                                           | Only a phone with a message does it; the tests fire the `input` event a fill fires (Browsers and screen readers)                                                                                                              |

## Password managers and browser extensions

Some password managers and extensions put a button of their own inside a
text field, at its inline end, placed over the field's box. An OTP Field's
Input is stretched over the Root, so such a button would sit over the last
box. Not seen yet: the test browsers run no extension, and none has been
tried by hand (#211). What the page can do, by the consumer's attributes on the
Input, which it passes on: `autocomplete="one-time-code"` already tells
most managers that the field is not a password, and a manager that fills
one-time codes is welcome to it; a manager that still draws its button
documents an attribute that opts the field out; and the consumer can give
the Root room at its inline end, with `padding-inline-end`, so the Input
reaches past the last box. Menhir adds no product's attribute of its own.

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite),
and the platform's behaviour above in Chromium, Firefox and WebKit. Not
yet tried by hand: the fill from a message needs a phone (iOS Safari and
Android Chrome), with a touch keyboard, and no screen reader has been
tried (#211). The Input is a native text field with its label, so a screen reader
reads its name, its text and its validity, and the Slots are hidden from
it.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25.

| App                | Size    | Budget |
| ------------------ | ------- | ------ |
| `menhir/otp-field` | 2,639 B | 2.7 kB |
| `menhir/input`     | 993 B   | 1 kB   |
| `menhir/separator` | 746 B   | 900 B  |

Most of it is what every Menhir control has: `mergeElementProps` and
`renderElement` (Separator, 746 B), `createControllableSignal` and the
form reset. Its own code is the cleaning of an edit, the selection the
Slots draw, the keys and the press on a box. In the comparison on the
docs site, measured the same way with each library's framework left out,
the OTP fields of three other libraries were 3,468 B, 8,425 B and
10,144 B.
