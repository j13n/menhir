import { Radio } from "menhir/radio";
import { For } from "solid-js";

const sizes = ["Small", "Medium", "Large"];

const radio =
  "inline-flex size-5 cursor-pointer items-center justify-center rounded-full border border-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-stone-800 dark:border-stone-500 dark:data-checked:border-stone-300";
const dot =
  "hidden size-2.5 rounded-full bg-stone-800 data-checked:block dark:bg-stone-300";

export default function RadioExample() {
  return (
    <Radio.Root
      name="size"
      defaultValue="Medium"
      class="inline-flex flex-col gap-2"
    >
      <legend class="mb-2 font-semibold">Size</legend>
      <For each={sizes}>
        {(size) => (
          <label class="inline-flex items-center gap-2">
            <Radio.Item value={size} class={radio}>
              <Radio.Indicator class={dot} />
            </Radio.Item>
            {size}
          </label>
        )}
      </For>
    </Radio.Root>
  );
}
