import { Input } from "menhir/input";

export default function OneTimeCode() {
  return (
    <label>
      Code
      <Input.Root
        name="code"
        autocomplete="one-time-code"
        inputmode="numeric"
        maxlength={6}
        pattern="\d{6}"
        required
      />
    </label>
  );
}
