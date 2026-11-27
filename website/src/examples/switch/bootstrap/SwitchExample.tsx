import { Switch } from "menhir/switch";

import styles from "./switch.module.css";

export default function SwitchExample() {
  return (
    <label class={styles.field}>
      <Switch.Root name="wifi" defaultChecked class={styles.track}>
        <Switch.Thumb class={styles.thumb} />
      </Switch.Root>
      Wi-Fi
    </label>
  );
}
