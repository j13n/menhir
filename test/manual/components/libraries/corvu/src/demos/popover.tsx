import Popover from "corvu/popover";

export default function PopoverDemo() {
  return (
    <Popover>
      <Popover.Trigger>Notifications</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class="popup padded">
          <Popover.Label>Notifications</Popover.Label>
          <Popover.Description>You have no new messages.</Popover.Description>
          <Popover.Close>Close</Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}
