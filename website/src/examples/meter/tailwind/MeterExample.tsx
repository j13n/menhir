import { Meter } from "menhir/meter";

export default function MeterExample() {
  return (
    <Meter.Root
      value={120}
      max={500}
      format={{ style: "unit", unit: "gigabyte" }}
      aria-labelledby="meter-label"
      class="grid w-64 grid-cols-[1fr_auto] gap-2 text-sm"
    >
      <span id="meter-label">Storage used</span>
      <Meter.Value />
      <div class="col-span-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div class="h-full w-(--meter) bg-stone-800 dark:bg-stone-300" />
      </div>
    </Meter.Root>
  );
}
