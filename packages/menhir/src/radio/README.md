# Radio

A group of radio buttons that holds one value: the user checks one option,
and checking another unchecks it. The WAI-ARIA radio group pattern.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                    | Read       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                    | 2026-11-24 |
| [WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) (no date on the page): a `radiogroup` with a visible label; Tab into the group focuses the checked radio, else the first; Space checks the focused radio; Right and Down move focus to the next radio and check it, Left and Up to the previous, wrapping | 2026-11-24 |
| [WAI-ARIA radio group example](https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio/) (updated 2026-01-20): one radio with `tabindex="0"`, the others `-1`; the keyboard table                                                                                                                                                   | 2026-11-24 |
| HTML standard, [the radio button state](<https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)>) and [constraint validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints); ARIA in HTML, the roles allowed on `fieldset`                                              | 2026-11-24 |
| Checkbox's decisions (`src/checkbox/README.md`), Checkbox Group's (`src/checkbox-group/README.md`), Field's (`src/field/README.md`) and the Fieldset recipe (`src/fieldset/README.md`)                                                                                                                                                    | 2026-11-24 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                                                                                   | 2026-11-24 |

## Shape

```tsx
<Radio.Root name="size" defaultValue="m">
  <legend>Size</legend>
  <label>
    <Radio.Item value="s">
      <Radio.Indicator />
    </Radio.Item>
    Small
  </label>
  <label>
    <Radio.Item value="m">
      <Radio.Indicator />
    </Radio.Item>
    Medium
  </label>
</Radio.Root>
```

- `Radio.Root` renders a `<fieldset role="radiogroup">`, named by the
  `<legend>` inside it, and holds the value.
- `Radio.Item` renders a `<button type="button" role="radio">`, then a
  visually hidden `<input type="radio">` for the form, as Checkbox does.
- `Radio.Indicator` renders a `<span>` with its Item's `data-*` attributes,
  always present, so CSS shows the dot by state.

### Decisions

- **One entry point, `menhir/radio`, with three parts.** A radio means
  nothing outside its group: it cannot be unchecked by the user, so a
  single radio is a Checkbox. The group is the Root, as every component's
  state is held by its Root, and the radios are its Items, as in Toggle
  Group and Checkbox Group. The Indicator is a part, as Checkbox's is,
  since a styled radio draws its dot in an element of its own.
- **The value** is `value`, `defaultValue` and `onValueChange` on the
  Root, the checked Item's `value`, and `null` while none is checked
  (PLAN.md section 8, "Controlled state"). `onValueChange` gets a string
  from the user, who can only check a radio, and `null` from a form reset
  to no `defaultValue`. A value with no Item for it is kept, and checks
  none.
