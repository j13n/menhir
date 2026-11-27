import { useId } from "react";

import { NumberField } from "@base-ui/react/number-field";

export default function NumberFieldDemo() {
  const id = useId();

  return (
    <NumberField.Root
      id={id}
      min={0}
      max={10}
      step={1}
      defaultValue={2}
      className="stack"
    >
      <label htmlFor={id}>Quantity</label>
      <NumberField.Group className="number-group">
        <NumberField.Decrement>−</NumberField.Decrement>
        <NumberField.Input />
        <NumberField.Increment>+</NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
