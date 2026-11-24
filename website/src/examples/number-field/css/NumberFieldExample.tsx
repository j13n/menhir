import { NumberField } from "menhir/number-field";

import "./number-field.css";

export default function NumberFieldExample() {
  return (
    <div class="number-field-example">
      <label for="tickets">Tickets</label>
      <NumberField.Root
        id="tickets"
        name="tickets"
        defaultValue={2}
        min={1}
        max={10}
        class="number-field"
      >
        <NumberField.Decrement aria-label="Fewer tickets" class="step">
          −
        </NumberField.Decrement>
        <NumberField.Input class="input" />
        <NumberField.Increment aria-label="More tickets" class="step">
          +
        </NumberField.Increment>
      </NumberField.Root>
    </div>
  );
}
