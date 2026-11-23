// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal } from "solid-js";

import { Field } from "../../src/field/index.ts";
import { Input } from "../../src/input/index.ts";

export default function InputFixture() {
  const [text, setText] = createSignal("Oslo");
  return (
    <form>
      <Field.Root name="city">
        <Field.Label>City</Field.Label>
        <Field.Control
          render={(p) => (
            <Input.Root {...p} value={text()} onValueChange={setText} />
          )}
        />
      </Field.Root>
      <output data-testid="text">{text()}</output>
      <button type="reset">Reset</button>
    </form>
  );
}
