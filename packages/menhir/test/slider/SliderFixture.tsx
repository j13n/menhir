// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal } from "solid-js";

import { Field } from "../../src/field/index.ts";
import { Slider } from "../../src/slider/index.ts";

export default function SliderFixture() {
  const [year, setYear] = createSignal(1969);
  return (
    <form>
      <Field.Root name="year">
        <Field.Label>Year</Field.Label>
        <Field.Control
          render={(p) => (
            <Slider.Root
              {...p}
              value={year()}
              onValueChange={setYear}
              min={1900}
              max={2100}
              format={{ useGrouping: false }}
              locale="en-US"
              data-testid="root"
            />
          )}
        >
          <Slider.Value data-testid="value" />
          <Slider.Track>
            <Slider.Thumb />
          </Slider.Track>
        </Field.Control>
      </Field.Root>
      <output data-testid="year">{String(year())}</output>
    </form>
  );
}
