import { Collapsible } from "radix-ui";

export default function CollapsibleDemo() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger>Show details</Collapsible.Trigger>
      <Collapsible.Content className="panel">
        Order 1042 shipped on Monday.
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
