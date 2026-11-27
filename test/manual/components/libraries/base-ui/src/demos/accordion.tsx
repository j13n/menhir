import { Accordion } from "@base-ui/react/accordion";

const items = [
  {
    value: "shipping",
    title: "Shipping",
    text: "Orders ship within two working days.",
    disabled: false,
  },
  {
    value: "returns",
    title: "Returns",
    text: "You can return an item within thirty days.",
    disabled: false,
  },
  {
    value: "warranty",
    title: "Warranty",
    text: "Every item has a two-year warranty.",
    disabled: true,
  },
];

function Items() {
  return items.map((item) => (
    <Accordion.Item
      key={item.value}
      value={item.value}
      disabled={item.disabled}
      className="accordion-item"
    >
      <Accordion.Header>
        <Accordion.Trigger>{item.title}</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>
        <p>{item.text}</p>
      </Accordion.Panel>
    </Accordion.Item>
  ));
}

export default function AccordionDemo() {
  return (
    <>
      <Accordion.Root defaultValue={["shipping"]}>
        <Items />
      </Accordion.Root>

      <h2>Multiple</h2>
      <Accordion.Root multiple defaultValue={["shipping"]}>
        <Items />
      </Accordion.Root>
    </>
  );
}
