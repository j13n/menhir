# Popups are built on `<dialog>` and `popover`, for Baseline Widely available plus `popover`

Menhir supports the browsers of Baseline Widely available on the date of each release, plus one exception, the `popover` attribute (#94). (Amended on 2026-11-23 by list navigation, #97: a second exception, `focus({ preventScroll: true })`, which is ignored where unsupported; PLAN.md section 5 has the reason.) That target lets the browser do most of a popup. Dialog and Alert Dialog are a `<dialog>` opened with `showModal()`. Popover and the menus are a `popover="auto"` element opened by its trigger's `popovertarget`, and Tooltip is `popover="manual"`. (Amended on 2026-11-22 by Popover, #33: its Trigger keeps `popovertarget`, so light dismiss counts a press on it as inside, but opens and closes the popover through its state and calls `preventDefault()` on the click, so the popover is shown in the same flush that places it. PLAN.md section 8, "Popups", has the details.) (Amended on 2026-11-23 by Navigation Menu, #105: it is not one of "the menus" here. Site navigation is a disclosure, not a menu, and its Panels are in the page's flow, `hidden` while closed and placed by the consumer's CSS: a top-layer panel would need positioning, about 7 kB gzipped, and an `auto` popover opened on hover would close the page's other popovers. PLAN.md section 8, "What the browser does for popups", has the details.) Both put the popup in the top layer, so no popup has a portal and none needs a `z-index`. Of what these elements cover, the `floating` layer adds only what the browser does not do:

- positioning, on `@floating-ui/dom`;
- outside press for a dialog, Escape for Tooltip (a `manual` popover has no light dismiss), and the reason for a close;
- the Tab wrap of a modal dialog, which the WAI-ARIA pattern requires and `showModal()` leaves out;
- keeping a refused close open;
- scroll lock;
- presence for exit animations.

Support was checked on 2026-11-22 in `web-features` 3.47.0. The spike ran the cases in Chromium, Firefox and WebKit, and measured the platform prototypes smaller than the hand-built ones by about 350 B gzipped for the dialog (with the Tab wrap) and 640 B for the popup. The hand-built ones were lower bounds. PLAN.md section 5 ("Browsers") and section 8 ("What the browser does for popups") have the details and the numbers.

## Considered options

- **Baseline Widely available with no exception**: `popover` is Widely available only from 2027-07-27. Until then Popover, Tooltip and every menu would ship a portal, their own light dismiss and focus order around the portal, and could still be covered by an element with a high `z-index`. That code would be removed in mid-2027. The exception covers one gap: iOS Safari 17.0 to 18.2 does not close a popover on a tap outside.
- **Baseline Newly available**: it adds `popover`, but also `commandfor`, `requestClose()`, `@starting-style` and `scrollbar-gutter`. None of these saves a popup bytes the way `popover` does, so it would drop older Safari releases for little.
- **Everything by hand, with a portal**: what a library for older browsers does. It is larger, and it cannot win against a stacking context. It also misses the Android back gesture, which the browser counts as a close request for a modal `<dialog>` and an `auto` popover, and which a keydown listener never sees.
- **CSS anchor positioning instead of `@floating-ui/dom`**: positioning is by far the largest cost of a positioned popup (about 7 kB gzipped in the spike), but anchor positioning is not Baseline at all (no Firefox). It is revisited once it is Widely available.
- **Platform features "where supported" with a fallback** (`closedby`, `CloseWatcher`, `popover="hint"`, `interestfor`): every app would ship the fallback, which is the code the feature was meant to save (PLAN.md section 6, rule 6).

## Consequences

- The portal ticket (#29) is not needed for any planned popup. A popup that is not in the top layer would bring it back.
- Dialog's Popup part must render a `<dialog>`, so a `render` function that returns another element breaks it. A development build checks for that.
- Server HTML cannot open a modal dialog: `<dialog open>` is non-modal, and a closed popover is `display: none` until it is shown. Hydration opens them, and Dialog (#31) and Popover (#33) decide what the server renders for `defaultOpen`.
- A controlled popup cannot veto every close. In the spike, a dialog could refuse Escape only once, even with a click inside between two Escapes, and a popover could not refuse a close at all. Menhir reopens the popup, and it reports each close once.
- One `toggle` event covers every way a popover closes, so dismissal (#26) adds listeners only to report the reason.
- On 2027-07-27 `popover` is Widely available, and the exception lapses with nothing to change.
