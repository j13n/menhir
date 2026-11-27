import { Button } from "@base-ui/react/button";
import { Tooltip } from "@base-ui/react/tooltip";

export default function TooltipDemo() {
  return (
    <div className="row">
      <Tooltip.Root>
        <Tooltip.Trigger>Save</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner className="positioner" sideOffset={6}>
            <Tooltip.Popup className="tooltip">Save the document</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>

      {/* `disabled` on the trigger turns the tooltip off, not the button. A
          disabled button that still takes focus is Base UI's Button with
          `focusableWhenDisabled`. */}
      <Tooltip.Root>
        <Tooltip.Trigger render={<Button disabled focusableWhenDisabled />}>
          Publish
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner className="positioner" sideOffset={6}>
            <Tooltip.Popup className="tooltip">
              Nothing to publish
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  );
}
