import OtpField from "corvu/otp-field";
import { Show } from "solid-js";

// The field is one transparent input laid over the root; what it holds is
// drawn by the page from the context, one slot per character.
function Slot(props: { index: number }) {
  const context = OtpField.useContext();
  const char = () => context.value()[props.index];
  const active = () => context.activeSlots().includes(props.index);
  return (
    <div class="otp-slot" data-active={active() ? "" : undefined}>
      {char()}
      <Show when={active() && context.isInserting()}>
        <div class="otp-caret" />
      </Show>
    </div>
  );
}

export default function OtpFieldDemo() {
  return (
    <div class="stack">
      <label for="otp">Verification code</label>
      <OtpField maxLength={6} class="row otp">
        <OtpField.Input id="otp" />
        <Slot index={0} />
        <Slot index={1} />
        <Slot index={2} />
        <Slot index={3} />
        <Slot index={4} />
        <Slot index={5} />
      </OtpField>
    </div>
  );
}
