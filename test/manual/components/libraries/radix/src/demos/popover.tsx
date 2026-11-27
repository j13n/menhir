import { Popover } from "radix-ui";

// Radix's popover has no title or description parts; they are plain text.
export default function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger>Notifications</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="popup padded">
          <h3>Notifications</h3>
          <p>You have no new messages.</p>
          <Popover.Close>Close</Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
