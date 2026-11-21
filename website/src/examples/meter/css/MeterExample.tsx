import { Meter } from "menhir/meter";

import "./meter.css";

export default function MeterExample() {
  return (
    <Meter.Root
      value={120}
      max={500}
      format={{ style: "unit", unit: "gigabyte" }}
      aria-labelledby="meter-label"
      class="meter"
    >
      <span id="meter-label">Storage used</span>
      <Meter.Value />
      <div class="meter-track">
        <div class="meter-fill" />
      </div>
    </Meter.Root>
  );
}
