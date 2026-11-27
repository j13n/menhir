import { Dialog } from "menhir/dialog";

import button from "../../../looks/bootstrap/button.module.css";
import styles from "./dialog.module.css";

export default function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger class={[button.button, button.secondary]}>
        Edit profile
      </Dialog.Trigger>
      <Dialog.Popup class={styles.popup}>
        <div class={styles.header}>
          <Dialog.Title class={styles.title}>Edit profile</Dialog.Title>
        </div>
        <div class={styles.body}>
          <Dialog.Description class={styles.description}>
            Your name is shown on your posts.
          </Dialog.Description>
          <label class={styles.label}>
            Name
            <input name="name" value="Ada Lovelace" class={styles.control} />
          </label>
        </div>
        <div class={styles.footer}>
          <Dialog.Close class={[button.button, button.primary]}>
            Done
          </Dialog.Close>
        </div>
        {/* Last, so that opening focuses the field. A modal <dialog> is
            position: fixed, which positions the button against it. */}
        <Dialog.Close class={[button.close, styles.cornerClose]}>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 2l12 12M14 2 2 14" />
          </svg>
          <span class={button.visuallyHidden}>Close</span>
        </Dialog.Close>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
