import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const previewCardDoc: ComponentDoc = {
  slug: "preview-card",
  name: "Preview Card",
  category: "Overlays",
  description:
    "A card that previews where a link leads, such as a profile or an article, shown on hover or keyboard focus. A tooltip describes its trigger in a few words and holds nothing to press; a popover opens on a press and takes focus; a preview card shows what is behind a link, and everything in it is also reached by following the link. The Popup is a popover=\"manual\" element, so the browser puts it in the top layer, above every z-index, with no portal, and no Popover or menu closes it. It opens after a delay on hover and on keyboard focus, and not on a press or a touch: a tap follows the link. It closes on Escape, when the pointer leaves the link and the card, when focus leaves both, and when the link is pressed, which still navigates. It stays open while the link or the card is hovered or holds keyboard focus, and the pointer can move onto it, as WCAG 1.4.13 asks. Menhir places it against the link with Floating UI, below it by default, and keeps it shown until its exit animation has ended. The card is extra, so a screen reader is told nothing of it: the link has no aria-describedby or aria-haspopup, and the open card is read in the page's order after the link. Opening moves no focus, but Tab reaches what is in the card in the page's order; Escape from inside returns focus to the link. A link inside a paragraph needs a card made of <span>s: the server HTML cannot hold a <div> inside a <p>.",
  anatomy: tsx`<PreviewCard.Root>
  <PreviewCard.Trigger />
  <PreviewCard.Popup>
    <PreviewCard.Arrow />
  </PreviewCard.Popup>
</PreviewCard.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the open state and the delays, and renders no element. Every part has data-open or data-closed.",
      props: [
        {
          name: "open",
          type: "boolean",
          description:
            "Whether the card is open, when controlled. Pair it with onOpenChange.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Whether the card is open at first, when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the card, and why: "trigger-hover", "trigger-focus" (keyboard focus on the link, or blur), "focus-out" (focus left the card), "trigger-press" or "escape-key". A controlled card changes only if open does.',
        },
        {
          name: "delay",
          type: "number",
          default: "700",
          description:
            "How long the pointer rests on the link, or keyboard focus stays on it, before the card opens, in milliseconds.",
        },
        {
          name: "closeDelay",
          type: "number",
          default: "300",
          description:
            "How long after the pointer has left the link and the card the card closes, in milliseconds. The pointer can cross the gap to the card without it.",
        },
      ],
    },
    {
      part: "Trigger",
      description:
        "<a> that the card previews. Pass its href. A press follows the link and closes the card. It may render your router's link component, which renders an <a>.",
      props: [render("link with your own component")],
    },
    {
      part: "Popup",
      description:
        '<div popover="manual">, placed against the link, with no role. It takes no focus when it opens. Inside a <p>, render it as a <span> with render, and its content as <span>s: a paragraph holds no <div>. The browser\'s own popover styles scroll its overflow: set overflow: visible to show an Arrow outside its edge.',
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description:
            "The side of the link it is placed against. It moves to the other side when it does not fit, and data-side says where it went.",
        },
        {
          name: "align",
          type: '"start" | "center" | "end"',
          default: '"center"',
          description:
            "Where along that side it sits. start and end follow the writing direction.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "0",
          description: "The gap between the link and the card, in pixels.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "The shift along the link's side, in pixels.",
        },
        {
          name: "collisionPadding",
          type: "number",
          default: "5",
          description:
            "The space it keeps from the viewport's edges, in pixels.",
        },
        {
          name: "anchor",
          type: "Element | VirtualElement | (() => Element | VirtualElement | undefined)",
          description:
            "What it is placed against instead of the link: an element, a virtual element with a getBoundingClientRect(), such as a point, or a function returning one, for an element you hold in a ref.",
        },
        render("card with your own component"),
      ],
    },
    {
      part: "Arrow",
      description:
        "aria-hidden <div> that points at the center of the link: Menhir sets its left or top. Position it absolutely on the card's edge by its data-side, which it shares with the Popup. Inside a <p>, render it as a <span>. An app that renders no Arrow does not bundle the code that places it.",
      props: [render("arrow with your own component")],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Onto the link, opens the card after the delay. On to the card's content, when the card is next in the page, keeps it open; on to anything else, closes it.",
    },
    {
      keys: "Escape",
      action:
        "Closes the card, and only it: a dialog or popover below it stays open. Focus inside the card returns to the link.",
    },
    {
      keys: "Enter",
      action: "On the link, follows it, which closes the card.",
    },
  ],
  sections: [
    {
      id: "loading",
      title: "Loading the card",
      text: "The closed card is in the page, so its content would load with the page. To load it on the first opening, set a signal from onOpenChange and fetch in an async memo that reads it, under a <Loading> inside the Popup. on={opened()} shows the fallback for that first opening, since the empty card was already shown; once loaded, the card keeps its content between openings.",
    },
  ],
};
