import { isDev } from "@solidjs/web";
import {
  createContext,
  createMemo,
  createUniqueId,
  useContext,
} from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { createActiveDescendantList } from "../../floating/list-navigation/activeDescendant.ts";
import type {
  ActiveDescendantItem,
  ActiveDescendantList,
} from "../../floating/list-navigation/activeDescendant.ts";
import { createTypeahead } from "../../floating/typeahead/typeahead.ts";
import type { Typeahead } from "../../floating/typeahead/typeahead.ts";

/**
 * A select's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`, `data-disabled`
 * and `data-required`.
 */
export type SelectStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
  readonly "data-disabled": "" | undefined;
  readonly "data-required": "" | undefined;
};

/** An item of a select, as its list navigation knows it. */
export interface SelectItemEntry extends ActiveDescendantItem {
  /** What the Select's value is while this item is selected. */
  readonly value: string;
  /** Whether the item is disabled: reached, but not selected. */
  readonly disabled?: boolean;
}

/** The props of `Select.Root`, less its children. */
export interface SelectStateProps {
  /** The selected item's `value`, or `null` for none, when controlled. */
  value?: string | null;
  /** The item selected at first, when uncontrolled. */
  defaultValue?: string | null;
  /**
   * Called with the new value when the user selects an item, the browser
   * fills one in, or its form is reset. When controlled, the selection
   * changes only if `value` does.
   */
  onValueChange?: (value: string | null) => void;
  /** Whether the list is open, when controlled. */
  open?: boolean;
  /** Whether the list is open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value, and why, when the user opens or closes the
   * list. When controlled, the list changes only if `open` does.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /** Submitted with the form, as the hidden input's `name`. */
  name?: string;
  /** The `id` of the form the Select belongs to, when it is not inside it. */
  form?: string;
  /** Whether the form can be submitted only once an item is selected. */
  required?: boolean;
  /** Whether the Select ignores the user. It cannot be focused either. */
  disabled?: boolean;
  /** What the browser may fill in, as the hidden input's `autocomplete`. */
  autocomplete?: string;
}

/** What `Select.Root` shares with its parts through context. */
export interface Select {
  /** Whether the list is open. */
  open(): boolean;
  /** Asks to open or close the list, saying why. */
  setOpen(open: boolean, details: OpenChangeDetails): void;
  /** The selected item's `value`, or `null`. */
  value(): string | null;
  /** Asks for a value, as the hidden input's `change` and a reset do. */
  setValue(value: string | null): void;
  /**
   * Selects `item` through the hidden input, which fires `input` and
   * `change` for the form. A disabled item, and the item already selected,
   * change nothing. Returns whether the item can be selected.
   */
  select(item: SelectItemEntry | undefined): boolean;
  /** The selected item, once it has mounted. */
  selectedItem(): SelectItemEntry | undefined;
  /**
   * The active item: the one the keys or the pointer moved to, else, while
   * the list is open, the selected item, else the first. The Trigger names
   * it only while the list is open.
   */
  active(): SelectItemEntry | undefined;
  /** Whether `item` is the active one of an open list, for its `data-active`. */
  isActive(item: SelectItemEntry): boolean;
  /**
   * The item a list just opened starts on, until a key or the pointer
   * moves: the selected item, else the first.
   */
  initial(): SelectItemEntry | undefined;
  readonly list: ActiveDescendantList<SelectItemEntry>;
  readonly typeahead: Typeahead;
  /**
   * The Popup's `id`, which the Trigger names in `popovertarget` and
   * `aria-controls` before the Popup is rendered.
   */
  readonly popupId: string;
  /** The Trigger's `id`, which labels the Popup; set by the Trigger. */
  triggerId(): string | false | undefined;
  /** The Trigger's element, once rendered: the anchor by default. */
  trigger: HTMLElement | undefined;
  /** The hidden input, once rendered: the form's view of the value. */
  input: HTMLInputElement | undefined;
  /** The `data-*` attributes of the Trigger and the Popup. */
  readonly attributes: SelectStateAttributes;
  /** The Root's props, for the Trigger's button and hidden input. */
  readonly props: SelectStateProps;
}

/** Creates a select's state, its list navigation and its typeahead. */
export function createSelect(props: SelectStateProps): Select {
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  const [value, setValue, requested] = createControllableSignal<string | null>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? null;
    },
    onChange: (value) => props.onValueChange?.(value),
  });
  // Disabled items stay reachable, and the keys do not wrap (README,
  // "Decisions"): list navigation's defaults.
  const list = createActiveDescendantList<SelectItemEntry>({
    get open() {
      return open();
    },
  });
  const typeahead = createTypeahead<SelectItemEntry>({
    get open() {
      return open();
    },
    get items() {
      return list.items();
    },
    get active() {
      return active();
    },
    move: (item) => list.move(item),
  });
  // Runs again when an item mounts or leaves, and when the value changes:
  // not for each item on each move.
  const selectedItem = createMemo(() => {
    const selected = value();
    return list.items().find((item) => item.value === selected);
  });
  // Whenever the list opens, the selected item is active, else the first
  // (README, "Decisions"). Derived, not written to the list by an effect,
  // so the Trigger names it in the flush that opens the list. It changes
  // as the list opens and closes and on the first move, not on each move.
  const initial = createMemo(() =>
    open() && !list.active() ? (selectedItem() ?? list.items()[0]) : undefined,
  );
  const active = () => list.active() ?? initial();
  const select: Select = {
    open,
    setOpen,
    value,
    setValue,
    select: (item) => {
      if (!item || item.disabled) return false;
      const input = select.input;
      if (item.value !== requested()) {
        if (input) {
          // The form sees the events a native control fires, and the
          // Select takes the value from the `change`, as it does one the
          // browser filled in.
          input.value = item.value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } else setValue(item.value);
      }
      return true;
    },
    selectedItem,
    active,
    // Only while open: a move made while closed, as typing makes, waits
    // for the list to open, which a controlled Select may refuse.
    isActive: (item) => open() && (list.isActive(item) || initial() === item),
    initial,
    list,
    typeahead,
    popupId: createUniqueId(),
    triggerId: () => undefined,
    trigger: undefined,
    input: undefined,
    attributes: {
      get "data-open"() {
        return open() ? "" : undefined;
      },
      get "data-closed"() {
        return open() ? undefined : "";
      },
      get "data-disabled"() {
        return props.disabled ? "" : undefined;
      },
      get "data-required"() {
        return props.required ? "" : undefined;
      },
    },
    props,
  };
  return select;
}

// `null` outside a Root, so that the part can name what is missing.
export const SelectContext = createContext<Select | null>(null);

export function useSelectContext(): Select {
  const context = useContext(SelectContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Select parts must be placed within <Select.Root>.",
    );
  }
  return context!;
}
