import { Accordion } from "menhir/accordion";
import { For } from "solid-js";

import "./accordion.css";

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
    <Accordion.Root class="accordion">
      <For each={questions}>
        {(item) => (
          <Accordion.Item value={item.value} class="accordion-item">
            <Accordion.Header class="accordion-header">
              <Accordion.Trigger class="accordion-trigger">
                {item.question}
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel class="accordion-panel">
              {item.answer}
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </For>
    </Accordion.Root>
  );
}
