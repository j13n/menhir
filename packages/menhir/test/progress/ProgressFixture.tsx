// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal } from "solid-js";

import { Progress } from "../../src/progress/index.ts";

export default function ProgressFixture() {
  const [value, setValue] = createSignal<number | null>(50);
  return (
    <>
      <Progress.Root
        id="upload"
        value={value()}
        max={200}
        // The server and the browser format alike only in the same locale.
        locale="en-US"
        aria-label="Upload"
      >
        <Progress.Value id="upload-value" />
        <Progress.Indicator id="upload-indicator" />
      </Progress.Root>
      <Progress.Root id="loading" value={null} aria-label="Loading" />
      <button type="button" onClick={() => setValue(200)}>
        Finish
      </button>
      <button type="button" onClick={() => setValue(null)}>
        Restart
      </button>
    </>
  );
}
