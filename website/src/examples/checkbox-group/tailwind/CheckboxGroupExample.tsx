import { CheckboxGroup } from "menhir/checkbox-group";
import { For } from "solid-js";

const toppings = ["Mushrooms", "Olives", "Peppers"];

const box =
  "inline-flex size-5 cursor-pointer items-center justify-center rounded border border-stone-400 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-transparent data-checked:bg-stone-800 data-indeterminate:border-transparent data-indeterminate:bg-stone-800 dark:border-stone-500 dark:text-stone-900 dark:data-checked:bg-stone-300 dark:data-indeterminate:bg-stone-300";
// A check from two borders of a rotated box, a dash from one.
const mark =
  "hidden border-0 border-current data-checked:block data-checked:h-2.5 data-checked:w-1.5 data-checked:-translate-y-px data-checked:rotate-45 data-checked:border-r-2 data-checked:border-b-2 data-indeterminate:block data-indeterminate:w-2 data-indeterminate:border-b-2";

export default function CheckboxGroupExample() {
  return (
    <CheckboxGroup.Root
      name="toppings"
      defaultValue={["Olives"]}
      class="inline-flex flex-col gap-2"
    >
      <legend class="mb-2 font-semibold">Toppings</legend>
      <label class="inline-flex items-center gap-2">
        <CheckboxGroup.Parent values={toppings} class={box}>
          <CheckboxGroup.Indicator class={mark} />
        </CheckboxGroup.Parent>
        All toppings
      </label>
      <For each={toppings}>
        {(topping) => (
          <label class="ml-7 inline-flex items-center gap-2">
            <CheckboxGroup.Item value={topping} class={box}>
              <CheckboxGroup.Indicator class={mark} />
            </CheckboxGroup.Item>
            {topping}
          </label>
        )}
      </For>
    </CheckboxGroup.Root>
  );
}
