import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

// `what` finishes "Renders the …".
const render = (what: string) => ({
  name: "render",
  type: "(props) => JSX.Element",
  description: `Renders the ${what}. Read once.`,
});

export const alertDialogDoc: ComponentDoc = {
  slug: "alert-dialog",
  name: "Alert Dialog",
  description:
    "A dialog that interrupts the user to ask for an answer to an important message, such as confirming an action that cannot be undone: the WAI-ARIA alert dialog pattern. It is a Dialog with the alertdialog role, which a press on the backdrop does not close, so a click that missed it is not taken as an answer; Escape still closes it, as Cancel does. Use Dialog for anything else on top of the page, such as a form. Focus goes to the first focusable element, so place the least destructive action, such as Cancel, first, or give it autofocus. Every action is an AlertDialog.Close; give the confirming one an onClick. Root, Trigger, Title, Description and Close are Dialog's parts, so an app with both components pays for them once.",
  anatomy: tsx`<AlertDialog.Root>
  <AlertDialog.Trigger />
  <AlertDialog.Popup>
    <AlertDialog.Title />
    <AlertDialog.Description />
    <AlertDialog.Close />
  </AlertDialog.Popup>
</AlertDialog.Root>`,
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
            "Whether the alert dialog is open, when controlled. Pair it with onOpenChange. A controlled alert dialog needs no Trigger: open it from any button of your own, and focus returns to that button. Control it to keep it open while a confirmed action is in flight.",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description:
            "Whether the alert dialog is open at first, when uncontrolled.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: { reason, event }) => void",
          description:
            'Called with the new value when the user opens or closes the alert dialog, and why: "trigger-press", "close-press", "escape-key" or "close-request" (such as the back gesture on Android or a <form method="dialog">). A controlled alert dialog changes only if open does, so keeping open true refuses the close.',
        },
      ],
    },
    {
      part: "Trigger",
      description:
        '<button type="button" aria-haspopup="dialog"> that opens the alert dialog. Name it with its content. Its render function must render a <button>.',
      props: [render("trigger with your own button component")],
    },
    {
      part: "Popup",
      description:
        '<dialog role="alertdialog">, opened with showModal(). Named by the Title in aria-labelledby and described by the Description, the message, in aria-describedby, while they are rendered; without a Title, give it an aria-label. A press on the backdrop does not close it. Its render function must render a <dialog>. While it plays an exit animation it has data-closed and is inert.',
      props: [
        {
          name: "initialFocus",
          type: "HTMLElement | ((focused) => HTMLElement | null | undefined)",
          description:
            "Where focus goes once it has opened, instead of the browser's choice: the element with autofocus, else the first focusable one. Point it at the least destructive action. A function gets the browser's choice; use one for an element you hold in a ref.",
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
        "<p> with the message, which describes the Popup. Takes your id, else a generated one.",
      props: [render("description with your own component")],
    },
    {
      part: "Close",
      description:
        '<button type="button"> that closes the alert dialog: each action, such as Cancel and Delete, with its own onClick for the action. Its render function must render a <button>.',
      props: [render("close button with your own button component")],
    },
  ],
  keyboard: [
    { keys: "Space", action: "On the Trigger, opens the alert dialog." },
    { keys: "Enter", action: "On the Trigger, opens the alert dialog." },
    {
      keys: "Tab",
      action:
        "Moves focus to the next element in the alert dialog, from the last back to the first.",
    },
    {
      keys: "Shift + Tab",
      action:
        "Moves focus to the previous element in the alert dialog, from the first to the last.",
    },
    { keys: "Escape", action: "Closes the alert dialog." },
  ],
};
