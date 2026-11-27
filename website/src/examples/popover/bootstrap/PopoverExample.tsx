import { Popover } from "menhir/popover";

import button from "../../../looks/bootstrap/button.module.css";
import styles from "./popover.module.css";

export default function PopoverExample() {
  return (
    <Popover.Root>
      <Popover.Trigger class={[button.button, button.secondary]}>
        Notifications
      </Popover.Trigger>
      <Popover.Popup sideOffset={8} class={styles.popup}>
        <Popover.Arrow class={styles.arrow} />
        <Popover.Title class={styles.title}>Notifications</Popover.Title>
        <div class={styles.body}>
          <Popover.Description class={styles.description}>
            You are all caught up.
          </Popover.Description>
          <div class={styles.actions}>
            <Popover.Close
              class={[button.button, button.outline, button.small]}
            >
              Close
            </Popover.Close>
          </div>
        </div>
      </Popover.Popup>
    </Popover.Root>
  );
}
