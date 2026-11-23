# Navigation Menu

A site's navigation: links, and buttons that show more links, opening on a
press and on hover. Built on the WAI-ARIA disclosure pattern, as its
disclosure navigation example applies it, with hover added: delays, a safe
area to the open Panel, and moving along the bar at once (#105). It is not
a popup: its Panels are in the page's flow, as Collapsible's are, not in
the top layer, yet it opens on hover and closes on Escape, focus leaving
and a press outside, as a popup does.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 2026-11-23 |
| WAI-ARIA [disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) (page last updated 2026-01-20): a `<nav>` holding a list of buttons with `aria-expanded` and `aria-controls`, each followed by a list of links, and `aria-current="page"` on the current link. Tab and Shift+Tab move through the buttons and the links of an open list; Enter or Space toggles a button; "Escape: If a dropdown is open, closes it and sets focus on the button that controls that dropdown"; "Moving focus out of the navigation region also closes an open dropdown". Arrow keys, Home and End are marked optional. It "does not use the WAI-ARIA menu role", since it "does not provide the complex functionality that assistive technologies expect in a widget that has the menu role" | 2026-11-23 |
| WAI-ARIA [disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) (no date on the page): the control has role `button`, `aria-expanded` `"true"` or `"false"`, and optionally `aria-controls`; Enter and Space toggle the content. There is no navigation menu pattern                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 2026-11-23 |
| WCAG 2.2 [Understanding 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (updated 2026-07-12), for opening on hover. Dismissible: "without moving pointer hover or keyboard focus". Hoverable: "the pointer can be moved over the additional content without the additional content disappearing". Persistent: it "remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid"                                                                                                                                                                                                                                                                                                                                 | 2026-11-23 |
| Size: PLAN.md section 6, rules 3 and 6. The budget was set before the behaviour, at about Accordion's plus `hover/hover` and `dismissal/escape`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 2026-11-23 |

## Shape

`NavigationMenu.Root` renders a `<nav>` that holds which Item is open.
`NavigationMenu.Item` renders an `<li>` around one entry of the bar: a
`NavigationMenu.Trigger`, a native `<button type="button">` with
`aria-expanded` and `aria-controls`, and its `NavigationMenu.Panel`, a
`<div>` in the page's flow, `hidden` while closed. `NavigationMenu.Link`
renders an `<a>` that closes the menu when it is activated. The `<ul>`
around the Items is the consumer's.

```tsx
<NavigationMenu.Root aria-label="Main">
  <ul>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
      <NavigationMenu.Panel>
        <ul>
          <li>
            <NavigationMenu.Link href="/switch">Switch</NavigationMenu.Link>
          </li>
        </ul>
      </NavigationMenu.Panel>
    </NavigationMenu.Item>
    <li>
      <NavigationMenu.Link href="/blog" aria-current="page">
        Blog
      </NavigationMenu.Link>
    </li>
  </ul>
</NavigationMenu.Root>
```

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser**: the `<button>` gives Enter, Space, focus and a name
  without code, before hydration too, and `hidden` hides a closed Panel.
  Nothing is in the top layer.
- **The `floating` layer**: `hover/hover` (opening after the delay,
  closing when the pointer leaves the Trigger and the Panel, with the safe
  area between them) and `dismissal/escape`, both from the Item. No
  positioning, presence, focus or scroll lock: `menhir/navigation-menu`
  bundles none of them, nor `hover/group`
  (`test/bundle-size/popupModules.ts`).
- **The parts**: one open Item, the hover delay that moving along the bar
  skips, a Panel opened by a press staying open, closing on focus leaving
  the `<nav>`, on a press outside it and on a Link, and returning focus on
  Escape.

### Decisions

- **Not a menu.** WAI-ARIA's guidance is that site navigation uses the
  disclosure pattern, not `menu` roles: its example "does not provide the
  complex functionality that assistive technologies expect" from the menu
  role. So this component does not build on Menu, and has no `menu`,
  `menuitem` or `aria-haspopup`: a `<nav>` landmark, a list, links, and
  buttons that say whether their list is shown.
- **The Panel is in the page's flow,** `hidden` while closed, as
  Collapsible's Panel is, and the consumer's CSS places it, usually
  `position: absolute` under its Item. Not a `popover`: a top-layer panel
  needs `floating/positioning` (about 7 kB gzipped) to be placed under its
  Trigger, and an `auto` popover opened on hover would close the page's
  other popovers. Its exit animation is the consumer's CSS
  (`transition-behavior: allow-discrete` on `display`), as Collapsible's
  is. An ancestor with `overflow: hidden` can clip it, as it can any
  element placed outside its parent's box.
- **Closed content stays in the document,** `hidden`, so the links are in
  the server HTML, and `aria-controls` always names an element. A Panel
  open by `defaultValue` is rendered open by the server, as a
  Collapsible's is: nothing needs the top layer, so nothing waits for
  hydration.
- **The Root renders a `<nav>`,** unlike a popup's Root, which renders
  nothing: it is the landmark, and the boundary that focus leaving and a
  press outside are measured against. Name it with `aria-label` when the
  page has more than one `<nav>`.
- **The Item renders an `<li>`** and generates its Panel's `id` with
  Solid's `createUniqueId`, which the server render and hydration agree on,
  as an Accordion Item does (PLAN.md section 8, "Generated ids belong to
  the root"). The Panel takes no `id`: the Trigger, rendered first, names
  it. The Item holds the entry's `value`; without one it uses the Panel's
  generated `id`.
- **The Trigger** is a native `<button type="button">` with
  `aria-expanded` (`"true"` or `"false"`) and `aria-controls`, and no
  `aria-haspopup`, which would announce a menu. Its `render` must render a
  `<button>`; a development build warns otherwise.
- **No List part:** the `<ul>` carries nothing without arrow keys, so it is
  the consumer's. No Title, Description or Close: the pattern names none.
- **The state** is `value`, `defaultValue` and
  `onValueChange(value, { reason, event })` on the Root: the open Item's
  value, `null` when none is open. One Item is open at a time: opening one
  closes the other, in one change.
- **It opens** on a press on the Trigger (`trigger-press`), by pointer or
  by Enter or Space, and when a mouse or a pen rests on the Trigger for
  `delay` (`trigger-hover`). Hover is always on, with no flag (PLAN.md
  section 6, rule 6): the press-only form is a recipe on Collapsible, on
  the docs page as "Without hover". **Not on focus**, unlike Tooltip: the
  disclosure opens on a press, and a Panel that opened as Tab passed over
  its Trigger would move the links of every entry into the Tab order in
  turn.
- **Moving along the bar.** While an Item is open, or within `timeout`
  milliseconds of the last close, hovering another Trigger opens its Panel
  at once, and the open one closes in the same change. The Root works out
  the delay it passes to `createHover` from its own value. It does not use
  `createHoverGroup`: the Root's one value already closes the other Item,
  and a group would report `null` and then the next value for one move. A
  press opening counts as open too. There is no Group part.
- **The delays: `delay` 300 ms, `closeDelay` 200 ms, `timeout` 400 ms.**
  Chosen against the bar in Chromium, with input from the test browser,
  not a person's hand (`root/NavigationMenuRoot.test.tsx` sweeps a real
  pointer across it); revisit them when the bar is tried by hand:
  - `delay` is shorter than a tooltip's 600 ms, since the user who points
    at an entry of a navigation bar is usually after its links. A pointer
    sweeping across the bar at about 1 px a millisecond, a slow sweep, was
    over each 100 px Trigger for about 110 ms and opened nothing. It is not
    much shorter, because a press on the Trigger of a Panel that hover
    opened closes it (below): with `delay={0}`, a click that followed the
    pointer onto a Trigger closed the Panel its arrival had just opened
    (the hydration test met this), so a user who rests on a Trigger and
    presses should usually press before the delay ends.
  - `closeDelay` forgives a pointer that overshoots a Panel's edge, where a
    tooltip's 0 would close a large Panel the moment the pointer slipped
    off it. Moving to another Trigger does not wait for it, since that one
    opens at once and closes this one.
  - `timeout` is the delay group's 400 ms (PLAN.md section 8, "Hover
    delays"): a pointer that left the bar for a moment and came back opens
    the next entry at once.
- **A Panel opened by a press stays open when the pointer leaves.** The
  Item ignores hover's close while its Panel was opened by a press: the
  user asked for it, and it closes on a press, Escape, focus leaving or a
  press outside. **So does a Panel that holds focus**, as after Tab moved
  into one that hover opened: closing it would hide the focused link and
  drop focus to the page (WCAG 1.4.13, persistent: it stays until it is
  dismissed or focus moves away). A press on the Trigger of a Panel that hover opened closes
  it, since the button toggles, as the pattern says, and the pointer still
  on the Trigger does not open it again until it leaves and comes back
  (#30).
- **Hovered keeps it open** (WCAG 1.4.13, hoverable and persistent):
  nothing closes it while the pointer is on the Trigger, on the Panel or in
  the safe area between them.
- **Escape** (`escape-key`, `floating/dismissal/escape.ts`) closes the open
  Panel without moving the pointer (WCAG 1.4.13, dismissible), and returns
  focus to its Trigger if focus was inside its Item, as the example does.
  With focus elsewhere, as after hover opened it, focus stays where it is.
  The key is marked handled, so a dialog or popover below stays open.
- **Focus leaving the `<nav>`** closes, with a new reason, `focus-out`:
  focus that moves to an element outside it by the keyboard, such as Tab.
  Focus that a press outside moves, onto an element that takes focus, is
  left to the press, which closes on release as `outside-press` (below).
  Focus lost to nothing does not close: the window losing focus, and a
  press on content that takes no focus, inside the Panel or outside, where
  an outside press decides.
- **A press outside the `<nav>`** closes (`outside-press`), on release and
  only for a press that also started outside, so a text selection dragged
  out of a Panel keeps it open (PLAN.md section 8, "Dismissing a popup").
  It is the `click` that ends a primary press which started outside, so a
  secondary button, a touch that scrolls and a key's `click` close
  nothing, and a press on a focusable element outside closes on its
  release too, not when the press moves focus to it. `dismissal/outsidePress.ts` is a dialog's backdrop, so this is
  the Root's own, a few lines, until another component needs it.
- **A Link press closes**, with a new reason, `link-press`: with a router,
  nothing reloads the page, and a menu left open over the new page is a
  bug. Enter on a link fires `click` too. A Link is anywhere in the Root,
  in a Panel or beside the Triggers.
- **Links**: `aria-current="page"` on the current one is the consumer's,
  since only the app knows the page. A Link renders a router's link
  through `render`, which spreads the props onto it.
- **`data-*` attributes**: `data-open`/`data-closed` on the Item, Trigger
  and Panel (PLAN.md section 8).
- **Readers without scripts** get the links in the server HTML but cannot
  open a closed Panel, since the buttons need scripts. A top-level Link
  beside a Trigger, to a page that lists the same links, is the way round.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part against the
part conventions. "A" marks a case of the WAI-ARIA disclosure pattern as
its navigation example applies it, "W" a case of WCAG 1.4.13, "C" a case
that runs only in Chromium (`it.skipIf(isJSDOM)`): jsdom has no layout, no
real pointer and no real focus movement by Tab. Hover in jsdom comes from
Testing Library's pointer events with fake timers; real pointer movement
and key presses from the Chrome DevTools Protocol and `vitest/browser`
(`test/floating/input.ts`).

`root/NavigationMenuRoot.test.tsx`

- Renders a `<nav>` landmark, named by its `aria-label` (A: navigation region)
- Every Panel closed by default, and `defaultValue` opens that Item
- A press on a Trigger opens its Panel, reporting `trigger-press`; opening another closes the first in one change; its Trigger closes it again (A: Enter or Space toggles; one open)
- Controlled: stays put and asks with the requested value; follows a value changed from outside; `null` closes every Panel
- Opens before async work that `onValueChange` starts settles (PLAN.md "API conventions")
- A mouse resting on a Trigger opens its Panel after 300 ms, not before, reporting `trigger-hover`; `delay` changes it
- The pointer leaving the Trigger and the Panel closes it after 200 ms, reporting `trigger-hover`; `closeDelay` changes it, and coming back within it keeps it open
- While one is open, hovering another Trigger opens it at once and closes the first, with one `onValueChange` (moving along the bar)
- The first Item's close from hover, in the same turn as the next Item's opening, does not undo it
- While one opened by a press is open, hovering another Trigger opens it at once
- Within `timeout` (400 ms) of the last close, the next opens at once; after it, it waits its delay; `timeout` changes it
- A Panel opened by a press stays open when the pointer leaves
- A press on the Trigger of a Panel that hover opened closes it, and it does not open again until the pointer leaves and comes back
- A touch opens nothing on hover; a tap toggles it (C)
- A real pointer sweeping across the bar opens nothing; resting on a Trigger opens it (C)
- The pointer moving from a Trigger across the gap onto its Panel keeps it open, and leaving both closes it (W: hoverable; C)
- The pointer resting on a Panel that hover opened, past `closeDelay`, keeps it open (W: persistent; C)
- A real pointer moving from an open Trigger to the next, through the first Panel's safe area, opens the next at once, with one `onValueChange` and no `null` (C)
- A Panel that hover opened stays open once Tab has moved focus into it and the pointer leaves, and focus stays on its link (W: persistent; C)
- Escape closes the open Panel, reporting `escape-key`, without moving the pointer (A: Escape; W: dismissible)
- Escape closes a Panel that hover opened with the real pointer on its Trigger, then on the Panel, and it stays closed while the pointer stays (W: dismissible; C)
- Escape with focus in the Item returns focus to its Trigger (A: Escape sets focus on the button; C)
- Escape with focus outside the Item leaves focus where it is
- Escape with nothing open does nothing, and is not marked handled
- Tab from the last link of an open Panel out of the `<nav>` closes it, reporting `focus-out` (A: moving focus out closes; C)
- Shift+Tab out of the `<nav>` closes it (A; C)
- Focus moving inside the `<nav>`, from a Trigger into its Panel and to another Trigger, keeps it open (A: Tab moves through buttons and links; C)
- Focus lost to nothing, as when the window loses focus, keeps it open
- A press on a Panel's text that takes focus from a link in it keeps it open (C)
- A press outside the `<nav>` closes, reporting `outside-press`, on release (C)
- A press on a focusable element outside, with focus inside, closes on release, reporting `outside-press`, not `focus-out` (C)
- A press inside the `<nav>`, on a Panel's text, keeps it open (C)
- A press that starts inside and ends outside keeps it open (C)
- A press with the secondary button outside keeps it open (C)
- Outside-press and Escape listeners exist only while an Item is open
- `render` with another element keeps the behaviour (PLAN.md "Polymorphism")

`item/NavigationMenuItem.test.tsx`

- Renders an `<li>`
- `value` identifies the Item in the Root's value; without one it uses a generated value
- `data-open`/`data-closed` on the Item, Trigger and Panel, and they follow changes
- Throws a descriptive error outside `NavigationMenu.Root`

`trigger/NavigationMenuTrigger.test.tsx`

- Renders a button with type `button`, named by its content, taking the consumer's `id`, with no `aria-haspopup` (A: role `button`)
- `aria-expanded` is `"false"` closed and `"true"` open (A: `aria-expanded`)
- `aria-controls` names its Panel's `id` (A: `aria-controls`)
- Keyboard focus opens nothing (A: opens on Enter or Space only)
- Enter and Space toggle its Panel and keep focus (A: Enter or Space; C)
- Tab moves through the Triggers, and through the links of an open Panel only (A: Tab, Shift+Tab; C)
- Does not submit its form
- Calls the consumer's `onClick` once per click
- `render` with a button component keeps its behaviour; warns in development when it renders another element
- Throws a descriptive error outside `NavigationMenu.Item`

`panel/NavigationMenuPanel.test.tsx`

- Renders a `<div>` with the generated `id`, `hidden` while closed and shown while open, its links in the document either way (A: container shown or hidden)
- Every Item's Panel gets an `id` of its own
- Takes no `id` from the consumer
- In the page's flow: not a popover, and laid out where the consumer's CSS puts it (C)
- `render` keeps the `id` and `hidden`
- Throws a descriptive error outside `NavigationMenu.Item`

`link/NavigationMenuLink.test.tsx`

- Renders an `<a>` with the consumer's `href` and `aria-current` (A: `aria-current="page"`)
- A press on a Link in an open Panel closes it, reporting `link-press`, and the link is followed
- Enter on a Link closes it, reporting `link-press` (A: Enter activates the link)
- A Link beside the Triggers closes the open Panel
- `render` with a router's link component keeps its behaviour
- Throws a descriptive error outside `NavigationMenu.Root`

`test/navigation-menu/NavigationMenu.hydrate.test.tsx`

- The server HTML of a closed menu has the `<nav>`, the Triggers with `aria-expanded="false"` and `aria-controls` naming hidden Panels, and the links inside them, before any script runs (PLAN.md section 10)
- The server HTML of a `defaultValue` menu has that Panel shown, with `aria-expanded="true"` and `data-open`
- Hydration adopts the server's elements and ids without warnings, and a click, Enter and Space open and close Panels afterwards
- After hydration a Panel opens on hover (C)

`test/bundle-size/popupModules.test.ts`

- `menhir/navigation-menu` bundles no `@floating-ui`, `positioning`, `presence`, `focus`, `scroll-lock`, `list-navigation`, `typeahead`, `hover/group`, `dismissal/outsidePress`, `dismissal/dialogClose` or `dismissal/popoverClose`

## Left out

| Case                                                            | Reason                                                                                                                                                                                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow keys, Home and End                                        | Optional in the example, where they "supplement, but do not replace, tabbing"; bytes in every app. They are not a roving tab stop, so neither `core/rovingFocus.ts` nor list navigation (#97) fits them. A part if ever added |
| A shared, animated area that every Item's content moves into    | It needs a measured size, so a resize observer in every app (Collapsible leaves the same out). A part if it is ever added (PLAN.md section 6, rule 6)                                                                         |
| A top-level item that is both a link and a button               | The pattern has no such control; render a Link beside the Trigger                                                                                                                                                             |
| A popover Panel in the top layer                                | See "Decisions": positioning in every app, and an `auto` popover would close the page's others                                                                                                                                |
| Opening on focus                                                | See "Decisions": the disclosure opens on a press                                                                                                                                                                              |
| A flag that turns hover off                                     | A flag would ship hover in every app (PLAN.md section 6, rule 6). The press-only form is a Collapsible recipe, "Without hover" on the docs page                                                                               |
| Several Items open at once                                      | The pattern's example opens one; a bar with two Panels open would overlap. A consumer who wants it builds on Collapsible                                                                                                      |
| Nested Navigation Menus, submenus inside a Panel                | No pattern describes them for site navigation; a Panel holds a list of links, which may be grouped under headings                                                                                                             |
| Focus lost to nothing closing it                                | See "Decisions": the window losing focus, or a press on text inside a Panel, would close it. Tab from the page's last element into the browser's own interface therefore leaves it open                                       |
| A Link press with a modifier key, such as one opening a new tab | It closes too: the menu cannot tell whether the page will change, and a check would be bytes in every app for a rare case. A consumer controls `value` to keep it open                                                        |
| `disabled` on the Root or an Item                               | Not in the pattern; an entry with nothing to show is plain text. A disabled native button still gets pointer events in Chromium (#30), so a flag would also have to stop hover                                                |
| `hidden="until-found"`, which lets find-in-page open a Panel    | As on Collapsible: a `beforematch` handler every app would ship. Add it when asked for                                                                                                                                        |
| An `id` on the Panel                                            | See "Decisions": the Trigger renders first on the server, so it could not name the Panel's own `id`. A consumer who needs an anchor puts the `id` on an element inside the Panel                                              |
| Scrolling closing it                                            | The Panel is in the page's flow and scrolls with it. A scroll under a still pointer moves the pointer off the Trigger or Panel, which closes one hover opened (#30)                                                           |
| Tried with screen readers                                       | VoiceOver with Safari 26.6.1 on macOS 15.7.9, on 2026-11-23: every check of #129 passed. NVDA and JAWS on Windows are still to be tried (#129)                                                                                |
| Firefox and WebKit                                              | Tests run in Chromium (PLAN.md section 5). The parts use only a button, `hidden`, pointer, focus and key events                                                                                                               |

## Browsers and screen readers

Tried on 2026-11-23 in Chromium (Playwright's headless build, through the
test suite), and on 2026-11-23 with VoiceOver and Safari 26.6.1 on macOS
15.7.9, on the docs page's examples, the "Without hover" recipe and the home
page's example. Every check of #129 passed: the navigation landmark and its
name, a Trigger read as a collapsed or expanded button with no menu
announced, Enter and Space opening a Panel, Tab into its links, no link of
a closed Panel read, Escape returning focus to the Trigger, Tab out of the
navigation and a Link press closing it, `aria-current="page"` read as the
current page, VoiceOver's own activation toggling a Trigger, and a Panel
opened by hover and entered with Tab staying open. NVDA with Firefox, and
NVDA or JAWS with Chrome, are still to be tried (#129).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-23.

| Entry point              | Size    | Budget |
| ------------------------ | ------- | ------ |
| `menhir/navigation-menu` | 2,579 B | 3 kB   |

The budget was set at 3.5 kB before the behaviour was written, about
Accordion's (1,537 B) plus `hover/hover` (905 B, the safe area included) and
`dismissal/escape` (344 B), and lowered to 3 kB once measured. The rest is
the parts, the outside press and the one value. No `@floating-ui/dom`: a
Popover is 9,599 B, most of it positioning.
