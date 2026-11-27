import { Collapsible } from "@base-ui/react/collapsible";

export default function CollapsibleDemo() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger>Show details</Collapsible.Trigger>
      <Collapsible.Panel>
        <p>Order 1042 shipped on Monday.</p>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
