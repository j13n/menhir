# Preview Card

A card that previews where a link leads, such as a person's profile or the
first lines of an article, shown when the pointer rests on the link or when
it receives keyboard focus. No WAI-ARIA pattern exists; WCAG 1.4.13 sets what
it must do. The third popup that opens on hover, after Tooltip (#34) and
Navigation Menu (#105).

What separates it from its neighbours, one sentence each:

- **A tooltip** describes its trigger, in a few words, and holds nothing to
  press.
- **A popover** opens on a press, takes focus, and holds content that is
  nowhere else.
- **A preview card** shows what is behind a link, and everything in it is
  also reached by following the link.

## Sources

In order of precedence (PLAN.md section 8).

| Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Read       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 2026-11-25 |
| No WAI-ARIA pattern. WCAG 2.2 [Understanding 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) (updated 2026-07-12). Dismissible: "without moving pointer hover or keyboard focus", "such as pressing the Esc key". Hoverable: "the pointer can be moved over the additional content without the additional content disappearing". Persistent: it "remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid". "Content which can be triggered via pointer hover should also be able to be triggered by keyboard focus." Nothing on focus moving into the content, on delays or on touch | 2026-11-25 |
| Size: PLAN.md section 6, rules 3, 4 and 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 2026-11-25 |
| [Selectors Level 4](https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo) (Editor's Draft): `:focus-visible` matches after keyboard focus and not after a mouse press on a link; Baseline Widely available                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 2026-11-25 |
| [HTML](https://html.spec.whatwg.org/multipage/grouping-content.html#the-p-element), the `p` element: a `<p>` holds phrasing content only, and the parser closes an open `<p>` at a `<div>` start tag                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 2026-11-25 |

## Shape

`PreviewCard.Root` renders no element: it holds the open state and the
delays. `PreviewCard.Trigger` renders a native `<a>`, the link previewed.
`PreviewCard.Popup` renders a `<div popover="manual">`, placed against the
Trigger, and inside it `PreviewCard.Arrow` renders a `<div>` that points at
the Trigger.

```tsx
<p>
  Built by{" "}
  <PreviewCard.Root>
    <PreviewCard.Trigger href="/people/ada">Ada</PreviewCard.Trigger>
    <PreviewCard.Popup sideOffset={8} render={(p) => <span {...p} />}>
      <PreviewCard.Arrow render={(p) => <span {...p} />} />
      <img src="/people/ada.png" alt="" /> Ada Lovelace, analyst
    </PreviewCard.Popup>
  </PreviewCard.Root>
  .
</p>
```

What the browser does, the `floating` layer adds, and the parts decide:

- **The browser** (`popover="manual"`, #94): the top layer, with no portal.
  A `manual` popover is not closed by Escape, a press outside or another
  popover opening, so it neither closes nor is closed by a Popover or a
  menu. The link navigates on its own press.
- **The `floating` layer**: `hover` (opening after the delay, closing when
  the pointer leaves the Trigger and the Popup, with the safe area between
  them) and `escape` from the Root, presence and `positioning` with
  `offset`, `flip` and `shift` from the Popup, and `arrow` from the Arrow.
  Nothing wraps Tab, locks the page's scroll or closes on a press outside,
  and no list: `menhir/preview-card` bundles no module of `focus`, no
  `scroll-lock`, `outsidePress`, `dialogClose`, `popoverClose`,
  `hover/group`, `list-navigation` or `typeahead`
  (`test/bundle-size/popupModules.ts`).
- **The parts**: opening on keyboard focus after the delay, closing when
  focus leaves the Trigger and the Popup, keeping it open while either is
  hovered or holds keyboard focus, closing it when the link is pressed, and
  returning focus to the link from a card that closes while it holds focus.

### Decisions

"Popups that open on hover and focus" (PLAN.md section 8), decided with
Tooltip, one by one:

- **Parts: changed.** Root, Trigger, Popup and Arrow, a positioned popup's
  (PLAN.md section 8, "Positioned popups"), with no Title, Description or
  Close: the card names nothing, and nothing in it needs a close button,
  since moving away or Escape closes it. **No Positioner**: the Popup is
  the element positioned, as in every positioned popup. **No Group**: a
  delay group suits a row of triggers the pointer runs along, such as a
  toolbar; links that preview are spread through text (Left out).
- **The state and delays are on the Root: holds**, with longer delays.
  `delay` defaults to 700 ms, longer than a tooltip's 600, since a card
  covers more of the page and a pointer crossing a paragraph passes over
  many links; `closeDelay` defaults to 300 ms, since a card is large, and a
  pointer on its way to a far corner of it may slip out of the safe area
  for a moment.
- **Opening on hover: holds** (`trigger-hover`). A mouse or a pen opens it;
  a touch does not, and a tap follows the link (#30).
- **Opening at once on keyboard focus: changed.** Keyboard focus, focus that
  matches `:focus-visible`, opens it after `delay`, as hover does
  (`trigger-focus`): opened at once, Tab through a paragraph of links would
  open and close a card at each stop. WCAG 1.4.13 asks that what hover
  shows, focus shows too. A press that focuses the link opens nothing.
- **Closing on Escape: holds** (`escape-key`; WCAG 1.4.13, dismissible).
  Focus does not move, unless it was inside the Popup: then it returns to
  the Trigger. Chromium leaves focus on the `<body>` when a `manual` popover
  that holds it is hidden (checked on 2026-11-25), so the Root moves it,
  for any close, as the card's state turns closed. The focus returned opens
  nothing, or Escape would be undone after the delay. Escape on the Trigger
  while keyboard focus waits out the delay cancels the opening, so a card
  is dismissed before it shows as well as after.
- **Closing on blur: changed.** Focus may move into the card, so it closes
  when focus leaves both the Trigger and the Popup: blur of the Trigger
  reports `trigger-focus`, as for a tooltip, and focus leaving the Popup
  for an element outside both reports `focus-out`. Focus moving between
  them closes nothing.
- **Closing when the pointer leaves: holds** (`trigger-hover`), after
  `closeDelay`, with the safe area to the Popup (WCAG 1.4.13, hoverable).
- **Closing on a press of the Trigger: holds** (`trigger-press`). The link
  keeps its own press: nothing calls `preventDefault()`, so it navigates.
  In an app that keeps the link on screen, such as a client-side route
  change or a link opened in a new tab, the card would otherwise cover the
  page the user went to. A press before the delay ends cancels the opening
  until the pointer leaves and comes back.
- **Hovered or focused keeps it open: holds, widened to the Popup** (WCAG
  1.4.13, persistent). The close from hover is ignored while the Trigger or
  an element in the Popup has keyboard focus, and the close on blur while
  the pointer is on the Trigger or the Popup (`:hover`).
- **The description link: changed. A screen reader is told nothing.** The
  Trigger has no `aria-describedby`, `aria-haspopup`, `aria-expanded` or
  `aria-controls`, and the Popup no role. The card is extra: what it shows
  is behind the link. A description would read the whole card after the
  link's name at every visit, and `aria-haspopup` promises a popup that a
  press opens, where a press here follows the link. While open, the card is
  in the page's order after the Trigger, so a screen reader's virtual
  cursor reads it there.
- **No focus in the popup: changed. Focus may move into it, never by
  itself.** Opening leaves focus where it is. The Popup is not `inert`, so
  a link or a button in the card is pressed by pointer and reached by Tab
  in the document's order: placed right after the Trigger, Tab from the
  Trigger moves into an open card. Nothing in it is needed, since it is
  all behind the link, so a closed card that Tab passes over loses nothing.
- **A disabled trigger opens nothing: does not apply.** A link has no
  `disabled`.
- **The Trigger renders any element: changed to a link.** It renders an
  `<a>`, whose `href` the consumer passes. `render` may render a router's
  link component; no warning is given for another element, as on Tooltip's
  Trigger. It sets no `type` of its own, where Tooltip's sets
  `type="button"`.
- **`popover="manual"`: holds.** **`side` defaults to `"bottom"`**, as on
  Popover: a card reads as what follows the link, below the line, and above
  it would cover the text just read.
- **The server renders a `defaultOpen` card closed, and hydration opens it:
  holds.** **Exit animations** run for every close, through presence.
- **Scrolling closes nothing of its own: holds.** It follows its Trigger.
- **A link inside a paragraph.** The server HTML cannot hold a `<div>`
  inside a `<p>`: the browser's parser closes the paragraph at the `<div>`,
  and hydration finds another tree. A card for a link in running text
  renders its Popup as a `<span>` (`render`) and its content as phrasing
  elements (`<span>`, `<img>`, `<strong>`), styled as blocks, and its Arrow
  as a `<span>` too. A popover is `position: fixed`, so a `<span>` Popup is
  laid out as a block anyway. With the hydrate test's Popup rendered as a
  `<div>`, the paragraph broke and so did the hydration of what follows it
  (checked on 2026-11-25); as a `<span>`, which the test keeps, the
  paragraph stays whole. The Popup stays a `<div>` by default, as every popup's,
  since a card outside a paragraph holds blocks.
- **It builds on no popup, only on `floating`, as Tooltip does** (PLAN.md
  section 6, rule 4). Measured on 2026-11-25 both ways, in bytes gzipped
  with Rolldown as `test/bundle-size/pairSize.test.ts` measures, through a
  module that re-exports the entry points, which adds 9 B to an entry
  point's size, and before Escape cancelled a pending opening, which later
  added the same to both ways. On `floating` alone, Preview Card was
  9,799 B and with Tooltip 10,275 B, 482 B over Tooltip's 9,793 B. On Tooltip, its Root providing Tooltip's context, its Popup
  calling Tooltip's with no role and `side` `"bottom"`, and Tooltip's Arrow
  re-exported, it was 9,885 B alone and 10,244 B with Tooltip. Building on
  Tooltip saves an app with both 31 B and costs an app with Preview Card
  alone 86 B: the code the two share is `floating`'s already (positioning,
  hover, presence, Escape), and what is left is each component's own. It
  would also tie Preview Card to Tooltip's Popup, which holds no focus and
  describes its Trigger, and give it Tooltip's development messages. The
  two are measured together all the same: `floatingNeighbours` in
  `packages/menhir/layers.ts` holds the pair to a margin of 650 B over
  Tooltip alone (`test/bundle-size/pairSize.test.ts`).
- **Loading the card's content is the app's**, not a feature: the Popup is
  in the document while closed, so content that should wait for the first
  opening reads `open` from `onOpenChange` into an async memo under
  `<Loading>`. The docs page has the example.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks every part that renders
an element against the part conventions. "W" marks a case of WCAG 1.4.13,
"C" a case that runs only in Chromium (`it.skipIf(isJSDOM)`): jsdom has no
`popover`, no layout, no real pointer, and matches `:focus-visible` on any
focus and `:hover` never. Hover in jsdom comes from Testing Library's
pointer events with fake timers; real pointer movement from the Chrome
DevTools Protocol (`test/floating/input.ts`). In jsdom an opened popover gets
`:popover-open` from a stub (`test/popover/stubPopover.ts`).

`root/PreviewCardRoot.test.tsx`

- Renders no element of its own: its children are rendered in its place
- Closed by default: the Popup is not shown, and every part has `data-closed`
- `defaultOpen` starts open: the Popup is shown, and every part has `data-open`
- Opens after 700 ms of a mouse resting on the Trigger, and reports `trigger-hover` with the `pointerenter`
- Closes 300 ms after the pointer leaves the Trigger, reporting `trigger-hover`; the pointer coming back within it keeps it open
- `delay` and `closeDelay` change the delays
- Escape closes it, reporting `escape-key`, and focus stays on the Trigger (W: dismissible)
- Controlled open: hover leaving and Escape only ask, and it stays open
- Controlled closed: hover and focus only ask, and it stays closed
- Follows a controlled value changed from outside, showing and hiding the Popup
- Disposed while a delay is pending, nothing opens and no timer is left
- Opens before async work that `onOpenChange` starts settles (PLAN.md "API conventions")

`trigger/PreviewCardTrigger.test.tsx`

- Renders a link with the consumer's `href`, named by its content, with no `type`
- Has no `aria-describedby`, `aria-haspopup`, `aria-expanded` or `aria-controls`, and no accessible description
- Keyboard focus opens it after `delay`, not before, reporting `trigger-focus` with the `focus`; with `delay={0}` at once
- Blur before the delay ends opens nothing, nor does Escape before it ends (W: dismissible)
- Tab onto the Trigger opens it after the delay, and Tab away to an element outside closes it, reporting `trigger-focus` (C)
- A press that focuses the Trigger does not open it (C)
- A press closes the open card, reporting `trigger-press`, and does not cancel the link's click
- A press before the hover delay ends opens nothing until the pointer leaves and comes back
- A tap opens nothing (C)
- Opened by focus, it stays open when the pointer enters and leaves the Trigger, and closes on blur (W: persistent; C)
- Opened by hover, it stays open when the Trigger loses focus while the pointer rests on it, and closes when the pointer leaves (W: persistent; C)
- Calls the consumer's `onClick`, `onFocus` and `onBlur`
- `render` with a component that renders an `<a>` keeps the Trigger's behaviour
- Throws a descriptive error outside `PreviewCard.Root`

`popup/PreviewCardPopup.test.tsx`

- Renders a `<div popover="manual">` with no role, hidden until opened
- Opened, it is in the top layer, above an element with a high `z-index` (C)
- Opening leaves focus on the Trigger (C)
- Tab from the Trigger moves into an open card, which stays open; Tab out of it to an element outside closes it, reporting `focus-out`; Shift+Tab back to the Trigger keeps it open (C)
- Escape with focus inside the card closes it and returns focus to the Trigger, which does not open it again (W: dismissible; C)
- Opened by focus, it stays open while the pointer moves onto the card and away, and closes when focus leaves (W: persistent; C)
- The pointer may move from the Trigger across the gap onto the Popup, and it stays open, then closes once the pointer leaves both (W: hoverable; C)
- A button in the card is pressed by pointer, the card stays open until the pointer leaves, then focus returns to the Trigger (C)
- Placed below the Trigger by default, and on each `side`, with `data-side` and `data-align` (C)
- `sideOffset` moves it away from the Trigger (C)
- At the bottom edge of the viewport it flips above (C)
- `anchor` places it against another element (C)
- Stays open when a Popover opens, and a Popover stays open when it opens (C)
- Stays shown, with `data-closed`, while its exit animation runs after Escape, then hides (C)
- `render` with a `<span>` keeps its behaviour
- Throws a descriptive error outside `PreviewCard.Root`

`arrow/PreviewCardArrow.test.tsx`

- Renders an `aria-hidden` `<div>`
- Points at the Trigger's center, with the Popup's `data-side` and `data-align` (C)
- Throws a descriptive error outside `PreviewCard.Popup`

`test/preview-card/PreviewCard.hydrate.test.tsx`

- The server HTML of a closed card has the link with its `href` and a hidden popover with `data-closed`, before any script runs (PLAN.md section 10)
- The server HTML of a `defaultOpen` card has a hidden popover with `data-open` and no position
- A card for a link inside a paragraph, its Popup rendered as a `<span>`, keeps the paragraph whole in the server HTML
- Hydration adopts the server's elements without warnings; a `defaultOpen` card is then shown and placed
- After hydration the card opens on hover and on keyboard focus (C)

`test/bundle-size`

- `menhir/preview-card` bundles no focus wrap, no scroll lock, no list navigation, no typeahead, no dialog or popover dismissal and no hover group (`popupModules.ts`)
- Tooltip and Preview Card imported together cost at most 650 B more than Tooltip alone (`pairSize.test.ts`, `floatingNeighbours`)
- The comparison maps Preview Card to each library's module (`comparison.test.ts`)

## Left out

| Case                                                       | Reason                                                                                                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Group, with the delay group of Tooltip's                 | Links that preview sit apart in text, not in a row the pointer runs along. `hover/group` is ready if an app asks                                                                |
| Opening on a long press, or on a tap                       | A tap follows the link, and a long press brings up the browser's own link menu, which some browsers fill with their own preview (#30)                                           |
| Initial focus in the card, or a modal card                 | The card is extra and opens on hover: focus moved into it would take the user away from where they were. Content a user must reach goes in a Popover; a modal popup is a Dialog |
| `aria-describedby`, `aria-haspopup` or a role on the Popup | See "Decisions": a screen reader is told nothing                                                                                                                                |
| A Trigger outside the Root, or several Triggers            | As for the other popups (PLAN.md section 8, "Popups"). Put one Root around each link                                                                                            |
| A `disabled` prop on the Root                              | A controlled `open={false}` keeps it closed; a flag would ship in every app (PLAN.md section 6, rule 6)                                                                         |
| Closing on a press outside                                 | Moving the pointer away closes it, and Escape. A press outside the card while the pointer is over neither part has already closed it                                            |
| Loading the content as a feature                           | The app's async memo under `<Loading>` does it in a few lines (docs page)                                                                                                       |
| `size` and `hide` middleware                               | As on Popover: no part carries them, and a prop would be a flag                                                                                                                 |
| `popover="hint"` and `interestfor`                         | Not Baseline (#94)                                                                                                                                                              |
| Tried with screen readers                                  | Not yet: the Trigger has no description in the tests' accessibility queries, as a plain link. VoiceOver, NVDA and JAWS are still to be tried                                    |
| Firefox and WebKit                                         | Tests run in Chromium (PLAN.md section 5). #94 ran a `manual` popover in all three engines; `:focus-visible` and `:hover` are Widely available                                  |

## Browsers and screen readers

Tried on 2026-11-25 in Chromium (Playwright's headless build, through the
test suite). Screen readers, other browsers and real devices have not been
tried yet: that needs a person (#217).

## Size

Measured as `test/bundle-size` measures an entry point: an app that uses
every part, Rolldown, minified, gzipped, Solid left out. Measured on
2026-11-25.

| Entry point           | Size    | Budget  |
| --------------------- | ------- | ------- |
| `menhir/preview-card` | 9,821 B | 11.5 kB |

Most of it is `@floating-ui/dom`, as for Tooltip (9,784 B): `createPosition`
with `offset`, `flip` and `shift`, and the `arrow` middleware from the Arrow.
The rest is `hover` (905 B in #30, the safe area included), `escape`
(344 B), presence and the parts. An app with Tooltip as well pays 507 B
more than for Tooltip alone (see "Decisions").
