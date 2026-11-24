# Number Field

A text input for a number, with buttons that step it: the WAI-ARIA
spinbutton pattern (#149). The user types a number in the locale's own
digits and separators, or steps it with the arrow keys and the buttons; the
form receives the plain number. It follows the form conventions Field
settled (`src/field/README.md`).

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 2026-11-24 |
| [WAI-ARIA spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) (no date on the page): role `spinbutton` on the element that takes text, with `aria-valuenow`, and `aria-valuemin` and `aria-valuemax` when the value has a known minimum or maximum, `aria-valuetext` when the number is not friendly; Up and Down increase and decrease; Home and End set the minimum and maximum, if it has them; Page Up and Page Down by a larger step (optional); focus stays on the text field; the browser's own text editing keys are left alone | 2026-11-24 |
| [WAI-ARIA quantity spin button example](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/examples/quantity-spinbutton/) (updated 2025-10-28): an `<input type="text" role="spinbutton">`; the buttons have `tabindex="-1"`, out of the tab order but reachable by touch and voice, `aria-controls` naming the input, and a name; they are marked disabled at the minimum and maximum                                                                                                                                                                       | 2026-11-24 |
| HTML standard, [the number state](<https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)>), [`stepUp()` and `stepDown()`](https://html.spec.whatwg.org/multipage/input.html#dom-input-stepup), the value sanitization algorithm and [constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints): `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `valueMissing`, and `badInput`                                                                                                    | 2026-11-24 |
| ECMA-402, `Intl.NumberFormat` and its `formatToParts()`: the parts of a formatted number (`minusSign`, `group`, `decimal`, `currency`, `percentSign`, `unit`, `literal`) and the `numberingSystem` of a locale's digits                                                                                                                                                                                                                                                                                                                                       | 2026-11-24 |
| Input's decisions (`src/input/README.md`), Select's hidden input (`src/select/README.md`), Meter's `format` and `locale` (`src/meter/README.md`) and Field's (`src/field/README.md`)                                                                                                                                                                                                                                                                                                                                                                          | 2026-11-24 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 2026-11-24 |

## Settled after Field

Checked on 2026-11-23, as the ticket's "Settle after Field" list records: a
Number Field joins a Field as `Field.Control`'s `render`, and Field reads
the validity of its input (`min`, `max`, `step`, `required`). Here the Root
is the Control, as a Radio's is, and the input Field reads is the Root's
hidden `<input type="number">` (Decisions).

## The platform first

Checked on 2026-11-24, in the HTML standard and in Chromium.

| Feature of `<input type="number">` | What it does                                                                                                                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting                         | None the page chooses: the text is the value, or the browser's own rendering of it, in the browser's locale, with no group separators, currency, percent or unit. `Intl.NumberFormat` options cannot apply |
| Text that is not a number          | The value sanitization algorithm makes `value` `""`, and `validity.badInput` true: the page cannot read what was typed, nor tell it from an empty field. Firefox lets any character be typed               |
| Up and Down                        | Step by `step` (`stepUp()`, `stepDown()`); no Page Up, Page Down, Home or End                                                                                                                              |
| The wheel                          | Changes the value while focused in some browsers, which scrolls past the field change it by surprise                                                                                                       |
| The spin buttons                   | Drawn by the browser, small, styled only with vendor pseudo-elements, and not parts of the page's own                                                                                                      |
| `min`, `max`, `step`, `required`   | Constraint validation: `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `valueMissing`, which Field reads, and the browser's messages for them                                                           |
| `FormData`                         | The plain number, such as `1234.5`, whatever the locale                                                                                                                                                    |
| Role                               | `spinbutton`, with the value read out                                                                                                                                                                      |

**So the user's element is not an `<input type="number">`, and the form's is.**
The user types in an `<input type="text" role="spinbutton">`, which shows the
number formatted with `Intl.NumberFormat` in the given locale, keeps any text
while it is typed, and takes the pattern's keys; Increment and Decrement are
buttons of the page's own. The form gets a visually hidden `<input
type="number">` with the plain number and the `min`, `max`, `step` and
`required` constraints, so `FormData`, constraint validation, the browser's
messages and Field work as they do for a native number input. The wheel is
left out (Left out).

## Shape

```tsx
import { NumberField } from "menhir/number-field";

<label for="quantity">Quantity</label>
<NumberField.Root id="quantity" name="quantity" min={1} max={10} defaultValue={1}>
  <NumberField.Decrement aria-label="Decrease">−</NumberField.Decrement>
  <NumberField.Input />
  <NumberField.Increment aria-label="Increase">+</NumberField.Increment>
</NumberField.Root>

<Field.Root name="price">
  <Field.Label>Price</Field.Label>
  <Field.Control
    required
    render={(p) => (
      <NumberField.Root {...p} format={{ style: "currency", currency: "EUR" }} locale="de-DE">
        <NumberField.Input />
      </NumberField.Root>
    )}
  />
  <Field.Error />
</Field.Root>
```

- `NumberField.Root` renders a `<div>` around the parts, holds the value,
  and renders the hidden `<input type="number">` for the form after them.
- `NumberField.Input` renders an `<input type="text" role="spinbutton">`.
- `NumberField.Increment` and `NumberField.Decrement` render a `<button
type="button" tabindex="-1">` each.

### Decisions

- **Four parts: Root, Input, Increment and Decrement.** The Root holds the
  value, as every component's Root does, and the form's input; the Input is
  the spinbutton; the buttons are parts because each steps the value and
  carries its state. No Group part around the Input and the buttons: the
  Root's `<div>` is that. No Label, Description or error parts: they are
  Field's.
- **The value** is `value`, `defaultValue` and `onValueChange` on the Root:
  a number, `null` while the field is empty (PLAN.md section 8, "Controlled
  state"). `onValueChange` gets the new value only, as Radio's does: the
  user can type, step or reset, and the reason has not been asked for (Left
  out). A value from the app is shown as it is, even outside `min` and
  `max`: the user's changes are clamped, the app's are the app's, and the
  hidden input reports one outside the range to a Field.
- **The text is parsed when it is committed: on blur, and on Enter**, not on
  each key. Typed text is often not yet a number (`-`, `1.`, `1,5` half
  written), and a parse on each key would rewrite the text under the caret.
  While the user types, the Input keeps the text as typed and the value as
  it was. A commit parses the text: empty text is `null`, a number is
  rounded to the digits the format shows and clamped to `min` and `max`, and
  text that is not a number is dropped. Then the text is the formatted
  value, which shows the user what was understood: `1000` becomes `1,000`,
  `abc` goes back to the value it had. Enter commits and goes on, so a form
  submits the committed number by Enter. Text the user has not edited is
  not parsed again, so an app's value with more digits than the format
  shows is kept on blur.
- **Formatting and parsing with `Intl.NumberFormat`**: `format` takes its
  options and `locale` the language, else the runtime's default, as Meter
  takes them (PLAN.md section 8, "A value along a range"); pass `locale`
  when rendering on the server, so that the server and the browser agree.
  The default format is the formatter's: grouped, up to three decimals.
  `{ style: "percent" }` shows `0.25` as `25%`, and `25` typed is `0.25`.
  Parsing reads the formatter's own parts: the locale's digits (any
  `numberingSystem`, and ASCII digits too), its decimal separator, its
  minus sign (and `-`), and drops its group separator, whitespace (a
  no-break space is typed as a space), apostrophes (de-CH groups with `'`
  or `’` by ICU version, and keyboards type `'`), and the currency, percent
  sign, unit and literal text the format writes. Any other character makes
  the text not a number. Parsing is a module of its own, `parse.ts`, about
  280 B (Size); the Root bundles it, since every field that can be typed in
  needs it, and a parser of plain `1234.5` would fail every user whose
  decimal separator is a comma. Not its own import: the ticket asked for
  one if it were large, and at a tenth of the component it is not.