- **The element is a `<fieldset role="radiogroup">`**, named by a native
  `<legend>` inside it. The pattern asks for the `radiogroup` role, which
  ARIA in HTML allows on a `fieldset`, and the legend still names it, so
  the name is in the server HTML with no id to link (decided with the
  Fieldset recipe, #145). The fieldset's `disabled` disables every control
  in it, as for Checkbox Group. `render` makes it a `<div>`, named by
  `aria-labelledby`, for a group named by an element outside it.
- **One tab stop** (`core/rovingFocus.ts`): the checked radio if it is
  enabled, else the first enabled one, as the pattern says; not the radio
  that last had focus, as in Toggle Group, since Tab into the group goes
  to the checked one. The server HTML has it too: the checked radio claims
  it, or the first enabled one while the value is `null`.
- **Arrow keys move focus and check**, as the pattern says. Right and Down
  go to the next enabled radio, Left and Up to the previous, and both
  wrap; right to left, Left and Right are mirrored, as in Toggle Group and
  Tabs, while Up and Down are not. Disabled radios are skipped: they are
  disabled buttons, which cannot take focus, as native radios cannot.
  `core/rovingFocus.ts` reads one axis; the Root reads each key on its
  own, Up and Down as a vertical group's and Left and Right as a
  horizontal one's, so the core module did not change and Toggle Group
  and Tabs pay nothing. Home and End do nothing, as the pattern and native
  radios have none; with a modifier held, the keys are the browser's. A
  radio that focus reaches by Tab or a click is not checked by focusing
  it: only a key that moved it, or a click, checks it.
- **Space checks** the focused radio, through the button's click; Enter is
  canceled on key down, as on Checkbox, since the pattern names only
  Space (PLAN.md section 8, "Form controls are native buttons"). A click
  on the checked radio changes nothing, and calls no `onValueChange`.
- **What the form receives: one hidden `<input type="radio">` per Item,**
  under the group's `name`, with the Item's `value`, checked while its
  Item is. Each Item's button clicks its own input, as Checkbox's does, so
  the form sees a radio's native `input` and `change` events, and the
  browser's own radio group is the form's view: `FormData` has one entry
  for the checked radio and none while none is checked,
  `form.elements[name]` is a `RadioNodeList` whose `value` is the checked
  value, and `required` is the browser's own constraint. One input for the
  whole group was the other candidate: it would fire no `change` when the
  value moves from one checked radio to another, so it would have to
  dispatch its own events, and a form library that reads
  `form.elements[name].value` would see one input, not a radio group.
- **A declined change is put back.** A controlled group that does not take
  a change leaves its inputs as its value says: the browser checked the
  clicked radio's input and unchecked the checked one's, which no binding
  changed, so the Root checks its checked Item's input again after the
  flush, and the clicked one unchecks itself.
- **`required`** is on every hidden radio while none is checked, so the
  browser blocks a submission with its message for a missing selection
  ("Please select one of these options."), and focuses the first enabled
  radio's input, which hands focus to its button. Once one is checked the
  group is not missing, and the inputs are not `required`: by the HTML
  standard an unnamed, unchecked, `required` radio is missing on its own,
  as jsdom has it, though browsers do not. It follows the value, not the
  inputs' checkedness, which a form reset changes behind the bindings'
  back. The Root has `aria-required`, which the `radiogroup` role takes,
  and `data-required`; an Item has neither, since the group is required,
  not a radio, as for Checkbox Group. Browsers find a radio missing only
  when it has a name (Checkbox Group's README), so while none is checked,
  a group with no `name` gives its inputs one from `createUniqueId`;
  unchecked, they submit nothing, and once one is checked they have no
  name again, so a group with no `name` never submits.
  It counts the value: a value with no Item for it satisfies it, though no
  radio is checked and the form submits nothing for it, as Checkbox
  Group's `required` counts its list, not the form's data.
- **`disabled`** on the Root disables the fieldset, and every Item through
  the group's context, so each radio and its Indicator get
  `data-disabled`; the Root has `data-disabled` too. On an Item, that
  radio alone; a disabled radio that is checked keeps the value, and the
  form does not submit it.
- **A form reset** sets the value back to `defaultValue` once, through the
  setter, so a controlled group asks once: every Item's input asks the
  group, and a set equal to the last one in the turn does nothing
  (`createControllableSignal`). Each Item then puts its input back to its
  own state, which the browser reset to its `checked` attribute.
- **The group's error is a Field's**, with the group as its Control
  (`<Field.Control render={Radio.Root}>`), as for Checkbox Group: the
  fieldset gets the Field's `id`, `aria-describedby`, `aria-invalid`,
  `data-*`, and the `name` and `disabled` it passes to its radios. Field
  reads the hidden radios' `valueMissing`, since they are inside its Root.
  The browser's message names no group, so the docs give the Error
  `match="valueMissing"` and the app's words.
- **The hidden input is shared with Switch and Checkbox** in
  `core/hiddenInput.tsx` (the Checkbox README said it would move once
  Radio showed its shape): the visually hidden input with its name, value,
  form, `required` and `disabled`, the click that bubbles no further and
  that `readOnly` cancels, the change that asks for the state, focus
  handed to the button, and a form reset that asks for the default through
  the setter and puts the input back. It returns the input, which the
  button clicks. It is a function with positional parameters: as a
  component, its props compiled to getters and cost Switch and Checkbox
  about 110 B each; with an options object, about 55 B; positional, 30 B.
  An app with Radio and Checkbox pays for it once. Sizes before and after
  are under Size.
- **Menu's `RadioGroup` and `RadioItem` stay Menu's.** They share
  `core/createControllableSignal.ts` and nothing else: a menu's radio item
  is a `menuitemradio` in a popup, checked by activating it, which closes
  the menu, with focus moved by list navigation in `floating`, and it has
  no hidden input, since a menu is not a form control. Sharing a part
  would make Radio import a popup's layer, or Menu a simple component.
- **A part used outside its Root or Item throws** a descriptive error in
  development builds.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the Root, the Item and
the Indicator against the part conventions. "A" marks a case the WAI-ARIA
pattern requires.

`root/RadioRoot.test.tsx`

- Renders a `<fieldset>` with role `radiogroup`, named by its `<legend>` (A)
- `render` renders it as a `<div role="radiogroup">` named by `aria-labelledby` (A)
- Uncontrolled: starts at `defaultValue`, none checked without one, and calls `onValueChange` with each new value
- Controlled: stays put, asks with the requested value, the hidden inputs stay as the value says, and follows a `value` changed from outside; `null` checks none
- Checks before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- Keeps a value with no Item for it, and checks none
- Form: submits the checked radio's value under the group's `name`, and nothing while none is checked
- Form: `form.elements[name]` is a radio group whose `value` is the checked value
- Form: submits to the form named by `form`
- Form: a form reset goes back to `defaultValue`, and the hidden inputs with it; when controlled, it asks once
- Form: the form's `change` listener and `FormData` see the new value
- `disabled`: disables the fieldset, every radio and its hidden input, with `data-disabled` on the Root, each radio and its Indicator; no radio changes; the form submits nothing; follows changes while rendered
- `required`: `aria-required` and `data-required` on the Root, `required` on every hidden radio while none is checked, and neither on an Item; absent when not set
- `required`: blocks a submission while none is checked; one checked lets it submit
- `required`: blocks a submission with no `name` on the group, which then submits nothing once checked
- `required`: the browser's message is its message for a missing selection; Chromium only, since jsdom has no messages
- `required`: a form reset to no `defaultValue` blocks again
- `required` and `disabled`: never blocks a submission
- `required`: when the browser blocks the submission, focus moves to the first enabled radio; Chromium only, since jsdom does not focus the invalid control

`item/RadioItem.test.tsx`

- Renders a button with role `radio` and type `button`, inside the group (A)
- `aria-checked` is `"true"` on the checked radio and `"false"` on the others (A)
- The hidden input is a radio, hidden from assistive technology and the tab order, with the group's `name`, the Item's `value` and the group's `form`, checked while its Item is
- `id` goes on the button; the consumer's attributes override the part's own
- A wrapping `<label>` names the radio and checks it (A: label)
- A `<label for>` names the radio and checks it (A: label)
- A click checks it and unchecks the one checked before (A)
- A click on the checked radio changes nothing and calls no `onValueChange`
- Space checks the focused radio (A)
- Enter does not check it; the consumer's `onKeyDown` still runs
- Fires native `input` and `change` events that reach the form
- One user click reaches ancestors once; calls the consumer's `onClick`
- `disabled` on one Item: that radio alone is disabled, not focusable, and keeps the value when it is checked; the form submits nothing for it
- `data-checked` and `data-unchecked`, one at a time, and `data-disabled`, on the radio and its Indicator, and they follow changes
- `render` with a button component keeps the radio's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- The consumer's `class` and `ref` reach the button
- Throws a descriptive error outside `Radio.Root`

`indicator/RadioIndicator.test.tsx`

- Renders a `<span>` inside the radio, carrying its Item's `data-*` attributes
- Throws a descriptive error outside `Radio.Item`

`Radio.keyboard.test.tsx`

- One tab stop: the checked radio has `tabindex="0"` and the others `-1` (A)
- With none checked, the first radio has the tab stop (A)
- With the checked radio disabled, or none checked and the first disabled, the first enabled radio has it
- Tab moves focus into the group onto the checked radio, and Tab again out of it (A)
- Shift+Tab from after the group moves focus onto the checked radio (A)
- Focusing a radio by Tab does not check it
- Right and Down move focus to the next radio and check it (A)
- Left and Up move focus to the previous radio and check it (A)
- From the last radio, Right and Down wrap to the first; from the first, Left and Up wrap to the last (A)
- Disabled radios are skipped
- Right to left: Left moves to the next radio and Right to the previous; Up and Down are not mirrored
- Home and End do nothing; an arrow key with a modifier does nothing
- The tab stop follows the checked radio as the arrow keys move it (A)
- Controlled: an arrow key moves focus and asks; declined, the radio checked before keeps the value and its input stays checked
- The order is the document's, for a radio added after the others between two of them

`Radio.field.test.tsx`, as a Field's Control

- Described by the Field's Description; the radios submit under the Field's `name`
- `required` and none checked: no error before it is touched
- A submission while none is checked is blocked, and the browser's message shows as its error, with `aria-invalid` and `data-invalid` on the fieldset and the error in its accessible description
- The app's message shows instead (`match="valueMissing"`); checking a radio hides it
- Focus leaving the group with none checked shows its error; moving between its radios does not
- The Field's `disabled` disables the group and every radio
- A Form's error under the Field's `name` shows at once, and hides once a radio is checked
- A reset hides the error and goes back to `defaultValue`

`test/radio/Radio.hydrate.test.tsx`

- The server HTML has the `radiogroup` named by its legend, each radio's `aria-checked`, the tab stop on the checked radio, the hidden inputs with the group's `name` and the checked one checked, before any script runs (PLAN.md section 10)
- With none checked, the server HTML gives the first enabled radio the tab stop
- Hydration adopts the server's elements without warnings; a click and an arrow key change the value afterwards, and the form's data with it

`core/hiddenInput.tsx` has no suite of its own: Switch's and Checkbox's
suites, unchanged since it moved there, and Radio's above cover it through
each control.

Outside `src`:

- `test/bundle-size/fieldModules.test.ts`: `menhir/radio` bundles no module of `src/field`
- `test/bundle-size/floating.test.ts` covers `menhir/radio` with every simple component
- `test/bundle-size/comparison.ts`: Radio's row; Base UI's Radio is two modules, `radio-group` and `radio`, measured together

## Left out

| Case                                                                                         | Reason                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radios in a toolbar, where arrow keys move focus without checking                            | The pattern's second keyboard model, for radios styled as toggle buttons: a Toggle Group in a `toolbar` is that, and a Toolbar (#150) would decide how a group inside it takes the keys                                                       |
| Enter checking a radio                                                                       | Only the toolbar model names it, as optional                                                                                                                                                                                                  |
| Home and End                                                                                 | Neither the pattern nor native radios have them (Decisions)                                                                                                                                                                                   |
| Shift+Tab into a group with none checked focusing the last radio                             | The pattern notes some browsers do this with native radios, and asks for the first                                                                                                                                                            |
| `orientation` and `aria-orientation`                                                         | Every arrow key works whatever the layout, as the pattern says, so the group needs no orientation                                                                                                                                             |
| The tab stop in the server HTML when the checked radio is disabled, or the value has no Item | The server renders each radio before it knows the others; the first enabled radio gets the tab stop once the radios are mounted                                                                                                               |
| `readOnly` on the group                                                                      | The ticket names none, and native radios have none                                                                                                                                                                                            |
| A radio unchecked by a click, or by Ctrl+Space                                               | A radio cannot be unchecked by the user; a choice that can be none is a Toggle Group, or a "None" radio                                                                                                                                       |
| `aria-required` and `data-required` on each radio                                            | The `radio` role takes no `aria-required`, and the group is required, not a radio (Decisions)                                                                                                                                                 |
| `aria-posinset` and `aria-setsize`                                                           | Browsers count the radios of a `radiogroup` themselves                                                                                                                                                                                        |
| `Field.Label` as the group's name                                                            | A `<label for>` cannot name a fieldset; the legend does, as for Checkbox Group                                                                                                                                                                |
| Label, Description and ErrorMessage parts                                                    | Field's: the group joins a Field as its Control (Decisions)                                                                                                                                                                                   |
| Keyboard modifiers in the change callback, and canceling a change                            | `onValueChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                                                                                             |
| A form reset by a real press of a reset button                                               | The same timing as Checkbox's own, tracked in #165: a reset dispatched from script, as the tests do, is followed; a real press runs microtasks before the browser resets the controls, which #165 fixes for every control with a hidden input |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite).
Not yet tried in Firefox or WebKit, and no screen reader has been tried
yet: the group's name from its legend on a `radiogroup`, "1 of 3", the
checked state as the arrow keys move it, and the error in the group's
description are still to be heard in VoiceOver, NVDA and JAWS.

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-24.

| App                   | Size    | Budget |
| --------------------- | ------- | ------ |
| `menhir/radio`        | 2,507 B | 2.6 kB |
| `menhir/toggle-group` | 1,902 B | 2.3 kB |

Radio is 605 B over Toggle Group, which has the same roving focus and
controllable value: the hidden input, the button's own props and the
Indicator.

The hidden input moved to `core` with Radio. Before and after, each entry
point alone:

| App                     | Before  | After   |
| ----------------------- | ------- | ------- |
| `menhir/switch`         | 1,623 B | 1,651 B |
| `menhir/checkbox`       | 1,677 B | 1,708 B |
| `menhir/checkbox-group` | 2,338 B | 2,391 B |

and imported together, with the input a copy in each of Switch and
Checkbox before (each set re-exported from one module, so the sizes differ
a little from the ones above):

| App                        | Before  | After   |
| -------------------------- | ------- | ------- |
| Switch and Checkbox        | 1,828 B | 1,832 B |
| Radio and Checkbox         | 2,991 B | 2,774 B |
| Radio, Checkbox and Switch | 3,120 B | 2,883 B |

Alone, Switch and Checkbox pay about 30 B for the function call and its
parameters, and gzip had already counted their two copies almost once, so
together they are 4 B larger. An app with Radio and Checkbox saves 217 B,
and one with all three 237 B: a third copy would not have compressed away,
since Radio's input is a radio with a group's `name`. A fix to the hidden
input, such as the reset timing of #165, is now made once.
