import { Accordion } from "@kobalte/core/accordion";

function Items() {
  return (
    <>
      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger>Shipping</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content class="panel">
          Orders ship within two working days.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Header>
          <Accordion.Trigger>Returns</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content class="panel">
          You can return an item within thirty days.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="warranty" disabled>
        <Accordion.Header>
          <Accordion.Trigger>Warranty</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content class="panel">
          Every item has a two-year warranty.
        </Accordion.Content>
      </Accordion.Item>
    </>
  );
}

export default function AccordionDemo() {
  return (
    <>
      <Accordion defaultValue={["shipping"]}>
        <Items />
      </Accordion>

      <h2>Multiple</h2>
      <Accordion multiple defaultValue={["shipping"]}>
        <Items />
      </Accordion>
    </>
  );
}
