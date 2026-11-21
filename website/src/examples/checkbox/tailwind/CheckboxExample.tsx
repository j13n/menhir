import { Checkbox } from "menhir/checkbox";
import { For, createSignal } from "solid-js";

const topics = ["Product news", "Security alerts"];

const box =
  "inline-flex size-5 cursor-pointer items-center justify-center rounded border border-stone-400 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-transparent data-checked:bg-stone-800 data-indeterminate:border-transparent data-indeterminate:bg-stone-800 dark:border-stone-500 dark:text-stone-900 dark:data-checked:bg-stone-300 dark:data-indeterminate:bg-stone-300";
// A check from two borders of a rotated box, a dash from one.
const mark =
  "hidden border-0 border-current data-checked:block data-checked:h-2.5 data-checked:w-1.5 data-checked:-translate-y-px data-checked:rotate-45 data-checked:border-r-2 data-checked:border-b-2 data-indeterminate:block data-indeterminate:w-2 data-indeterminate:border-b-2";

export default function CheckboxExample() {
  const [checked, setChecked] = createSignal([false, true]);
  const all = () => checked().every(Boolean);
  const some = () => checked().some(Boolean);
  return (
    <div class="inline-flex flex-col gap-2">
      <label class="inline-flex items-center gap-2">
        <Checkbox.Root
          checked={all()}
          indeterminate={some() && !all()}
          onCheckedChange={(value) => setChecked(topics.map(() => value))}
          class={box}
        >
          <Checkbox.Indicator class={mark} />
        </Checkbox.Root>
        Email updates
      </label>
      <For each={topics}>
        {(topic, index) => (
          <label class="ml-7 inline-flex items-center gap-2">
            <Checkbox.Root
              name="topics"
              value={topic}
              checked={checked()[index()]}
              onCheckedChange={(value) =>
                setChecked((current) =>
                  current.map((old, i) => (i === index() ? value : old)),
                )
              }
              class={box}
            >
              <Checkbox.Indicator class={mark} />
            </Checkbox.Root>
            {topic}
          </label>
        )}
      </For>
    </div>
  );
}
