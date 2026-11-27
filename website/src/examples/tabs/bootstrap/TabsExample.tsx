import { Tabs } from "menhir/tabs";
import { For } from "solid-js";

import styles from "./tabs.module.css";

const sections = [
  {
    value: "account",
    name: "Account",
    content: "Your name, email address and language.",
  },
  {
    value: "billing",
    name: "Billing",
    content: "Your plan, payment method and invoices.",
  },
  {
    value: "security",
    name: "Security",
    content: "Your password, passkeys and signed-in devices.",
  },
];

export default function TabsExample() {
  return (
    <Tabs.Root class={styles.tabs}>
      <Tabs.List aria-label="Settings" class={styles.list}>
        <For each={sections}>
          {(section) => (
            <Tabs.Tab value={section.value} class={styles.tab}>
              {section.name}
            </Tabs.Tab>
          )}
        </For>
      </Tabs.List>
      <For each={sections}>
        {(section) => (
          <Tabs.Panel value={section.value} class={styles.panel}>
            {section.content}
          </Tabs.Panel>
        )}
      </For>
    </Tabs.Root>
  );
}
