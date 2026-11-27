import { useId } from "react";

import { OTPField } from "@base-ui/react/otp-field";

const length = 6;

// The docs add an `aria-label` ("Character 2 of 6") to every input after the
// first. Left out here, to hear what the library says on its own.
export default function OTPFieldDemo() {
  const id = useId();

  return (
    <div className="stack">
      <label htmlFor={id}>Verification code</label>
      <OTPField.Root id={id} length={length} className="otp">
        {Array.from({ length }, (_, index) => (
          <OTPField.Input key={index} />
        ))}
      </OTPField.Root>
    </div>
  );
}
