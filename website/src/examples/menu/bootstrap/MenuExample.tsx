import { Menu } from "menhir/menu";

import button from "../../../looks/bootstrap/button.module.css";
import styles from "./menu.module.css";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

export default function MenuExample() {
  return (
    <Menu.Root>
      <Menu.Trigger class={[button.button, button.secondary, styles.trigger]}>
        Edit
      </Menu.Trigger>
      <Menu.Popup sideOffset={2} class={styles.popup}>
        <Menu.Item class={styles.item}>Cut</Menu.Item>
        <Menu.Item class={styles.item}>Copy</Menu.Item>
        <Menu.Item class={styles.item} disabled>
          Paste
        </Menu.Item>
        <hr class={styles.separator} />
        <Menu.CheckboxItem class={styles.item} defaultChecked>
          <Menu.ItemIndicator class={styles.indicator}>
            <CheckIcon />
          </Menu.ItemIndicator>
          Word wrap
        </Menu.CheckboxItem>
        <hr class={styles.separator} />
        <Menu.RadioGroup defaultValue="comfortable">
          <Menu.GroupLabel class={styles.groupLabel}>
            Line spacing
          </Menu.GroupLabel>
          <Menu.RadioItem class={styles.item} value="compact">
            <Menu.ItemIndicator class={styles.indicator}>
              <span class={styles.dot} />
            </Menu.ItemIndicator>
            Compact
          </Menu.RadioItem>
          <Menu.RadioItem class={styles.item} value="comfortable">
            <Menu.ItemIndicator class={styles.indicator}>
              <span class={styles.dot} />
            </Menu.ItemIndicator>
            Comfortable
          </Menu.RadioItem>
        </Menu.RadioGroup>
        <hr class={styles.separator} />
        <Menu.Submenu>
          <Menu.SubmenuTrigger class={styles.item}>
            Share
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class={styles.chevron}
            >
              <path d="m6 3 5 5-5 5" />
            </svg>
          </Menu.SubmenuTrigger>
          {/* Up by the Popup's padding and border, so that its first item
              lines up with the SubmenuTrigger. */}
          <Menu.Popup sideOffset={2} alignOffset={-9} class={styles.popup}>
            <Menu.Item class={styles.item}>Email</Menu.Item>
            <Menu.Item class={styles.item}>Messages</Menu.Item>
          </Menu.Popup>
        </Menu.Submenu>
      </Menu.Popup>
    </Menu.Root>
  );
}
