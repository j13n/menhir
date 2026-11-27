import { Select } from "menhir/select";

import styles from "./select.module.css";

function Indicator() {
  return (
    <Select.ItemIndicator class={styles.indicator}>
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
    </Select.ItemIndicator>
  );
}

export default function SelectExample() {
  return (
    <div class={styles.field}>
      <label for="select-fruit-bootstrap">Fruit</label>
      <Select.Root name="fruit" defaultValue="apple">
        <Select.Trigger id="select-fruit-bootstrap" class={styles.trigger}>
          <Select.Value class={styles.value} placeholder="Pick a fruit" />
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
            <path d="m3 6 5 5 5-5" />
          </svg>
        </Select.Trigger>
        <Select.Popup sideOffset={2} class={styles.popup}>
          <Select.Item class={styles.item} value="apple">
            Apple
            <Indicator />
          </Select.Item>
          <Select.Item class={styles.item} value="banana">
            Banana
            <Indicator />
          </Select.Item>
          <Select.Item class={styles.item} value="cherry" disabled>
            Cherry
            <Indicator />
          </Select.Item>
          {/* A listbox holds only options and groups, so the separator is
              hidden from assistive technology. */}
          <div aria-hidden="true" class={styles.separator} />
          <Select.Group>
            <Select.GroupLabel class={styles.groupLabel}>
              Citrus
            </Select.GroupLabel>
            <Select.Item class={styles.item} value="lemon">
              Lemon
              <Indicator />
            </Select.Item>
            <Select.Item class={styles.item} value="orange">
              Orange
              <Indicator />
            </Select.Item>
          </Select.Group>
        </Select.Popup>
      </Select.Root>
    </div>
  );
}
