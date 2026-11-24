import { Accordion } from "menhir/accordion";
import { Collapsible } from "menhir/collapsible";
import { Tabs } from "menhir/tabs";
import { For } from "solid-js";

import { ExampleCard, ExampleGroup } from "./ExampleGroup";

// The Tabs example: one tab and one panel per day.
const forecast = [
  { name: "Mon", weather: "Sunny, 18°" },
  { name: "Tue", weather: "Cloudy, 15°" },
  { name: "Wed", weather: "Rain, 12°" },
];

export default function DisclosureExamples() {
  return (
    <ExampleGroup category="Disclosure">
      <ExampleCard name="Collapsible" href="/docs/components/collapsible">
        <Collapsible.Root>
          <Collapsible.Trigger class="flex cursor-pointer items-center gap-2 before:transition-[rotate] before:content-['▸'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:before:rotate-90">
            Release notes
          </Collapsible.Trigger>
          <Collapsible.Panel class="mt-2 text-sm text-stone-500">
            Adds Collapsible, a button that shows and hides content.
          </Collapsible.Panel>
        </Collapsible.Root>
      </ExampleCard>
      <ExampleCard name="Accordion" href="/docs/components/accordion">
        <Accordion.Root>
          <For
            each={[
              {
                question: "Is it styled?",
                answer: "No: every part takes your classes.",
              },
              {
                question: "Does it work with SSR?",
                answer: "Yes, and with hydration.",
              },
            ]}
          >
            {(item) => (
              <Accordion.Item class="border-b border-stone-200 dark:border-stone-800">
                <Accordion.Header class="m-0 text-base font-normal">
                  <Accordion.Trigger class="flex w-full cursor-pointer items-center gap-2 py-2 text-start before:transition-[rotate] before:content-['▸'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:before:rotate-90">
                    {item.question}
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel class="pb-2 text-sm text-stone-500">
                  {item.answer}
                </Accordion.Panel>
              </Accordion.Item>
            )}
          </For>
        </Accordion.Root>
      </ExampleCard>
      <ExampleCard name="Tabs" href="/docs/components/tabs">
        <Tabs.Root>
          <Tabs.List
            aria-label="Forecast"
            class="flex border-b border-stone-200 dark:border-stone-800"
          >
            <For each={forecast}>
              {(day) => (
                <Tabs.Tab
                  value={day.name}
                  class="-mb-px cursor-pointer border-b-2 border-transparent px-3 py-1 text-sm text-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-selected:border-current data-selected:text-inherit"
                >
                  {day.name}
                </Tabs.Tab>
              )}
            </For>
          </Tabs.List>
          <For each={forecast}>
            {(day) => (
              <Tabs.Panel
                value={day.name}
                class="pt-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
              >
                {day.weather}
              </Tabs.Panel>
            )}
          </For>
        </Tabs.Root>
      </ExampleCard>
    </ExampleGroup>
  );
}
