import { Tabs } from "menhir/tabs";
import { For } from "solid-js";

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
    <Tabs.Root class="w-80 text-sm">
      <Tabs.List
        aria-label="Settings"
        class="flex border-b border-stone-300 dark:border-stone-700"
      >
        <For each={sections}>
          {(section) => (
            <Tabs.Tab
              value={section.value}
              class="-mb-px cursor-pointer border-b-2 border-transparent px-3 py-2 text-stone-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-selected:border-current data-selected:font-semibold data-selected:text-inherit dark:text-stone-400"
            >
              {section.name}
            </Tabs.Tab>
          )}
        </For>
      </Tabs.List>
      <For each={sections}>
        {(section) => (
          <Tabs.Panel
            value={section.value}
            class="py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
          >
            {section.content}
          </Tabs.Panel>
        )}
      </For>
    </Tabs.Root>
  );
}
