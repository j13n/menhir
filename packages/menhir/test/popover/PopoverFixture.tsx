// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed Popover, and one open by default, which the server
// renders closed (README, "Decisions").
import { Popover } from "../../src/popover/index.ts";

export default function PopoverFixture() {
  return (
    <>
      <Popover.Root>
        <Popover.Trigger>Notifications</Popover.Trigger>
        <Popover.Popup data-testid="notifications">
          <Popover.Arrow />
          <Popover.Title>All caught up</Popover.Title>
          <Popover.Description>No new notifications.</Popover.Description>
          <Popover.Close>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <Popover.Root defaultOpen>
        <Popover.Trigger>Tips</Popover.Trigger>
        <Popover.Popup data-testid="tips">
          <Popover.Title>Welcome</Popover.Title>
          <Popover.Close>Got it</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
    </>
  );
}
