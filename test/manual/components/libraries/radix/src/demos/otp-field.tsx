import { unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui";

// The field has no label part; the group is named by the visible label.
export default function OtpFieldDemo() {
  return (
    <div className="stack">
      <span id="otp-label">Verification code</span>
      <OneTimePasswordField.Root className="row" aria-labelledby="otp-label">
        <OneTimePasswordField.Input className="otp" />
        <OneTimePasswordField.Input className="otp" />
        <OneTimePasswordField.Input className="otp" />
        <OneTimePasswordField.Input className="otp" />
        <OneTimePasswordField.Input className="otp" />
        <OneTimePasswordField.Input className="otp" />
        <OneTimePasswordField.HiddenInput />
      </OneTimePasswordField.Root>
    </div>
  );
}
