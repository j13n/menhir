import { Popover } from "@base-ui/react/popover";

export default function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger>Notifications</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner className="positioner" sideOffset={6}>
          <Popover.Popup className="popup padded">
            <Popover.Title>Notifications</Popover.Title>
            <Popover.Description>You have no new messages.</Popover.Description>
            <Popover.Close>Close</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
