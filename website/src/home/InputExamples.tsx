import { Checkbox } from "menhir/checkbox";
import { CheckboxGroup } from "menhir/checkbox-group";
import { Input } from "menhir/input";
import { NumberField } from "menhir/number-field";
import { Radio } from "menhir/radio";
import { Slider } from "menhir/slider";
import { Switch } from "menhir/switch";
import { Toggle } from "menhir/toggle";
import { ToggleGroup } from "menhir/toggle-group";
import { createSignal, For } from "solid-js";

import { ExampleCard, ExampleGroup } from "./ExampleGroup";

const toppings = ["Mushrooms", "Olives"];
// The Checkbox Group's boxes, styled as the Checkbox, with a dash while
// partly checked.
const checkboxBox =
  "inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-stone-400 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-transparent data-checked:bg-stone-800 data-indeterminate:border-transparent data-indeterminate:bg-stone-800 dark:border-stone-500 dark:text-stone-900 dark:data-checked:bg-stone-300 dark:data-indeterminate:bg-stone-300";
const checkboxMark =
  "hidden border-0 border-current data-checked:block data-checked:h-3 data-checked:w-1.5 data-checked:-translate-y-px data-checked:rotate-45 data-checked:border-r-2 data-checked:border-b-2 data-indeterminate:block data-indeterminate:w-2.5 data-indeterminate:border-b-2";
const deliveries = ["Standard", "Express"];
// The Radio's radios: circles the size of the Checkbox Group's boxes, with
// a dot while checked.
const radioCircle =
  "inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-stone-800 dark:border-stone-500 dark:data-checked:border-stone-300";
const radioDot =
  "hidden size-3 rounded-full bg-stone-800 data-checked:block dark:bg-stone-300";
// The Number Field's buttons, either side of its input in one box.
const stepButton =
  "w-7 cursor-pointer disabled:cursor-default disabled:opacity-40";

