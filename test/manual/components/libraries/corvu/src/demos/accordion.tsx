import Accordion from "corvu/accordion";

function Items() {
  return (
    <>
      <Accordion.Item value="shipping">
        <h3>
          <Accordion.Trigger>Shipping</Accordion.Trigger>
        </h3>
        <Accordion.Content class="panel">
          Orders ship within two working days.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <h3>
          <Accordion.Trigger>Returns</Accordion.Trigger>
        </h3>
        <Accordion.Content class="panel">
          You can return an item within thirty days.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="warranty" disabled>
        <h3>
          <Accordion.Trigger>Warranty</Accordion.Trigger>
        </h3>
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
      <Accordion initialValue="shipping">
        <Items />
      </Accordion>

      <h2>Multiple</h2>
      <Accordion multiple initialValue={["shipping"]}>
        <Items />
      </Accordion>
    </>
  );
}
