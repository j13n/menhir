import { Slider } from "menhir/slider";

export default function SliderExample() {
  return (
    <Slider.Root
      id="year"
      name="year"
      defaultValue={1969}
      min={1900}
      max={2025}
      format={{ useGrouping: false }}
      class="grid w-64 grid-cols-[1fr_auto] gap-2 text-sm"
    >
      <label for="year">Year</label>
      <Slider.Value />
      <Slider.Track class="relative col-span-2 h-5 cursor-pointer before:absolute before:inset-x-0 before:top-[calc(50%-0.125rem)] before:h-1 before:rounded-full before:bg-stone-200 dark:before:bg-stone-700">
        <div class="absolute start-0 top-[calc(50%-0.125rem)] h-1 w-(--slider) rounded-full bg-stone-800 dark:bg-stone-300" />
        <Slider.Thumb class="absolute start-[calc(var(--slider)-0.5rem)] top-[calc(50%-0.5rem)] size-4 rounded-full border-2 border-stone-800 bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-stone-500 dark:border-stone-300 dark:bg-stone-800" />
      </Slider.Track>
    </Slider.Root>
  );
}
