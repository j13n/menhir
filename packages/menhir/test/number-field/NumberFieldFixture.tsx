// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal } from "solid-js";

import { Field } from "../../src/field/index.ts";
import { NumberField } from "../../src/number-field/index.ts";

export default function NumberFieldFixture() {
  const [price, setPrice] = createSignal<number | null>(1234.5);
  return (
    <form>
      <Field.Root name="price">
        <Field.Label>Price</Field.Label>
        <Field.Control
          render={(p) => (
            <NumberField.Root
              {...p}
              value={price()}
              onValueChange={setPrice}
              min={0}
              max={10000}
              step={0.5}
              format={{ style: "currency", currency: "EUR" }}
              locale="de-DE"
            >
              <NumberField.Decrement aria-label="Decrease">
                −
              </NumberField.Decrement>
              <NumberField.Input />
              <NumberField.Increment aria-label="Increase">
                +
              </NumberField.Increment>
            </NumberField.Root>
          )}
        />
      </Field.Root>
      <output data-testid="price">{String(price())}</output>
      <button type="button">Next</button>
    </form>
  );
}
