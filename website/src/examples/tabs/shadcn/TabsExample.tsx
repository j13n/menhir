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
    <Tabs.Root class="flex w-80 flex-col gap-2">
      <Tabs.List
        aria-label="Settings"
        class="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground"
      >
        <For each={sections}>
          {(section) => (
            <Tabs.Tab
              value={section.value}
              class="inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:bg-background data-selected:text-foreground data-selected:shadow-sm motion-reduce:transition-none dark:text-muted-foreground dark:hover:text-foreground dark:data-selected:border-input dark:data-selected:bg-input/30 dark:data-selected:text-foreground"
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
            class="rounded-xl border bg-card p-6 text-sm text-card-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {section.content}
          </Tabs.Panel>
        )}
      </For>
    </Tabs.Root>
  );
}
