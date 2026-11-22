# `floating/scroll-lock`

Stops the page scrolling behind a modal popup (#28). `showModal()` makes the
page inert but leaves it scrolling: the wheel scrolled the page behind a
modal dialog in all three engines, and `html:has(dialog:modal) { overflow:
hidden }` stopped it with no script (#94; PLAN.md section 8, "What the
browser does for popups"). This folder sets that style on `<html>` while a
modal popup is open, and adds what the rule leaves: the count of nested
popups, the scrollbar's width, putting the page's own styles back, and
`touch-action` on the popup for iOS Safari, which scrolls the page from a
drag on the backdrop whatever the page's `overflow`.

One file, which only modal popups import (PLAN.md section 6, rule 6): a
non-modal Popover and Tooltip leave the page scrolling.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                     | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                     | 2026-11-22 |
| WAI-ARIA [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): "windows under a modal dialog are inert", so a user cannot interact with content outside it. No pattern covers scrolling; that the page does not scroll behind a modal popup follows from it                      | 2026-11-22 |
| Size: PLAN.md section 6, rules 2 and 6                                                                                                                                                                                                                                                                     | 2026-11-22 |
| [CSS Overflow Module Level 3](https://drafts.csswg.org/css-overflow-3/) (Editor's Draft): `overflow` on the root element applies to the viewport; `hidden` content is still scrollable from script but not by the user; `scrollbar-gutter: stable` reserves the gutter whether or not a scrollbar is shown | 2026-11-22 |
| [CSS Overscroll Behavior Module Level 1](https://drafts.csswg.org/css-overscroll-1/) (Editor's Draft): scroll chaining passes a scroll that reaches the end of a scroll container on to its nearest scrollable ancestor; `overscroll-behavior: contain` stops it                                           | 2026-11-22 |

## Shape

| File            | Exports            | Used by                                     | What it does                                              |
| --------------- | ------------------ | ------------------------------------------- | --------------------------------------------------------- |
| `scrollLock.ts` | `createScrollLock` | Dialog, Alert Dialog, a modal Popover (#33) | Keeps the page from scrolling while a modal popup is open |

The options are getters, as in `floating/dismissal` and `floating/focus`:

```ts
createScrollLock({
  get popup() { return dialog; },
  get open() { return open(); },
});
```

- **Locks while open, and unlocks once the popup has closed.** Effects do
  not run on the server, and nothing runs at import time.

### Decisions

- **`<html>` is locked, with inline styles.** `overflow: hidden` on the root
  element applies to the viewport, which is what scrolled in #94. The lock
  writes the declaration through `element.style`, not as the `:has()` rule:
  a `<style>` element the module added would be blocked by a Content
  Security Policy without `'unsafe-inline'` in `style-src`, while a write
  to `element.style` is not. In Chromium on 2026-11-22, with a policy of
  `style-src 'self'`, the write applied and an added `<style>` did not. A rule the
  docs ask apps to copy would make the lock depend on the app's CSS. The
  inline style also lets a modal popup that is not a `<dialog>`, such as a
  modal Popover (#33), lock the page. The cost is the count below, which
  the `:has()` rule would have had from the browser.
- **A page that scrolls in another element needs no lock.** A popup in the
  top layer has the viewport as its containing block, so a scroll from its
  backdrop or from the popup chains to the viewport, not to a scroll
  container the popup sits in. In Chromium, a `<main>` that scrolls did not
  scroll behind a modal dialog, with or without the lock, for the wheel,
  PageDown and touch alike. Not checked in Firefox and WebKit.
- **The count is module state, touched only in the browser.** The first
  lock saves the page's styles and sets its own; the last unlock puts the
  saved ones back, in whatever order the popups close. Its variables hold
  nothing at import time and are written only from effects, which do not
  run on the server, so no request sees another's count (PLAN.md section 6,
  "No shared stack of open popups", is about a stack of popups, which a
  count is not).
- **Unlocking puts back exactly what was there.** Each property the lock
  sets (`overflow-x`, `overflow-y` and, with a scrollbar, `padding-right`
  and `--hidden-scrollbar-width`) is saved with its priority and set back,
  or removed if it was not there. A style written to `<html>` while locked,
  such as the theme utility's, stays, but a write to one of the lock's own
  properties is replaced by the saved value. An empty `style` attribute
  may be left behind, with no declaration in it. Neither locking nor
  unlocking moves the scroll position.
- **No layout shift from the scrollbar going.** Before locking, the width
  of the page's scrollbar is `innerWidth` less `<html>`'s `clientWidth`.
  When it is more than 0, the lock adds it to `<html>`'s `padding-right`,
  so the content keeps its width and place.
- **`position: fixed` elements use `--hidden-scrollbar-width`.** A fixed
  element is placed against the viewport, which widens when the scrollbar
  goes, and no padding on `<html>` reaches it. The lock sets the
  scrollbar's width as `--hidden-scrollbar-width` on `<html>`, so such an
  element keeps its place with a fallback of `0px`, as in
  `right: var(--hidden-scrollbar-width, 0px)`. The lock does not look for
  fixed elements: it would have to search the page and write to the app's
  elements on every opening. The name has no prefix, as the variables a
  popup sets do not; set on `<html>`, the whole page inherits it, so an
  app's own variable of the same name is hidden while the page is locked.
- **A page with `scrollbar-gutter: stable` gets no padding.** Its gutter
  stays when the scrollbar goes, so nothing moves, fixed elements included
  (Chromium, 2026-11-22). The lock reads the computed value and adds
  nothing. The lock does not set `scrollbar-gutter` itself: it is Widely
  available only from 2027-06-11 (PLAN.md section 5). An app may set it on
  `<html>` and have no shift and no padding.
- **`overscroll-behavior: contain` on the popup.** With `<html>` at
  `overflow: hidden`, Chromium does not chain a scroll from the popup to
  the page anyway. iOS Safari does: a dialog that scrolls, because it is
  taller than the screen or because the on-screen keyboard left it less
  room, scrolled the page once it reached its end. With `contain` on the
  dialog it stopped there. The lock sets it inline while the popup holds
  the lock, and puts the popup's own value back. On a dialog that does not scroll, `contain` did not stop a drag with the keyboard open, which `touch-action` does (below); `none` on `<html>` and
  `<body>` stopped nothing (see "iOS Safari").
- **The page unlocks once the popup has closed**, not when its state turns
  false, as return focus does (`floating/focus`). A popup that presence
  (#96) keeps shown while it animates out is still modal and the page
  still inert, so the page stays locked until the animation has ended and
  the scrollbar comes back in one step. The lock is released after the
  flush that closed the popup, or, if the popup is still shown then, on its
  `close` or `toggle` event. Opened again before it closed, the popup keeps
  the lock it has. Disposed while open, it unlocks at once.
- **A refused close keeps the lock.** The lock follows the popup's state,
  not the browser's `close` event, so a controlled dialog that dismissal
  opens again after a second Escape stays locked.
- **`touch-action: pinch-zoom` on a popup that does not scroll itself.**
  iOS Safari 26.5 scrolled the page from a drag on the backdrop of a
  modal dialog, though `<html>` was at `overflow: hidden`: a drag on the
  backdrop hits the `<dialog>`, and from there the scroll reached the page.
  With `touch-action: pinch-zoom` on the dialog, a drag on the backdrop or
  on the dialog's own text pans nothing, with the keyboard open as well,
  while a scrollable area inside still scrolls and pinch zoom still works.
  The lock sets it inline, as it does `contain`.
- **Only while the popup does not overflow.** A modal `<dialog>` is a
  scroll container (`overflow: auto` in the browser's stylesheet), and
  Chromium applies a scroll container's own `touch-action` to its
  scrolling: with `pinch-zoom` on a dialog taller than the screen, a touch
  drag scrolled it 5 px where it scrolled 490 px without (2026-11-22). So a
  popup whose content overflows keeps its own value, and scrolls by touch;
  on iOS it leaves only thin strips of backdrop, and `contain` keeps its
  scroll from reaching the page. A `ResizeObserver` on the
  popup and its children checks again as they change size, so content that
  arrives after the popup opened counts. It is part of the one file, not a
  file of its own: every modal popup has iOS users, and the module does not
  tell browsers apart.
- **Zoomed in, the popup pans with two fingers.** `pinch-zoom` allows only
  pinch gestures on the popup, and WebKit counts a two-finger drag as one:
  a user who has zoomed in moves the view over the popup with two fingers,
  and one finger scrolls only a scrollable area. A two-finger drag can also
  scroll the page behind the popup. Accepted for the page never scrolling
  from a one-finger drag; VoiceOver and the system's Zoom use gestures of
  their own. Chrome on Android honours `touch-action` too, so zoomed in, it
  pans the same way.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`). "C" marks a case that runs only in Chromium
(`it.skipIf(isJSDOM)`): jsdom has no `showModal()`, no layout and no
scrolling. Real wheel, key and touch input comes from `vitest/browser` and
the Chrome DevTools Protocol (`test/floating/input.ts`). Chromium runs with
its scrollbars shown (`vitest.config.ts`), 15 px wide, as on a desktop
with classic scrollbars. The test dialog in `test/floating/scroll-lock/`
wires the module as Dialog (#31) will, with `createDialogClose` for Escape.

`scrollLock.test.tsx`

- Without the lock, the wheel and PageDown scroll the page behind a modal dialog (C)
- While open, the wheel over the backdrop, PageDown and a touch drag do not scroll the page (C)
- Once closed, the page scrolls again (C)
- Locking and unlocking leave the scroll position where it was (C)
- A scrollable area in the dialog still scrolls, and at its end the page does not (C)
- A page that scrolls in another element does not scroll behind the dialog, without the lock (C)
- While closed, nothing is set on `<html>`
- Unlocking puts back exactly the inline styles `<html>` had: none, or its own `overflow` and `padding-right`
- A style written to `<html>` while locked stays after unlocking
- With a scrollbar, the content keeps its width and place, and the padding adds to the page's own (C)
- A `position: fixed` element that uses `--hidden-scrollbar-width` keeps its place (C)
- With `scrollbar-gutter: stable`, no padding is added and nothing moves, fixed elements included (C)
- With no scrollbar, no padding is added (C)
- Nested dialogs: the page unlocks when the last one closes, in either order
- Escape closes the dialog and unlocks the page; a refused Escape keeps it locked (C)
- A dialog still shown after its state turned false, as with an exit animation, keeps the page locked until it has closed (C)
- A dialog opened again before it closed keeps one lock (C)
- A dialog disposed while open unlocks the page
- Listens for `close` and `toggle` only while a closing dialog is still shown, and stops on close, on opening again and on disposal (C)
- A dialog that fits gets `touch-action: pinch-zoom` and `overscroll-behavior: contain` while open, and its own values back after (C)
- A scroll area in a dialog that fits still scrolls by touch (C)
- A dialog taller than the screen keeps its own `touch-action`, and scrolls by touch, with `contain` (C)
- The check runs again while open, as the content grows past the screen and shrinks back (C)

`test/floating/scroll-lock/ScrollLock.hydrate.test.tsx`

- The server render runs the module and renders the dialog closed: nothing runs during a server render
- Hydration adopts the server's elements without warnings
- After hydration, opening locks the page and closing unlocks it (C)

## Left out

| Case                                                                  | Reason                                                                                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| iOS Safari                                                            | Chromium tests cannot show it; tried on a device, see below                                                                         |
| Chrome on iOS: a drag on the text of a dialog that fits               | Scrolls the page, where Safari's does not; not a Baseline core browser (PLAN.md section 5). Follow-up in #114                       |
| A popup with a set height whose content gains children while open     | Only a change of size runs the check again, and a new child resizes neither the popup nor the children already observed             |
| A page's scrollbar on the left, in a right-to-left page               | The padding goes on the right, where Chromium keeps the page's scrollbar in a right-to-left page. Not checked in Firefox and WebKit |
| An app stylesheet that sets `overflow` on `<html>` with `!important`  | It wins over the inline style. Setting the lock's own with `!important` would win over the app's choice too                         |
| `position: fixed` elements that do not use `--hidden-scrollbar-width` | They widen by the scrollbar's width while locked; see Decisions                                                                     |
| A popup in an iframe                                                  | It locks its own document, not the page around the iframe                                                                           |
| Firefox and WebKit                                                    | Tests run in Chromium (PLAN.md section 5). #94 ran the `overflow: hidden` rule in all three engines                                 |

## iOS Safari

Tried on 2026-11-22 on an iPhone 17 with iOS 26.5.1, in Safari and in
Chrome, which runs on WebKit there, against a test page over the local
network: a page taller than the screen and a modal dialog with an input
and a scrollable area, opened partway down the page. Not tried on an older
iOS.

What the module of #113 did, with `overflow: hidden` on `<html>` only:
the computed `overflow` of `<html>` was `hidden`, yet a drag on the
backdrop scrolled the page, in Safari and in Chrome. While the page
coasted, a drag on the scrollable area scrolled the page too, until it
stopped.

Each candidate added to that, with the dialog open:

| Candidate                                            | Drag on the backdrop | Scrollable area | Drag on the dialog's text | Keyboard open | Zoomed in                               |
| ---------------------------------------------------- | -------------------- | --------------- | ------------------------- | ------------- | --------------------------------------- |
| `overflow: hidden` on `<body>` too                   | Page scrolls         |                 |                           |               | The dialog moved off centre             |
| `overscroll-behavior: none` on `<html>` and `<body>` | Page scrolls         |                 |                           |               | The dialog moved off centre             |
| `<body>` pinned with `position: fixed` (no module)   | Still                | Does not scroll |                           |               |                                         |
| `touch-action: pinch-zoom` on `::backdrop`           | Still                | Scrolls         | Still                     |               | Safari's toolbar resized during drags   |
| `overscroll-behavior: contain` on the dialog         | Still                | Scrolls         | Still                     | Page scrolls  | Page scrolls                            |
| `touch-action: pinch-zoom` on the dialog             | Still                | Scrolls         | Still                     | Still         | Two fingers pan and can scroll the page |

A dialog taller than the screen still scrolled with `touch-action:
pinch-zoom` on it in Safari, unlike in Chromium (see Decisions), and with
`overscroll-behavior: contain`.

The module as built here, with `contain` and the `touch-action` check of
Decisions. A first pass without `contain` failed step 3: with the keyboard
open the dialog no longer fitted, so it scrolled by touch, and at its end
the page scrolled; with `contain` it stopped.

| Step                                                     | Safari                          | Chrome       |
| -------------------------------------------------------- | ------------------------------- | ------------ |
| 1. Drag on the backdrop: the page stays                  | Passes                          | Passes       |
| 2. Drag in the scrollable area: it scrolls, the page not | Passes                          | Passes       |
| Drag on the dialog's text: the page stays                | Passes                          | Page scrolls |
| 3. Keyboard open, drag: the page stays                   | Passes                          |              |
| 4. Zoomed in: the view pans                              | With two fingers; see Decisions |              |
| 5. Closed: the page is where it was, and scrolls again   | Passes                          |              |
| A dialog taller than the screen scrolls                  | Passes                          |              |

## Size

Measured as `test/bundle-size` measures a module (`floatingBudgets.ts`):
Rolldown, minified, gzipped, Solid left out.

Measured on 2026-11-22.

| File            | Size  | Budget |
| --------------- | ----- | ------ |
| `scrollLock.ts` | 821 B | 950 B  |

Dialog imports it, and Alert Dialog will; `test/bundle-size/popupModules.ts`
checks that Popover and Tooltip do not.
