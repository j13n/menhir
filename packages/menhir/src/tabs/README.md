# Tabs

Layered sections of content, one shown at a time, each chosen by its tab in
a list above or beside it: the WAI-ARIA tabs pattern.

## Sources

| Source                                                                                                                                                               | Read       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)                                                                                              | 2026-11-21 |
| [WAI-ARIA keyboard interface practice](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), for selection following focus and for focusable disabled tabs | 2026-11-21 |

## Shape

`Tabs.Root` renders a `<div>` that holds which tab is selected.
`Tabs.List` renders a `<div role="tablist">` around the `Tabs.Tab`s, each a
native `<button type="button" role="tab">` with a `value`. `Tabs.Panel`
renders a `<div role="tabpanel">` with the `value` of its tab. The button
gives Enter and Space, focus and a name from its content without code,
before hydration too (PLAN.md section 8, "API conventions").

- **The value is the selected tab's `value`**: `value`, `defaultValue` and
  `onValueChange` take a string. An empty controlled value is `null`, which
  selects no tab.
- **The first enabled tab is selected** when neither `value` nor
  `defaultValue` is passed, as the pattern has one panel shown when the tabs
  load. The server HTML selects it too.
- **Automatic activation by default**: a tab is selected when it receives
  focus, so arrow keys show each panel in turn, which the pattern
  recommends when panels show without delay. `activation="manual"` selects
  a tab only by click, Enter or Space, for panels that load their content.
- **One tab stop** (roving tabindex, PLAN.md section 8): the selected tab
  has `tabindex="0"`, so Tab into the list focuses it, as the pattern says,
  and the others `-1`. With no tab selected, it is the first tab. While a
  tab has focus, it has the tab stop instead, so Tab from it moves on to the
  panel even when it is not the selected tab, as with manual activation. The roving focus is
  `core/rovingFocus.ts`, shared with Toggle Group.
- **Arrow keys move focus and wrap**: Left and Right in a horizontal list,
  Up and Down in a vertical one, and Home and End to the first and last
  tab. In a right-to-left horizontal list, Left moves to the next tab. With
  Alt, Control, Meta or Shift held, the keys are left to the browser and the
  app, as on Toggle Group.
- **A disabled tab stays focusable**, with `aria-disabled="true"`, not
  native `disabled`: the keyboard interface practice names tabs among the
  elements a user should still find. Arrow keys stop on it, but neither
  focus nor a click selects it.
- **The panel is a tab stop** (`tabindex="0"`), as the pattern asks when
  its first content is not focusable. A panel that starts with a focusable
  element passes `tabindex={undefined}`.
- **A panel that is not selected is `hidden`**, not removed, as on
  Accordion: `aria-controls` always names an element, and its content keeps
  its state.
- **Ids.** The Root generates one id with Solid's `createUniqueId`, and each
  tab's and panel's id is that id with the `value` added, so a `value` must
  not contain spaces. The panel takes no `id` of its own, since its tab,
  rendered first on the server, names it. A tab takes the consumer's `id`,
  as every button does, and hands it to its panel through the Root's
  context (PLAN.md section 8, "Generated ids belong to the root"), so a tab
  with the consumer's `id` is rendered before its panel.
- **`orientation`** on the Root: `aria-orientation="vertical"` on a
  vertical list, which is horizontal by default, and
  `data-horizontal`/`data-vertical` on the Root and the List.
- **`data-*` attributes**: `data-selected`/`data-unselected` on each tab
  and panel, and `data-disabled` on a disabled tab (PLAN.md section 8).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part against the
part conventions. "A" marks a case the WAI-ARIA tabs pattern requires.

`root/TabsRoot.test.tsx`

- Selects the first enabled tab and shows its panel when nothing is passed (A: one panel shown on load)
- `defaultValue` selects that tab and shows its panel
- Clicking a tab selects it, shows its panel and hides the one before; `onValueChange` gets each value (A: activating a tab)
- Selecting the tab selected by default again reports nothing
- Controlled: stays put and asks with the requested value
- Follows a controlled value changed from outside
- A controlled `null` selects no tab and shows no panel
- Selects before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- `data-horizontal` by default, `data-vertical` with `orientation="vertical"`, and they follow changes

`list/TabsList.test.tsx`

- Renders a `<div>` with role `tablist` (A: `tablist`)
- `aria-label` and `aria-labelledby` pass through (A: label)
- No `aria-orientation` when horizontal; `aria-orientation="vertical"` when vertical (A: `aria-orientation`)
- `data-horizontal`/`data-vertical`
- Throws a descriptive error outside `Tabs.Root`

`tab/TabsTab.test.tsx`

- Renders a button with type `button` and role `tab`, inside the tablist (A: `tab`)
- Named by its content; `aria-label` passes through
- `aria-selected` is `"true"` on the selected tab and `"false"` on the others (A: `aria-selected`)
- `aria-controls` names its panel's `id` (A: `aria-controls`)
- Takes the consumer's `id`, which its panel names
- `data-selected`/`data-unselected`, and they follow changes
- `disabled`: `aria-disabled="true"` and `data-disabled`, not native `disabled`; a click does not select it
- Does not submit its form
- Calls the consumer's `onClick`, `onFocus` and `onKeyDown` with its own
- `render` with a button component keeps the tab's behaviour (PLAN.md "Polymorphism")
- Warns in development when `render` does not render a `<button>`
- Throws a descriptive error outside `Tabs.Root`

