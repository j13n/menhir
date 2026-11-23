// A test autocomplete: a "City" label, an Input, a Trigger and a Clear, a
// Popup with a List of Bergen, Bodø, Oslo and Trondheim filtered by what is
// typed, unless children are given, a Status, and a button before and after
// it.
import { createMemo, createSignal, For } from "solid-js";

import { Autocomplete, includesText } from "../../src/autocomplete/index.ts";
import type { AutocompleteRootProps } from "../../src/autocomplete/root/AutocompleteRoot.tsx";

export const cities = ["Bergen", "Bodø", "Oslo", "Trondheim"];

export function City(props: AutocompleteRootProps) {
  // Filtered by the text the user typed, and not by a suggestion the
  // Autocomplete filled in (README, "Decisions").
  const [query, setQuery] = createSignal("");
  const shown = createMemo(() =>
    cities.filter((city) => includesText(city, query())),
  );
  return (
    <>
      <button type="button">Before</button>
      <label for="city" id="city-label">
        City
      </label>
      <Autocomplete.Root
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={(text, details) => {
          setQuery(details.reason === "input-change" ? text : "");
          props.onValueChange?.(text, details);
        }}
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        name={props.name}
        form={props.form}
        required={props.required}
        disabled={props.disabled}
      >
        <Autocomplete.Input id="city" />
        <Autocomplete.Trigger aria-label="Show cities">▾</Autocomplete.Trigger>
        <Autocomplete.Clear aria-label="Clear">×</Autocomplete.Clear>
        <Autocomplete.Popup>
          <Autocomplete.List aria-labelledby="city-label">
            {props.children ?? (
              <For each={shown()}>
                {(city) => (
                  <Autocomplete.Item value={city}>{city}</Autocomplete.Item>
                )}
              </For>
            )}
          </Autocomplete.List>
          <Autocomplete.Status data-testid="status">
            {(count) => `${count} cities`}
          </Autocomplete.Status>
        </Autocomplete.Popup>
      </Autocomplete.Root>
      <button type="button">After</button>
    </>
  );
}
