// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { Collapsible } from "../../src/collapsible/index.ts";

export default function CollapsibleFixture() {
  return (
    <>
      <Collapsible.Root>
        <Collapsible.Trigger id="shipping">Shipping</Collapsible.Trigger>
        <Collapsible.Panel>Ships in two days.</Collapsible.Panel>
      </Collapsible.Root>
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Returns</Collapsible.Trigger>
        <Collapsible.Panel>Free for 30 days.</Collapsible.Panel>
      </Collapsible.Root>
    </>
  );
}
