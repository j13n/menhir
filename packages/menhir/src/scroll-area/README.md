# Scroll Area

A native scroller whose scrollbars are the page's own (#208, part of
#150): the system's scrollbars are hidden, and a Scrollbar with a Thumb is
drawn beside the scroller for each axis. Scrolling stays the browser's, by
wheel, touch, keyboard and `scrollIntoView`; the component draws the
scrollbars, keeps them in step and lets them be pressed and dragged.

Try a styled native scroller first: `overflow: auto` with
`scrollbar-width` and `scrollbar-color` needs no JavaScript and no
component. The recipe is on the docs page ("A styled native scroller") and
in the styling skill's looks. The component is for what the recipe cannot
do: a thumb of any shape, a scrollbar that overlays the content on every
system, one that shows only on hover or while scrolling. Whether it is
still needed beside the recipe was decided on 2026-11-25, when the
component was asked for: it is.

## Sources

In order of precedence (PLAN.md section 8). There is no WAI-ARIA pattern:
the custom scrollbar is hidden from assistive technology, and the viewport,
a plain scroller, is what the keyboard and screen readers reach.

| Source                                                                                                                                                                                                                                                                 | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1): `onSettled` for work once mounted, which does not run on the server; writes from event handlers, observers and timers, never in a component body                               | 2026-11-25 |
| [CSS Scrollbars Styling Module Level 1](https://drafts.csswg.org/css-scrollbars/) (Editor's Draft): `scrollbar-width: auto \| thin \| none`, where `none` hides the scrollbar but the element still scrolls; `scrollbar-color: <thumb> <track>`                        | 2026-11-25 |
| [CSS Overflow Module Level 3](https://drafts.csswg.org/css-overflow/) (Editor's Draft): `overflow: auto`, `scrollbar-gutter: stable`, and the scroll position, which runs from 0 to negative in a right-to-left box                                                    | 2026-11-25 |
| [WCAG 2.2, Understanding 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html): all content operable by keyboard. A scroller whose content has nothing focusable must take focus itself for the keys to scroll it                                 | 2026-11-25 |
| [ARIA in HTML](https://www.w3.org/TR/html-aria/) and [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#generic): naming is prohibited on the `generic` role a `<div>` has, so a named scroller needs a role; `region` is the landmark for a named section of the page | 2026-11-25 |
| Baseline status from `web-features` 3.47.0 (PLAN.md section 5), below                                                                                                                                                                                                  | 2026-11-25 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                | 2026-11-25 |

## The platform first

Baseline status on 2026-11-25 (`web-features` 3.47.0), and what a browser
without the feature shows:

| Feature                  | Status                                                                                  | Without it                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `scrollbar-width`        | Newly available since 2024-12-11 (Safari 18.2), Widely from 2027-06-11                  | The system's scrollbar, at its own width                                             |
| `scrollbar-color`        | Newly available since 2025-12-12 (Safari 26.2), Widely from 2028-06-12                  | The system's scrollbar, in its own colours                                           |
| `scrollbar-gutter`       | Newly available since 2024-12-11 (Safari 18.2), Widely from 2027-06-11                  | No space kept for a classic scrollbar, so the content gets narrower when one appears |
| `overscroll-behavior`    | Not Baseline: `web-features` lists no Safari version, for the property or its longhands | A scroll that reaches the end goes on to the page, which is the default              |
| `ResizeObserver`         | Widely available since 2023-01-28                                                       | (used without a fallback)                                                            |
| `min-width: fit-content` | Widely available since 2024-05-02                                                       | (used without a fallback)                                                            |
| `setPointerCapture`      | Widely available (Pointer Events)                                                       | (used without a fallback)                                                            |

So the recipe's CSS may use all four of the first: a browser without them
shows the system's scrollbar, which is fine.

Checked on 2026-11-25 in Playwright's Chromium 159, Firefox 159 and WebKit
27.2, with a throwaway page (not kept):

| Case                                                                                 | What the browsers do                                                                                                         |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `CSS.supports("scrollbar-width", "none")`                                            | `true` in all three                                                                                                          |
| A classic scrollbar's width, and with `scrollbar-width: none`                        | 15 px in Chromium with scrollbars shown, 0 with `none`. Firefox and WebKit headless draw overlay scrollbars, 0 px either way |
| Tab from a button before a scroller with no `tabindex`                               | Chromium and Firefox focus the scroller; WebKit skips it. So the recipe and the component give it `tabindex="0"`             |
| A wheel over an element beside the scroller, such as a scrollbar drawn over its edge | The page scrolls, not the scroller, in all three: the element is not inside the scroller                                     |
| `scrollLeft` of a right-to-left scroller                                             | 0 at the start, running negative to the end, in all three                                                                    |

## Shape

`ScrollArea.Root` renders a `<div>`, `Viewport` the scroller, a `<div>`,
`Content` a `<div>` inside it, and `Scrollbar` a `<div>` with its `Thumb`,
a `<div>`, inside. The parts are exported through a namespace re-export,
and the component imports only `core`.

```tsx
<ScrollArea.Root>
  <ScrollArea.Viewport aria-label="Release notes">
    <ScrollArea.Content>…</ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
```

- **Parts.** Root holds the measurements and is what the Scrollbars are
  positioned in. The Viewport is the scroller, and the consumer gives it
  `overflow: auto` and a size: it is not set inline, so that a class such
  as `overflow-x-hidden` still clips one axis. Content is what the
  `ResizeObserver` watches beside the Viewport, so the thumb follows
  content that changes size; it has `min-width: fit-content`, so that
  content wider than the viewport widens it too and is seen. A Scrollbar
  per axis, `orientation` `"vertical"` (the default) or `"horizontal"`, and
  its Thumb. **No Corner part**: the square where two scrollbars meet
  carries no state the Root's attributes do not, so it is a plain element
  shown with `[data-overflow-x][data-overflow-y]`.
- **Hiding the system's scrollbar.** Once mounted, and while at least one
  Scrollbar is mounted, the Viewport gets `scrollbar-width: none` inline,
  if `CSS.supports("scrollbar-width", "none")`. `scrollbar-width` is
  Newly available, so it is an exception to PLAN.md section 5: a browser
  without it, Safari before 18.2, keeps the system's scrollbar and the
  component draws none, so there are never two. `none` hides both axes, so
  render a Scrollbar for each axis that can overflow, or clip the other
  with `overflow-x: hidden`. A Viewport without a Scrollbar keeps the
  system's, for an area that only wants the attributes, such as fades.
- **The server HTML** scrolls with the system's scrollbar, which is hidden
  only once the component's can replace it, after hydration. The other way,
  hiding it in the server HTML, would leave a page whose script is slow or
  fails with a scroller that shows nothing of its length. On a system with
  classic scrollbars the content gets wider by the scrollbar's width at
  hydration; overlay scrollbars take no width.
- **The thumb's size and place** are CSS variables on its Scrollbar,
  inherited by the Thumb: `--thumb-size`, the viewport's share of the
  content along the axis as a percentage of the track (`25%`), and
  `--thumb-position`, how far the area is scrolled from the axis's start,
  a number from 0 to 1. The consumer sizes and places the Thumb with them:
  `height: var(--thumb-size); top: calc((100% - var(--thumb-size)) *
var(--thumb-position))`, with `max()` for a smallest thumb and
  `inset-inline-start` across, which mirrors right to left by itself. The
  track's length is never read to draw the thumb, so the Scrollbar may be
  any size.
- **Measuring.** A `ResizeObserver` on the Viewport and the Content reads
  the viewport's client size and the content's scroll size when either
  changes, and the Viewport's `scroll` event reads the scroll position
  only. No layout is read on each frame. Overflow of 1 px or less does not
  count, so a fractional size or a zoom level that rounds the content one
  pixel past the viewport makes no scrollbar.
- **The pointer**, on the Scrollbar:
  - A press on the Thumb and a drag move it with the pointer, captured, so
    the drag goes on outside the scrollbar, scrolling the viewport by the
    content's length over the track's for each pixel.
  - A press on the track scrolls one page towards the pointer, a page being
    seven eighths of the viewport, so a line stays in view, and, held,
    again after 400 ms and then every 60 ms until the thumb reaches the
    pointer, as the system's scrollbars do by default on Windows and macOS.
    With Alt (Option on macOS) or Shift, the thumb jumps so that its centre
    is under the pointer, and the press goes on as a drag, as those keys
    switch the system's scrollbars to on macOS and Windows.
  - Right to left: `scrollLeft` runs negative, and in both directions it
    grows as the thumb moves right, so a drag and a press need no case for
    it; `--thumb-position` is the distance from the start, `|scrollLeft|`.
  - `touch-action: none` on the Scrollbar, so a touch drag on it moves the
    thumb and does not scroll the page; the Scrollbar cancels
    `pointerdown`, so nothing is selected and focus stays where it was.
  - A wheel over a Scrollbar scrolls the viewport: the Scrollbar is beside
    the scroller, not inside it, and the browser would scroll the page (the
    table above). The Scrollbar scrolls the viewport by the wheel's delta,
    in lines (16 px) or pages where the wheel says so, and cancels the
    wheel only if the viewport moved, so at the end the page scrolls on.
- **Assistive technology and the keyboard.** The Scrollbars are
  `aria-hidden="true"` and hold nothing focusable. The Viewport is the
  scroller: `role="region"`, named by the consumer's `aria-label` or
  `aria-labelledby`, and `tabindex="0"` while either axis overflows, so the
  arrow keys, Page Up, Page Down, Home, End and Space scroll it in every
  browser, WebKit included; one that does not overflow is not a tab stop.
  A consumer's `role` or `tabindex` wins.
- **When scrollbars show is styling.** A Scrollbar is rendered only while
  its axis overflows and the system's scrollbar is hidden, so it need not
  be hidden by CSS when there is nothing to scroll. Attributes on every
  part: `data-scrolling` while the area scrolls, cleared 150 ms after the
  last `scroll` event; `data-overflow-x` and `data-overflow-y` while that
  axis overflows; and `data-overflow-x-start`, `data-overflow-x-end`,
  `data-overflow-y-start` and `data-overflow-y-end` while there is content
  hidden past that edge, start and end in the writing direction across. A
  Scrollbar and its Thumb have `data-vertical` or `data-horizontal`. **No
  `data-hovering`**: `:hover` on the Root matches the same, in the server
  HTML too, and `@media (hover: hover)` keeps it off touch screens, as
  `:focus-visible` stands in for a `data-focus-visible` (PLAN.md section 8).
  No `type` prop: "always", "on hover" and "while scrolling" are CSS on
  these.
- **Shadows or fades at the edges** are CSS on the edge attributes, such as
  a gradient on the Root's `::after` while `data-overflow-y-end`: an
  example on the docs page, not a feature.
- **Zoom and fractional sizes.** The variables are ratios, so the thumb is
  right at any zoom; the 1 px tolerance above keeps a rounding from making
  a scrollbar.
- **Touch devices.** The thumb can be dragged by touch, but on a phone the
  system's overlay scrollbar, shown while scrolling, may be the better one.
  To keep it there, hide the Scrollbars and set `scrollbar-width: auto
!important` on the Viewport under `@media (pointer: coarse)`.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. jsdom lays nothing out and has no `ResizeObserver`, so
it is stood in for there, and the layout, scrolling and pointer cases run
in Chromium only (`it.skipIf(isJSDOM)`), with real mouse and touch input
through the DevTools protocol, as Slider's tests do. Chromium runs with
classic scrollbars shown (PLAN.md section 7).

`root/ScrollAreaRoot.test.tsx`

- Renders a `<div>` with its children
- `data-overflow-y` while the content is taller than the viewport, and not once it fits; `data-overflow-x` the same across (Chromium)
- Overflow of 1 px or less counts as none (Chromium)
- `data-overflow-y-start` once scrolled down, `data-overflow-y-end` until the end is reached; across, the same from the inline start, right to left too (Chromium)
- `data-scrolling` while the viewport scrolls, cleared once it has stopped (Chromium)
- The attributes are on every part (Chromium)

`viewport/ScrollAreaViewport.test.tsx`

- Renders a `<div>` with `role="region"`, named by the consumer's `aria-label`
- `tabindex="0"` while it overflows, and none while it fits; the consumer's `tabindex` wins (Chromium)
- `scrollbar-width: none` once a Scrollbar is mounted, and the system's scrollbar takes no width; none without a Scrollbar (Chromium)
- Keeps the system's scrollbar, and the Scrollbars are not rendered, where `CSS.supports("scrollbar-width", "none")` is false (Chromium)
- The keys scroll it once focused (Chromium)
- Throws a descriptive error outside `ScrollArea.Root` (PLAN.md section 8)

`content/ScrollAreaContent.test.tsx`

- Renders a `<div>` with `min-width: fit-content`
- The thumb follows content that grows and shrinks, without the viewport changing size (Chromium)
- Content wider than the viewport makes it overflow across (Chromium)

`scrollbar/ScrollAreaScrollbar.test.tsx`

- Renders nothing before the area has measured it, as in the server HTML
- Rendered only while its axis overflows: a vertical one for tall content, a horizontal one for wide content (Chromium)
- `aria-hidden="true"`, `data-vertical` or `data-horizontal`, `touch-action: none` (Chromium)
- `--thumb-size` is the viewport's share of the content, and `--thumb-position` follows the scroll from 0 to 1 (Chromium)
- `--thumb-position` across is the distance from the start right to left, where `scrollLeft` is negative (Chromium)
- A press on the track above or below the thumb scrolls a page that way (Chromium)
- Held, the press scrolls again until the thumb reaches the pointer, and stops on release (Chromium)
- With Shift or Alt, the press puts the thumb's centre under the pointer and goes on as a drag (Chromium)
- A press on the track across scrolls a page towards the pointer, left to right and right to left (Chromium)
- Takes a new press after it was taken out in the middle of a held press, which then gets no `pointerup` (Chromium)
- A wheel over it scrolls the viewport and is cancelled; at the end it is not, so the page scrolls on (Chromium)
- Throws a descriptive error outside `ScrollArea.Root` (PLAN.md section 8)

`thumb/ScrollAreaThumb.test.tsx`

- Renders a `<div>` with its Scrollbar's `data-vertical` or `data-horizontal` (Chromium)
- A drag scrolls the viewport by the content's length over the track's per pixel, goes on outside the scrollbar, and ends on release (Chromium)
- A drag across scrolls towards the pointer, left to right and right to left (Chromium)
- A touch drag on the thumb scrolls the viewport, not the page (Chromium)
- The press selects nothing and moves no focus (Chromium)
- Throws a descriptive error outside `ScrollArea.Scrollbar` (PLAN.md section 8)

`test/scroll-area/ScrollArea.hydrate.test.tsx`

- The server HTML has the Viewport with `role="region"`, its name and no `scrollbar-width`, the Content, and no Scrollbar, so the system's scrollbar shows before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings; afterwards the system's scrollbar is hidden, the Scrollbar appears with its thumb, and content added later grows the thumb's track share down (Chromium)

## Left out

| Case                                                             | Reason                                                                                                                                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-hovering`                                                  | `:hover` on the Root does it, in the server HTML too (Shape)                                                                                                                                      |
| A `type` prop ("always", "hover", "scroll", "auto")              | CSS on the attributes does each                                                                                                                                                                   |
| A Corner part                                                    | A plain element shown with the Root's `[data-overflow-x][data-overflow-y]` (Shape)                                                                                                                |
| A `data-dragging` attribute on the Thumb                         | `:active` on the Thumb matches while it is held. Add it if a consumer finds a case `:active` misses                                                                                               |
| Hiding the system's scrollbar where `scrollbar-width` is missing | `::-webkit-scrollbar` is not a standard and needs a stylesheet. Without `scrollbar-width` the component draws nothing and the system's scrollbar stays (Shape)                                    |
| Smooth scrolling on a track press or a wheel over the Scrollbar  | Both scroll at once (`behavior: "instant"`), so a press held down measures the thumb where it is. The viewport's own wheel, touch and key scrolling is the browser's, smooth where the browser is |
| The system's setting for a track press (page or to the point)    | No browser exposes it. The default of Windows and macOS is followed, with their modifier for the other                                                                                            |
| Vertical writing modes                                           | `scrollTop` and `scrollLeft` swap roles; no app has asked                                                                                                                                         |
| Scroll position as a prop, or a scroll-to method                 | The Viewport is a plain scroller: `ref` gives the element, and `scrollTo`, `scrollIntoView` and `scrollTop` are the browser's                                                                     |
| Keyboard behaviour of the Scrollbar                              | It is hidden from assistive technology and not a tab stop; the Viewport takes the keys, and the browser scrolls it                                                                                |
| A development warning for a Viewport without a name              | The name may come from `aria-labelledby` on an element rendered later, and a region without a name is still a scroller; the docs say what to pass                                                 |
| A real touch scroll, an overlay-scrollbar system                 | Chromium in the tests has classic scrollbars, and its touch input is synthetic. Tried by hand below                                                                                               |

## Browsers and screen readers

The tests run in jsdom and in Chromium through Playwright, with classic
scrollbars. The platform behaviour above was checked in Playwright's
Chromium, Firefox and WebKit. Real systems with overlay scrollbars (macOS,
iOS, Android), touch devices and screen readers have not been tried yet:
that needs a person (#223).
