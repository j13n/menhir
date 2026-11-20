# Switch

A control that turns a setting on or off: the WAI-ARIA switch pattern.

## Sources

| Source                  | Version                |
| ----------------------- | ---------------------- |
| Kobalte `solid2`        | `ba6b1df` (2026-10-29) |
| `@base-ui/react`        | 1.9.0                  |
| WAI-ARIA switch pattern | APG, read 2026-11-20   |

## Shape

`Switch.Root` renders a native `<button type="button" role="switch">`, then
a visually hidden `<input type="checkbox">` beside it for forms.
`Switch.Thumb` renders a `<span>`. Why a button and not Base UI's `<span>`
or Kobalte's hidden checkbox: PLAN.md section 8, "API conventions".

## Test list

Written in Kobalte's style against Menhir's API. Every test fails if
Solid reports a dev diagnostic while it runs (`createRenderer`), and
`describeConformance` checks both parts against the part conventions. "K" is a case from
Kobalte's `switch.test.tsx`, "B" from Base UI's `SwitchRoot.test.tsx` or
`SwitchThumb.test.tsx`, "A" from the WAI-ARIA pattern, "M" from Menhir's
own conventions.

`root/SwitchRoot.test.tsx`

- Renders a button with role `switch` and type `button` (A, K "should set input role to switch", on the button instead, B "can render a native button")
- `aria-checked` is `"false"` by default and `"true"` with `defaultChecked` (A, K)
- The hidden input is a checkbox, hidden from assistive technology and the tab order, and mirrors the state (K "input type", B)
- `name` and `value` are set only on the input; `value` is absent by default, so the browser submits `"on"` (K, B)
- `id` goes on the button (K "supports custom ids")
- The consumer's attributes override the part's own (B "should override the built-in attributes")
- `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-errormessage` pass through (K)
- A wrapping `<label>` names the switch and toggles it (K "visible label", B)
- A `<label for>` names the switch and toggles it (B)
- Toggles on click (K, B)
- Focuses with Tab, toggles with Enter and with Space (A, B)
- Uncontrolled: calls `onCheckedChange` with each new value (K)
- `defaultChecked` starts on and toggles off (K)
- Controlled on and controlled off: stays put, asks with the requested value, the hidden input stays in step (K)
- Follows a controlled value changed from outside (B)
- Turns on before async work that `onCheckedChange` starts settles, and the hidden input with it (M, PLAN.md "API conventions")
- Toggles when the hidden input is clicked (B)
- Ignores a hidden-input click canceled before it is handled (B)
- Fires native `input` and `change` events that reach the form (M)
- One user click reaches ancestors once; a consumer's `stopPropagation()` stops it but the switch still toggles (B)
- Calls the consumer's `onClick` (B)
- Tolerates a ref callback that clicks before the hidden input exists (B, without its `focus()` call: user-event's patched `focus` throws for an element not yet in a document)
- `disabled`: native `disabled` on the button and the input, no toggle, not focusable; absent when not set; follows changes while rendered (K, B, inverted from B's `aria-disabled`)
- `readOnly`: `aria-readonly`; a click or a label click does not toggle or call `onCheckedChange`; absent when not set (K, B)
- `required`: `aria-required` on the button, `required` on the input; absent when not set (B)
- `data-checked`/`data-unchecked`, `data-disabled`, `data-readonly`, `data-required` on Root and Thumb, and they follow changes (K, B)
- Form: submits `"on"` when on and nothing when off, as a native checkbox does (B)
- Form: submits a custom `value` (B)
- Form: submits to the form named by `form` (B)
- Form: a disabled switch submits nothing (B)
- Form: a form reset goes back to `defaultChecked`; when controlled, it asks with `onCheckedChange` (K)
- Form: the form's `change` listener and `FormData` see the new value (M)
- Form: `required` blocks submission while off (B)
- Form: when the browser blocks the submission, focus moves to the switch; Chromium only, since jsdom does not focus the invalid control (M)
- `render` with a button component keeps the switch's behaviour (M, PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>` (M)
- The consumer's `class` and `ref` reach the button (M)

`thumb/SwitchThumb.test.tsx`

- Renders a `<span>` carrying the Root's `data-*` attributes (B)
- Throws a descriptive error outside `Switch.Root` (B)

`test/switch/Switch.hydrate.test.tsx`

- The server HTML has the button with its role and `aria-checked`, the hidden input, the `data-*` attributes, and a name from a `<label for>` before any script runs (M, PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the switch toggles by click and by key afterwards (M)

## Left out

| Case                                                                                                                                                                          | Source | Reason                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| "should generate default ids", "should generate ids based on switch id"                                                                                                       | K      | No generated ids: the button takes the consumer's `id`, and no part links to another                |
| Label, Description and ErrorMessage parts, and the cases that combine their ids into `aria-*` (about 10)                                                                      | K      | Those parts belong to Field (Phase 4); a native `<label>` labels the button                         |
| `validationState`, "can be invalid", `data-valid`, `data-invalid`                                                                                                             | K      | Validity comes with Field; until then a consumer passes `aria-invalid` through                      |
| "sets `aria-labelledby` from a sibling label", "updates fallback `aria-labelledby`", Field.Label "when rendering a non-native button" and "when rendering a non-native label" | B      | Base UI works around a `<span>` that cannot be labelled; a button is labelled natively              |
| "prefers `aria-label` over an associated label"                                                                                                                               | B      | The browser's name computation, with no code of Menhir's involved                                   |
| "should report keyboard modifier event properties", both "does not change state when canceled" cases                                                                          | B      | `onCheckedChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8) |
| "should associate `id` with the native button when `nativeButton=true`"                                                                                                       | B      | The button is the default; covered by the `id` and `<label for>` cases                              |
| `inputRef`                                                                                                                                                                    | B      | Deferred until a form library needs it                                                              |
| `uncheckedValue` (5 cases)                                                                                                                                                    | B      | Deferred                                                                                            |
| Field, Form errors and validation modes (about 22)                                                                                                                            | B      | Field and Form are Phase 4                                                                          |
| `describeConformance`                                                                                                                                                         | B      | Not built yet (#7); the `class`, `ref` and `render` cases above stand in                            |
