// Rendered on the server and hydrated in the test, so both sides get the
// same tree: two test tooltips in a group, closed.
import { createHoverGroup } from "../../../src/floating/hover/group.ts";
import { Tooltip } from "./Tooltip.tsx";

export default function HoverFixture() {
  const group = createHoverGroup();
  return (
    <>
      <Tooltip label="First" group={group} delay={0} />
      <Tooltip label="Second" group={group} />
    </>
  );
}