`panel/TabsPanel.test.tsx`

- Renders a `<div>` with role `tabpanel`, named by its tab (A: `tabpanel`, `aria-labelledby`)
- Is a tab stop (`tabindex="0"`), which the consumer can remove (A: note 4)
- Has the `hidden` attribute unless its tab is selected, and its content stays in the document
- `data-selected`/`data-unselected`
- Every tab and panel gets an id of its own, and two Roots do not share them
- `render` keeps the generated `id`, the role and `hidden`
- Throws a descriptive error outside `Tabs.Root`

`Tabs.keyboard.test.tsx`

- Tab into the list focuses the selected tab, and Tab again moves to its panel: one tab stop (A: Tab)
- Tab from a focused tab that is not selected moves to the panel, and Shift+Tab out of the list (A: Tab)
- Shift+Tab back into the list focuses the selected tab (A: Tab)
- Right and Left move focus in a horizontal list and wrap at the ends (A)
- Down and Up move focus in a vertical list and wrap at the ends (A: note 2)
- Up and Down do nothing in a horizontal list, and leave the page to scroll; Left and Right do nothing in a vertical one (A: note 3)
- Home and End focus the first and the last tab (A: optional)
- Automatic: the tab that receives focus is selected and its panel shown (A: note 1)
- Manual: arrow keys move focus only; Enter and Space select the focused tab (A: Space or Enter)
- Manual: Tab into the list goes back to the selected tab, not the one last focused (A: Tab)
- Arrow keys stop on a disabled tab without selecting it, and Enter does not select it (keyboard interface practice)
- Arrow keys, Home and End cancel their default action, so the page does not scroll
- With Alt, Control, Meta or Shift, arrow keys, Home and End are left to the browser
- Right to left: Left moves to the next tab and Right to the previous one (Chromium: jsdom computes no `direction`)
- The tab stop moves to the first tab when the selected tab is removed
- A tab added later takes its place in the order of the document

`test/tabs/Tabs.hydrate.test.tsx`

- The server HTML has the tablist, the tabs with `aria-selected`, `aria-controls` naming their panels and one tab stop on the selected tab, the panels named by their tabs, unselected panels with `hidden`, and the `data-*` attributes, before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements and ids without warnings; arrow keys move focus and select, and a click selects, afterwards

## Left out

| Case                                                                              | Reason                                                                                                                                                                                          |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delete closing a tab                                                              | Optional in the pattern, for tabs the user may close. The app owns its list of tabs: it handles Delete in the tab's `onKeyDown` and moves focus                                                 |
| Shift+F10 opening a tab's popup menu, and `aria-haspopup`                         | The menu is the app's (Menu, PLAN.md section 9). The consumer passes `aria-haspopup` to the tab                                                                                                 |
| Native `disabled` on a tab                                                        | See "Shape": the keyboard interface practice keeps disabled tabs focusable. A consumer who wants a tab out of the focus order leaves it out                                                     |
| Arrow keys skipping disabled tabs                                                 | A disabled tab is focusable, so arrow keys reach it, as Tab reaches a focusable element                                                                                                         |
| `disabled` on the Root                                                            | A list whose every tab ignores the user shows one panel for good, which a consumer gets by rendering that panel alone. A flag every app would ship (PLAN.md section 6, rule 6)                  |
| Turning wrapping off                                                              | The pattern wraps, and a flag would cost every app bytes, as on Toggle Group                                                                                                                    |
| Up and Down duplicating Left and Right in a horizontal list                       | Note 3 of the pattern: a horizontal list leaves them to the page                                                                                                                                |
| Removing a panel's content while it is not selected                               | See "Shape": `aria-controls` would name nothing and the content would lose its state. A consumer wraps the content in `<Show>`                                                                  |
| An `id` on the panel                                                              | See "Shape": the tab renders first on the server, so it could not name the panel's own `id`. A consumer who needs an anchor puts the `id` on an element inside the panel                        |
| A tab stop in the server HTML when no tab is selected, or `value` names no tab    | The server knows a tab is selected only when it renders it. After hydration the first tab takes the tab stop                                                                                    |
| Selecting another tab when the selected one is removed or disabled                | The value is the consumer's to change: a removed tab's panel stays hidden until a tab is selected. Arrow keys and Tab still reach the list                                                      |
| Selecting the first tab when it is created after its Panel has rendered           | The Root learns the first tab as it is created, which is before the Panels in the usual order, on the server too. A tab rendered later, such as under its own `<Loading>`, needs `defaultValue` |
| An indicator part that follows the selected tab, with its size as custom property | Measuring the tabs needs a resize observer in every app (PLAN.md section 6, rule 6). CSS styles `[data-selected]` itself                                                                        |
| A name and value submitted with a form                                            | The tabs are not form controls                                                                                                                                                                  |
| Keyboard modifiers in the change callback, and canceling a change                 | `onValueChange` receives the value only, and nothing cancels a part's handler (PLAN.md section 8)                                                                                               |
