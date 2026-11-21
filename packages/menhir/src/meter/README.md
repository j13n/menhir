# Meter

Shows a measurement within a known range, such as a battery's charge or the
storage a disk has used: the WAI-ARIA meter pattern.

## Sources

| Source                                                                                        | Read       |
| --------------------------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA Authoring Practices meter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/meter/) | 2026-11-21 |
| [WAI-ARIA 1.2 `meter` role](https://www.w3.org/TR/wai-aria-1.2/#meter)                        | 2026-11-21 |

The pattern defines no keyboard interaction ("Not applicable"): the user
cannot change a meter's value. The role requires `aria-valuenow`, which must
not fall outside `aria-valuemin` and `aria-valuemax`, and a name from the
author. The pattern says not to use a meter for progress, which is what
Progress is for, nor for a value with no meaningful maximum.

## Shape

`Meter.Root` renders a `<div role="meter">` with `aria-valuemin`,
`aria-valuemax`, `aria-valuenow` and `aria-valuetext`. `Meter.Value` is a
`<span>` with the value as text. Nothing needs script to show, so the server
HTML before hydration is complete.

- **A `<div>`, not a `<meter>`.** `<meter>` has the role natively, but
  browsers draw it with a bar of their own that only vendor pseudo-elements
  restyle, and it cannot hold a label, the value's text or any other element
  (its content is a fallback).
- **`value` is a number, always.** The role requires `aria-valuenow`, so a
  meter has no indeterminate state, unlike Progress.
- **`min` and `max`** default to 0 and 100, the role's implicit values, and
  are always written. A value outside them is clamped, so `aria-valuenow`
  stays in the range, as the role requires.
- **`aria-valuetext` is the value formatted with `Intl.NumberFormat`**, and
  `Meter.Value` shows the same text, as Progress does. By default it is the
  percentage of the range from `min` to `max`, such as "25%". `format` takes
  the formatter's options: with the `percent` style it formats that
  percentage too, and with any other style it formats the value itself, such
  as "120 GB" for `{ style: "unit", unit: "gigabyte" }`. `locale` picks the
  language, else the runtime's default; pass it when rendering on the
  server, so that the server and the browser format alike. A consumer's
  `aria-valuetext` replaces the part's own, for text no format gives, such
  as the pattern's "50% (6 hours) remaining", and `Meter.Value` then shows
  that text.
- **`--meter` on the Root** is the percentage of the range, such as `25%`, a
  CSS custom property its descendants inherit (PLAN.md section 8, "API
  conventions"). The part draws nothing: any element inside it takes its
  size from it, as `width: var(--meter)`, so a vertical or a right-to-left
  meter needs no prop.
- **No Indicator part, and no `data-*` state.** A meter's value has no
  states to name, so an indicator part would carry nothing a plain element
  does not: the consumer's `<div>` inside the Root, sized with `--meter`, is
  the indicator.
- **No name of its own.** The role requires one, from the author:
  `aria-label`, or `aria-labelledby` naming an element, which may be inside
  the Root.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. "A" marks a case the WAI-ARIA pattern or role requires.

`root/MeterRoot.test.tsx`

- Renders a `<div>` with role `meter` (A: role)
- `aria-valuemin="0"` and `aria-valuemax="100"` by default (A: implicit values)
- `min` and `max` set `aria-valuemin` and `aria-valuemax` (A: value range)
- `value` sets `aria-valuenow`, a decimal too (A: `aria-valuenow` required, a decimal)
- A value outside the range is clamped to it, in `aria-valuenow`, the text and `--meter` (A: `aria-valuenow` within the range)
- `aria-valuetext` is the percentage of the range by default
- `format` with the `percent` style formats the percentage with its options
- `format` with another style formats the value itself
- `locale` changes the language of the text
- The consumer's `aria-valuetext` replaces the part's own (A: `aria-valuetext` when a percentage is not friendly)
- `--meter` is the percentage of the range
- Follows `value`, `min` and `max` changing while rendered, in every attribute
- Named by `aria-label`, and by `aria-labelledby` naming an element inside it (A: labelling)
- Not focusable: Tab moves past it (A: no keyboard interaction)

`value/MeterValue.test.tsx`

- Renders a `<span>` inside the meter with the text of `aria-valuetext`, and follows it as the value changes
- Shows the value in the Root's format
- Shows the consumer's `aria-valuetext` in place of its own
- Throws a descriptive error outside `Meter.Root` (PLAN.md section 8)

`test/meter/Meter.hydrate.test.tsx`

- The server HTML has the role, the `aria-value*` attributes, `--meter` and the Value's text before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the meter follows `value` changing afterwards

## Left out

| Case                                                          | Reason                                                                                                                                                                                                            |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard behaviour                                            | The pattern says "Not applicable": a meter is read-only and not focusable                                                                                                                                         |
| `low`, `high` and `optimum`, as on `<meter>`                  | WAI-ARIA has no equivalent (the 1.2 role notes it may come in 1.3), so they would only style. The consumer has the value and sets a class from it, as `class={{ low: charge() < 20 }}`, with no bytes in the part |
| An indeterminate value                                        | The role requires `aria-valuenow`; a value that is unknown, or a task under way, is a Progress                                                                                                                    |
| An Indicator or a Track part                                  | Either would carry no state: a plain element inside the Root is the track or the indicator, and `--meter` reaches it                                                                                              |
| A Label part that links itself with a generated id            | Generated ids are decided with the first component whose parts link each other (PLAN.md section 8, "API conventions"). Until then, `aria-labelledby` with the consumer's own id, or `aria-label`, names the meter |
| A function that computes `aria-valuetext`                     | The consumer's `aria-valuetext`, computed in their own JSX, does the same with no extra prop                                                                                                                      |
| A development warning when the meter has no name              | The name can come from attributes the part does not see when it mounts, such as an `aria-labelledby` target rendered later, so the warning could be wrong; the docs say a name is required                        |
| A development warning when a meter shows progress             | The part cannot tell what the value measures; the docs point to Progress                                                                                                                                          |
| `min` not below `max`, or a value that is not a number        | The consumer's error, not checked, to keep the part small; the text and `--meter` are then meaningless                                                                                                            |
| Content inside the meter, which the role makes presentational | Assistive technologies, not the DOM, decide that children are not read, so a test cannot observe it                                                                                                               |
| Announcing each change                                        | The role is not a live region; assistive technologies read the value when they reach the meter                                                                                                                    |
