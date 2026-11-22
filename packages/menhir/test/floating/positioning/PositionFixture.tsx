// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal } from "solid-js";

import { Popup } from "./Popup.tsx";

export default function PositionFixture() {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <button onClick={() => setOpen(!open())}>Toggle</button>
      <Popup open={open()} side="top" align="start" />
    </>
  );
}
