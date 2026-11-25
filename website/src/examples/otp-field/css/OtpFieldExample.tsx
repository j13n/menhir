import { OtpField } from "menhir/otp-field";
import { Repeat } from "solid-js";

import "./otp-field.css";

export default function OtpFieldExample() {
  return (
    <div class="otp-field-example">
      <label for="verification-code">Verification code</label>
      <OtpField.Root
        id="verification-code"
        name="code"
        length={6}
        class="otp-field"
      >
        <OtpField.Input />
        <Repeat count={6}>
          {(index) => <OtpField.Slot index={index} class="slot" />}
        </Repeat>
      </OtpField.Root>
    </div>
  );
}
