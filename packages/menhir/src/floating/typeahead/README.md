# `floating/typeahead`

Typing characters to move to the item whose text starts with them (#98), in
Menu (#99), Select (#102) and the components built on them, Context Menu and
Menubar. Combobox and Autocomplete filter instead, and bundle none of it.
Nothing in the browser does it for a `popover` (PLAN.md section 8, "What the
browser does for popups"); a native `<select>` does its own.

Two files, as `hover/` pairs `safeArea.ts` with `hover.ts`: a framework-free
matcher, and its Solid binding, which holds the typed string, its timer and
the keys.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 2026-11-23 |
| WAI-ARIA [listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), keyboard: "Type-ahead is recommended for all listboxes, especially those with more than seven options"; "Type a character: focus moves to the next item with a name that starts with the typed character"; "Type multiple characters in rapid succession: focus moves to the next item with a name that starts with the string of characters typed". No timeout                                                                                                                                 | 2026-11-23 |
| WAI-ARIA [menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/), keyboard: "Any key that corresponds to a printable character (Optional): Move focus to the next item in the current menu whose label begins with that printable character"; "Disabled menu items are focusable but cannot be activated". No timeout                                                                                                                                                                                                                                    | 2026-11-23 |
| WAI-ARIA [select-only combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/), printable characters, closed and open: "First opens the listbox if it is not already displayed and then moves visual focus to the first option that matches the typed character"; "If multiple keys are typed in quick succession, visual focus moves to the first option that matches the full string"; "If the same character is typed in succession, visual focus cycles among the options starting with that character". No timeout in the text | 2026-11-23 |
| Size: PLAN.md section 6, rules 2, 5 and 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 2026-11-23 |
| Chromium's native `<select>`, `third_party/blink/renderer/core/html/forms/type_ahead.cc`: `kTypeAheadTimeout = base::Seconds(1)`, the pause after which typing starts a new string                                                                                                                                                                                                                                                                                                                                                                                             | 2026-11-23 |

## Shape

| File           | Exports           | Used by                             | What it does                                                                            |
| -------------- | ----------------- | ----------------------------------- | --------------------------------------------------------------------------------------- |
| `match.ts`     | `findMatch`       | `typeahead.ts`                      | The item a typed string moves to, from the active item. No timers, no Solid             |
| `typeahead.ts` | `createTypeahead` | Menu, Select, Context Menu, Menubar | Printable keys build a string, which resets after a pause; moves to the item it matches |

`createTypeahead` takes its options as getters, as the other modules do, and
returns a handler the parts call from their own key events. The component
hands it list navigation's items, active item and move (#97); typeahead
imports nothing from `list-navigation/`, nor it from typeahead:

```ts
const typeahead = createTypeahead<MenuItemEntry>({
  get open() { return open(); },
  get items() { return list.items(); },
  get active() { return list.active(); },
  move: (item) => list.move(item),
});

// In the item part:
onKeyDown: (event) => {
  if (typeahead.onKeyDown(event) || list.onKeyDown(event)) return;
  if (event.key === " " || event.key === "Enter") activate(event);
},

// On a closed Select's trigger: a printable character opens it, and the
// move waits for it to open.
onKeyDown: (event) => {
  if (typeahead.onKeyDown(event) && !open()) setOpen(true, details);
},
```

`findMatch(items, active, typed)` is plain DOM: the item `typed` moves to,
or `undefined`.

An item is `{ element, text? }`, the shape list navigation registers. Its
text is `text`, else the element's text content, read when a key is typed.
The text content includes a submenu nested in the item's element, so that
"Cherry" holding "Bing" reads "CherryBing", and a long string could match
the parent: Menu (#99) gives an item with a submenu its `text`.

### Decisions

- **The typed string resets 1 second after the last key.** None of the
  patterns gives a time. A second is what Chromium's native `<select>`
  waits (Sources), so a styled Select types as the native one does, and
  what a user who knows one expects of the other. Fixed, not a prop: a
  timeout is a property of the platform's typing, not of an app. The timer
  exists only while a string is being typed.
- **Matching is by prefix**, with the built-in `Intl.Collator` at
  `sensitivity: "base"`, so case and accents are ignored: "e" matches
  "Éclair" (PLAN.md section 6, rule 5). It is created on the first key,
  never at import time, and kept for the page. Its locale is the browser's
  default. Leading white space in an item's text is ignored.
- **One character moves to the next item that starts with it**, after the
  active item, wrapping to the first; with no active item, to the first
  that matches.
- **A string of different characters matches from the active item on**,
  so the item the first character reached stays while the string still
  matches it, and the next one that does follows.
- **The same character repeated cycles** through the items that start with
  it, as the select-only combobox example says, rather than matching items
  that start with the repeated string.
- **No match moves nothing.** The character still joins the string.
- **A printable character** is a `key` of one character, with no Control,
  Alt or Meta held: those are shortcuts. Shift gives a capital, which
  matches the same. A character typed with Alt or AltGr is reached by its
  base letter, since accents are ignored.
- **The handler reports whether it used the key**, and cancels the default
  action of each key it uses. Every printable character is used, matched
  or not, so that a key typed into a string does nothing else.
- **Space while a string is being typed is part of it**, so "new y"
  reaches "New York"; the handler uses it, and the part skips its Space
  activation. Space with no string is not used. No `defaultPrevented`
  check (PLAN.md section 8, "Nothing cancels the part's handler").
- **Keys while an input method is composing are ignored** (`isComposing`,
  as `dismissal/escape.ts`): the composed text arrives as its own events.
- **Which items it searches is the component's**: the items list
  navigation's keys reach (`items()`), so disabled items match where the
  arrow keys move to them (#97).
- **It moves through list navigation's own `move`**, so focus or
  `aria-activedescendant`, and scrolling into view, stay there.
- **Nested lists**: like list navigation, it acts only on keys whose target
  is one of its items, or the element whose handler calls it, such as a
  closed Select's trigger. A submenu sits in its parent item's subtree, so
  its keys bubble through that item, and the parent's typeahead ignores
  them. Its items are only those the keys reach, where list navigation
  checks every item it registered; a focused item the keys do not reach
  still types, since its own handler hands the key over as the target.
  The two differ only for a handler on the list's container, which
  neither module's wiring uses.
- **Opening a closed Select is the component's.** The handler reports the
  key used, and the Select opens: the move made while closed waits for the
  popup to open (#97), no item is active while closed, so the first match
  is found, and the value does not change. The typed string survives the
  opening; it is cleared, with its timer, when the popup closes and on
  disposal. Typeahead renders no part, generates no id, sets no `data-*`
  attribute and adds no open-change reason (#31).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that runs only in Chromium
(`it.skipIf(isJSDOM)`), and "J" one that runs only in jsdom. In Chromium
every key is real input (`keyboard` from `test/floating/input.ts`), except
where a case says otherwise; jsdom gets Testing Library's events. Time is
Vitest's fake timers. The fixtures in `test/floating/typeahead/` wire the
module with list navigation as the components will: `Menu.tsx`, list
navigation's test menu in the roving form with typeahead handed to it,
whose items activate on Space and Enter, and `Select.tsx`, a
trigger that opens on a printable character, with options in the
`aria-activedescendant` form and a value that only a click changes.

`match.test.ts`

- One character matches the next item that starts with it, after the active item, wrapping to the first
- With no active item, one character matches the first item that starts with it
- A string of different characters matches from the active item on, so the active item stays while it matches
- The same character repeated cycles through the items that start with it
- No match gives `undefined`
- Case and accents are ignored
- An item's own `text` is matched over its content, and leading white space is ignored
- The element's text content is read when matching, so a changed label is matched
- The collator is created on first use, once, and not at import time (J: `vi.resetModules`)

`typeahead.test.tsx`

- A character moves to the next item that starts with it, through list navigation's move, which focuses it
- Characters typed less than 1 second apart build a string; after 1 second without a key, the next starts a new string
- The same character repeated cycles through the items that start with it
- The handler reports a printable character as used, matched or not, and cancels its default action; Shift gives a capital, which matches (Testing Library's event in both: the test browser's input with Shift held gives a lowercase `key`)
- Named keys, and characters with Control, Alt or Meta, are not used and their default is left alone
- Space while a string is being typed joins it, is used and cancelled, and the item does not activate; with no string, Space is not used and the item activates
- A key while an input method is composing is ignored, and joins no string (Testing Library's event in both)
- Items the keys do not reach are skipped
- A disabled item the keys reach is matched
- A key from a focused item the keys do not reach is taken, as list navigation takes its arrow keys
- An item's own `text` is matched over its content
- A key from a list nested in an item, such as a submenu, moves only the nested list
- On a closed Select, a character opens it and moves to the first option that matches, and the value does not change
- The typed string survives that opening: the next character continues it
- Closing the popup clears the typed string and its timer
- Disposal clears the timer

`test/floating/typeahead/Typeahead.hydrate.test.tsx`

- The server render runs the module: no item is active
- Hydration adopts the server's elements without warnings, and typing works afterwards

`test/bundle-size/popupModules.test.ts`

- Dialog, Alert Dialog, Popover and Tooltip bundle no `typeahead`
- No file of `list-navigation/` bundles `typeahead`, and `typeahead.ts` bundles no `list-navigation`
- The matcher bundles no Solid and no timer

`test/bundle-size/floatingSize.test.ts`

- Each file holds its budget (Size)

## Left out

| Case                                                             | Reason                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Safari's `keyCode` 229 for a key that ends a composition         | Tests run in Chromium (PLAN.md section 5), which reports `isComposing`; revisit with a WebKit report, as in `dismissal/README.md`                                                                                                                    |
| Real input method composition                                    | The test browser's input cannot start one; the composing key is Testing Library's event in both environments                                                                                                                                         |
| A timeout prop                                                   | The pause is the platform's typing, not an app's (Decisions)                                                                                                                                                                                         |
| Matching inside an item's text, not at its start                 | All three patterns match the start of a name                                                                                                                                                                                                         |
| The collator's locale from the document's `lang`                 | The browser's default is the user's language; with case and accents ignored, a locale changes few matches. Revisit if a report shows one                                                                                                             |
| Characters that compare equal to more than one, such as ß and ss | The prefix is cut at the typed string's length. Revisit if a report shows one                                                                                                                                                                        |
| Text with combining accents, such as e followed by U+0301        | The prefix is cut at the typed string's length in UTF-16 units, so a decomposed accent shifts it and "ec" misses that spelling of "Éclair". Labels and keys are normally composed; `normalize()` on both would fix it. Revisit if a report shows one |
| Typeahead in Combobox and Autocomplete                           | They filter their options as the user types (#103)                                                                                                                                                                                                   |
| Typing on a closed Menu's trigger                                | The menu pattern types in an open menu only; Select's closed trigger is the select-only combobox example's                                                                                                                                           |
| Items not in the document (virtualised)                          | List navigation has none (`list-navigation/README.md`, Left out)                                                                                                                                                                                     |
| Firefox and WebKit                                               | Tests run in Chromium (PLAN.md section 5)                                                                                                                                                                                                            |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out.

Measured on 2026-11-23. `typeahead.ts` includes `match.ts`.

| File           | Size  | Budget |
| -------------- | ----- | ------ |
| `match.ts`     | 328 B | 400 B  |
| `typeahead.ts` | 598 B | 700 B  |

Menu and Select will add `typeahead.ts` to list navigation's `roving.ts` or
`activeDescendant.ts`. Dialog, Alert Dialog, Popover and Tooltip bundle
none of it, and no file of `list-navigation/` does, so Combobox does not
(`test/bundle-size/popupModules.ts`).
