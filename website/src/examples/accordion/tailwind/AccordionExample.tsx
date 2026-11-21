import { Accordion } from "menhir/accordion";
import { For } from "solid-js";

const questions = [
  {
    value: "shipping",
    question: "When will my order ship?",
    answer: "Within two working days, and it arrives three to five days later.",
  },
  {
    value: "returns",
    question: "Can I return it?",
    answer: "Yes, for free, within 30 days of delivery.",
  },
  {
    value: "warranty",
    question: "Is there a warranty?",
    answer: "Two years, covering any fault that is not wear and tear.",
  },
];

export default function AccordionExample() {
  return (
    <Accordion.Root class="w-80 text-sm">
      <For each={questions}>
        {(item) => (
          <Accordion.Item
            value={item.value}
            class="border-b border-stone-300 dark:border-stone-700"
          >
            <Accordion.Header class="m-0 text-sm">
              <Accordion.Trigger class="flex w-full cursor-pointer items-center gap-2 py-3 text-start font-semibold before:transition-[rotate] before:content-['▸'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:before:rotate-90">
                {item.question}
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel class="pb-3 text-stone-600 dark:text-stone-400">
              {item.answer}
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </For>
    </Accordion.Root>
  );
}
