import { TextField } from "@kobalte/core/text-field";
import { createSignal } from "solid-js";

export default function FieldDemo() {
  // Kobalte does not validate: the page tells it when the field is
  // invalid, from the input's own validity, and the error message follows.
  const [invalid, setInvalid] = createSignal(false);

  return (
    <TextField
      class="stack"
      required
      validationState={invalid() ? "invalid" : undefined}
    >
      <TextField.Label>Email</TextField.Label>
      <TextField.Input
        type="email"
        onBlur={(event) => setInvalid(!event.currentTarget.validity.valid)}
        onInput={(event) => {
          if (invalid()) setInvalid(!event.currentTarget.validity.valid);
        }}
      />
      <TextField.Description class="hint">
        We only use it for receipts.
      </TextField.Description>
      <TextField.ErrorMessage class="error">
        Enter a valid email address.
      </TextField.ErrorMessage>
    </TextField>
  );
}
