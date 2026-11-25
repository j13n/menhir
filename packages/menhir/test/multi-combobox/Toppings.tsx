// A test multi combobox: a "Toppings" label, the Chips with a chip per
// value (its text the label, with a remove button) and the Input, a Trigger
// and a Clear, a Popup with a List of Cheese, Mushrooms, Olives and Onions
// filtered by what is typed, unless children are given, a Status, and a
// button before and after it.
import { createMemo, createSignal, For } from "solid-js";

import { includesText, MultiCombobox } from "../../src/multi-combobox/index.ts";
import type { MultiComboboxRootProps } from "../../src/multi-combobox/root/MultiComboboxRoot.tsx";

export const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "onions", label: "Onions" },
];

export const labelOf = (value: string) =>
  toppings.find((topping) => topping.value === value)?.label ?? value;

export interface ToppingsProps extends MultiComboboxRootProps {
  /** Whether to leave the Chips box out, with the Input alone. */
  noChips?: boolean;
}

export function Toppings(props: ToppingsProps) {
  // Filtered by the text the user typed (README, "The input value").
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() =>
    toppings.filter((topping) => includesText(topping.label, query())),
  );
  const input = () => <MultiCombobox.Input id="toppings" />;
  return (
    <>
      <button type="button">Before</button>
      <label for="toppings" id="toppings-label">
        Toppings
      </label>
      <MultiCombobox.Root
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        inputValue={props.inputValue}
        defaultInputValue={props.defaultInputValue}
        onInputValueChange={(text, details) => {
          setQuery(details.reason === "input-change" ? text : "");
          props.onInputValueChange?.(text, details);
        }}
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        name={props.name}
        form={props.form}
        required={props.required}
        disabled={props.disabled}
      >
        {props.noChips ? (
          input()
        ) : (
          <MultiCombobox.Chips data-testid="chips">
            <MultiCombobox.Value>
              {(value) => (
                <MultiCombobox.Chip value={value}>
                  {labelOf(value)}
                  <MultiCombobox.ChipRemove
                    aria-label={`Remove ${labelOf(value)}`}
                  >
                    ×
                  </MultiCombobox.ChipRemove>
                </MultiCombobox.Chip>
              )}
            </MultiCombobox.Value>
            {input()}
          </MultiCombobox.Chips>
        )}
        <MultiCombobox.Trigger aria-label="Show toppings">
          ▾
        </MultiCombobox.Trigger>
        <MultiCombobox.Clear aria-label="Clear">×</MultiCombobox.Clear>
        <MultiCombobox.Popup>
          <MultiCombobox.List aria-labelledby="toppings-label">
            {props.children ?? (
              <For each={shown()}>
                {(topping) => (
                  <MultiCombobox.Item value={topping.value}>
                    <MultiCombobox.ItemIndicator>✓</MultiCombobox.ItemIndicator>
                    {topping.label}
                  </MultiCombobox.Item>
                )}
              </For>
            )}
          </MultiCombobox.List>
          <MultiCombobox.Status data-testid="status">
            {(count) => `${count} toppings`}
          </MultiCombobox.Status>
        </MultiCombobox.Popup>
      </MultiCombobox.Root>
      <button type="button">After</button>
    </>
  );
}
