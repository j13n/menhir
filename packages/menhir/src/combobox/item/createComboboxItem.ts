import type { JSX } from "@solidjs/web";
import { createUniqueId, onSettled } from "solid-js";

import type { ElementProps } from "../../core/renderElement.tsx";
import type {
  ComboboxBase,
  ComboboxItemEntry,
} from "../root/ComboboxContext.ts";

/** The props of an item that `createComboboxItem` reads. */
export interface ComboboxItemOptions {
  readonly id?: JSX.HTMLAttributes<HTMLElement>["id"];
  readonly value: string;
  readonly disabled?: boolean;
}

/**
 * An item of a combobox, the code `Combobox.Item` and `Autocomplete.Item`
 * share: its entry in the list navigation, registered once mounted, and
 * the props of its `option` element, its `id`, `data-active`, the disabled
 * state, the pointer and the click that selects or accepts it. `text` is
 * what the input shows once it is: a Combobox's label, an Autocomplete's
 * value. Each Item adds its own `aria-selected`.
 */
export function createComboboxItem(
  combobox: ComboboxBase,
  props: ComboboxItemOptions,
  text: (element: HTMLElement) => string,
): { item: ComboboxItemEntry; props: ElementProps } {
  let element!: HTMLElement;
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one, which the Input names
  // while the item is active, so `false` does not remove it. Kept out of
  // the merge ("`undefined` is a value", PLAN.md section 8).
  const id = () => props.id || generated;
  const item: ComboboxItemEntry = {
    get element() {
      return element;
    },
    get id() {
      return id();
    },
    get text() {
      return text(element);
    },
    get value() {
      return props.value;
    },
    get disabled() {
      return props.disabled;
    },
  };
  onSettled(() => combobox.list.register(item));
  return {
    item,
    props: {
      role: "option",
      get id() {
        return id();
      },
      get "data-active"() {
        return combobox.isActive(item) ? "" : undefined;
      },
      get "aria-disabled"() {
        return props.disabled ? "true" : undefined;
      },
      get "data-disabled"() {
        return props.disabled ? "" : undefined;
      },
      onPointerMove: (event: PointerEvent) =>
        combobox.list.onPointerMove(item, event),
      onClick: (event: MouseEvent) => {
        if (combobox.select(item, event))
          combobox.setOpen(false, { reason: "item-press", event });
      },
      ref: (el: HTMLElement) => {
        element = el;
      },
    } satisfies ElementProps,
  };
}
