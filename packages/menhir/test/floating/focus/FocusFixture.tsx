// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a dialog with the Tab wrap, an autofocus element and
// returnFocus, closed.
import { Dialog } from "./Dialog.tsx";

export default function FocusFixture() {
  let heading: HTMLHeadingElement | undefined;
  return (
    <>
      <h1 ref={(el) => (heading = el)} tabindex="-1">
        Page
      </h1>
      <Dialog returnFocus={() => heading}>
        <button>First</button>
        <button autofocus>Second</button>
      </Dialog>
    </>
  );
}
