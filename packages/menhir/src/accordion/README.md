# Accordion

A stack of headings, each a button that shows and hides its own section of
content: the WAI-ARIA accordion pattern, such as the questions of an FAQ or
the steps of a long form. Each section is built as a Collapsible is.

## Sources

| Source                                                                            | Read       |
| --------------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) | 2026-11-21 |

## Shape

`Accordion.Root` renders a `<div>` that holds which sections are open.
`Accordion.Item` renders a `<div>` around one section: `Accordion.Header`, an
`<h3>` that holds only `Accordion.Trigger`, a native
`<button type="button">` with `aria-expanded` and `aria-controls`, and
`Accordion.Panel`, a `<div role="region">` named by its Trigger. The button
gives Enter and Space, focus, `disabled` and a name from its content without
code, before hydration too (PLAN.md section 8, "API conventions"). The
Trigger takes its props from `core/button.ts`, as Collapsible's does, since
components do not import each other (PLAN.md section 6, rule 4).

- **The value is an array** of the open items' values, in both modes, so
  that `value`, `defaultValue` and `onValueChange` have one type, as on
  Toggle Group. Nothing open is `[]`. By default one item at a time is open:
  opening another closes it, and its Trigger closes it again. With
  `multiple`, each item opens on its own.
- **An Item's `value`** identifies it in the Root's value. Without one, the
  Item uses a generated value, which is enough for an uncontrolled accordion
  that starts closed.
- **The Header is an `<h3>`.** The pattern asks for a heading level that
  fits the page, which only the page knows: a consumer renders another level
  with `render={(props) => <h2 {...props} />}`. The Header holds only the
  Trigger, as the pattern requires; other elements of a section's header go
  next to it, inside the Item.
- **A closed Panel is `hidden`**, not removed, as on Collapsible: its
  content stays in the document, so `aria-controls` always names an element,
  and keeps its state while closed.
- **The Panel is a region** named by its Trigger (`aria-labelledby`), the
  pattern's optional structure for screen-reader users. The pattern warns
  against it where many panels can be open at once, around six or more,
  which would add a landmark each: such an accordion removes it in the
  Panel's render function, which spreads the props and then sets `role` and
  `aria-labelledby` to `undefined`.
- **Ids.** The Item generates the Panel's `id` and the Trigger's, with
  Solid's `createUniqueId`, which the server render and hydration agree on.
  The Panel takes no `id` of its own, since the server renders the Trigger,
  which names it, first. The Trigger takes the consumer's `id`, as every
  button does, which the Panel, rendered after it, then names (PLAN.md
  section 8, "Generated ids belong to the root"). A Trigger with the
  consumer's `id` therefore goes before its Panel and is not rendered
  conditionally: a Panel created before it would name the generated `id`.
- **`disabled`** on the Root disables every Trigger natively, and on an Item
  its own Trigger; the Panels keep their state.
- **`data-*` attributes**: `data-disabled` on the Root;
  `data-open`/`data-closed` and `data-disabled` on every part of an Item
  (PLAN.md section 8).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part against the
part conventions. "A" marks a case the WAI-ARIA accordion pattern requires.

`root/AccordionRoot.test.tsx`

- Every section closed by default: each Trigger has `aria-expanded="false"` and each Panel is hidden (A: `aria-expanded`)
- `defaultValue` opens the items with those values (A: `aria-expanded`)
- Single by default: opening an item closes the one open before; its Trigger closes it again; `onValueChange` gets each value (A: Enter or Space, one panel open)
- `multiple`: items open and close on their own; `onValueChange` gets each value
- `multiple`: two clicks in one turn, before the flush, both count
- Controlled: stays put and asks with the requested value
- Follows a controlled value changed from outside
- Opens before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- An Item without a `value` opens and closes
- `disabled`: every Trigger is natively disabled and does not toggle, with `data-disabled` on every part, and they follow changes

`item/AccordionItem.test.tsx`

