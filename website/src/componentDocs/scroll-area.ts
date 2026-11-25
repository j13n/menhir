import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const scrollAreaDoc: ComponentDoc = {
  slug: "scroll-area",
  name: "Scroll Area",
  category: "Display",
  description:
    "A scrollable box with custom scrollbars that you style, over a native scroller that the browser scrolls. Wheel, touch, the keys and scrollIntoView stay the browser's: the component hides the system's scrollbars, draws a Scrollbar and Thumb of your own for each axis, keeps them in step and lets them be dragged and pressed, a page at a time or, with Shift or Alt, to the point. The Thumb takes its size and place from --thumb-size and --thumb-position, and the parts carry data-scrolling and data-overflow-* attributes, so when scrollbars show, on hover, while scrolling or always, and fades at the edges are your CSS. The server HTML scrolls with the system's scrollbar, which is hidden only once the component's can replace it after hydration: on a system with classic scrollbars the content gets that much wider then. A browser without scrollbar-width (Safari before 18.2) keeps the system's scrollbar, and no Scrollbar is drawn. The thumb is right at any zoom, since the variables are ratios, and overflow of 1 px or less, from a fractional size or a zoom level that rounds, draws no scrollbar. On a phone the system's overlay scrollbar may be the better one: under @media (pointer: coarse), hide the Scrollbars and give the Viewport scrollbar-width: auto !important.",
  tryFirst: {
    section: "native-scroller",
    text: "It needs no JavaScript. Use the component for what it cannot do: a thumb of any shape, a scrollbar that overlays the content on every system, or one that shows only on hover or while scrolling.",
  },
  anatomy: tsx`<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content />
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>`,
  api: [
    {
      part: "Root",
      description:
        "<div> around the Viewport and the Scrollbars: position it, and the Scrollbars inside it. It and every part carry data-scrolling while the area scrolls, cleared 150 ms after it stops; data-overflow-x and data-overflow-y while that axis overflows; and data-overflow-x-start, data-overflow-x-end, data-overflow-y-start and data-overflow-y-end while content is hidden past that edge, start and end in the writing direction across. None of them is in the server HTML. For scrollbars on hover, use :hover on the Root inside @media (hover: hover). Where two scrollbars meet, a plain element shown with [data-overflow-x][data-overflow-y] fills the corner.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the area with your own component. Read once.",
        },
      ],
    },
    {
      part: "Viewport",
      description:
        '<div> that scrolls: give it overflow: auto and a size. It has role="region", and tabindex="0" while it overflows, so the keys scroll it in every browser; name it with aria-label or aria-labelledby. Once a Scrollbar is mounted it gets scrollbar-width: none, which hides the system\'s scrollbars on both axes: render a Scrollbar for each axis that can overflow, or clip the other with overflow-x: hidden.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the scroller with your own component. Read once.",
        },
      ],
    },
    {
      part: "Content",
      description:
        "<div> inside the Viewport around what scrolls, with min-width: fit-content. The area watches its size, so the thumbs follow content that changes, such as items added or an image loading.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the content with your own component. Read once.",
        },
      ],
    },
    {
      part: "Scrollbar",
      description:
        "<div> for one axis, rendered only while that axis overflows and the system's scrollbars are hidden, with aria-hidden=\"true\", data-vertical or data-horizontal, and touch-action: none. It sets --thumb-size, the viewport's share of the content as a percentage of the track, and --thumb-position, how far the area is scrolled, from 0 at the start to 1 at the end. A press on the track scrolls a page towards the pointer, and again while held; with Shift or Alt the thumb jumps under the pointer and follows it. A wheel over it scrolls the Viewport.",
      props: [
        {
          name: "orientation",
          type: '"vertical" | "horizontal"',
          default: '"vertical"',
          description: "The axis it scrolls.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the scrollbar with your own component. Read once.",
        },
      ],
    },
    {
      part: "Thumb",
      description:
        "<div> that a drag moves, with its Scrollbar's data-vertical or data-horizontal. Size and place it with the variables: height: var(--thumb-size) and top: calc((100% - var(--thumb-size)) * var(--thumb-position)), with max(var(--thumb-size), 1.5rem) in both for a smallest thumb; across, width and inset-inline-start, which mirrors right to left by itself.",
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the thumb with your own component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves focus to the Viewport while it overflows. The Scrollbars are not tab stops.",
    },
    {
      keys: "Arrow keys",
      action: "Scroll the focused Viewport, as the browser does.",
    },
    {
      keys: "Page Up / Page Down / Space",
      action: "Scroll the focused Viewport by a page, as the browser does.",
    },
    {
      keys: "Home / End",
      action:
        "Scroll the focused Viewport to the start or the end, as the browser does.",
    },
  ],
  sections: [
    {
      id: "native-scroller",
      title: "A styled native scroller",
      text: 'Try this first: a scroller styled in CSS needs no component and no JavaScript. overflow: auto makes it scroll; scrollbar-width: thin and scrollbar-color (thumb, then track) style the system\'s scrollbar; scrollbar-gutter: stable keeps room for a classic scrollbar so the content does not move when one appears; overscroll-behavior: contain keeps a scroll at the end from going on to the page. Give it tabindex="0", since WebKit does not let the keys reach a scroller by itself, and with it role="region" and a name, aria-label or aria-labelledby. On 2026-11-25, scrollbar-width and scrollbar-gutter were Baseline newly available (since Safari 18.2), scrollbar-color too (since Safari 26.2), and overscroll-behavior was not Baseline; a browser without one shows the system\'s scrollbar, or lets the scroll go on to the page, which is fine. What it cannot do, and the component can: a thumb of any shape, a scrollbar that overlays the content on every system, rather than taking room on one with classic scrollbars, and one that shows only on hover or while scrolling.',
    },
  ],
};
