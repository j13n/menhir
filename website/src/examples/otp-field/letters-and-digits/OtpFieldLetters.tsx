import { OtpField } from "menhir/otp-field";

export default function OtpFieldLetters() {
  return (
    <>
      <label for="voucher">Voucher</label>
      <OtpField.Root id="voucher" name="voucher" length={6} pattern="[0-9A-Z]">
        <OtpField.Input />
        <OtpField.Slot index={0} />
        <OtpField.Slot index={1} />
        <OtpField.Slot index={2} />
        <span aria-hidden="true">-</span>
        <OtpField.Slot index={3} />
        <OtpField.Slot index={4} />
        <OtpField.Slot index={5} />
      </OtpField.Root>
    </>
  );
}
