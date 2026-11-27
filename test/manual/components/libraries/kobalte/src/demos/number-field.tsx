import { NumberField } from "@kobalte/core/number-field";

export default function NumberFieldDemo() {
  return (
    <NumberField
      class="stack"
      defaultValue={2}
      minValue={0}
      maxValue={10}
      step={1}
    >
      <NumberField.Label>Quantity</NumberField.Label>
      <div class="row">
        <NumberField.DecrementTrigger>−</NumberField.DecrementTrigger>
        <NumberField.Input />
        <NumberField.IncrementTrigger>+</NumberField.IncrementTrigger>
      </div>
    </NumberField>
  );
}
