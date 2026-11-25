import { OtpField } from "menhir/otp-field";
import { Repeat } from "solid-js";

// The Input is invisible, so the boxes show where focus is, with a caret in
// the box where the next character goes.
const slot =
  "flex h-12 w-10 items-center justify-center rounded-md border border-stone-300 text-xl data-active:outline-2 data-active:-outline-offset-1 data-active:outline-stone-500 dark:border-stone-700 data-caret:not-data-filled:after:h-6 data-caret:not-data-filled:after:w-px data-caret:not-data-filled:after:bg-current data-caret:not-data-filled:after:content-[''] motion-safe:data-caret:not-data-filled:after:animate-pulse";

export default function OtpFieldExample() {
  return (
    <div class="flex flex-col items-start gap-1">
      <label for="verification-code" class="text-sm font-medium">
        Verification code
      </label>
      <OtpField.Root
        id="verification-code"
        name="code"
        length={6}
        class="flex gap-2"
      >
        <OtpField.Input />
        <Repeat count={6}>
          {(index) => <OtpField.Slot index={index} class={slot} />}
        </Repeat>
      </OtpField.Root>
    </div>
  );
}
