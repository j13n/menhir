# `floating/hover`

Opens a popup when the pointer rests on its trigger, and closes it when the
pointer leaves both the trigger and the popup (#30). Tooltip (#34) and
Navigation Menu (#105) use it; Preview Card and Menu's submenus later. The
browser has no Baseline way to do it: `interestfor` is Chromium only
(PLAN.md section 8, "What the browser does for popups").

Three files, so a popup bundles only what it uses (PLAN.md section 6,
rule 6). A submenu needs the safe area without the delays, and a bundle of
`safeArea.ts` alone has no timer. A popup that does not group its
triggers does not bundle `group.ts`.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                            | Read       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                            | 2026-11-22 |
| WCAG 2.2 [Understanding 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (updated 2026-07-12). Hoverable: "the pointer can be moved over the additional content without the additional content disappearing". Persistent: it "remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid". Nothing on delays or touch | 2026-11-22 |
| WAI-ARIA [tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/), marked "work in progress; it does not yet have task force consensus": a tooltip "typically appears after a small delay"; opened by a pointer, "it remains open as long as the cursor is over the trigger element or the tooltip". Nothing on touch                                                                                                                 | 2026-11-22 |
| Size: PLAN.md section 6, rules 2 and 6                                                                                                                                                                                                                                                                                                                                                                                                            | 2026-11-22 |
| [Pointer Events Level 4](https://www.w3.org/TR/pointerevents4/) (Working Draft, 2026-10-08): `pointerType` is `mouse`, `pen`, `touch` or empty; compatibility mouse events are mouse events only; a pointer that does not hover gets `pointerout` and `pointerleave` after `pointerup`; boundary events fire "after a layout change that affected the hit test target" of a still pointer, and may be delayed                                     | 2026-11-22 |

## Shape

| File          | Exports            | Used by                                       | What it does                                                                                   |
| ------------- | ------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `safeArea.ts` | `trackSafeArea`    | `hover.ts`; Menu's submenus without the delay | Reports when the pointer, once it left one element, moves out of the way to another. No timers |
| `hover.ts`    | `createHover`      | Tooltip, Preview Card, Navigation Menu        | Opens on hover after a delay, closes when the pointer leaves after another, with a safe area   |
| `group.ts`    | `createHoverGroup` | The part that groups a popup's triggers       | Once one popup of the group is open, the next opens at once, and the first closes              |

The options of `createHover` are getters, as in the other modules; the
popup opens and closes through its own setter, so a controlled popup only
asks:

```ts
createHover({
  get trigger() { return trigger; },
  get popup() { return popup; },
  get open() { return open(); },
  get delay() { return props.delay; },
  get closeDelay() { return props.closeDelay; },
  get group() { return useContext(GroupContext); },
  onOpenChange: (open, details) => setOpen(open, details),
});
```

`trackSafeArea` is plain DOM, for a submenu that keeps its own state:

```ts
const stop = trackSafeArea(leaveEvent, submenu, (event) => closeSubmenu());
```

- **Listeners on the trigger exist from mount to disposal**, since it opens
  while closed. Those on the popup and the document exist only while open.
  Effects do not run on the server, and nothing runs at import time.
- **Timers exist only while a delay is pending.** A change of `open`, from
  hover or anything else, and disposal clear them. Disposal also takes the
  popup out of its group, so that a popup unmounted while open does not
  keep the group open, and is not closed by the next member.

### The reason

Opening and closing both report `trigger-hover`, with the pointer event
that caused it: the `pointerenter` on the trigger that the delay followed,
or the `pointerleave` or `pointermove` that left. A group closing one popup
because another opened reports the other trigger's `pointerenter`.

### Decisions

- **The delay props are `delay` and `closeDelay`**, in milliseconds, on the
  popup's part that takes its state (PLAN.md section 8, "API
  conventions"). `delay` defaults to 600 ms, so that a pointer passing over
  a trigger on its way elsewhere opens nothing, and `closeDelay` to 0: the
  safe area keeps the popup open across the gap, so no delay is needed for
  it. A popup may pass its own defaults. A delay of 0 opens or closes in
  the same event, with no timer.
- **The safe area is the shape between the point where the pointer left
  and the other element**: every point on a line from there to the other
  element's box. Leaving the trigger, the other element is the popup;
  leaving the popup, it is the trigger. A move inside it keeps the popup
  open, however slow, and a stop there keeps it open too (persistent); a
  move outside it, or past the element, closes the popup after
  `closeDelay`. The box is read again on each move, so a popup that moves
  while the pointer crosses is followed. The move that left is at the
  point itself and counts as inside. It works for any side, and for a
  popup that overlaps the trigger, where the pointer enters the popup at
  once.
- **No safe area when the pointer did not move.** When the page scrolls
  under a still pointer, Chromium fires `pointerleave` at the same point as
  the last move (checked on 2026-11-22), and the shape from that point
  would keep the popup open until the pointer moved. A leave at the
  pointer's last position over the trigger or the popup closes after
  `closeDelay`.
- **Leaving the window closes.** Chromium fires `pointerleave` with no
  `relatedTarget` when the pointer leaves the window (2026-11-22), after
  which no move arrives to end a safe area. It closes after `closeDelay`;
  the safe area also ends on a `pointerout` with no `relatedTarget`.
- **Touch opens nothing.** A touch on a trigger fires pointer events with
  `pointerType` `touch`, which the module ignores, then compatibility
  mouse events, which are mouse events only (Pointer Events), so the
  module, listening to pointer events alone, never sees them. Not a long
  press either: a long press brings up the browser's own callout or
  selection, and a tooltip is not a name, so the trigger must be usable
  without it. Tooltip (#34) opens on focus, which a tap gives a
  button. If #34 wants a long press, it is a file of its own.
- **A pen opens like a mouse.** A pen that hovers fires `pointerenter`
  before it touches, with `pointerType` `pen` (checked with Chromium's
  pen input), and a hover is what the user meant. A pen that does not
  hover gets `pointerenter` at contact and `pointerleave` after lifting,
  so a tap opens nothing unless the pen rests longer than the delay.
- **Grouping is a part, not module state.** `createHoverGroup` makes a
  group object, which the popup's part that groups triggers (Tooltip's
  `Tooltip.Group`, #34) provides through context, and each popup passes to `createHover`.
  Module state would group every popup of every kind in the app, run for
  apps that never group, and be shared between requests on the server. A
  member opens at once while another member is open, or within `timeout`
  milliseconds (default 400) of the last one closing, and closes the
  member that was open. The group's `delay` applies to members that set
  none. The time comes from `Date.now()`, not a timer, so a group has
  nothing to clear. Only popups opened by hover count: a popup opened by
  focus neither closes the others nor keeps the group open.
- **Disabled cancels a pending opening.** While `disabled`, the trigger
  opens nothing on hover; an open popup still closes when the pointer
  leaves. The module does not read the trigger's `disabled` attribute:
  Chromium 159 fires pointer events on a disabled `<button>` (checked on
  2026-11-22), so Tooltip (#34) decides what a disabled trigger does.
- **A trigger removed while a delay is pending opens nothing.** Disposal
  clears the timer, and a trigger that is no longer in the document when
  the delay ends does not open.
- **Persistent.** Nothing closes the popup while the pointer is on the
  trigger, on the popup or in the safe area. A popup dismissed while the
  pointer is still on the trigger stays closed until the pointer leaves and
  comes back. A popup opened another way, such as by focus, closes when the
  pointer leaves it, once it has entered: this module knows only the
  pointer. A Tooltip stays open while its trigger is hovered or focused, so
  #34 ignores this close while the trigger has focus, and its own close on
  blur while the trigger or popup is hovered (Left out).
- **`interestfor` is not used.** It is not Baseline (#94), and a fallback
  would be this code.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no layout, so no safe area, and no real
pointer. Real pointer movement comes from the Chrome DevTools Protocol
(`test/floating/input.ts`), in steps, as a mouse moves, with fake timers.
The other cases fire pointer events with Testing Library, in both. The test
tooltip in `test/floating/hover/Tooltip.tsx` wires the module as Tooltip
(#34) will, with a `popover="manual"` popup placed below its trigger with a
gap.

`safeArea.test.ts`

- A move from the point where the pointer left towards the element, and onto it, does not report
- A move away from the element, sideways out of the shape, or past the element reports once, with the move, and stops listening
- A move at the point where the pointer left counts as inside
- The element on each side of the point, and diagonally: inside and outside each (it.each)
- The shape follows the element when it moves
- The pointer leaving the window reports, with the `pointerout`
- A touch is ignored, such as a tap elsewhere while the mouse is in the gap
- Stopping removes the listeners, and nothing is reported after
- Real pointer movement across a gap stays inside, and away from it leaves (C)

`hover.test.tsx`

- A mouse resting on the trigger opens after 600 ms, not before, and reports `trigger-hover` with the `pointerenter`
- `delay` overrides it, and `delay={0}` opens at once
- The pointer leaving before the delay ends opens nothing
- The pointer leaving closes at once by default, and reports `trigger-hover` with the event
- `closeDelay` keeps it open that long, and the pointer coming back within it keeps it open
- The pointer moving from the trigger across the gap onto the popup keeps it open, and back again (C)
- The pointer stopping in the gap keeps it open (C)
- The pointer leaving the trigger away from the popup closes it, and leaving the popup away from the trigger (C)
- Nothing closes it while the pointer rests on the trigger or the popup
- A popup closed while the pointer is on the trigger does not open again until the pointer leaves and comes back
- A popup opened another way closes when the pointer enters and leaves
- A touch on the trigger opens nothing, nor the mouse events the browser emulates after it (also C, with a real tap)
- A pen resting on the trigger opens it (also C, with Chromium's pen input)
- The pointer leaving the window from the trigger or the popup closes it (C)
- The page scrolling under a still pointer closes it (C)
- Disabled while the delay is pending: nothing opens; while disabled, hovering opens nothing; an open popup still closes when the pointer leaves
- The trigger removed while the delay is pending, or the popup disposed: nothing opens, and no timer is left
- The pointer moving straight from one trigger to another closes the first, and the second waits its delay (C)
- A change of `open` from elsewhere clears a pending delay: nothing more is reported
- Listeners: on the trigger from mount to disposal, on the popup and the document only while open

`group.test.tsx`

- With one open, hovering another member opens it at once and closes the first, which reports `trigger-hover` with the second's `pointerenter`
- Within `timeout` of the last closing, the next opens at once; after it, the next waits its delay
- `timeout` is 400 ms by default
- The pointer moving straight from one trigger to the next opens each at once (C)
- The group's `delay` applies to members without one, and a member's own wins
- Two groups do not share
- A popup opened another way neither closes the others nor keeps the group open
- A member disposed while open leaves the group: the next waits its delay, and nothing reaches the disposed one

`test/floating/hover/Hover.hydrate.test.tsx`

- The server render runs the module and renders the popup closed: nothing runs during a server render
- Hydration adopts the server's elements without warnings, and hovering the trigger afterwards opens the popup

`test/bundle-size/popupModules.test.ts`

- `hover/safeArea` alone bundles no timer, and neither `hover/hover` nor `hover/group`
- `hover/hover` bundles no `hover/group`

## Left out

| Case                                                   | Reason                                                                                                                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opening on focus, closing on blur                      | Tooltip's own (#34), since Preview Card and the menus do not open on focus the same way                                                                                |
| Staying open while focused after the pointer leaves    | This module closes on the pointer alone. Tooltip (#34) keeps a popup open while its trigger is hovered or focused, by ignoring hover's close while focused (Decisions) |
| Escape                                                 | `floating/dismissal/escape.ts` (#26)                                                                                                                                   |
| A long press on touch                                  | See Decisions                                                                                                                                                          |
| A trigger that is a disabled native button             | Chromium fires its pointer events; what a disabled trigger does is #34's (see Decisions)                                                                               |
| A group member whose controlled `open` refuses to open | The group counts it open until it opens and closes. Refusing a hover opening is not a case of this phase                                                               |
| Content that moves under a still pointer on the popup  | The same check as the trigger's, which the scroll case covers                                                                                                          |
| A pointer resting in the safe area for a long time     | It keeps the popup open (persistent). A submenu that wants to give up after a pause adds its own timer                                                                 |
| Firefox and WebKit                                     | Tests run in Chromium (PLAN.md section 5). The scroll and window cases rely on boundary events the Pointer Events draft requires of every engine, which may delay them |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out.

Measured on 2026-11-22. `hover.ts` includes `safeArea.ts`.

| File          | Size  | Budget |
| ------------- | ----- | ------ |
| `safeArea.ts` | 429 B | 500 B  |
| `hover.ts`    | 905 B | 1100 B |
| `group.ts`    | 251 B | 300 B  |

Tooltip uses `hover` and, through `Tooltip.Group`, `group` (#34);
Navigation Menu uses `hover` without `group`, since its Root holds the one
open Item and works out the delay itself (#105); a submenu will use
`safeArea` alone. Dialog and Alert Dialog bundle none
of it (`test/bundle-size/popupModules.ts`).
