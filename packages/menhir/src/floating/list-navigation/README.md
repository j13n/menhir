# `floating/list-navigation`

Moving through the items of a list with the keyboard and the pointer (#97):
the shared behaviour of Menu (#99), Select (#102), Combobox (#103) and the
components built on them. Typeahead (#98) moves through the same items.
Nothing in the browser does it: `focusgroup` is not Baseline (Sources).

Two ways of holding focus, a file each, so a component ships one (PLAN.md
section 6, rule 6):

- **Focus moves to the item** (roving `tabindex`), as in a menu.
- **Focus stays on another element**, such as a combobox's input, which names
  the active item in `aria-activedescendant`.

In both, the item the keyboard acts on is the **active item** (GLOSSARY.md),
and it carries `data-active`.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                         | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                         | 2026-11-23 |
| WAI-ARIA practice [Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/): roving `tabindex` ("the user agent will scroll the newly focused element into view"), `aria-activedescendant` (DOM focus stays on the container, and the author scrolls "the active element into view"), and disabled menu items and options stay focusable                | 2026-11-23 |
| WAI-ARIA [listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), keyboard: Down and Up move to the next and previous option, Home and End (optional) to the first and last; arranged horizontally, "Down Arrow performs as Right Arrow is described above, and vice versa". Nothing on wrapping                                                                                  | 2026-11-23 |
| WAI-ARIA [menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/), keyboard: Down and Up in a menu, "optionally wrapping"; Right and Left in a menubar; Right on an item with a submenu "opens the submenu and places focus on its first item", Left in a submenu "closes the submenu and returns focus to the parent menuitem"; Down on a menubar item opens its submenu | 2026-11-23 |
| WAI-ARIA [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), keyboard: "DOM Focus is maintained on the combobox" while the listbox's active option moves; at the last option Down "either returns focus to the combobox or does nothing"; in an editable combobox, Left, Right, Home and End move the text cursor                                                          | 2026-11-23 |
| Size: PLAN.md section 6, rules 2 and 6                                                                                                                                                                                                                                                                                                                                                         | 2026-11-23 |
| `web-features` 3.47.0 and browser-compat-data 8.1.10 (PLAN.md section 5): `focusgroup` is not Baseline (Chrome and Edge 150 only); `scrollIntoView` with `block` is Widely available; `focus({ preventScroll })` is not Baseline, since Chrome and Firefox on Android lack it: an exception in PLAN.md section 5, "Browsers" (Decisions)                                                       | 2026-11-23 |

## Shape

| File                  | Exports                      | Used by                        | What it does                                                                                |
| --------------------- | ---------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------- |
| `listNavigation.ts`   | `createListNavigation`       | the two files below            | The items in document order, the active item, the keys, the pointer and scrolling into view |
| `roving.ts`           | `createRovingList`           | Menu, Context Menu, Menubar    | Focus moves to the active item                                                              |
| `activeDescendant.ts` | `createActiveDescendantList` | Select; Combobox, Autocomplete | Focus stays where it is; the active item's `id` is for `aria-activedescendant`              |

Each `create*` takes its options as getters, as the other modules do, and
returns handlers the parts call from their own events, as
`createRovingFocus().navigate` is:

```ts
const list = createRovingList<MenuItemEntry>({
  get open() { return open(); },
  get orientation() { return props.orientation; },
  get wrap() { return props.wrap; },
  reachable: (item) => true,
  onArrowIn: (item, event) => openSubmenu(item, event),
  onArrowOut: (item, event) => closeThisMenu(event),
});

// In the item part:
onSettled(() => list.register(item)); // returns what unregisters it
const ownProps = {
  get tabindex() { return list.isActive(item) ? 0 : -1; },
  get "data-active"() { return list.isActive(item) ? "" : undefined; },
  onKeyDown: (event) => list.onKeyDown(event),
  onPointerMove: (event) => list.onPointerMove(item, event),
};
```

The form with `aria-activedescendant` takes items with an `id`, the item
part's `props.id ?? createUniqueId()`, registered once mounted as Dialog's
Title is (PLAN.md section 8, "Generated ids belong to the root"). The
element that keeps focus takes the keys and reads `list.activeId()`, so the
server HTML has no `aria-activedescendant`.

What both return:

| Member                       | What it is                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `register(item)`             | Adds a mounted item; returns what removes it. An item is `{ element, text? }`, plus `id` in the `aria-activedescendant` form                                        |
| `items()`                    | The items the keys reach, in document order                                                                                                                         |
| `active()`                   | The active item, or `undefined`                                                                                                                                     |
| `isActive(item)`             | Whether this item is the active one. A move re-runs it for the two items that change, not for every item                                                            |
| `move(item)`                 | Makes the item active as a key does: focused in the roving form, and scrolled into view. `undefined` leaves none active                                             |
| `onKeyDown(event)`           | Arrow keys, Home and End, and the keys into an item and out of the list, from one of its items or the element that hands them over; returns whether it used the key |
| `onPointerMove(item, event)` | The pointer moving on an item makes it active, without scrolling                                                                                                    |

### What typeahead reads

Typeahead (#98) imports nothing from this folder, nor this folder from it.
The component hands it `items()`, `active()` and `move(item)`: the items the
keys reach in document order, each with its `element` and, for an item whose
content is not its label, its own `text`, which the component sets on the
item it registers, so Select's Value part reads the same label; the active
item; and the move, which focuses and scrolls as a key does, and on a closed
popup waits for it to open. The fallback to the element's text content, read
when a key is typed, is typeahead's: this module never reads `text`. A list
without typeahead bundles none of it (`test/bundle-size/popupModules.test.ts`).

### Decisions

- **`core/rovingFocus.ts` and this module are kept apart**, each with its
  own key mapping. Triage decided on 2026-11-23 to move the mapping of
  `createRovingFocus().navigate` into a framework-free function in `core`
  that both import, unless the split grew `menhir/tabs` or
  `menhir/toggle-group`. It did, measured on 2026-11-23 (gzipped, against
  2,013 B and 1,914 B): +51 B to +55 B each, in two shapes of the
  function this module needs (optional wrapping, and from no item to the
  first or last), and still +16 B and +18 B for the smallest function with
  `navigate`'s behaviour alone.
  The call and its parameters cost more than the lines they replace, so
  every app with Tabs or Toggle Group would pay, where only an app with
  both Tabs and a list popup pays for the two mappings. The state was always to stay apart: a group's roving focus keeps a
  lasting tab stop, which suits Tabs and Toggle Group, where a list popup's
  active item is set on each opening. A simple component imports nothing
  from `floating`.
- **Each item has its own active signal**, made on its first read and set
  and cleared on each move, so a move re-runs the reads of the item that
  was active and the one that is, not of every item: a Select may have
  several hundred options (#102). `createRovingFocus` re-reads every item on
  each move, which is fine for a dozen tabs. **Not `createProjection`**,
  which does the same with Solid's store engine, which an app that uses no
  store otherwise does not bundle (decided on review, 2026-11-23). Measured
  on 2026-11-23 with Rolldown, minified and gzipped, Solid included: an app
  with signals, a memo, an effect, `merge`, `omit`, `For` and `render` is
  15,123 B; with `createRovingList` added, 24,066 B with a projection and
  15,868 B with a signal per item, 8,198 B less. The module budgets leave
  Solid out (`floatingBudgets.ts`), so they do not show it;
  `popupModules.test.ts` checks that no file imports the store engine.
- **Items register once mounted** (`onSettled`), so the order follows the
  document (PLAN.md section 8, "A group of items is one tab stop"); the
  order is sorted again only when an item registers or leaves, not on each
  key. A closed popup stays in the document (#96), so its items register
  when it mounts, not when it opens, and the server HTML has none active.
- **`open`**: when the popup opens, the active item is focused (roving
  form) and scrolled into view once the popup is shown, in a microtask as
  `focus/initialFocus.ts` does, so a `move` in the same handler that opens
  it, before or after, lands. While it is closed, `move` neither focuses
  nor scrolls, and the pointer moves no active item, even while an exit
  animation still shows the popup. When it
  closes, no item is active:
  the component sets one on each opening, such as the first or last by the
  key that opened it, or a Select's selected option, and a `move` while
  closed, as typeahead makes on a closed Select, stays until it opens. A
  list that is not in a popup leaves `open` out.
- **Which items the keys reach is the component's** (`reachable`), since
  the keyboard practice keeps disabled menu items and options focusable.
  An item that is not reachable is never active: the keys skip it, the
  pointer on it changes nothing, and `move` ignores it. Activating an item
  (Enter, Space, a click) is the component's.
- **Wrapping is off by default** (`wrap`): the listbox and combobox
  patterns do not wrap, the menu pattern wraps optionally. With wrapping
  off, the keys stop at the ends and still cancel the default action, so
  the page does not scroll. Combobox turns it on, as the list autocomplete
  example wraps, since Home and End belong to its text (#103).
- **With no active item**, the next key moves to the first item and the
  previous key to the last, as Down and Up do on a combobox (combobox
  pattern).
- **`data-active`** (`""` on the active item, absent on the others) styles
  it in both forms: in the `aria-activedescendant` form it never has
  focus, and whether focus that the pointer moved matches `:focus-visible`
  is the browser's heuristic, which depends on the input before it. In
  Chromium it matches after a key and not after a mouse press (tested).
- **The pointer moves the active item without scrolling**, the keyboard
  scrolls it into view. The pointer focuses the item with `preventScroll`
  in the roving form, since the list would otherwise jump under it.
  `focus({ preventScroll })` is not Baseline, and is used as an exception
  recorded in PLAN.md section 5, "Browsers": Chrome and Firefox on Android
  lack it, where the option is ignored and focus scrolls the item into
  view, and a touch, the usual pointer there, moves no active item
  (below). Every other core browser has had it since Safari 15.5 on iOS.
  No fallback is shipped (PLAN.md section 6, rule 6).
- **The keyboard scrolls with `scrollIntoView({ block: "nearest" })`**, in
  both forms: an item already in view does not move, and one out of view
  comes in at the near edge. In the roving form it focuses with
  `preventScroll` first, since focus would scroll to an alignment each
  browser chooses.
- **Only a pointer that moves counts** (`pointermove`), not `pointerover`
  or `pointerenter`: a list that the keyboard scrolls under a still pointer
  gets boundary events in Chromium (checked on 2026-11-23, with real input)
  and no `pointermove`, so the keyboard keeps the active item. **A touch is
  ignored**: a finger that scrolls the list would make each item it crosses
  active, and a tap activates an item through the component's click.
- **Nested lists**: a list acts only on keys whose target is one of its
  items, or the element that hands them over (the one whose handler calls
  `onKeyDown`, such as a combobox's input). A submenu sits in its parent
  item's subtree, so its keys bubble through that item, and the parent list
  ignores them. It does not read `defaultPrevented`, which would cancel it
  for a consumer who only meant the browser (PLAN.md section 8, "Nothing
  cancels the part's handler"). The key that points into an item (Right in a vertical
  list, Left right to left, Down in a horizontal one) calls `onArrowIn`
  with the active item and the event, while an item is active; the key
  that points out of the list (Left in a vertical list, Right right to
  left, Up in a horizontal one) calls `onArrowOut` with the active item,
  if any, and the event. Without the callback, the key is not used. The
  module cancels neither. Menu (#99) opens and closes the submenu, picks
  the `onOpenChange` reason, and moves focus back to the item that opened
  it, which the browser does not do for a nested popover (PLAN.md section
  8, "What the browser does for popups"). There is no stack of open popups
  (PLAN.md section 6, "The `floating` layer").
- **Right to left** is read from the active item's `direction`, else the
  first item's, which inherits from the list, not from the element that
  has focus: a combobox's input may sit outside the list's `dir`.
- **With a modifier held** (Alt, Control, Meta, Shift), the keys are left
  to the browser and the app, as in `createRovingFocus`.
- **Keys the component keeps**: an editable combobox's Home, End, Left and
  Right move the text cursor (combobox pattern), so Combobox does not hand
  them to `onKeyDown`. The module has no flag for it.
- **`focusgroup` is not used**: it is not Baseline (Chrome and Edge 150
  only on 2026-11-23), and a fallback would be this code.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no layout, so no scrolling and no
`direction`, no popover, inside which it focuses nothing, and no real
pointer. In Chromium every key is real input (`keyboard` from
`test/floating/input.ts`, through `press` in `helpers.ts`), and so is the
pointer where a case says so; jsdom gets Testing Library's events. The
fixtures in `test/floating/list-navigation/` wire the module as the
components will: `Menu.tsx` in the roving form, `Combobox.tsx` with an input
and `aria-activedescendant`, each with an optional `popover="manual"` popup
(`TestList.tsx`) and a handle on the list for the tests. The menu also
takes a typeahead, disabled items the keys reach and an activation, for
typeahead's tests (#98).

`listNavigation.test.tsx`, in both forms (`describe.each`)

- Down and Up move the active item, `data-active` follows, and their default action is cancelled
- A horizontal list moves with Right and Left, and leaves Down and Up alone; a vertical one leaves Right and Left alone
- Right to left, Left moves to the next item in a horizontal list (C)
- The key into an item calls `onArrowIn` with the active item and the event, the key out of the list `onArrowOut`, neither cancelled nor with a modifier; none into an item while none is active; Down and Up in a horizontal list; mirrored right to left (C)
- Home and End move to the first and last item
- Without `wrap` the keys stop at the ends and are still cancelled; with it they wrap
- The keys it uses are cancelled, so the page does not scroll, at the ends too (C)
- With no active item, Down moves to the first item and Up to the last
- Items the keys do not reach are skipped, by the arrows, Home and End
- A modifier leaves the keys to the browser
- `onKeyDown` reports whether it used the key: not other keys, a modifier, or the keys into and out of a list with no callback for them
- `items()` lists the reachable items in document order with their element, an item added later in its place, and a removed one gone
- `items()` lists each item with its own `text`, if it has one (#98)
- `move(item)` makes it active as the keys do, `move(undefined)` leaves none, and a move to an unreachable item is ignored
- Removing the active item leaves no item active
- Closing the popup leaves no item active, and an item moved to while closed is active once it opens
- A move re-runs the reads of the two items that change, of 200
- The pointer moving on an item makes it active, with a mouse or a pen; on an unreachable item, or by touch, it changes nothing
- The keyboard scrolls the active item into view at the near edge (C)
- An item moved to while the popup is closed is scrolled into view once it opens (C)
- An item moved to while the popup is closed but still shown, as during an exit animation, does not scroll (C)
- The pointer does not scroll for the item it moves on (C, real pointer)
- The keyboard scrolling the list under a still pointer leaves the active item with the keyboard (C, real pointer)

`roving.test.tsx`

- A key moves focus to the active item, the only one with `tabindex="0"`
- A key from a list nested in an item, such as a submenu, moves only the nested list, and its key out of the list calls only its own `onArrowOut`
- The pointer moves focus to the item it moves on (C, real pointer)
- Focus that the pointer moves matches `:focus-visible` after a key, and not after a mouse press, so `data-active` is needed (C, real pointer)
- An item moved to while the popup is closed takes focus only once it has opened, even while an exit animation still shows it (C)
- The pointer moving on a closed popup's items, while an exit animation still shows it, makes none active and moves no focus (C, real pointer)
- An item moved to in the handler that opens the popup, before or after opening, takes focus (C)

`activeDescendant.test.tsx`

- Focus stays in the input while the keys and the pointer move the active item
- The input names the active item in `aria-activedescendant`, and nothing while none is active
- Items take the consumer's `id`, else a generated one, and the reference follows a change of `id`

`test/floating/list-navigation/ListNavigation.hydrate.test.tsx`

- The server render runs the module: no item is active, no `aria-activedescendant`, every menu item `tabindex="-1"`
- Hydration adopts the server's elements without warnings, and the keys work afterwards, in both forms

`test/bundle-size/popupModules.test.ts`

- The roving file bundles no `activeDescendant` file, and the reverse
- No file bundles `typeahead` (#98)
- No file imports Solid's store engine
- Dialog, Alert Dialog, Popover and Tooltip bundle no `list-navigation`

## Left out

| Case                                                              | Reason                                                                                                                                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lists whose items are not all in the document (virtualised)       | Every planned list has its items in the document, since a closed popup stays there (#96). An index-based form would be a second API; revisit as a file of its own if Combobox (#103) decides to support them |
| Grids                                                             | No Phase 3 component needs one                                                                                                                                                                               |
| Typeahead                                                         | #98, in `floating/typeahead/`, through `items()`, `active()` and `move()`                                                                                                                                    |
| Opening and closing a submenu, its reason, focus back to its item | Menu's (#99). This module reports the keys (Decisions)                                                                                                                                                       |
| Enter, Space, Escape and Tab                                      | The component's: activation, closing and leaving the list differ between Menu, Select and Combobox                                                                                                           |
| Page Up and Page Down                                             | None of the three patterns asks for them                                                                                                                                                                     |
| The pointer leaving the list clears the active item               | The keyboard would lose its place, and none of the patterns asks for it                                                                                                                                      |
| An active item that becomes unreachable                           | It stays active until the next move, which starts as from no item. Menu items and options are not disabled while the user moves through them                                                                 |
| A sharing of the key mapping with `core/rovingFocus.ts`           | It grew Tabs and Toggle Group (Decisions)                                                                                                                                                                    |
| `focusgroup`                                                      | Not Baseline (Sources)                                                                                                                                                                                       |
| Firefox and WebKit                                                | Tests run in Chromium (PLAN.md section 5)                                                                                                                                                                    |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out.

Measured on 2026-11-23. `roving.ts` and `activeDescendant.ts` include
`listNavigation.ts`.

| File                  | Size    | Budget  |
| --------------------- | ------- | ------- |
| `listNavigation.ts`   | 975 B   | 1,150 B |
| `roving.ts`           | 1,005 B | 1,200 B |
| `activeDescendant.ts` | 1,010 B | 1,200 B |

Menu uses `roving`, Select and Combobox `activeDescendant`. Dialog, Alert Dialog,
Popover and Tooltip bundle none of it (`test/bundle-size/popupModules.ts`).