export default function InputExamples() {
  // The Input's text: digits only, so a letter typed is undone.
  const [pin, setPin] = createSignal("");
  return (
    <ExampleGroup category="Inputs">
      <ExampleCard name="Switch" href="/docs/components/switch">
        <label class="flex items-center justify-between gap-4">
          Airplane mode
          <Switch.Root class="inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-stone-300 p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:bg-stone-800 dark:bg-stone-700 dark:data-checked:bg-stone-300">
            <Switch.Thumb class="block size-5 rounded-full bg-white shadow transition-transform data-checked:translate-x-5 dark:data-checked:bg-stone-900" />
          </Switch.Root>
        </label>
      </ExampleCard>
      <ExampleCard name="Checkbox" href="/docs/components/checkbox">
        <label class="flex items-center justify-between gap-4">
          Email updates
          <Checkbox.Root
            defaultChecked
            class="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-stone-400 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-transparent data-checked:bg-stone-800 dark:border-stone-500 dark:text-stone-900 dark:data-checked:bg-stone-300"
          >
            <Checkbox.Indicator class="hidden h-3 w-1.5 -translate-y-px rotate-45 border-r-2 border-b-2 border-current data-checked:block" />
          </Checkbox.Root>
        </label>
      </ExampleCard>
      <ExampleCard name="Checkbox Group" href="/docs/components/checkbox-group">
        <CheckboxGroup.Root
          defaultValue={["Olives"]}
          class="flex flex-col gap-2"
        >
          <legend class="mb-1">Toppings</legend>
          <label class="flex items-center justify-between gap-4">
            All toppings
            <CheckboxGroup.Parent values={toppings} class={checkboxBox}>
              <CheckboxGroup.Indicator class={checkboxMark} />
            </CheckboxGroup.Parent>
          </label>
          <For each={toppings}>
            {(topping) => (
              <label class="flex items-center justify-between gap-4 pl-4">
                {topping}
                <CheckboxGroup.Item value={topping} class={checkboxBox}>
                  <CheckboxGroup.Indicator class={checkboxMark} />
                </CheckboxGroup.Item>
              </label>
            )}
          </For>
        </CheckboxGroup.Root>
      </ExampleCard>
      <ExampleCard name="Radio" href="/docs/components/radio">
        <Radio.Root defaultValue="Standard" class="flex flex-col gap-2">
          <legend class="mb-1">Delivery</legend>
          <For each={deliveries}>
            {(delivery) => (
              <label class="flex items-center justify-between gap-4">
                {delivery}
                <Radio.Item value={delivery} class={radioCircle}>
                  <Radio.Indicator class={radioDot} />
                </Radio.Item>
              </label>
            )}
          </For>
        </Radio.Root>
      </ExampleCard>
      <ExampleCard name="Input" href="/docs/components/input">
        <div class="flex flex-col gap-1">
          <label class="flex items-center justify-between gap-4">
            PIN
            <Input.Root
              inputmode="numeric"
              maxlength={4}
              value={pin()}
              onValueChange={(value) => {
                if (/^\d*$/.test(value)) setPin(value);
              }}
              class="w-36 rounded-md border border-stone-300 bg-transparent px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
            />
          </label>
          <p class="text-sm opacity-70">Digits only: try a letter.</p>
        </div>
      </ExampleCard>
      <ExampleCard name="Number Field" href="/docs/components/number-field">
        <div class="flex items-center justify-between gap-4">
          <label for="home-guests">Guests</label>
          <NumberField.Root
            id="home-guests"
            defaultValue={2}
            min={1}
            max={8}
            class="inline-flex shrink-0 rounded-md border border-stone-300 text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-500 dark:border-stone-700"
          >
            <NumberField.Decrement aria-label="Fewer guests" class={stepButton}>
              −
            </NumberField.Decrement>
            <NumberField.Input class="w-10 bg-transparent py-1 text-center outline-none" />
            <NumberField.Increment aria-label="More guests" class={stepButton}>
              +
            </NumberField.Increment>
          </NumberField.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Slider" href="/docs/components/slider">
        <div class="flex items-center justify-between gap-4">
          <label for="home-brightness">Brightness</label>
          <Slider.Root
            id="home-brightness"
            defaultValue={60}
            class="flex w-36 shrink-0 items-center gap-3 text-sm"
          >
            <Slider.Track class="relative h-5 flex-1 cursor-pointer before:absolute before:inset-x-0 before:top-[calc(50%-0.125rem)] before:h-1 before:rounded-full before:bg-stone-200 dark:before:bg-stone-700">
              <div class="absolute start-0 top-[calc(50%-0.125rem)] h-1 w-(--slider) rounded-full bg-stone-800 dark:bg-stone-300" />
              <Slider.Thumb class="absolute start-[calc(var(--slider)-0.5rem)] top-[calc(50%-0.5rem)] size-4 rounded-full border-2 border-stone-800 bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-stone-500 dark:border-stone-300 dark:bg-stone-800" />
            </Slider.Track>
            <Slider.Value class="w-7 text-end tabular-nums" />
          </Slider.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Toggle" href="/docs/components/toggle">
        <div class="flex items-center justify-between gap-4">
          Microphone
          <Toggle.Root class="shrink-0 cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-pressed:border-transparent data-pressed:bg-stone-800 data-pressed:text-white dark:border-stone-700 dark:data-pressed:bg-stone-300 dark:data-pressed:text-stone-900">
            Mute
          </Toggle.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Toggle Group" href="/docs/components/toggle-group">
        <ToggleGroup.Root
          aria-label="Text alignment"
          defaultValue={["left"]}
          class="flex gap-1"
        >
          <For each={["Left", "Center", "Right"]}>
            {(name) => (
              <ToggleGroup.Item
                value={name.toLowerCase()}
                class="flex-1 cursor-pointer rounded-md border border-stone-300 px-2 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-pressed:border-transparent data-pressed:bg-stone-800 data-pressed:text-white dark:border-stone-700 dark:data-pressed:bg-stone-300 dark:data-pressed:text-stone-900"
              >
                {name}
              </ToggleGroup.Item>
            )}
          </For>
        </ToggleGroup.Root>
      </ExampleCard>
    </ExampleGroup>
  );
}
