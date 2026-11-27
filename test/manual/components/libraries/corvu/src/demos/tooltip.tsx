import Tooltip from "corvu/tooltip";

export default function TooltipDemo() {
  return (
    <div class="row">
      <Tooltip>
        <Tooltip.Trigger>Save</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="tooltip">Save the document</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger disabled>Publish</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="tooltip">Nothing to publish</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip>
    </div>
  );
}
