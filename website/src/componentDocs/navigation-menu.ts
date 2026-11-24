import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const navigationMenuDoc: ComponentDoc = {
  slug: "navigation-menu",
  name: "Navigation Menu",
  category: "Menus & navigation",
  summary:
    "A site's navigation, with buttons that show more links on a press or when the pointer rests on them.",
  description:
    "A site's navigation: links, and buttons that show more links, opening on a press and when the pointer rests on them. It is the WAI-ARIA disclosure pattern as its navigation example applies it, not a menu: a <nav> landmark with a list, links, and buttons with aria-expanded and aria-controls, which is what WAI-ARIA asks of site navigation. One Item is open at a time. Hovering a Trigger opens its Panel after a delay; once one is open, moving along the bar opens the next at once. The pointer can cross the gap onto the Panel, and a Panel opened by a press, or holding focus, stays open when the pointer leaves, as WCAG 1.4.13 asks. Escape closes it, and puts focus back on the Trigger if it was inside; focus moving out of the <nav>, a press outside it and a Link all close it. A Panel is in the page's flow, not the top layer: it is hidden while closed, so its links are in the server HTML, and your CSS places it under its Item with position: absolute, so an ancestor with overflow: hidden would clip it. Opening on focus, arrow keys and an animated shared area are left out.",
  anatomy: tsx`<NavigationMenu.Root>
  <ul>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger />
      <NavigationMenu.Panel>
        <NavigationMenu.Link />
      </NavigationMenu.Panel>
    </NavigationMenu.Item>
    <li>
      <NavigationMenu.Link />
    </li>
  </ul>
</NavigationMenu.Root>`,
  api: [
    {
      part: "Root",
      description:
        "<nav> that holds which Item is open, and the hover delays. Name it with aria-label when the page has another <nav>. Focus moving to an element outside it, or a press outside it, closes the open Item.",
      props: [
        {
          name: "value",
          type: "string | null",
          description:
            "The open Item's value, null when none is, when controlled. Pair it with onValueChange.",
        },
        {
          name: "defaultValue",
          type: "string | null",
          default: "null",
          description:
            "The value of the Item open at first, when uncontrolled. The server renders its Panel open.",
        },
        {
          name: "onValueChange",
          type: "(value: string | null, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes an Item, and why: "trigger-press", "trigger-hover", "escape-key", "focus-out", "outside-press" or "link-press". A controlled menu changes only if value does.',
        },
        {
          name: "delay",
          type: "number",
          default: "300",
          description:
            "How long the pointer rests on a Trigger before its Panel opens, in milliseconds. While an Item is open, or just after one closed, the next opens at once.",
        },
        {
          name: "closeDelay",
          type: "number",
          default: "200",
          description:
            "How long after the pointer has left a Trigger and its Panel the Panel closes, in milliseconds. The pointer can cross the gap to the Panel without it.",
        },
        {
          name: "timeout",
          type: "number",
          default: "400",
          description:
            "How long after the last close hovering a Trigger still opens its Panel at once, in milliseconds.",
        },
        render("root with your own component"),
      ],
    },
    {
      part: "Item",
      description:
        "<li> around a Trigger and its Panel. It generates the Panel's id. Every part of it has data-open or data-closed.",
      props: [
        {
          name: "value",
          type: "string",
          description:
            "Identifies the Item in the Root's value. Without one, the Item uses a generated value.",
        },
        render("item with your own component"),
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button"> with aria-expanded, and aria-controls naming its Panel. A press opens or closes the Panel; resting the pointer on it opens the Panel, which a press then closes. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Panel",
      description:
        "<div> with the links, hidden while closed. It is in the page's flow: place it under its Item with position: absolute. Its id is generated, for the Trigger to name.",
      props: [render("panel with your own component")],
    },
    {
      part: "Link",
      description:
        "<a> that closes the open Panel when it is activated, so a router's page change leaves no menu open. Put aria-current=\"page\" on the current page's link. Place it in a Panel, or beside the Triggers in an <li> of your own.",
      props: [
        {
          name: "href",
          type: "string",
          description: "Where the link goes.",
        },
        render("link with your own component, such as a router's link"),
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves through the Triggers, and through the links of the open Panel. Out of the navigation, closes the open Panel.",
    },
    {
      keys: "Shift + Tab",
      action: "Moves back the same way.",
    },
    {
      keys: "Enter",
      action:
        "On a Trigger, opens or closes its Panel. On a Link, follows it and closes the Panel.",
    },
    {
      keys: "Space",
      action: "On a Trigger, opens or closes its Panel.",
    },
    {
      keys: "Escape",
      action:
        "Closes the open Panel, and puts focus on its Trigger if focus was in it.",
    },
  ],
  sections: [
    {
      id: "without-hover",
      title: "Without hover",
      text: "A navigation that opens on a press only, as the WAI-ARIA example does, needs no Navigation Menu: it is a Collapsible for each section, rendered as an <li>, with a signal for the open one, and two listeners on the <nav>, for Escape and for focus leaving. It costs a Collapsible and these lines, and has no hover delays, safe area or press outside.",
    },
  ],
};
