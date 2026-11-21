# Toggle

A button that the user presses to turn something on and presses again to
turn it off: the toggle button of the WAI-ARIA button pattern.

## Sources

| Source                                                                      | Read       |
| --------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | 2026-11-21 |

## Shape

`Toggle.Root` renders a native `<button type="button">` with `aria-pressed`.
The button gives Enter and Space, focus, `disabled` and a name from its
content without code, before hydration too (PLAN.md section 8,
"API conventions"). It is the only part: the pressed state is the button's
own, and its content is the consumer's.

The pattern requires that a toggle's label does not change when its state
does: a "Mute" button stays "Mute" while pressed. The label is the
consumer's content; the docs page says so.

There is no hidden input: a toggle button is not a form control, and a
button with `type="button"` submits nothing.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the part against the
part conventions. "A" marks a case the WAI-ARIA pattern requires.

`root/ToggleRoot.test.tsx`

- Renders a button with type `button` (A: role)
- `aria-pressed` is `"false"` by default and `"true"` with `defaultPressed` (A)
- Named by its content; `aria-label`, `aria-labelledby` and `aria-describedby` pass through (A: name, description)
- `id` goes on the button
- The consumer's attributes override the part's own, shown with `aria-pressed`, the only one it can type
- Toggles on click
- Focuses with Tab, toggles with Enter and with Space, and keeps focus (A)
- Uncontrolled: calls `onPressedChange` with each new value
- `defaultPressed` starts pressed and toggles off
- Controlled pressed and unpressed: stays put and asks with the requested value
- Follows a controlled value changed from outside
- Turns on before async work that `onPressedChange` starts settles (PLAN.md "API conventions")
- Calls the consumer's `onClick`, once per click
- `disabled`: native `disabled`, no toggle, not focusable; absent when not set; follows changes while rendered (A: unavailable action)
- `data-pressed`/`data-unpressed` and `data-disabled`, and they follow changes
- Does not submit its form, by click or by Enter
- `render` with a button component keeps the toggle's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- The consumer's `class` and `ref` reach the button

`test/toggle/Toggle.hydrate.test.tsx`

- The server HTML has the button with `aria-pressed`, its name and the `data-*` attributes before any script runs (PLAN.md section 10)
- Hydration adopts the server's element without warnings, and the toggle toggles by click and by key afterwards

## Left out

| Case                                                              | Reason                                                                                                                                                                              |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aria-disabled`, which keeps a disabled toggle focusable          | Native `disabled` is exposed as unavailable and removes the button from the tab order, as for Switch and Checkbox. A consumer who needs it focusable passes `aria-disabled` instead |
| A label that changes with the state                               | The pattern's alternative to `aria-pressed`, and the label is the consumer's content; the docs page warns against it                                                                |
| `aria-pressed="mixed"`                                            | The button pattern names `true` and `false` only                                                                                                                                    |
| `readOnly`, `aria-readonly` and `data-readonly`                   | `aria-readonly` is not allowed on the button role; a consumer who needs a fixed toggle controls `pressed`                                                                           |
| Where focus goes after activation                                 | A toggle does not leave its context, so focus stays on the button, natively                                                                                                         |
| Menu buttons (`aria-haspopup`)                                    | The menu button pattern, which belongs to Menu                                                                                                                                      |
| A `value` identifying the toggle in a group                       | Comes with Toggle Group (#17), which decides how its items are identified                                                                                                           |
| A name and value submitted with a form, as a checkbox does        | A toggle button is not a form control; Checkbox and Switch are                                                                                                                      |
| Keyboard modifiers in the change callback, and canceling a change | `onPressedChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                                 |
| Generated ids                                                     | The button takes the consumer's `id`, and no part links to another                                                                                                                  |
