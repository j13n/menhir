import { Popover } from "menhir/popover";

import "./popover.css";

export default function PopoverExample() {
  return (
    <Popover.Root>
      <Popover.Trigger class="popover-trigger">Notifications</Popover.Trigger>
      <Popover.Popup class="popover-popup" sideOffset={8}>
        <Popover.Arrow class="popover-arrow" />
        <Popover.Title class="popover-title">Notifications</Popover.Title>
        <Popover.Description class="popover-description">
          You are all caught up.
        </Popover.Description>
        <Popover.Close class="popover-close">Close</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  );
}