- `value` identifies the item in the Root's value
- `disabled`: its Trigger is natively disabled and does not toggle, while the other items still do; `data-disabled` on its parts only
- `data-open`/`data-closed` on the Item, Header, Trigger and Panel, and they follow changes
- Throws a descriptive error outside `Accordion.Root`

`header/AccordionHeader.test.tsx`

- Renders a heading of level 3 that holds the Trigger (A: heading with `aria-level`, button its only element)
- `render` with another heading changes its level (A: level fits the page)
- Throws a descriptive error outside `Accordion.Item`

`trigger/AccordionTrigger.test.tsx`

- Renders a button with type `button` (A: role `button`)
- Named by its content; `aria-label` passes through
- `aria-controls` names its Panel's `id` (A: `aria-controls`)
- Takes the consumer's `id`, which its Panel names
- Tab moves through every Trigger, and past a disabled one (A: Tab, Shift+Tab)
- Enter and Space toggle its Panel and keep focus (A: Enter or Space)
- Does not submit its form, by click or by Enter
- Calls the consumer's `onClick` once per click
- `render` with a button component keeps the Trigger's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Accordion.Item`

`panel/AccordionPanel.test.tsx`

- Is a region named by its Trigger (A: optional `region` and `aria-labelledby`)
- Has the `hidden` attribute when closed and none when open, and its content stays in the document (A: panel shown or hidden)
- Every item's Panel and Trigger get ids of their own
- `render` keeps the generated `id`, `hidden` and the region
- A render function can remove the region, for an accordion with many panels open at once (A: region proliferation)
- Throws a descriptive error outside `Accordion.Item`

`test/accordion/Accordion.hydrate.test.tsx`

- The server HTML has the headings, the Triggers with `aria-expanded` and `aria-controls` naming their Panels, the Panels named by their Triggers, closed Panels with `hidden`, and the `data-*` attributes, before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements and ids without warnings, and the Triggers open and close sections by click and by key afterwards

## Left out

| Case                                                                       | Reason                                                                                                                                                                                  |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow keys, Home and End between the Triggers                              | Not in the pattern as read on 2026-11-21, whose keyboard interaction is Enter, Space, Tab and Shift+Tab; earlier versions listed them as optional. Every Trigger is a tab stop          |
| An open section that cannot be closed, with `aria-disabled` on its Trigger | A flag every app would ship (PLAN.md section 6, rule 6). A consumer controls `value`, keeps the last section open in `onValueChange`, and passes `aria-disabled="true"` to that Trigger |
| A `level` prop on the Header                                               | `render` renders another heading, as for any part's element (PLAN.md "Polymorphism")                                                                                                    |
| `orientation`                                                              | With no arrow keys, an accordion laid out side by side differs only in CSS                                                                                                              |
| An `id` on the Panel                                                       | See "Shape": the Trigger renders first on the server, so it could not name the Panel's own `id`. A consumer who needs an anchor puts the `id` on an element inside the Panel            |
| Removing a closed Panel's content                                          | See "Shape": `aria-controls` would name nothing and the content would lose its state. A consumer wraps the content in `<Show>`                                                          |
| `hidden="until-found"`, which lets find-in-page open a Panel               | As on Collapsible: a flag with a `beforematch` handler that every app would ship. Add it when asked for                                                                                 |
| A Panel's measured height as a custom property, for animating it           | As on Collapsible: measuring needs a resize observer in every app. CSS animates the Panel itself                                                                                        |
| `open` and `onOpenChange` on an Item                                       | The Root holds which sections are open, in one value; an Item's state is read from its `data-open` attribute or from `value`                                                            |
| A disabled Trigger that stays focusable (`aria-disabled`)                  | Native `disabled` is exposed as unavailable, as for Collapsible. A consumer who needs it focusable passes `aria-disabled` and controls `value`                                          |
| A name and value submitted with a form                                     | The Triggers are not form controls                                                                                                                                                      |
| `readOnly`                                                                 | `aria-readonly` is not allowed on the button role; a consumer who needs a fixed accordion controls `value`                                                                              |
| Keyboard modifiers in the change callback, and canceling a change          | `onValueChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                                       |
