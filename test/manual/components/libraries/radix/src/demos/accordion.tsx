import { Accordion } from "radix-ui";

function Items() {
  return (
    <>
      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger>Shipping</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="panel">
          Orders ship within two working days.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Header>
          <Accordion.Trigger>Returns</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="panel">
          You can return an item within thirty days.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="warranty" disabled>
        <Accordion.Header>
          <Accordion.Trigger>Warranty</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="panel">
          Every item has a two-year warranty.
        </Accordion.Content>
      </Accordion.Item>
    </>
  );
}

export default function AccordionDemo() {
  return (
    <>
      <Accordion.Root type="single" defaultValue="shipping">
        <Items />
      </Accordion.Root>

      <h2>Multiple</h2>
      <Accordion.Root type="multiple" defaultValue={["shipping"]}>
        <Items />
      </Accordion.Root>
    </>
  );
}
