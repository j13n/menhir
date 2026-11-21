# Collapsible

A button that shows and hides a section of content: the disclosure of the
WAI-ARIA disclosure pattern, such as "Show details" or an answer under a
question.

## Sources

| Source                                                                              | Read       |
| ----------------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | 2026-11-21 |

## Shape

`Collapsible.Root` renders a `<div>` that holds the open state.
`Collapsible.Trigger` renders a native `<button type="button">` with
`aria-expanded` and `aria-controls`, and `Collapsible.Panel` a `<div>` with
the `id` that `aria-controls` names. The button gives Enter and Space, focus,
`disabled` and a name from its content without code, before hydration too
(PLAN.md section 8, "API conventions").

- **The open state** is `open`, `defaultOpen` and `onOpenChange` on the
  Root, which shares it with its parts.
- **A closed Panel is `hidden`**, not removed: its content stays in the
  document, so `aria-controls` always names an element, and the content
  keeps its state, such as a half-filled input, while closed. A consumer who
  wants closed content out of the document wraps it in `<Show>`.
- **The Panel's `id` is generated** by the Root with Solid's
  `createUniqueId`, which the server render and hydration agree on, and the
  Trigger names it in `aria-controls`. The Panel takes no `id` of its own:
  the server renders the Trigger before the Panel, so a Panel's own `id`
  could not reach the Trigger in the server HTML (PLAN.md section 8, "API
  conventions"). The Trigger takes the consumer's `id`, as every button
  does.
- **`disabled`** on the Root disables the Trigger natively; the Panel keeps
  its state.
- **`data-*` attributes**: `data-open`/`data-closed` and `data-disabled` on
  every part (PLAN.md section 8).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part against the
part conventions. "A" marks a case the WAI-ARIA disclosure pattern
requires.

`root/CollapsibleRoot.test.tsx`

- Closed by default: the Trigger has `aria-expanded="false"` and the Panel is hidden (A: `aria-expanded`)
- `defaultOpen` starts open: `aria-expanded="true"` and the Panel shown (A: `aria-expanded`)
- Uncontrolled: a click opens and closes the Panel, and `onOpenChange` gets each value
- Controlled open and closed: stays put and asks with the requested value
- Follows a controlled value changed from outside
- Opens before async work that `onOpenChange` starts settles (PLAN.md "API conventions")
- `disabled`: the Trigger is natively disabled, cannot be focused and does not toggle; follows changes while rendered
- `data-open`/`data-closed` and `data-disabled` on every part, and they follow changes

`trigger/CollapsibleTrigger.test.tsx`

- Renders a button with type `button` (A: role `button`)
- Named by its content; `aria-label` passes through
- `id` goes on the button
- `aria-controls` names the Panel's `id` (A: optional `aria-controls`)
- Focuses with Tab, toggles with Enter and with Space, and keeps focus (A: keyboard)
- Does not submit its form, by click or by Enter
- Calls the consumer's `onClick` once per click
- `render` with a button component keeps the Trigger's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Collapsible.Root`

`panel/CollapsiblePanel.test.tsx`

- Has the `hidden` attribute when closed and none when open, and its content stays in the document (A: content hidden or visible)
- Two collapsibles get different ids
- `render` keeps the generated `id` and `hidden`
- Throws a descriptive error outside `Collapsible.Root`

`test/collapsible/Collapsible.hydrate.test.tsx`

- The server HTML has the Trigger with `aria-expanded` and `aria-controls` naming the Panel's `id`, a closed Panel with `hidden`, and the `data-*` attributes, before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements and ids without warnings, and the Trigger toggles by click and by key afterwards

## Left out

| Case                                                                  | Reason                                                                                                                                                                                                                  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An `id` on the Panel                                                  | See "Shape": the Trigger renders first on the server, so it could not name the Panel's own `id`. A consumer who needs an anchor puts the `id` on an element inside the Panel                                            |
| Removing a closed Panel's content                                     | See "Shape": `aria-controls` would name nothing and the content would lose its state. A consumer wraps the content in `<Show>`                                                                                          |
| `hidden="until-found"`, which lets find-in-page open the Panel        | A flag, with a `beforematch` handler, that every app would ship (PLAN.md section 6, rule 6). Add it when asked for                                                                                                      |
| The Panel's measured height as a custom property, for animating it    | Measuring needs a resize observer in every app. CSS animates the Panel itself: `transition-behavior: allow-discrete` for `display`, and `interpolate-size: allow-keywords` for `height: auto` where browsers support it |
| `role="region"` on the Panel                                          | The disclosure pattern does not call for it, and a region needs a name. A consumer passes `role` and `aria-labelledby`, with the `id` they gave the Trigger                                                             |
| A disabled Trigger that stays focusable (`aria-disabled`)             | Native `disabled` is exposed as unavailable, as for Toggle. A consumer who needs it focusable passes `aria-disabled` and controls `open`                                                                                |
| Arrow keys, Home and End between the triggers of several collapsibles | Not in the accordion pattern as read on 2026-11-21, nor in the disclosure pattern; earlier versions of the accordion pattern listed them as optional                                                                    |
| Escape closing the Panel                                              | Not in the disclosure pattern. A disclosure used as a navigation menu adds it, as an app's own key handler                                                                                                              |
| `readOnly`                                                            | `aria-readonly` is not allowed on the button role; a consumer who needs a fixed collapsible controls `open`                                                                                                             |
| Keyboard modifiers in the change callback, and canceling a change     | `onOpenChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                                                                        |
