import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

const render = {
  name: "render",
  type: "(props) => JSX.Element",
  description: "Renders the part with your own component. Read once.",
};

export const toastDoc: ComponentDoc = {
  slug: "toast",
  name: "Toast",
  category: "Overlays",
  description:
    "A notification at an edge of the screen that stacks with the others and leaves by itself, also called a snackbar. The app makes the list with createToastManager() and adds to it from anywhere: an event handler, an action, a module with no component. The Region is a landmark and a polite live region in the top layer, there before its first toast, so a screen reader announces each one; a toast of high priority is an alert, which interrupts. While a modal dialog is open the Region is inside it, so its toasts stay above the dialog and their buttons work. Timers wait while the pointer is on the Region, while focus is inside it and while the page is hidden. On the server add() does nothing: the server HTML holds the Region and no toast.",
  anatomy: tsx`const toasts = createToastManager();

<Toast.Provider manager={toasts}>
  <Toast.Region>
    {(toast) => (
      <Toast.Root toast={toast}>
        <Toast.Title />
        <Toast.Description />
        <Toast.Action />
        <Toast.Close />
      </Toast.Root>
    )}
  </Toast.Region>
</Toast.Provider>`,
  api: [
    {
      part: "createToastManager",
      description:
        "Makes the list of toasts. Call it once, where the code that adds toasts can import it, and hand it to Toast.Provider. Call its methods from event handlers, actions and onSettled, not from a component's body. add(), update() and the list's entries take these fields.",
      props: [
        {
          name: "add(options)",
          type: "(options) => string",
          description:
            "Adds a toast and returns its id. With the id of an open toast it updates that one. Does nothing on the server.",
        },
        {
          name: "update(id, options)",
          type: "(id, options) => void",
          description:
            "Changes the fields given of a listed toast, and starts its time again.",
        },
        {
          name: "remove(id?)",
          type: "(id?) => void",
          description:
            "Closes the toast with this id, or every toast, with its exit animation.",
        },
        {
          name: "toasts()",
          type: "() => ToastEntry[]",
          description: "The listed toasts, oldest first. A signal.",
        },
        {
          name: "id",
          type: "string",
          description: "A field. The toast's id. One is made by default.",
        },
        {
          name: "title",
          type: "JSX.Element",
          description: "A field. What Toast.Title renders.",
        },
        {
          name: "description",
          type: "JSX.Element",
          description: "A field. What Toast.Description renders.",
        },
        {
          name: "priority",
          type: '"low" | "high"',
          default: '"low"',
          description:
            'A field. How it is announced: low when the user is idle, by the Region; high at once, as a role="alert". Keep high for what cannot wait.',
        },
        {
          name: "duration",
          type: "number",
          description:
            "A field. How long it stays, in milliseconds; Infinity until it is closed. By default the Provider's, and Infinity for a toast with a Toast.Action.",
        },
        {
          name: "data",
          type: "T",
          description:
            "A field. Anything else your toast needs, such as its kind. Type it with createToastManager<T>() and the Region's child, (toast: ToastEntry<T>) => ….",
        },
        {
          name: "onOpenChange",
          type: "(open: false, details) => void",
          description:
            "A field. Called when the toast closes. details.reason is timeout, close-press, action-press, swipe, escape-key or remove; details.event is the click, key or pointer event, absent for timeout and remove.",
        },
      ],
    },
    {
      part: "Provider",
      description:
        "Hands the list to the Region and its parts. Renders no element. Place it around the app, or around the Region alone.",
      props: [
        {
          name: "manager",
          type: "ToastManager",
          description: "The list, from createToastManager(). Read once.",
        },
        {
          name: "duration",
          type: "number",
          default: "5000",
          description:
            "How long a toast with no duration of its own stays, in milliseconds.",
        },
        {
          name: "limit",
          type: "number",
          description:
            "How many toasts are rendered at once. The rest wait, their time not started, until one leaves. No limit by default.",
        },
      ],
    },
    {
      part: "Region",
      description:
        '<div popover="manual" role="region" aria-live="polite" tabindex="-1">, shown from mount, also while empty. Name it with aria-label and place it with CSS; lay it out under :popover-open, since display on a popover shows it before hydration. It has --toast-count, and data-expanded while the pointer is on it or focus is inside it. Its child is a function that renders one toast.',
      props: [
        {
          name: "hotkey",
          type: "string | false",
          default: '"F6"',
          description:
            "The key that moves focus to the Region while it has a toast, as KeyboardEvent.key names it, or false for none.",
        },
        {
          name: "children",
          type: "(toast: ToastEntry) => JSX.Element",
          description:
            "Renders one toast: a Toast.Root with the toast it is given. Toasts are in the document oldest first. Read once.",
        },
        render,
      ],
    },
    {
      part: "Root",
      description:
        '<div>, with role="alert" when its priority is high, data-open or data-closed, data-priority, --toast-index (0 for the newest) and data-front on the newest. Once closed it stays, with data-closed, until its animations have ended.',
      props: [
        {
          name: "toast",
          type: "ToastEntry",
          description: "The toast the Region's child was given. Read once.",
        },
        render,
      ],
    },
    {
      part: "Title",
      description:
        "<div> with the toast's title, or its children when it has any.",
      props: [render],
    },
    {
      part: "Description",
      description:
        "<div> with the toast's description, or its children when it has any.",
      props: [render],
    },
    {
      part: "Action",
      description:
        '<button type="button"> for something to do about the message, such as Undo. It runs its onClick, then closes the toast. A toast with an Action does not leave by itself unless it was given a duration of its own, so the button is not lost to someone who needs longer to reach it.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the button with your own component, which must render a <button>. Read once.",
        },
      ],
    },
    {
      part: "Close",
      description:
        '<button type="button"> that closes the toast. Name an icon with aria-label.',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the button with your own component, which must render a <button>. Read once.",
        },
      ],
    },
    {
      part: "swipe",
      description:
        'Swipe to dismiss, as a ref: <Toast.Root ref={Toast.swipe({ direction: "right" })}>. While dragged the Root has data-swipe="move", --toast-swipe-x and --toast-swipe-y; let go past the threshold it has data-swipe="end" and data-swipe-direction, and closes. An app that does not use it bundles none of it.',
      props: [
        {
          name: "direction",
          type: '"left" | "right" | "up" | "down", or an array of them',
          default: '"right"',
          description: "The direction, or directions, it is swiped away in.",
        },
        {
          name: "threshold",
          type: "number",
          default: "50",
          description: "The distance that dismisses it, in pixels.",
        },
      ],
    },
    {
      part: "measure",
      description:
        "The heights a stylesheet needs to collapse and expand a stack, as a ref: <Toast.Region ref={Toast.measure()}>. Each toast gets --toast-height and --toast-offset, the heights of the newer toasts added up, in pixels. An app that does not use it bundles none of it.",
      props: [],
    },
  ],
  keyboard: [
    {
      keys: "F6",
      action:
        "Moves focus to the Region, while it has a toast. Another key with hotkey.",
    },
    {
      keys: "Tab",
      action:
        "From the Region, moves through the buttons of each toast, oldest first.",
    },
    {
      keys: "Escape",
      action:
        "With focus in a toast, closes it. A dialog under it stays open. Focus goes to the Region if a toast is left, else back to where it was.",
    },
    {
      keys: "Enter",
      action: "Activates the focused Action or Close, natively.",
    },
    {
      keys: "Space",
      action: "Activates the focused Action or Close, natively.",
    },
  ],
  sections: [
    {
      id: "promise",
      title: "A toast that follows a request",
      text: "Add a toast that stays, with duration: Infinity, before the request, and update it by its id once the request has ended. update() starts the toast's time again, so a result given a duration is shown for all of it; one that failed can stay until it is closed. In an action a rejected request is thrown at the yield.",
    },
    {
      id: "stack",
      title: "A stack that expands",
      text: "Menhir positions nothing: every Root has --toast-index, 0 for the newest, the Region has --toast-count, and data-expanded while the pointer is on it or focus is inside it, which is also when the timers wait. For a stack that collapses to the newest toast and opens into a column, pass Toast.measure() as the Region's ref: it gives each toast --toast-height and --toast-offset. limit on the Provider keeps the stack short; the rest wait their turn.",
    },
  ],
};
