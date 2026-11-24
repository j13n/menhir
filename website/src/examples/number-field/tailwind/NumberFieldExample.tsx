import { NumberField } from "menhir/number-field";

const step = "w-8 cursor-pointer disabled:cursor-default disabled:opacity-40";

export default function NumberFieldExample() {
  return (
    <div class="flex flex-col items-start gap-1">
      <label for="tickets" class="text-sm font-medium">
        Tickets
      </label>
      <NumberField.Root
        id="tickets"
        name="tickets"
        defaultValue={2}
        min={1}
        max={10}
        class="inline-flex rounded-md border border-stone-300 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-500 dark:border-stone-700"
      >
        <NumberField.Decrement aria-label="Fewer tickets" class={step}>
          −
        </NumberField.Decrement>
        <NumberField.Input class="w-16 bg-transparent px-2 py-1.5 text-center outline-none" />
        <NumberField.Increment aria-label="More tickets" class={step}>
          +
        </NumberField.Increment>
      </NumberField.Root>
    </div>
  );
}
