import { Tooltip } from "@kobalte/core/tooltip";

export default function TooltipDemo() {
  return (
    <Tooltip>
      <Tooltip.Trigger>Save</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="tooltip">Save the document</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
}