- **Keys, as the spinbutton pattern says.** Up and Down step by `step`
  (default 1); Page Up and Page Down by `largeStep` (default ten steps);
  Home and End set `min` and `max`, only when the field has them, else
  they move the caret, as in any text field. A key with Ctrl, Alt or Meta
  held, or Shift with an arrow, is the browser's, which selects text. Every
  other key edits the text, as the browser does (the pattern's note: do not
  capture the text editing keys).
- **A step lands on the step grid.** From a value off the grid it goes to
  the grid's next value in that direction, as `stepUp()` does: `1.5` up by 1
  is `2`. The grid starts at `min`, else 0. Each result is rounded to the
  decimals of `step` and `min`, so `0.1 + 0.2` is `0.3`, and clamped to
  `min` and `max`. From `null` a step starts at 0, as `stepUp()` does on an
  empty number input. A step from text the user has typed but not committed
  starts from that text.
- **The buttons are not tab stops** (`tabindex="-1"`), as the example has
  them: the keys on the Input do what they do, and touch and voice users
  reach them. A press keeps focus where it was: the button cancels its
  `pointerdown`, so it never takes focus, and a mouse press focuses the
  Input, so that the keys go on from there; a touch focuses nothing, which
  would open the on-screen keyboard. `aria-controls` names the Input, as
  in the example. They have no name of their own: an icon or a sign is not
  one, so the consumer gives it, `aria-label` or text (the docs say so).
