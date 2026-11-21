# Progress

Shows how far a task that takes a while has got: the `progressbar` role of
WAI-ARIA.

## Sources

| Source                                                                             | Read       |
| ---------------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA 1.2 `progressbar` role](https://www.w3.org/TR/wai-aria-1.2/#progressbar) | 2026-11-21 |

The WAI-ARIA Authoring Practices have no pattern for a progress bar; the
role's definition is the source. It defines no keyboard interaction: the
user cannot change a progress bar's value.

## Shape

`Progress.Root` renders a `<div role="progressbar">` with `aria-valuemin`,
`aria-valuemax`, `aria-valuenow` and `aria-valuetext`. `Progress.Indicator`
is a `<div>` to draw the filled part with, and `Progress.Value` a `<span>`
with the value as text. Both carry the Root's `data-*` attributes. Nothing
needs script to show, so the server HTML before hydration is complete.

- **A `<div>`, not a `<progress>`.** `<progress>` has the role natively, but
  browsers draw it with a bar of their own that only vendor pseudo-elements
  restyle, it cannot hold an indicator or any other element (its content is
  a fallback), and it has no minimum.
- **`value` is a number, or `null` while indeterminate**, when how far the
  task has got is unknown. `aria-valuenow` is then absent, as the role asks,
  and so are `aria-valuetext` and `--progress`.
- **`min` and `max`** default to 0 and 100, the role's implicit values, and
  are always written. A value outside them is clamped, so `aria-valuenow`
  stays in the range.
- **`aria-valuetext` is the value formatted with `Intl.NumberFormat`**, and
  `Progress.Value` shows the same text. By default it is the percentage of
  the range from `min` to `max`, such as "25%". `format` takes the
  formatter's options: with the `percent` style it formats that percentage
  too, and with any other style it formats the value itself, such as
  "42 MB" for `{ style: "unit", unit: "megabyte" }`. `locale` picks the
  language, else the runtime's default; pass it when rendering on the
  server, so that the server and the browser format alike. A consumer's
  `aria-valuetext` replaces the part's own, for text no format gives, such
  as "3 of 10 files", and `Progress.Value` then shows that text.
- **`--progress` on the Root** is the percentage of the range, such as
  `25%`, a CSS custom property its descendants inherit. The part draws
  nothing: an indicator takes its size from it, as `width: var(--progress)`,
  `scale: var(--progress) 1` or `inset-inline-end: calc(100% - var(--progress))`,
  so a vertical or a right-to-left bar needs no prop.
- **`data-indeterminate`, `data-progressing` or `data-complete`**: exactly
  one applies, following the `data-*` convention of PLAN.md section 8 for a
  state with several values. Complete is the value at `max`.
- **No name of its own.** The role requires one, from the author:
  `aria-label`, or `aria-labelledby` naming an element, which may be inside
  the Root.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. "A" marks a case the WAI-ARIA role requires.

`root/ProgressRoot.test.tsx`

- Renders a `<div>` with role `progressbar` (A: role)
- `aria-valuemin="0"` and `aria-valuemax="100"` by default (A: implicit values)
- `min` and `max` set `aria-valuemin` and `aria-valuemax` (A: value range)
- `value` sets `aria-valuenow` (A: value)
- A value outside the range is clamped to it, in `aria-valuenow` and the text
- `null` is indeterminate: no `aria-valuenow`, `aria-valuetext` or `--progress` (A: omit the value when indeterminate)
- `aria-valuetext` is the percentage of the range by default (A: text alternative of the value)
- `format` with the `percent` style formats the percentage with its options
- `format` with another style formats the value itself
- `locale` changes the language of the text
- The consumer's `aria-valuetext` replaces the part's own (A: text alternative)
- `data-indeterminate`, `data-progressing`, `data-complete`, exactly one of them
- `--progress` is the percentage of the range
- Follows `value` changing while rendered, to another value and to `null`, in every attribute
- Named by `aria-label`, and by `aria-labelledby` naming an element inside it (A: accessible name required)
- Not focusable: Tab moves past it (A: read-only)

`indicator/ProgressIndicator.test.tsx`

- Renders a `<div>` inside the progress bar
- Carries the Root's `data-*` attributes, and follows them as the value changes
- Throws a descriptive error outside `Progress.Root` (PLAN.md section 8)

`value/ProgressValue.test.tsx`

- Renders a `<span>` inside the progress bar with the text of `aria-valuetext`, and follows it as the value changes
- Shows the consumer's `aria-valuetext` in place of its own
- Empty while indeterminate
- Carries the Root's `data-*` attributes
- Throws a descriptive error outside `Progress.Root` (PLAN.md section 8)

`test/progress/Progress.hydrate.test.tsx`

- The server HTML has the role, the `aria-value*` attributes, the `data-*` attributes, `--progress` and the Value's text before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the progress bar follows `value` changing afterwards

## Left out

| Case                                                                                  | Reason                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard behaviour                                                                    | A progress bar is read-only and not focusable; the role defines no keyboard interaction                                                                                                                         |
| `aria-busy` and `aria-describedby` on the region whose loading the progress bar shows | The role asks for them on that region, which is the consumer's element, not a part. The docs show it                                                                                                            |
| A Label part that links itself with a generated id                                    | Generated ids are decided with the first component whose parts link each other (PLAN.md section 8, "API conventions"). Until then, `aria-labelledby` with the consumer's own id, or `aria-label`, names the bar |
| A Track part                                                                          | It would carry no state: the Root, or a plain element inside it, is the track, and `--progress` reaches the indicator through either                                                                            |
| A function that computes `aria-valuetext`                                             | The consumer's `aria-valuetext`, computed in their own JSX, does the same with no extra prop                                                                                                                    |
| A development warning when the bar has no name                                        | The name can come from attributes the part does not see when it mounts, such as an `aria-labelledby` target rendered later, so the warning could be wrong; the docs say a name is required                      |
| `min` not below `max`, or a value that is not a number                                | The consumer's error, not checked, to keep the part small; the text and `--progress` are then meaningless                                                                                                       |
| Content inside the progress bar, which the role makes presentational                  | Assistive technologies, not the DOM, decide that children are not read, so a test cannot observe it                                                                                                             |
| Announcing each change                                                                | The role is not a live region; assistive technologies read the value when they reach the bar                                                                                                                    |
