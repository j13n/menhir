// A test select: a "Fruit" label, a Trigger with a Value, a Popup with
// Apple, Banana and Cherry unless children are given, and a button before
// and after it.
import type { JSX } from "@solidjs/web";

import { Select } from "../../src/select/index.ts";
import type { SelectPopupProps } from "../../src/select/popup/SelectPopup.tsx";
import type { SelectRootProps } from "../../src/select/root/SelectRoot.tsx";

export interface FruitProps extends SelectRootProps {
  /** Props for the Popup. */
  popup?: Omit<SelectPopupProps, "children">;
  /** The Trigger, instead of the default one. */
  trigger?: JSX.Element;
}

export function Fruit(props: FruitProps) {
  return (
    <>
      <button type="button">Before</button>
      <label for="fruit">Fruit</label>
      <Select.Root
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        name={props.name}
        form={props.form}
        required={props.required}
        disabled={props.disabled}
        autocomplete={props.autocomplete}
      >
        {props.trigger ?? (
          <Select.Trigger id="fruit">
            <Select.Value placeholder="Pick a fruit" />
          </Select.Trigger>
        )}
        <Select.Popup
          side={props.popup?.side}
          align={props.popup?.align}
          sideOffset={props.popup?.sideOffset}
          alignOffset={props.popup?.alignOffset}
          collisionPadding={props.popup?.collisionPadding}
          anchor={props.popup?.anchor}
          aria-labelledby={props.popup?.["aria-labelledby"]}
          style={props.popup?.style}
        >
          {props.children ?? (
            <>
              <Select.Item value="apple">Apple</Select.Item>
              <Select.Item value="banana">Banana</Select.Item>
              <Select.Item value="cherry">Cherry</Select.Item>
            </>
          )}
        </Select.Popup>
      </Select.Root>
      <button type="button">After</button>
    </>
  );
}
