import { Meter } from "@base-ui/react/meter";

const valueText = "60 GB of 100 GB";

export default function MeterDemo() {
  return (
    <Meter.Root value={60} getAriaValueText={() => valueText} className="stack">
      <Meter.Label>Storage</Meter.Label>
      <Meter.Track className="track">
        <Meter.Indicator className="fill" />
      </Meter.Track>
      <Meter.Value>{() => valueText}</Meter.Value>
    </Meter.Root>
  );
}
