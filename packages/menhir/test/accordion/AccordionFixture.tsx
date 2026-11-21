// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Accordion } from "../../src/accordion/index.ts";

export default function AccordionFixture() {
  return (
    <Accordion.Root defaultValue={["returns"]}>
      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger id="shipping">Shipping</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Ships in two days.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Header>
          <Accordion.Trigger>Returns</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Free for 30 days.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
