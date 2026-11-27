import { Collapsible } from "@kobalte/core/collapsible";

export default function CollapsibleDemo() {
  return (
    <Collapsible class="stack">
      <Collapsible.Trigger>Show details</Collapsible.Trigger>
      <Collapsible.Content class="panel">
        Order 1042 shipped on Monday.
      </Collapsible.Content>
    </Collapsible>
  );
}
