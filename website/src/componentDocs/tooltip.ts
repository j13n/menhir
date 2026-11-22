import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const tooltipDoc: ComponentDoc = {
  slug: "tooltip",
  name: "Tooltip",
  description:
    'A short text that describes an element, such as what an icon button does or its shortcut, shown when the pointer rests on the element or when it receives keyboard focus: the WAI-ARIA tooltip pattern. The Popup is a popover="manual" element, so the browser puts it in the top layer, above every z-index, with no portal, and no Popover or menu closes it. It opens after a delay on hover, at once on keyboard focus, and not on a press or a touch; it closes on Escape, on blur, when the pointer leaves the Trigger and the Popup, and when the Trigger is pressed. It stays open while the Trigger is hovered or focused, and the pointer can move onto it, as WCAG 1.4.13 asks. Menhir places it against the Trigger with Floating UI, above it by default, and keeps it shown until its exit animation has ended. A tooltip is not a name: the Trigger always names the Popup in aria-describedby, so its text is read after the Trigger\'s name, open or closed, and an icon button still needs an aria-label. The Popup never takes focus, so put only text in it; a link or a button belongs in a Popover. A disabled button cannot be focused, so its tooltip never opens: use aria-disabled="true" instead, and ignore its presses. Wrap a toolbar\'s tooltips in a Group, so that once one is open the next opens at once.',
  anatomy: tsx`<Tooltip.Group>
  <Tooltip.Root>
    <Tooltip.Trigger />
    <Tooltip.Popup>
      <Tooltip.Arrow />
    </Tooltip.Popup>
  </Tooltip.Root>
</Tooltip.Group>`,
  api: [
    {
      part: "Root",
      description:
        "Holds the open state and the hover delays, and renders no element. Every part has data-open or data-closed.",
      props: [
        {
          name: "open",
          type: "boolean",
          description:
            "Whether the tooltip is open, when controlled. Pair it with onOpenChange.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description:
            "Whether the tooltip is open at first, when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the tooltip, and why: "trigger-hover", "trigger-focus" (keyboard focus, or blur), "trigger-press" or "escape-key". A controlled tooltip changes only if open does.',
        },
        {
          name: "delay",
          type: "number",
          default: "600",
          description:
            "How long the pointer rests on the Trigger before the tooltip opens, in milliseconds. In a Group, the Group's delay when unset.",
        },
        {
          name: "closeDelay",
          type: "number",
          default: "0",
          description:
            "How long after the pointer has left the Trigger and the Popup the tooltip closes, in milliseconds. The pointer can cross the gap to the Popup without it.",
        },
      ],
    },
    {
      part: "Trigger",
      description:
        "<button type=\"button\"> that the tooltip describes, with aria-describedby naming the Popup. Name it with its content or an aria-label. Your aria-describedby replaces the Popup's; aria-describedby={false} removes it, for a tooltip that only repeats the Trigger's name. It may render a link or another focusable element.",
      props: [render("trigger with your own component")],
    },
    {
      part: "Popup",
      description:
        '<div popover="manual" role="tooltip">, placed against the Trigger. Its id is generated, for the Trigger to name. It never takes focus. The browser\'s own popover styles scroll its overflow: set overflow: visible to show an Arrow outside its edge.',
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"top"',
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
      part: "Group",
      description:
        "Renders no element. Once one tooltip inside is open, hovering another Trigger opens its tooltip at once and closes the first, as in a toolbar. An app that renders no Group does not bundle it.",
      props: [
        {
          name: "delay",
          type: "number",
          default: "600",
          description:
            "The hover delay of the tooltips inside that set none, in milliseconds.",
        },
        {
          name: "timeout",
          type: "number",
          default: "400",
          description:
            "How long after the last tooltip closed the next still opens at once, in milliseconds.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Onto the Trigger, opens the tooltip; away from it, closes it. Tab never moves into the tooltip.",
    },
    {
      keys: "Escape",
      action:
        "Closes the tooltip, and only it: a dialog or popover below it stays open. Focus stays on the Trigger.",
    },
    {
      keys: "Enter",
      action: "On the Trigger, presses it, which closes the tooltip.",
    },
    {
      keys: "Space",
      action: "On the Trigger, presses it, which closes the tooltip.",
    },
  ],
};
