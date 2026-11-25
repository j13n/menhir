// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal, Repeat } from "solid-js";

import { Field } from "../../src/field/index.ts";
import { OtpField } from "../../src/otp-field/index.ts";

export default function OtpFieldFixture() {
  const [code, setCode] = createSignal("12");
  return (
    <form>
      <Field.Root name="code">
        <Field.Label>Code</Field.Label>
        <Field.Control
          render={(p) => (
            <OtpField.Root
              {...p}
              length={6}
              value={code()}
              onValueChange={setCode}
            />
          )}
        >
          <OtpField.Input />
          <Repeat count={6}>
            {(index) => <OtpField.Slot index={index} data-testid="slot" />}
          </Repeat>
        </Field.Control>
      </Field.Root>
      <output data-testid="code">{code()}</output>
    </form>
  );
}
