// Rendered on the server and hydrated in the test, so both sides get the
// same tree: one test popup per module, closed.
import { Dialog } from "./Dialog.tsx";
import { Popover } from "./Popover.tsx";
import { Tooltip } from "./Tooltip.tsx";

export default function DismissalFixture() {
  return (
    <>
      <Dialog outsidePress />
      <Popover />
      <Tooltip />
    </>
  );
}
