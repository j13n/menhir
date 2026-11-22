import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

const focusTarget =
  "HTMLElement | ((focused) => HTMLElement | null | undefined)";

export const popoverDoc: ComponentDoc = {
  slug: "popover",
  name: "Popover",
  description:
    'A popup placed against its trigger that leaves the page usable, such as a few settings, a short form or details about an item: the WAI-ARIA dialog pattern, read for a non-modal dialog. The Popup is a popover="auto" element, so the browser puts it in the top layer, above every z-index, and closes it on Escape or a press outside; there is no portal. Menhir places it against the Trigger with Floating UI, flipping it to the other side or shifting it along when it would leave the viewport, and keeps it shown until its exit animation has ended. Render the Popup right after the Trigger: Tab then moves from the Trigger into the Popup and on to what follows, as WCAG\'s focus order asks. The Popup gets data-side and data-align, with the side and alignment it was placed on, and the CSS variables --anchor-width, --anchor-height and --transform-origin (the point nearest the trigger, for an animation that grows from it). For a popup that keeps focus inside until it is closed, use Dialog. A popover open by default is rendered closed on the server and opens once the page has hydrated.',
  anatomy: tsx`<Popover.Root>
  <Popover.Trigger />
  <Popover.Popup>
    <Popover.Arrow />
    <Popover.Title />
    <Popover.Description />
    <Popover.Close />
  </Popover.Popup>
</Popover.Root>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the open state and renders no element. Every part has data-open or data-closed.",
      props: [
        {
          name: "open",
          type: "boolean",
          description:
            "Whether the popover is open, when controlled. Pair it with onOpenChange. A controlled popover with no Trigger needs an anchor on the Popup.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description:
            "Whether the popover is open at first, when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the popover, and why: "trigger-press", "close-press", "escape-key", "outside-press" or "close-request" (such as another popover opening). A controlled popover changes only if open does, so keeping open true refuses the close.',
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" aria-haspopup="dialog"> that opens and closes the popover, with aria-expanded and with popovertarget and aria-controls naming the Popup. Name it with its content. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Popup",
      description:
        '<div popover="auto" role="dialog">, placed against the Trigger. Named by the Title in aria-labelledby and described by the Description in aria-describedby, while they are rendered; without a Title, give it an aria-label. Its id is generated, for the Trigger to name. The browser\'s own popover styles scroll its overflow: set overflow: visible to show an Arrow outside its edge.',
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description:
            "The side of the Trigger it is placed against. It moves to the other side when it does not fit, and data-side says where it went.",
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
          description: "The gap between the Trigger and the Popup, in pixels.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "The shift along the Trigger's side, in pixels.",
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
            "What it is placed against instead of the Trigger: an element, a virtual element with a getBoundingClientRect(), such as a point, or a function returning one, for an element you hold in a ref.",
        },
        {
          name: "initialFocus",
          type: focusTarget,
          description:
            "Where focus goes once it has opened, instead of staying on the Trigger, or going to the element inside with autofocus. A function gets the browser's choice; use one for an element you hold in a ref.",
        },
        {
          name: "returnFocus",
          type: focusTarget,
          description:
            "Where focus goes once it has closed with focus inside, instead of the Trigger. A function gets the element the browser focused, or null.",
        },
        render("popup with your own component"),
      ],
    },
    {
      part: "Arrow",
      description:
        "aria-hidden <div> that points at the center of the Trigger: Menhir sets its left or top. Position it absolutely on the Popup's edge by its data-side, which it shares with the Popup. An app that renders no Arrow does not bundle the code that places it.",
      props: [render("arrow with your own component")],
    },
    {
      part: "Title",
      description:
        "<h2> that names the Popup. Takes your id, else a generated one.",
      props: [render("title with your own component")],
    },
    {
      part: "Description",
      description:
        "<p> that describes the Popup. Takes your id, else a generated one.",
      props: [render("description with your own component")],
    },
    {
      part: "Close",
      description:
        '<button type="button"> that closes the popover, such as Done, or an icon with an aria-label. Its render function must render a <button>.',
      props: [render("close button with your own button component")],
    },
  ],
  keyboard: [
    { keys: "Space", action: "On the Trigger, opens or closes the popover." },
    { keys: "Enter", action: "On the Trigger, opens or closes the popover." },
    {
      keys: "Tab",
      action:
        "From the Trigger, moves focus into the popover; from its last element, on to what follows the Trigger. The popover stays open.",
    },
    {
      keys: "Shift + Tab",
      action: "Moves focus back, through the popover to the Trigger.",
    },
    {
      keys: "Escape",
      action:
        "Closes the popover, the topmost one of nested popovers, and returns focus to its Trigger when it was inside.",
    },
  ],
};
