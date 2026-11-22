# `floating/presence`

Shows a popup when its state turns open, and once it turns closed keeps it
shown until its exit animations and transitions have ended, then hides it
(#96). Every popup uses it: Dialog (#31), Alert Dialog, Popover (#33),
Tooltip (#34) and those after them.

A CSS-only exit (`transition-behavior: allow-discrete` on `display` and
`overlay`) ran only in Chromium in #94: Firefox and WebKit took the dialog
out of the top layer at once, and `overlay` is Chromium only (PLAN.md
section 8, "What the browser does for popups"). So the popup stays shown,
a `<dialog>` still modal, while it animates, and this module calls
`close()` or `hidePopover()` once it has finished.

One file. It imports nothing else from the layer, so a popup that does not
use it does not bundle it.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                       | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                       | 2026-11-22 |
| No WAI-ARIA pattern covers animation. The [modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) patterns decide what holds while a popup leaves: it is closed, so it takes no focus and is not announced as open                                                                     | 2026-11-22 |
| Size: PLAN.md section 6, rules 2 and 6                                                                                                                                                                                                                                                                                                                                       | 2026-11-22 |
| [CSS Transitions Level 2](https://drafts.csswg.org/css-transitions-2/) (Editor's Draft): `@starting-style` gives an element that had no style before, such as one leaving `display: none`, a style to transition from; `transition-behavior: allow-discrete`                                                                                                                 | 2026-11-22 |
| [Web Animations](https://drafts.csswg.org/web-animations-1/) (Editor's Draft): `getAnimations({ subtree: true })` returns the animations of an element, its descendants and their pseudo-elements, CSS animations and transitions included; `finished` resolves when an animation finishes and rejects when it is cancelled, and never settles for one that is infinite      | 2026-11-22 |
| HTML standard, [the `dialog` element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element) and [the `popover` attribute](https://html.spec.whatwg.org/multipage/popover.html) (last updated 2026-11-22): closing a modal dialog returns focus to the element focused before it opened; hiding a popover does so only when focus is inside it | 2026-11-22 |

## Shape

| File          | Exports          | Used by     | What it does                                                                         |
| ------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------ |
| `presence.ts` | `createPresence` | every popup | Shows the popup on opening; on closing, hides it once its exit animations have ended |

The options are getters, as in the other modules:

```ts
createPresence({
  get popup() { return dialog; },
  get open() { return open(); },
});
```

- **It shows and hides the popup itself.** A `<dialog>` is shown with
  `showModal()` and hidden with `close()`; any other element is a popover,
  shown with `showPopover()` and hidden with `hidePopover()`. A popup the
  browser has shown already, through `popovertarget`, is left as it is. The
  popup component writes no effect of its own for it.
- **No listeners and no timers.** It waits on the `finished` promises of
  the popup's animations. Effects do not run on the server, and nothing runs
  at import time.
- **jsdom has no `showModal()`, `showPopover()` or `getAnimations()`**, so
  a popup that is open in a jsdom test needs them stubbed, as
  `test/dialog/stubDialog.ts` stubs them for Dialog. A closed popup calls
  nothing.

### Decisions

- **A closed popup stays in the document**, hidden by the browser: a
  closed `<dialog>` and a closed popover are `display: none` in its own
  stylesheet, so they are neither focusable nor in the accessibility tree.
  `popovertarget` needs the popup's id in the document, a trigger's
  `aria-controls` names it, and its content keeps its state between
  openings, as a Collapsible's Panel does with `hidden` (#22). So there is
  no `<Show>` around the popup, and no "mounted" state in Solid: whether it
  is shown is the browser's (`[open]`, `:popover-open`). A popup whose
  content is costly to render wraps that content in `<Show>`.
- **It waits for what is running when the state turns closed.** The
  popup's `data-closed` lands in the same flush, before this module's
  effect, and `getAnimations({ subtree: true })` computes the style, so the
  transition or animation it starts is already there: those of the popup,
  of its descendants and of its `::backdrop` (Chromium, 2026-11-22). An
  animation in its `animation-delay` is running, so a delayed one counts
  from the start. Once they have all settled it asks again, so one started
  meanwhile counts too, then hides the popup. With none running it hides
  at once, in the same flush, with no timer.
- **Infinite and paused animations are not waited for.** Their `finished`
  never settles, and a spinner inside a popup would keep it open forever.
  Only animations that are running and end count.
- **Anything that ends an animation ends the exit**: finishing, a zero
  duration, which starts none, `prefers-reduced-motion` when the consumer's
  CSS drops the animation for it, a cancelled animation, whose `finished`
  rejects, and a `display: none` ancestor, which cancels the popup's
  animations or starts none. This module does not read
  `prefers-reduced-motion` itself: the animation is the consumer's CSS, and
  so is the choice to keep a fade for reduced motion.
- **Opening again while it leaves cancels the exit.** The popup is still
  shown, so nothing is shown again; the wait is dropped and the popup
  becomes interactive again. Its `data-open` turns a transition back, as
  CSS transitions reverse, or replaces an exit animation with the entry
  one.
- **Closing while it opens cancels the entry**, the same way: `data-closed`
  turns the entry transition back, or replaces the entry animation, and the
  popup hides once that has ended.
- **While it leaves, the popup is `inert`**: it is closed, so it takes no
  focus and no press, and is left out of the accessibility tree, and a
  second press on a button in it does nothing. Chromium drops focus from an
  inert element to the `<body>` at its next rendering (2026-11-22), and
  `close()` then returns focus to the element focused before the dialog
  opened, since the HTML standard returns focus from a modal dialog
  wherever focus is. **A popover that holds focus is not made inert**:
  hiding a popover returns focus to its trigger only from inside it, and
  in Chromium a popover that was inert returned it nowhere. Its own
  `inert` is put back once it has left or opens again.
- **Focus returns and the page unlocks once the popup has left**, not when
  its state turns closed, as `floating/focus` and `floating/scroll-lock`
  already do (#27, #28): they wait for the `close` or `toggle` event that
  this module's `close()` or `hidePopover()` fires. A dialog that is still
  modal keeps the page inert, so neither could happen earlier.
- **The browser may hide it first.** Escape on a dialog that is leaving
  fires a `cancel` that nothing prevents any more (dismissal listens only
  while open), and the browser closes it; light dismiss hides a popover.
  Its animations are cancelled with it, which ends the wait, and there is
  nothing left to hide.
- **A popover the browser hides while open is hidden at once.** Light
  dismiss, Escape, its `popovertarget` and another `auto` popover opening
  hide it before its state changes, since `beforetoggle` cannot be
  cancelled on closing. Showing it again to animate out would close the
  other popovers, and a popover shown from `display: none` has no style to
  transition from. Popover (#33) and the menus decide whether that is
  enough, or whether they dismiss a `manual` popover themselves.
- **No further `data-*` attribute.** `data-open` and `data-closed` (PLAN.md
  section 8, "API conventions") are enough: a closed popup at rest is
  `display: none`, so `[data-closed]` styles only the exit. The entry is
  the consumer's CSS, `@starting-style` for a transition or a `@keyframes`
  animation on `[data-open]`, which costs Menhir nothing (#94).
  `@starting-style` is Widely available from 2027-02-06; until then an
  older browser shows the popup without the entry transition, and a
  `@keyframes` entry works everywhere.
- **A popup removed while it leaves needs nothing more.** Solid removes a
  disposed popup from the document, which takes it out of the top layer
  and cancels its animations, so the wait ends by itself and `close()`
  runs on the detached element.
- **No callback when the popup has finished opening or closing.** No
  popup of this phase needs one: focus and the scroll lock follow the
  browser's `close` and `toggle` events. Add one when a component needs it.
- **`floating`, not `core`.** Collapsible and Accordion leave animation to
  CSS (their READMEs, "Left out"): their panels are not in the top layer,
  so `transition-behavior: allow-discrete` on `display` animates them out.
  It moves to `core` only if a simple component needs it.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no `showModal()`, no `popover` and no
`getAnimations()`. The test popups in `test/floating/presence/` wire the
module as a popup component will, with `data-open` and `data-closed`; most
exits use long durations that the test finishes itself, through the
animations' `finish()`.

`presence.test.tsx`

- While closed, nothing is shown, also in jsdom
- Opening shows a `<dialog>` as modal, and a popover (C)
- A dialog open at mount is modal (C)
- A popover the browser has shown through `popovertarget` is left as it is (C)
- With nothing running, closing hides the popup in the same flush (C)
- An exit transition keeps the dialog modal until it has ended, then closes it, and `close` fires once (C)
- An exit `@keyframes` animation, a transition on the `::backdrop`, an animation on a child and one with a delay are each waited for (C)
- An animation started during the exit is waited for too (C)
- An infinite animation inside, and a paused one, are not waited for (C)
- A popover is hidden once its exit transition has ended (C)
- Opening again while it leaves cancels the exit: it stays modal and is no longer inert (C)
- Closing while it opens turns the entry transition back, and closes once that has ended (C)
- While it leaves, the dialog is inert, and focus returns to the element focused before once it has closed (C)
- A popover without focus is inert while it leaves; one with focus is not, and focus returns to its trigger (C)
- The popup's own `inert` is put back (C)
- A zero duration, and `prefers-reduced-motion` with CSS that drops the transition for it, close at once (C)
- A cancelled animation ends the exit (C)
- Inside a `display: none` ancestor it closes at once, and an ancestor hidden during the exit ends it (C)
- Escape on a dialog that is leaving closes it, and nothing happens once the animations would have ended (C)
- Removed while it leaves, it is out of the top layer, and the wait ends (C)
- With dismissal and the scroll lock: Escape runs the exit, the close is reported once, and the page unlocks and the browser returns focus only once it has closed (C)

## Left out

| Case                                                 | Reason                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| An exit for a popover the browser hides itself       | See Decisions: `beforetoggle` cannot be cancelled on closing. Popover (#33) decides                                                         |
| A `<dialog open>` from the server                    | A popup open by default is rendered closed on the server, and hydration opens it (PLAN.md section 8, "Popups"). Removed in #31              |
| What the server renders for a `defaultOpen` popover  | A closed popover is `display: none` until it is shown, so hydration would show it with its entry animation. Popover (#33) decides           |
| An animation the consumer starts on another element  | Only the popup's subtree and pseudo-elements are asked. A popup whose exit is on an element outside it hides before that has ended          |
| A non-modal `<dialog>`                               | Every `<dialog>` popup is modal (ADR 0006), so a `<dialog>` is shown with `showModal()`                                                     |
| An animation that starts on another's `animationend` | That event comes after the check that follows the last animation settling, so the popup has hidden already. `animation-delay` chains them   |
| Firefox and WebKit                                   | Tests run in Chromium (PLAN.md section 5). `getAnimations()` and `finished` are Widely available, and #94 ran the exit by hand in all three |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out.

Measured on 2026-11-22.

| File          | Size  | Budget |
| ------------- | ----- | ------ |
| `presence.ts` | 499 B | 650 B  |

Every popup will import it.
