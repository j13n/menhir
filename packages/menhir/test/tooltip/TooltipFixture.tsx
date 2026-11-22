// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed Tooltip in a Group, and one open by default, which the
// server renders closed (README, "Decisions").
import { Tooltip } from "../../src/tooltip/index.ts";

export default function TooltipFixture() {
  return (
    <>
      <button type="button">Before</button>
      <Tooltip.Group>
        <Tooltip.Root delay={0}>
          <Tooltip.Trigger>Bold</Tooltip.Trigger>
          <Tooltip.Popup data-testid="bold">
            <Tooltip.Arrow />
            Ctrl+B
          </Tooltip.Popup>
        </Tooltip.Root>
      </Tooltip.Group>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger style={{ "margin-top": "100px" }}>
          Help
        </Tooltip.Trigger>
        <Tooltip.Popup data-testid="help">Opens the manual</Tooltip.Popup>
      </Tooltip.Root>
    </>
  );
}
