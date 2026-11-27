import { Tooltip } from "radix-ui";

// Radix shows no tooltip on a disabled trigger, so there is no "Publish".
export default function TooltipDemo() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>Save</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip">
            Save the document
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
