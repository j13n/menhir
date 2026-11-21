// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal } from "solid-js";

import { Meter } from "../../src/meter/index.ts";

export default function MeterFixture() {
  const [value, setValue] = createSignal(50);
  return (
    <>
      <Meter.Root
        id="storage"
        value={value()}
        max={200}
        // The server and the browser format alike only in the same locale.
        locale="en-US"
        aria-label="Storage"
      >
        <Meter.Value id="storage-value" />
      </Meter.Root>
      <button type="button" onClick={() => setValue(150)}>
        Fill
      </button>
    </>
  );
}
