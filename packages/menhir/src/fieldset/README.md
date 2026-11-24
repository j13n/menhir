# Fieldset

A group of controls with one name. **Not a component: a recipe**, on Field's
docs page ("Fieldset"). A native `<fieldset>` and `<legend>` give the group
everything a part would, and a Field around the group gives it a
description, an error and a validity (Decisions). This folder holds the
decision and the tests that pin the recipe; it has no entry point, budget or
row on the size comparison.

## Sources

In order of precedence (PLAN.md section 8). No WAI-ARIA pattern covers a
fieldset; the `group` role is the element's own.

| Source                                                                                                                                                                                                                                                                             | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                             | 2026-11-24 |
| [WAI tutorial: Grouping Controls](https://www.w3.org/WAI/tutorials/forms/grouping/) (updated 2026-03-27): `<fieldset>` and `<legend>` for radio buttons, checkboxes and related fields; a short legend, read with each label                                                       | 2026-11-24 |
| HTML standard, [the fieldset element](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element) and [the legend element](https://html.spec.whatwg.org/multipage/form-elements.html#the-legend-element): `disabled`, the first legend's exception, `elements` | 2026-11-24 |
| HTML standard, [`:disabled`](https://html.spec.whatwg.org/multipage/semantics-other.html#selector-disabled): matches a disabled fieldset and every control it disables                                                                                                             | 2026-11-24 |
| [ARIA in HTML](https://www.w3.org/TR/html-aria/#el-fieldset): a `<fieldset>` is a `group`                                                                                                                                                                                          | 2026-11-24 |
| Field's conventions: PLAN.md section 8, "Fields", and `src/field/README.md` (#141)                                                                                                                                                                                                 | 2026-11-24 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                            | 2026-11-24 |

## The platform first

| Feature                                         | What it gives                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<fieldset>`                                    | The `group` role, in the server HTML                                                                                                                                                                                                                                                |
| `<legend>`, the fieldset's first child          | The group's name, in the server HTML                                                                                                                                                                                                                                                |
| `<fieldset disabled>`                           | Disables every form control inside it but those in its first legend: Menhir's buttons and hidden inputs, a Select's Trigger and its hidden input, an Input, a Combobox's input. A disabled control takes no focus and no press, is left out of the form's data and is never invalid |
| `:disabled`                                     | Matches the disabled fieldset and every control it disables, so CSS needs no `data-disabled`: `fieldset:disabled > legend`, `:disabled .thumb`, `.field:has(:disabled)`                                                                                                             |
| `aria-describedby` on the fieldset              | Describes the group: its instructions and its error                                                                                                                                                                                                                                 |
| `fieldset.elements`, `name`                     | The controls of the group, and its name in `form.elements`; the fieldset is not submitted and has no value                                                                                                                                                                          |
| Constraint validation on `<input type="radio">` | `required` on the radios of one `name` makes the group invalid until one is chosen; the browser validates no fieldset                                                                                                                                                               |

## Shape

The group of options validated together, as one Field whose Control is the
fieldset:

```tsx
<Field.Root name="delivery">
  <Field.Control render={(props) => <fieldset {...props} />}>
    <legend>Delivery</legend>
    <Field.Description>We ship within two days.</Field.Description>
    <label>
      <input type="radio" name="delivery" value="standard" required />
      Standard
    </label>
    <label>
      <input type="radio" name="delivery" value="express" />
      Express
    </label>
    <Field.Error />
  </Field.Control>
</Field.Root>
```

A group of Fields, such as an address, is a plain `<fieldset>` around them,
with no Field of its own: each Field keeps its label and its error, and the
legend names the group.

### Decisions

- **Not a component.** The ticket asked what a part would add over
  `<fieldset>` and `<legend>`; nothing that costs no bytes elsewhere:
  - **The group's role and name** are the elements', in the server HTML,
    and a part would only render them.
  - **`disabled` reaches every control** inside the fieldset, Menhir's
    included, since they are native buttons with hidden inputs (PLAN.md,
    "Form controls are native buttons"): no press, no focus, no form data,
    no validity. Tested for each kind of control below.
  - **`data-disabled` on its parts** would duplicate `:disabled`, which
    matches the fieldset and every control it disables. Putting
    `data-disabled` on the parts of the controls inside, such as a Switch's
    Thumb, would need every control to read a context of the fieldset's,
    which Field rejected for its own context: it costs every control the
    read, in or out of a fieldset (`src/field/README.md`, "No control reads
    Field's context"). `:disabled .thumb` reaches the Thumb.
  - **An error for the group** is Field's: Field already reads the validity
    of every control inside its Root, tracks touched for the whole Root,
    takes errors from outside and from the Form around it by `name`, and
    names its Description and Error in the Control's `aria-describedby`. A
    Fieldset part with an error would repeat Field's Root, the most of its
    1,799 B, under `core`-only imports, or move it into `core`.
- **The group is the Field's Control** (the Shape above), as any control
  joins a Field through `Field.Control`'s `render` (PLAN.md, "Fields"). The
  fieldset then gets what a control gets, and each fits a group:
  - `aria-describedby` names the Description and, while it shows, the
    Error, so a screen reader reads both as the group's description when
    focus enters the group;
  - `disabled` from `Field.Root` disables the fieldset, and so every
    control inside it, and every part of the Field gets `data-disabled`;
  - `aria-invalid="true"` while the error shows (a global attribute in
    WAI-ARIA 1.2), and the Field's `data-invalid` and `data-touched`;
  - `name` is the fieldset's name in `form.elements`, and the key under
    which a Form hands the group its error;
  - the `id` names nothing, and is harmless.
- **The legend is a native `<legend>`, not `Field.Label`.** A `<label for>`
  names a labelable element, which a fieldset is not; the legend, as the
  fieldset's first child, names the group. `Field.Label` is left out of the
  recipe.
- **Where the group's error goes:** inside the fieldset, after its options,
  as `Field.Error`, and the Description after the legend. Both are named by
  the fieldset's `aria-describedby`, so their place in the page is the
  consumer's.
- **When it shows** is Field's rule: once the group is touched, by focus
  leaving the fieldset (not moving between its options), a `change` from any
  option, or a submission attempt; at once for an error a Form hands it.
- **Which control is invalid:** the first `input`, `select` or `textarea`
  in the group that the browser finds invalid, as for any Field. For radios
  with `required`, every radio of the name is invalid until one is chosen.
  A rule the browser has no constraint for, such as "at least one" of a set
  of checkboxes, is an error from outside: a memo the app passes as the
  Field's `error`.
- **Checkbox Group (#146) and Radio (#147) render their own root**, not a
  Fieldset part, since there is none. Each joins a Field as its Control, as
  the fieldset does here, so its root gets the group's description, error
  and `disabled` the same way. Whether that root is a `<fieldset>` by
  default, a `<div role="group">`, or a `role="radiogroup"`, is theirs to
  decide against their WAI-ARIA pattern; through `render` it can be the
  fieldset of this recipe.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). No WAI-ARIA pattern applies, so no case is marked "A".

`Fieldset.test.tsx`

The group's name and description:

- A `<fieldset>` is a `group` named by its `<legend>`
- Rendered as `Field.Control`, the group is described by the Field's Description
- The fieldset gets the Field's `name`, and is not in the form's data

`disabled` reaching each kind of control:

- A disabled fieldset disables a native `<input>`, `<textarea>`, `<select>` and `<button>`, a `Field.Control`, a Switch's button and hidden input, a Checkbox's, a Select's Trigger and hidden input, an Input and a Combobox's input: each matches `:disabled`
- A control in the fieldset's first `<legend>` stays enabled
- The controls of a disabled fieldset are left out of the form's data
- A press on a Switch, a Checkbox or a Select's Trigger in a disabled fieldset changes nothing and opens nothing; Chromium only, for the browser's own dispatch of a press, which jsdom leaves to Testing Library's simulation
- Tab skips every control of a disabled fieldset; Chromium only, for focus
- `disabled` on `Field.Root` disables the fieldset and the controls in it, and puts `data-disabled` on the Field's parts (the Root, the fieldset, the Description); turning it off enables them again

The group's error:

- A required radio group shows no error before it is touched
- Focus moving between the group's options does not touch it; focus leaving the group does: `aria-invalid="true"` and `data-invalid` on the fieldset, and the Error in its accessible description after the Description
- Choosing an option then hides the error (the end of the case above)
- A set of checkboxes with an "at least one" error from outside (`error`) shows it once a change touched the group, and hides it once one is checked
- A Form's error under the group's `name` shows at once, and hides on the next change of an option
- A submission blocked by the required group focuses its first radio, whose group has the error in its description; Chromium only, since jsdom focuses nothing
- A disabled group is never invalid

`test/fieldset/Fieldset.hydrate.test.tsx`

- The server HTML has the group named by its legend and described by the Description, with no Error and no `aria-invalid`
- Hydration adopts the server's elements without warnings; leaving the group without choosing shows its error

## Left out

| Case                                                                                                         | Reason                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `menhir/fieldset` entry point, its name in both READMEs, a size budget and a row on the size comparison    | Not a component (Decisions): the READMEs list what `exports` has (`test/workspace/readme.test.ts`); the recipe costs Field's size, and a fieldset without an error costs nothing |
| A changeset with a line of release notes                                                                     | Nothing that ships changes: the package publishes `dist` and `skills`, and only this README and tests are added under `src`, so the changeset is empty (AGENTS.md, "Changesets") |
| `data-disabled` on the fieldset, its legend, or the parts of the controls inside a disabled fieldset         | `:disabled` matches the fieldset and each control it disables; a context read by every control would cost each of them (Decisions)                                               |
| `data-disabled` on the parts of a Field inside a disabled fieldset                                           | The Field's own `disabled` is its prop; its control matches `:disabled`, and `.field:has(:disabled)` reaches its other parts                                                     |
| A Field around a group of Fields, such as an address                                                         | The outer Field would read the first invalid control of every inner Field as its own; a group of Fields is a plain `<fieldset>`, each Field with its own error (Shape)           |
| `Field.Label` as the legend                                                                                  | A `<label for>` cannot name a fieldset; the legend must be the fieldset's first child to name it (Decisions)                                                                     |
| `aria-errormessage` on the fieldset                                                                          | As on Field: read while valid in several screen readers; `aria-describedby` names the Error only while it is rendered                                                            |
| `role="radiogroup"` on the fieldset                                                                          | Native radios in a fieldset are a group by the WAI tutorial; a `radiogroup` with Menhir's radio buttons is Radio's (#147)                                                        |
| A control associated with the form by its `form` attribute, outside the fieldset; `fieldset.elements` itself | The browser's: `disabled` reaches only the fieldset's descendants, as the standard says, and Field reads only the controls inside its Root                                       |
| Nested fieldsets                                                                                             | The browser's: a fieldset inside a disabled one is disabled, except in the first legend, which the first-legend case covers                                                      |
| A legend hidden from sight, or a group named by `aria-label`                                                 | The consumer's: a visually hidden legend still names the group; `aria-label` on the fieldset works through `Field.Control` as any attribute does                                 |

## Browsers and screen readers

Tried in Chromium (Playwright's headless build, through the test suite),
where Testing Library's accessible name of the group is its legend and its
accessible description has the Description and, while it shows, the Error.
No screen reader has been tried yet: the group's name, description and
error, read as focus enters the group, are still to be heard in VoiceOver,
NVDA and JAWS, and whether a Description inside the fieldset, which is also
its description, is read twice. Firefox and WebKit have not been tried.

## Size

No code of its own. The group with an error is Field's 1,799 B
(`src/field/README.md`, "Size"), and a fieldset without one costs nothing.
