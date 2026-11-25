import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const dialogDoc: ComponentDoc = {
  slug: "dialog",
  name: "Dialog",
  category: "Overlays",
  description:
    "A window over the page that the user deals with before going back to it, such as a form or a confirmation: the WAI-ARIA modal dialog pattern. The Popup is a native <dialog> opened with showModal(), so the browser puts it in the top layer, above every z-index, makes the rest of the page inert and closes it on Escape; there is no portal. Inert covers everything outside the <dialog>, even a popover shown above it: a date picker's calendar or a toast that another library appends to <body> cannot be focused or pressed while the dialog is open. Render such a popup inside the Popup, through the library's option for the element it mounts into; Menhir's own popups have no portal and work inside it. Menhir adds what the browser leaves out: Tab and Shift+Tab stay inside, a press on the backdrop closes it, the page behind stops scrolling, and it stays shown until its exit animation has ended. Style the backdrop with ::backdrop, such as a blur with backdrop-filter, or Tailwind's backdrop: variant (backdrop:backdrop-blur-xs). A dialog open by default is rendered closed on the server and opens once the page has hydrated, since server HTML cannot open a modal dialog.",
  anatomy: tsx`<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Popup>
    <Dialog.Title />
    <Dialog.Description />
    <Dialog.Close />
  </Dialog.Popup>
</Dialog.Root>`,
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
            "Whether the dialog is open, when controlled. Pair it with onOpenChange. A controlled dialog needs no Trigger: open it from any button of your own, and focus returns to that button.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description:
            "Whether the dialog is open at first, when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the dialog, and why: "trigger-press", "close-press", "escape-key", "outside-press" (the backdrop) or "close-request" (such as the back gesture on Android or a <form method="dialog">). A controlled dialog changes only if open does, so keeping open true refuses the close.',
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" aria-haspopup="dialog"> that opens the dialog. Name it with its content. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Popup",
      description:
        "The <dialog> itself, opened with showModal(). Named by the Title in aria-labelledby and described by the Description in aria-describedby, while they are rendered; without a Title, give it an aria-label. Its render function must render a <dialog>. While it plays an exit animation it has data-closed and is inert.",
      props: [
        {
          name: "initialFocus",
          type: "HTMLElement | ((focused) => HTMLElement | null | undefined)",
          description:
            "Where focus goes once it has opened, instead of the browser's choice: the element with autofocus, else the first focusable one. A function gets the browser's choice; use one for an element you hold in a ref.",
        },
        {
          name: "returnFocus",
          type: "HTMLElement | ((focused) => HTMLElement | null | undefined)",
          description:
            "Where focus goes once it has closed, instead of the browser's choice: the element focused before it opened. A function gets that element, or null if it is gone, as in (focused) => focused ?? fallback.",
        },
        render(
          "popup with your own component, which spreads its props onto a <dialog>",
        ),
      ],
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
        '<button type="button"> that closes the dialog, such as Cancel, or an icon with an aria-label. Its render function must render a <button>.',
      props: [render("close button with your own button component")],
    },
  ],
  keyboard: [
    { keys: "Space", action: "On the Trigger, opens the dialog." },
    { keys: "Enter", action: "On the Trigger, opens the dialog." },
    {
      keys: "Tab",
      action:
        "Moves focus to the next element in the dialog, from the last back to the first.",
    },
    {
      keys: "Shift + Tab",
      action:
        "Moves focus to the previous element in the dialog, from the first to the last.",
    },
    {
      keys: "Escape",
      action: "Closes the dialog, and the topmost one of nested dialogs.",
    },
  ],
};