- **Press and hold repeats**: a primary pointer press steps once, then,
  after 400 ms, every 60 ms until the pointer is released or canceled, or
  the button is disabled at a limit. A click with no pointer press before
  it, from a screen reader or voice control (`detail` 0), steps once.
- **A button is disabled at its limit**: Increment while the value is at or
  over `max`, Decrement while at or under `min`, both while the field is
  `disabled` or `readOnly`. Native `disabled`, not `aria-disabled` as in the
  example: a press then does nothing with no code, `:disabled` styles it,
  and a disabled button is announced dimmed. Not being tab stops, they
  leave no gap in the tab order.
- **What the form receives: the plain number**, from the Root's visually
  hidden `<input type="number">`, with the field's `name`, `form`, `min`,
  `max`, `step`, `required`, `disabled` and `readOnly`. Without a `step`
  its `step` is `any`, not the browser's default of 1: the field formats
  decimals by default, so a price typed as `12,50` must not be a step
  mismatch that blocks the form (found in review); the keys and buttons
  still step by 1. Its value is the
  number as JavaScript writes it (`1234.5`), `""` while `null`. So
  `FormData` has the number, and constraint validation is the browser's:
  `valueMissing`, `rangeUnderflow` and `rangeOverflow` (for an app's value
  outside the range) and `stepMismatch` (with a `step`, for a typed value off the grid,
  which a commit does not move: the user typed it, and the error says what
  is valid), with the browser's messages, which a Field shows. As with a
  native number input, `readOnly` takes it out of validation. A user's
  change writes the input and fires its native `input` and `change`
  events, so the form's listeners, a Field's touched state and a Form's
  error under its name follow it; a controlled field that declines the
  change puts the input back after the flush, as a Select does. When the
  browser blocks a submission and focuses the hidden input, focus moves to
  the Input.
- **`required`** goes on the hidden input, and the Input has
  `aria-required`. The Input is never `required` itself: two invalid
  controls would give the field two messages.
- **A form reset asks:** the Root calls `onValueChange` with `defaultValue`
  (`null` without one) when the value is not that already, so a controlled
  field asks, then puts the text and the hidden input back to the value.
  In a task, as Input does (`src/input/README.md`), since the browser resets
  the controls after the `reset` event's listeners, and runs microtasks
  between them when the user presses a reset button; a reset the app
  cancels calls nothing.
