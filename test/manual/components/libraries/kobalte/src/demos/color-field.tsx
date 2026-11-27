import { ColorField } from "@kobalte/core/color-field";

export default function ColorFieldDemo() {
  return (
    <ColorField class="stack">
      <ColorField.Label>Favourite colour</ColorField.Label>
      <ColorField.Input />
    </ColorField>
  );
}
