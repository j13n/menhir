import { Tabs } from "menhir/tabs";
import { For } from "solid-js";

import "./tabs.css";

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
    <Tabs.Root class="tabs">
      <Tabs.List aria-label="Settings" class="tabs-list">
        <For each={sections}>
          {(section) => (
            <Tabs.Tab value={section.value} class="tabs-tab">
              {section.name}
            </Tabs.Tab>
          )}
        </For>
      </Tabs.List>
      <For each={sections}>
        {(section) => (
          <Tabs.Panel value={section.value} class="tabs-panel">
            {section.content}
          </Tabs.Panel>
        )}
      </For>
    </Tabs.Root>
  );
}
