import { Tooltip } from "menhir/tooltip";

import "./tooltip.css";

export default function TooltipExample() {
  return (
    <Tooltip.Group>
      <div class="tooltip-toolbar">
        <Tooltip.Root>
          <Tooltip.Trigger class="tooltip-trigger" aria-label="Bold">
            <b>B</b>
          </Tooltip.Trigger>
          <Tooltip.Popup class="tooltip-popup" sideOffset={8}>
            <Tooltip.Arrow class="tooltip-arrow" />
            Make text bold (Ctrl+B)
          </Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger class="tooltip-trigger" aria-label="Italic">
            <i>I</i>
          </Tooltip.Trigger>
          <Tooltip.Popup class="tooltip-popup" sideOffset={8}>
            <Tooltip.Arrow class="tooltip-arrow" />
            Make text italic (Ctrl+I)
          </Tooltip.Popup>
        </Tooltip.Root>
      </div>
    </Tooltip.Group>
  );
}
