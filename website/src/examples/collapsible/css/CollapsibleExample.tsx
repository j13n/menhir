import { Collapsible } from "menhir/collapsible";

import "./collapsible.css";

export default function CollapsibleExample() {
  return (
    <Collapsible.Root class="collapsible">
      <Collapsible.Trigger class="collapsible-trigger">
        Shipping
      </Collapsible.Trigger>
      <Collapsible.Panel class="collapsible-panel">
        Orders ship within two working days, and arrive three to five days
        later.
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
