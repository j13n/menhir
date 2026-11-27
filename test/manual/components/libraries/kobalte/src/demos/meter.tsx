import { Meter } from "@kobalte/core/meter";

export default function MeterDemo() {
  return (
    <Meter
      class="stack"
      value={60}
      getValueLabel={({ value, max }) => `${value} GB of ${max} GB`}
    >
      <div class="row">
        <Meter.Label>Storage</Meter.Label>
        <Meter.ValueLabel />
      </div>
      <Meter.Track class="track">
        <Meter.Fill class="fill" />
      </Meter.Track>
    </Meter>
  );
}
