import { Popover } from "@kobalte/core/popover";

export default function PopoverDemo() {
  return (
    <Popover>
      <Popover.Trigger>Notifications</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class="popup padded">
          <Popover.Title>Notifications</Popover.Title>
          <Popover.Description>You have no new messages.</Popover.Description>
          <Popover.CloseButton>Close</Popover.CloseButton>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
