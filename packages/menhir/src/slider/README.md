# Slider

A value picked along a range by moving a thumb: the WAI-ARIA slider pattern
(#148). The user drags the thumb, presses the track, or steps it with the
keys; the form receives the number. It follows the form conventions Field
settled (`src/field/README.md`).

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Read       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                   | 2026-11-25 |
| [WAI-ARIA slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) (no date on the page): role `slider` on the focusable thumb, with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, `aria-valuetext` when the number is not friendly, a name, and `aria-orientation="vertical"` when vertical; Right and Up increase by one step, Left and Down decrease, Home and End set the first and last allowed value, Page Up and Page Down by a larger step (optional). No word on right to left | 2026-11-25 |
| [WAI-ARIA multi-thumb slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) (no date on the page): each thumb a `slider` in the tab order, a tab order that does not change as thumbs pass, and a thumb's `aria-valuemin` or `aria-valuemax` that follows the other's value. Read for Left out                                                                                                                                                                                    | 2026-11-25 |
| [ARIA in HTML](https://www.w3.org/TR/html-aria/) (Recommendation, 11 August 2026): `input type=range` has the role `slider`, "Authors SHOULD NOT use the aria-valuemax or aria-valuemin attributes on input type=range", and takes any other attribute of the `slider` role, such as `aria-valuetext` and `aria-orientation`                                                                                                                                                                             | 2026-11-25 |
| HTML standard, [the range state](<https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)>): the default value is the midpoint of `min` and `max`, and the value sanitization algorithm clamps a value to them and rounds it to the step grid from `min`, so a range input is never invalid                                                                                                                                                                                           | 2026-11-25 |
| Meter's `format` and `locale` (`src/meter/README.md`), Number Field's step grid, form reset and Field (`src/number-field/README.md`), and Field's (`src/field/README.md`)                                                                                                                                                                                                                                                                                                                                | 2026-11-25 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 2026-11-25 |

## The platform first

Checked on 2026-11-25, in the HTML standard and in Chromium, Firefox and
WebKit (Playwright's builds; "Browsers and screen readers" below).

| Feature of `<input type="range">` | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Role and value                    | `slider`, with `aria-valuenow`, `aria-valuemin` and `aria-valuemax` from its `value`, `min` and `max`, and a name from a `<label for>`                                                                                                                                                                                                                                                                                                                                                                                                             |
| Focus and `disabled`              | A tab stop, out of the tab order and the form while `disabled`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Keys                              | Arrows by `step`, Home and End. Page Up and Page Down by a tenth of the range in all three engines, which the page cannot set; Left and Right by the input's own `direction`, and a vertical input by its `writing-mode`                                                                                                                                                                                                                                                                                                                           |
| `FormData` and reset              | The number under `name`; a reset goes back to the `value` attribute, else the midpoint                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Validity                          | Never invalid: the value is clamped and rounded to the grid, so `required`, `rangeOverflow` and `stepMismatch` never apply                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Styling                           | Only through the engines' own pseudo-elements: `::-webkit-slider-runnable-track` and `::-webkit-slider-thumb` in Chromium and WebKit, `::-moz-range-track`, `::-moz-range-thumb` and `::-moz-range-progress` in Firefox, after `appearance: none`. No engine had the standard `::slider-thumb`, `::slider-track` or `::slider-fill` (`CSS.supports("selector(::slider-thumb)")` is false), and Chromium and WebKit have no part for the filled track. The input holds no children, so no element of the page's own can be its track, fill or thumb |
| Pointer                           | A press on the track jumps there and a drag follows, by the input's own box: its thumb runs from half the thumb's width in from each end, which the page must match in the engines' pseudo-elements                                                                                                                                                                                                                                                                                                                                                |

**So the thumb's control is a native `<input type="range">`, visually
hidden inside the Thumb's element, and the parts the user sees are the
page's own elements.** The input gives the role, the value attributes, the
name from a `<label for>`, focus, `disabled`, `FormData` and the reset, in
the server HTML before any script. What it cannot give is its look: the
track, the filled part and the thumb are `<div>`s the consumer styles with
`--slider`, and the pointer is Menhir's, measured against the Track. Not a
`role="slider"` element by hand, which would rewrite all that the input
gives, and need a hidden input for the form beside it. Not the input shown
and styled, which needs a stylesheet of vendor pseudo-elements the page must
keep in step with its own thumb, and no part of the page's own can sit in it.

The keys are Menhir's too, on the input (Decisions, "Keys"), which cancels
the input's own: the pattern lets the page choose the larger step of Page Up
and Page Down, which the input fixes at a tenth of the range; a vertical
input would need the page's `writing-mode` copied onto a hidden element;
and the input would fire its `change` on each key, where a held key should
commit once.

## Shape

```tsx
import { Slider } from "menhir/slider";

<Slider.Root defaultValue={1969} min={1900} max={2025} format={{ useGrouping: false }}>
  <Slider.Value />
  <Slider.Track>
    <div class="indicator" />
    <Slider.Thumb aria-label="Year" />
  </Slider.Track>
</Slider.Root>

<Field.Root name="volume">
  <Field.Label>Volume</Field.Label>
  <Field.Control render={(p) => <Slider.Root {...p} defaultValue={50} />}>
    <Slider.Track>
      <Slider.Thumb />
    </Slider.Track>
  </Field.Control>
</Field.Root>
```

```css
.track { position: relative; height: 4px; }
.indicator { position: absolute; inset-block: 0; inset-inline-start: 0; width: var(--slider); }
.thumb { position: absolute; inset-inline-start: calc(var(--slider) - 8px); width: 16px; }
.thumb:has(:focus-visible) { outline: 2px solid; }
```

- `Slider.Root` renders a `<div>` around the parts, which holds the value
  and sets `--slider` to its percentage of the range.
- `Slider.Track` renders a `<div>`, the area a press and a drag move the
  thumb in.
- `Slider.Thumb` renders a `<div>`, the thumb the user sees, with the
  visually hidden `<input type="range">` inside it.
- `Slider.Value` renders a `<span>` with the value as text.

### Decisions

- **Four parts: Root, Track, Thumb and Value.** The Root holds the value, as
  every component's Root does; the Track takes the pointer; the Thumb holds
  the input; the Value shows the formatted text, as a Meter's does. **No
  Indicator part**: the filled part of the track carries no state of its
  own, so it is a plain element sized with `--slider`, as a Meter's bar is
  (PLAN.md section 8, "A value along a range"). No Label, Description or
  error parts: they are Field's.
- **The value** is `value`, `defaultValue` and `onValueChange` on the Root:
  a number, never `null`, since a range input always has one. Without a
  `defaultValue` it starts at the midpoint of `min` and `max` on the step
  grid, as a range input does. `onValueChange` is called on each change
  while the thumb moves, with the new value only, as Number Field's is.
- **`onValueCommit`** is called with the value once the user has finished a
  change: when a drag ends (the pointer is released or canceled), when a key
  is released (a key held down repeats, and commits once) or focus leaves
  before the release, and on a form reset once taken, so a controlled
  slider that declines the reset commits nothing. Changes that overlap,
  such as a key pressed during a drag, commit once, when the last ends: the
  Root counts them. Not when the value is what it was when the first
  began, so a press on the thumb that moves nothing commits nothing. For
  work too costly to run on each step, such as a request.
- **A change the input makes itself is the user's**: assistive technology
  may set a range input's value and fire `input` and `change` without a
  key, as may the browser for a key with a modifier, which the slider
  leaves alone. The Thumb takes an `input` whose value is not the slider's
  as a change, and the `change` after it as the commit. The slider's own
  changes write the input's value before they fire `input`, so they are
  not taken twice.
- **The input's native events follow the two callbacks:** `input` on each
  change, `change` on each commit, as a range input fires them under a
  drag. So a form's listeners, a Field's touched state and a Form's error
  under its name follow the slider.
- **`min`, `max` and `step`** default to 0, 100 and 1, the range input's
  own, and go on the input, whose `value`, `min` and `max` give
  `aria-valuenow`, `aria-valuemin` and `aria-valuemax`: ARIA in HTML says
  not to write the last two on a range input. A value the user sets lands on
  the grid from `min`, as the input's sanitization does, and the last value
  is the grid's last at or under `max`, so `max={10} step={3}` ends at 9,
  which the input agrees with. A step is rounded to the decimals of `step`
  and `min`, so `0.1` steps have no floating-point error. A value from the
  app is shown as it is; the input clamps and rounds it, and submits that.
- **Keys, as the slider pattern says, on the input.** Right and Up increase
  by `step`, Left and Down decrease; Page Up and Page Down by `largeStep`,
  default ten steps, as Number Field's; Home sets `min` and End the last
  value. Right to left, Left and Right swap, as the track is drawn mirrored;
  Up and Down do not. A key with Ctrl, Alt or Meta held is the browser's
  (Alt+Left goes back). Each key is canceled, so the input does not move
  itself as well, nor the page scroll. From a value off the grid a step goes
  to the grid's next value that way, as Number Field's does.
- **The pointer is the Track's.** A primary press on the Track moves the
  thumb to it and focuses the input, so the keys go on from there, with
  `focus({ focusVisible: false })`, so no focus ring shows, as after a
  press on a native control: Chromium 159, Firefox 159 and WebKit 27.2 all
  match `:focus-visible` for a script's focus after a canceled press, and
  none does with the option (tried on 2026-11-25). The option is Newly available
  (2026-02-14 in `web-features` 3.47.0), not Widely, so it is an exception
  in PLAN.md section 5, accepted on 2026-11-25: a browser without it
  (Chrome before 145, Safari before 18.4, Firefox before 104) shows the ring after a press, and nothing else
  changes. A drag
  follows the pointer, captured, so it goes on outside the Track, until it
  is released or canceled. A press on the Thumb keeps the distance from the
  thumb's centre, so the thumb does not jump by a press off its centre. The
  Track cancels `pointerdown`, so the press selects no text, and has
  `touch-action: none`, so a touch drag moves the thumb and does not scroll
  or zoom the page. Vertical sliders run from the bottom up, and a
  right-to-left one from the right, read from the Track's `direction`. A
  second pointer while one drags is ignored.
- **`--slider`** on the Root is the value's percentage of the range, such
  as `25%`, which every element inside inherits, as `--progress` is a
  Progress's. The thumb and the filled part are placed with it, by the
  consumer's CSS, so a vertical or right-to-left slider needs no prop for
  its look; `inset-inline-start` mirrors by itself.
- **`orientation`**, `"horizontal"` by default, or `"vertical"`, which gives
  the input `aria-orientation="vertical"`, as the pattern says, and the
  pointer and keys their direction. `data-horizontal` or `data-vertical` on
  every part.
- **The value's text**: `format` takes `Intl.NumberFormat` options and
  `locale` the language, as Meter's do, but the default format is the
  value itself, not a percentage, since a slider's value is a quantity
  (`{ useGrouping: false }` for a year). `format` also takes a function,
  `(value) => text`, for text that is not a number, such as a month's
  name. The text is the input's `aria-valuetext`, always, and the Value's
  content.
- **The input is visually hidden inside the Thumb's element**, so focus
  styles go on the Thumb with `:has(:focus-visible)` (`:has()` is Widely
  available, PLAN.md section 5). Its style is the hidden inputs' own, so
  it can still take focus, which `display: none` would stop.
- **Names and descriptions go on the input:** a `<label for>` the Root's
  `id`, the Thumb's `aria-label` or `aria-labelledby`, and the Root's or
  the Thumb's `aria-describedby`. The Thumb takes no `id`.
- **It joins a Field as `Field.Control`'s `render`, with the Root as the
  Control**, as Number Field and Radio do, and not with the Thumb as the
  ticket first had it: the Field's `disabled` has to reach the Track, which
  takes the pointer, and its `name` the input. The Root hands the Field's
  `id`, `aria-describedby` and `aria-invalid` to the input, the labelable
  element (PLAN.md section 8, "`id` goes on the labelable element"), takes
  its `name` and `disabled`, and its `data-*` attributes stay on the Root's
  element. The Root reads no context of Field's. A Field never finds the
  input invalid, since a range input never is, so it shows only errors from
  outside, such as a Form's.
- **`disabled`** disables the input, which leaves the tab order and the
  form, and the Track ignores the pointer; `data-disabled` on every part.
- **A form reset** goes back to `defaultValue`, else the midpoint, through
  the setter, so a controlled slider asks, then puts the input back to the
  value, since the browser reset it to its `value` attribute. In a task, as
  Number Field and Input do; a reset the app cancels changes nothing.
- **`core/range.ts` is not shared.** `createRange` writes `role` and the
  `aria-value*` attributes, which a range input has natively and ARIA in
  HTML says not to write, and formats a percentage by default. What is left
  to share is the fraction of the range, one line, and widening the function
  for it would grow Progress and Meter for no gain.
- **The input and the Thumb's element are plain fields of the Root's
  context**, set from their refs and read only in event handlers, as Number
  Field's Input is. Not a slot: nothing renders from them.
- **A part used outside its Root throws** a descriptive error in
  development builds.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. "A" marks a case the WAI-ARIA slider pattern requires.
Pointer cases run in Chromium only (`it.skipIf(isJSDOM)`), since jsdom lays
nothing out.

`root/SliderRoot.test.tsx`

- Renders a `<div>` around its parts, with `--slider` the value's percentage of the range
- Uncontrolled: starts at `defaultValue`, else the midpoint of `min` and `max` on the grid, and calls `onValueChange` with each new value
- Controlled: shows `value`, follows the app's changes, asks with the requested value and stays put when declined
- Changes before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- `onValueCommit` is called once a key is released, with the value, and not for a key that changed nothing
- `id`, `aria-describedby` and `aria-invalid` go on the input, not the Root
- `disabled`: disables the input, with `data-disabled` on every part; follows changes
- `orientation`: `data-horizontal` by default, `data-vertical` and the input's `aria-orientation="vertical"` when vertical, on every part
- Form: submits the value under `name`, and to the form named by `form`
- Form: a user's change fires native `input` on the input, and `change` once committed, which the form sees with the new value
- Form: a controlled slider that declines a change puts the input back
- Form: a reset goes back to `defaultValue`, else the midpoint, and calls `onValueChange` and `onValueCommit`; at its default already, it calls nothing
- Form: a reset of a controlled slider asks for `defaultValue`; declined, the input keeps the value and nothing is committed; taken, it is committed
- Form: a reset the app cancels calls nothing

`thumb/SliderThumb.test.tsx`

- Renders a `<div>` with a visually hidden `<input type="range">` inside, before the consumer's children (A: role `slider`)
- The input's `value`, `min`, `max` and `step` are the Root's, defaults 0, 100 and 1, with no `aria-valuemin` or `aria-valuemax` written (A: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- `aria-valuetext` is the value in `format` and `locale`, the value itself by default, or the text a `format` function returns; follows changes (A: `aria-valuetext`)
- Named by a `<label for>` the Root's `id`, by the Thumb's `aria-label`, and by its `aria-labelledby` (A: label)
- The Thumb's `aria-describedby` goes on the input
- The consumer's `onKeyDown` runs
- A change the input makes itself, an `input` with a value of its own, changes the value, and its `change` commits it
- Throws a descriptive error outside `Slider.Root`

`Slider.keyboard.test.tsx`

- Right and Up increase by `step`, Left and Down decrease (A)
- Page Up and Page Down change by `largeStep`, ten steps by default (A: optional)
- Home sets `min` and End sets the last value on the grid at or under `max` (A)
- The keys clamp at `min` and `max`, and change nothing there
- Right to left, Left increases and Right decreases; Up and Down do not swap
- A step from an app's value off the grid lands on the grid that way
- A decimal `step` has no floating-point error (`0.1` steps)
- A key with Ctrl, Alt or Meta held changes nothing and is not canceled; every handled key is canceled
- A disabled slider ignores the keys, since its input cannot be focused
- Holding a key commits once, when it is released; leaving the input before the release commits too

`track/SliderTrack.test.tsx`

- Renders a `<div>` with `touch-action: none`
- A press moves the thumb to the pointer, and focuses the input without `:focus-visible` (Chromium)
- A drag follows the pointer, outside the Track too, rounds to the grid and clamps at the ends, calls `onValueChange` on each change and `onValueCommit` once on release (Chromium)
- A key pressed and released during a drag commits nothing; the drag commits once when it ends (Chromium)
- A press on the Thumb off its centre does not move the value (Chromium)
- Vertical runs from the bottom up; right to left from the right (Chromium)
- A secondary button and a disabled slider move nothing (Chromium)
- A canceled pointer ends the drag and commits (Chromium)

`value/SliderValue.test.tsx`

- Renders a `<span>` with the value's text, which follows the value
- Throws a descriptive error outside `Slider.Root`

`Slider.field.test.tsx`, as a Field's Control

- Labelled by the Field's Label, described by its Description, and submits under the Field's `name`
- The Field's `disabled` disables the input and the Track
- A Form's error under the Field's `name` shows at once, and hides once the value changes

`test/slider/Slider.hydrate.test.tsx`

- The server HTML has the input with its value, `aria-valuetext` and label, `--slider` on the Root and the Value's text, before any script runs
- Hydration adopts the server's elements without warnings; a key changes the value, `--slider` and the form's data afterwards

Outside `src`:

- `test/bundle-size/fieldModules.test.ts`: `menhir/slider` bundles no module of `src/field`
- `test/bundle-size/floating.test.ts` covers `menhir/slider` with every simple component
- `test/bundle-size/comparison.ts`: Slider's row

## Left out

| Case                                                                             | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two thumbs, a range                                                              | The first use, and the app Phase 4 was set against, need one thumb. A range has a value of another type, an array, a thumb's bounds that follow the other's value (the multi-thumb pattern's `aria-valuemin` and `aria-valuemax`, which ARIA in HTML says not to write on a range input, so the bounds would need other means), which thumb a press on the Track moves, and a group with a label per thumb in a Field. That is another Root whose `onValueChange` takes an array, so this one's stays `(value: number) => void`, and a Thumb part that keeps two apart, which one thumb would not ship (PLAN.md section 6, rule 6). Add it when asked |
| An Indicator part                                                                | It would carry no state the Root does not; a plain element sized with `--slider` is the same, as a Meter's bar is (Decisions)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `readOnly`                                                                       | Not asked for, and a range input has no `readonly`; `disabled`, or a controlled value the app does not change, covers it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Marks or ticks along the track, a `<datalist>`                                   | Not asked for; they are elements the consumer places with the same arithmetic, `calc()` over the value's percentage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| A minimum distance between thumbs, inverted sliders, a slider without a thumb    | Come with a range, or not asked for                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| The wheel                                                                        | A wheel that changes a slider the page scrolls past is a surprise, as on Number Field                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `data-dragging` while a pointer drags                                            | Not asked for; a part that carries it costs a signal every slider would ship                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| The details argument of `onValueChange` (`reason`, `event`)                      | Not asked for; a second argument can be added later without breaking a consumer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| A press on the Track that animates the thumb to the pointer                      | The consumer's CSS, a `transition` on the thumb's inset                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Switching between controlled and uncontrolled                                    | Warned of by `createControllableSignal` in development, as for every control                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| A form the slider joins after it has settled, or a `form` attribute that changes | The `reset` listener goes on the input's form once it has settled, as Number Field's does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Touch exploration by a screen reader finding the 1-pixel input                   | Screen readers and touch are #179                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Browsers and screen readers

Tried on 2026-11-25 in Playwright's Chromium 159, Firefox 159 and WebKit
27.2, with real keyboard and mouse input on the docs page's example
(1900 to 2025, from 1969): each of the eight keys gave the same value in all
three, Left increased right to left, a press at a quarter of the track set
1931 and focused the input with no focus ring, a drag from the thumb to
three quarters, ending above the track, set 1994, nothing was selected, and
the keys then showed the ring. The test suite runs in Chromium, with real
pointer and touch input through the DevTools protocol, and in jsdom.

The same run checked a native range input: Page Up from 500 of 0 to 1000
went to 600 in all three; none supports `::slider-thumb` or `::slider-fill`;
Chromium and WebKit support `::-webkit-slider-thumb`, and Firefox
`::-moz-range-thumb` and `::-moz-range-progress`.

No screen reader has been tried yet, nor a touch screen: the slider's name,
its `aria-valuetext` as the keys and a drag change it, swipes in VoiceOver
on iOS and TalkBack, and touch exploration finding the visually hidden
input are #179.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25.

| App                   | Size    | Budget |
| --------------------- | ------- | ------ |
| `menhir/slider`       | 2,840 B | 2.9 kB |
| `menhir/meter`        | 1,060 B | 1.3 kB |
| `menhir/number-field` | 3,143 B | 3.3 kB |

Measured the same way, by part, before review; the keys made one lookup took
14 B off, and review's fixes (a count of the changes under way, the
input's own changes, a reset committed once taken) added 86 B:

| App                               | Size    |
| --------------------------------- | ------- |
| The Root alone                    | 1,507 B |
| The Root and the Thumb            | 2,298 B |
| The Root, Thumb and Track         | 2,653 B |
| Every part, without the namespace | 2,685 B |

Most of the Root is what every Menhir control has: `mergeElementProps` and
`renderElement` (Separator, 746 B) and `createControllableSignal`. Its own
code is the step grid, `--slider`, the commit and the form reset. The Thumb,
about 790 B, is the input's attributes and the keys; the Track, about 355 B,
the pointer; the Value, 32 B.
