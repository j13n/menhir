// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a dialog with the scroll lock, closed, on a page taller than
// the viewport.
import { Dialog } from "./Dialog.tsx";

export default function ScrollLockFixture() {
  return (
    <>
      <Dialog />
      <div style={{ height: "5000px" }}>Page</div>
    </>
  );
}
