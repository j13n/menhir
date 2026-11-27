import { TextField } from "@kobalte/core/text-field";

export default function InputDemo() {
  return (
    <div class="stack">
      <TextField class="stack">
        <TextField.Label>Name</TextField.Label>
        <TextField.Input />
      </TextField>
      <TextField class="stack">
        <TextField.Label>Comment</TextField.Label>
        <TextField.TextArea />
      </TextField>
    </div>
  );
}