- **It joins a Field as `Field.Control`'s `render`, with the Root as the
  Control**, as a Radio's does: the Root takes the Field's `name`,
  `disabled`, `data-*`, and its `id`, `aria-describedby` and `aria-invalid`,
  which it hands to the Input, the labelable element (PLAN.md section 8,
  "`id` goes on the labelable element"); the Root generates the Input's id
  when it gets none, which the buttons name in `aria-controls` ("Generated
  ids belong to the root"), so the Input takes no `id`. `disabled` on the
  Root, from a Field or not, disables every part. The Root reads no context
  of Field's, so a Number Field outside a Field pays nothing for it.
- **`aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`**
  on the Input: the value, `min` and `max` when set, and the formatted text,
  which a screen reader reads for a currency or a percentage; the value's
  attributes are absent while it is `null`.
- **`inputmode="decimal"`** by default, for a touch keyboard with digits and
  a decimal separator. A consumer passes `inputmode="numeric"` for whole
  numbers, or `"text"` where a minus sign must be typed (iOS's decimal pad
  has none). `autocomplete="off"`, since the browser's history of a field's
  past numbers is no help. Both are overridden like any attribute.
- **The Input's text is its `value` attribute**, bound as `defaultValue`,
  and written as a property only when the value changes, by the app or a
  step, and after a commit. A bound `value` is written again whenever any
  other attribute of the element changes, such as a Field's `aria-invalid`
  as the user types, which threw away the typed text; Solid's dev build
  reported it (`UNCOMMITTED_INPUT_OVERWRITTEN`). The attribute is also the
  server's text and the text a form reset puts back, and it leaves an
  edited input alone.
- **A form with one Number Field and no submit button does not submit on
  Enter**: the hidden number input is a second field that blocks implicit
  submission, as two text inputs would. Enter still commits; a form with a
  submit button submits the committed number.
- **`data-*` attributes**: `data-disabled`, `data-readonly` and
  `data-required` on every part (PLAN.md section 8). A button at its limit
  has none of its own: `:disabled` matches it.
- **The Input element and the `edited` flag are plain fields of the Root's
  context**, set by the Input from its ref and on each edit, and read by
  the Root and the buttons only in event handlers and `onFlush` callbacks,
  as Select's context holds its Trigger, input and Popup. Not a slot
  (`core/slot.ts`): a slot makes a mounted part's value reactive for
  something that renders from it, and nothing renders from these.
- **A part used outside its Root throws** a descriptive error in
  development builds.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. "A" marks a case the WAI-ARIA spinbutton pattern requires.

`root/NumberFieldRoot.test.tsx`

- Renders a `<div>` around its parts, then a visually hidden `<input type="number">`, hidden from assistive technology and the tab order
- Uncontrolled: starts at `defaultValue`, empty without one, and calls `onValueChange` with each new value
- Controlled: shows `value`, follows the app's changes, asks with the requested value and stays put when declined; `null` is empty
- Changes before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- An app's value outside `min` and `max` is shown as it is
- `id` goes on the Input, else a generated one; `aria-describedby` and `aria-invalid` go on the Input
- `disabled`: disables the Input, the buttons and the hidden input, with `data-disabled` on every part; follows changes
- `readOnly`: the Input is read-only, keys and buttons change nothing, with `data-readonly` on every part
- `required`: `aria-required` on the Input and `data-required` on every part
- Form: submits the plain number under `name`, `""` while empty, in any locale and format
- Form: submits to the form named by `form`
- Form: a user's change fires native `input` and `change` events on the hidden input, which the form sees with the new number
- Form: a controlled field that declines a change puts the hidden input back
- Form: `required` blocks a submission while empty, and not once a number is typed
- Form: the hidden input has `min`, `max` and `step`, so the browser reports `rangeUnderflow`, `rangeOverflow` and `stepMismatch`
- Form: without `step`, the hidden input's `step` is `any`, so a typed decimal, such as a currency's, submits
- Form: when the browser blocks the submission, focus moves to the Input; Chromium only, since jsdom does not focus the invalid control
- Form: a reset goes back to `defaultValue`, the text and the hidden input with it; at its default already, it calls nothing
- Form: a reset of a controlled field asks for `defaultValue`, `null` without one; declined, the text keeps the value; taken, it shows the default
- Form: a reset the app cancels calls nothing
- Form: a field the reset's own handler removes calls nothing

`input/NumberFieldInput.test.tsx`

- Renders an `<input type="text">` with role `spinbutton`, `inputmode="decimal"` and `autocomplete="off"`, which the consumer overrides (A: role)
- `aria-valuenow` is the value, absent while empty (A)
- `aria-valuemin` and `aria-valuemax` are `min` and `max` when set, absent otherwise (A)
- `aria-valuetext` is the formatted text (A: when the number is not friendly)
- Named by a `<label for>` the Root's `id`, and by `aria-label` (A: label)
- Shows the value formatted: grouped by default, with `format`'s options, in `locale`'s language and digits; follows changes of `format` and `locale`
- Typing keeps the text as typed and does not change the value until a commit
- The typed text stays when another attribute of the Input changes (Decisions, "The Input's text")
- Blur commits: the typed number becomes the value and the text its formatted form
- Enter commits, and a form with a submit button submits the committed number by Enter
- Enter while an input method composes commits nothing
- A commit of empty text sets `null`
- A commit of text that is not a number keeps the value and shows its text again
- A commit clamps to `min` and `max`
- A commit rounds to the digits the format shows
- A commit of a number off the step grid keeps it, and the hidden input reports `stepMismatch`
- A blur with no edit keeps an app's value with more digits than the format shows
- Parses in several locales: `en-US` (`1,234.5`), `de-DE` (`1.234,5`), `fr-FR` (narrow no-break space groups, typed as a space), `de-CH` (apostrophe groups), `ar-EG` (Arabic-Indic digits, and ASCII digits), `hi-IN` (lakh groups)
- Parses a negative number with the locale's minus sign and with `-`
- Parses the currency, percent and unit formats: `€1,234.50`, `25%` is `0.25`, `12 km`
- A controlled field that declines a commit shows the value's text again
- The consumer's `onBlur`, `onKeyDown` and `onInput` run

`NumberField.keyboard.test.tsx`

- Up increases by `step`, Down decreases by `step` (A)
- Page Up and Page Down change by `largeStep`, ten steps by default (A: optional)
- Home sets `min` and End sets `max` (A)
- Home and End without `min` or `max` change nothing and are not canceled, so the caret moves (A: text editing keys)
- Up and Down clamp to `min` and `max`
- A step from a value off the grid lands on the grid in that direction
- A step of a decimal `step` has no floating-point error (`0.1` steps)
- Up from empty is `step` and Down `-step`; with `min` above 0, `min`
- A step from typed text that is not committed starts from that text
- A key with a modifier, and Shift with an arrow, change nothing and are not canceled
- Focus stays on the Input (A)
- Disabled and read-only fields ignore the keys

`increment/NumberFieldIncrement.test.tsx` and `decrement/NumberFieldDecrement.test.tsx`

- Renders a `<button type="button" tabindex="-1">` with `aria-controls` naming the Input (example)
- A click steps the value by `step`
- A press keeps focus where it was: on the Input, or a mouse press focuses the Input; a touch focuses nothing (A: focus stays on the text field)
- Press and hold repeats after 400 ms, every 60 ms, and stops on release, `pointercancel` and `lostpointercapture`; at the limit it stops
- A click from assistive technology (`detail` 0) steps once
- Disabled at the limit (`max` for Increment, `min` for Decrement), when the field is disabled and when read-only; enabled again when the value moves away (example)
- Fires the consumer's `onClick` and `onPointerDown`
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `NumberField.Root`

`NumberField.field.test.tsx`, as a Field's Control

- Labelled by the Field's Label, described by its Description, and submits under the Field's `name`
- `required` and empty: the error shows once touched, with `aria-invalid` on the Input; typing a number and leaving hides it
- A typed number above `max` is clamped, so no error; an app's value over `max` shows the browser's `rangeOverflow` message once touched (the message in Chromium only, since jsdom has none)
- A typed value off the step grid shows the browser's `stepMismatch` message once touched (likewise)
- The Field's `disabled` disables every part
- A Form's error under the Field's `name` shows at once, and hides once the value changes

`test/number-field/NumberField.hydrate.test.tsx`

- The server HTML has the spinbutton with its formatted text as the `value` attribute, its `aria-value*`, the label, and the hidden input with the plain number, before any script runs
- Hydration adopts the server's elements without warnings; a step and a commit change the value and the form's data afterwards

Outside `src`:

- `test/bundle-size/fieldModules.test.ts`: `menhir/number-field` bundles no module of `src/field`
- `test/bundle-size/floating.test.ts` covers `menhir/number-field` with every simple component
- `test/bundle-size/comparison.ts`: Number Field's row

## Left out

| Case                                                                            | Reason                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changing the value by the wheel, or by dragging on a label                      | The ticket leaves them out unless asked: a wheel that changes a field the page scrolls past is a surprise, and either one is a part or a prop someone has to ask for                                                                                                                                                                                                                                    |
| Blocking characters that cannot be part of a number as they are typed           | The pattern allows it, as many implementations do; a commit drops text that is not a number and shows the value again, which costs nothing more. Filtering each key per locale and format costs bytes for little                                                                                                                                                                                        |
| Parsing each key, or `onValueChange` while typing                               | Text half typed is often not a number, and reformatting it would move the caret (Decisions)                                                                                                                                                                                                                                                                                                             |
| Reading `1.5` as one and a half in a locale whose decimal is `,`                | `.` is that locale's group separator, so `1.5` is 15, as the locale writes it; guessing would read `1.500` wrong                                                                                                                                                                                                                                                                                        |
| Scientific notation, `Infinity`, accounting parentheses for a negative number   | No format the field shows writes them, so typing them is rare; they are not a number to the parser                                                                                                                                                                                                                                                                                                      |
| Snapping a typed value to the step grid                                         | The user typed it; the browser's `stepMismatch` says it is not valid and which values are, which a Field shows (Decisions)                                                                                                                                                                                                                                                                              |
| The details argument of `onValueChange` (`reason`, `event`)                     | Not asked for; a second argument can be added later without breaking a consumer                                                                                                                                                                                                                                                                                                                         |
| `aria-disabled` on a button at its limit, as the example has                    | A native `disabled` button needs no code to ignore a press, and is out of the tab order already (Decisions)                                                                                                                                                                                                                                                                                             |
| Default names for the buttons, such as "Increase"                               | A name in English would ship in every app, in every language; the consumer names them                                                                                                                                                                                                                                                                                                                   |
| A live region that announces each step, as the example has                      | The Input keeps focus, and a screen reader reads a focused spinbutton's new `aria-valuetext`; a button pressed by touch or voice is the example's case, left until a screen reader is tried                                                                                                                                                                                                             |
| `aria-invalid` from the field itself, for an app's value out of range           | The pattern asks for it, but the Input cannot tell whether a Field is around it: a Field sets `aria-invalid` from the hidden input's `rangeOverflow` once touched, and an `aria-invalid` of the field's own would show before that. The user's changes are clamped, so only the app's value can be out of range; outside a Field the app passes `aria-invalid` on the Root, which hands it to the Input |
| Switching between controlled and uncontrolled                                   | Warned of by `createControllableSignal` in development, as for every control                                                                                                                                                                                                                                                                                                                            |
| A form the field joins after it has settled, or a `form` attribute that changes | The `reset` listener goes on the form the hidden input belongs to once it has settled, as Input's and Switch's do                                                                                                                                                                                                                                                                                       |
| Implicit submission of a form whose only field is a Number Field                | The hidden number input counts as a second field, which blocks it, as in a browser; a submit button submits (Decisions)                                                                                                                                                                                                                                                                                 |
| An app's value that changes while an input method composes in the Input         | The new value's text is written at once, over the text being composed, which ends the composition. Rare in a field of digits, and the app's value is what it asked for; Input waits for `compositionend` (about 30 B here), if anyone reports it                                                                                                                                                        |
| Composition in the browser's input methods, in the tests                        | No test runner drives an input method; the tests fire `keydown` with `isComposing` as an input method does                                                                                                                                                                                                                                                                                              |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite).
Not yet tried in Firefox or WebKit, and no screen reader has been tried yet:
the spinbutton's name, its `aria-valuetext` as the keys step it, and a step
from a button pressed by touch or voice are still to be heard in VoiceOver,
NVDA and JAWS.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-24.

| App                   | Size    | Budget |
| --------------------- | ------- | ------ |
| `menhir/number-field` | 3,143 B | 3.3 kB |
| `menhir/input`        | 934 B   | 950 B  |
| `menhir/radio`        | 2,507 B | 2.6 kB |

Measured the same way, by part, before the review's changes, which took
26 B off:

| App                                         | Size    |
| ------------------------------------------- | ------- |
| The Root alone                              | 2,429 B |
| The Root and the Input                      | 2,914 B |
| Every part                                  | 3,156 B |
| `parse.ts` alone                            | 493 B   |
| Every part, with a parser of `Number(text)` | 2,880 B |

So the locale-aware parser costs about 280 B of the 3.2 kB, the Input
about 490 B and the two buttons about 240 B together, since they share
`stepButton.tsx`. Most of the Root is what every Menhir control has:
`mergeElementProps` and `renderElement` (Separator, 746 B) and
`createControllableSignal` (338 B alone). Its own code is the step grid,
the commit, the hidden input and its events, and the form reset. The
first parser was 539 B alone; reading the locale's characters into one
lookup, with one formatter fewer, made it 493 B.
