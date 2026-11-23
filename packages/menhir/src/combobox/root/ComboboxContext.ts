import { isDev } from "@solidjs/web";
import {
  createContext,
  createMemo,
  createUniqueId,
  untrack,
  useContext,
} from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";
import { createActiveDescendantList } from "../../floating/list-navigation/activeDescendant.ts";
import type {
  ActiveDescendantItem,
  ActiveDescendantList,
} from "../../floating/list-navigation/activeDescendant.ts";

/**
 * Why the text in the input changed:
 *
 * - `input-change`: the user typed or edited it.
 * - `item-press`: an item was selected, and the text is its label.
 * - `escape-key`: Escape on a closed list emptied it.
 * - `clear-press`: `Combobox.Clear` emptied it.
 * - `focus-out`: focus left the input, and the text went back to the
 *   selected item's label, or empty.
 * - `reset`: its form was reset.
 */
export type InputValueChangeReason =
  | "input-change"
  | "item-press"
  | "escape-key"
  | "clear-press"
  | "focus-out"
  | "reset";

/** The second argument of `onInputValueChange`. */
export interface InputValueChangeDetails {
  readonly reason: InputValueChangeReason;
  readonly event: Event;
}

/**
 * A combobox's state as `data-*` attributes, each `""` when it applies and
 * absent otherwise: one of `data-open` and `data-closed`, `data-disabled`
 * and `data-required`.
 */
export type ComboboxStateAttributes = {
  readonly "data-open": "" | undefined;
  readonly "data-closed": "" | undefined;
  readonly "data-disabled": "" | undefined;
  readonly "data-required": "" | undefined;
};

/** An item of a combobox, as its list navigation knows it. */
export interface ComboboxItemEntry extends ActiveDescendantItem {
  /** What the Combobox's value is while this item is selected. */
  readonly value: string;
  /** Whether the item is disabled: reached, but not selected. */
  readonly disabled?: boolean;
}

/** The props of `Combobox.Root`, less its children. */
export interface ComboboxStateProps {
  /** The selected item's `value`, or `null` for none, when controlled. */
  value?: string | null;
  /** The item selected at first, when uncontrolled. */
  defaultValue?: string | null;
  /**
   * Called with the new value when the user selects an item or empties
   * the Combobox, or its form is reset. When controlled, the selection
   * changes only if `value` does.
   */
  onValueChange?: (value: string | null) => void;
  /** The text in the input, when controlled. */
  inputValue?: string;
  /**
   * The text in the input at first, when uncontrolled. Without it, the
   * selected item's label once the items have mounted, and nothing in the
   * server HTML.
   */
  defaultInputValue?: string;
  /**
   * Called with the new text, and why, when the user types, selects an
   * item or empties the Combobox, when focus leaves and the text goes back
   * to the selection, or when its form is reset. Filter by it for
   * `input-change` only. When controlled, the text changes only if
   * `inputValue` does.
   */
  onInputValueChange?: (text: string, details: InputValueChangeDetails) => void;
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
  /** The `id` of the form the Combobox belongs to, when it is not inside it. */
  form?: string;
  /** Whether the form can be submitted only once an item is selected. */
  required?: boolean;
  /** Whether the Combobox ignores the user. It cannot be focused either. */
  disabled?: boolean;
}

/** What `Combobox.Root` shares with its parts through context. */
export interface Combobox {
  /** Whether the list is open. */
  open(): boolean;
  /** Asks to open or close the list, saying why. */
  setOpen(open: boolean, details: OpenChangeDetails): void;
  /** The selected item's `value`, or `null`. */
  value(): string | null;
  /** Asks for a value, as the hidden input's `change` and a reset do. */
  setValue(value: string | null): void;
  /** The text the input shows. */
  inputValue(): string;
  /** Asks for a text, saying why. */
  setInputValue(text: string, details: InputValueChangeDetails): void;
  /**
   * Selects `item`: its value through the hidden input, which fires
   * `input` and `change` for the form, and its label as the text. A
   * disabled item changes nothing. Returns whether it could be selected.
   */
  select(item: ComboboxItemEntry | undefined, event: Event): boolean;
  /** Empties the text and the value. */
  clear(event: Event, reason: "escape-key" | "clear-press"): void;
  /**
   * Puts the text back to the selected item's label as focus leaves, or
   * clears the value if the user emptied the text.
   */
  revert(event: Event): void;
  /** The label of the item with `value`, if one has mounted. */
  labelOfValue(value: string | null): string | undefined;
  /** Whether `item` is the active one of an open list, for its `data-active`. */
  isActive(item: ComboboxItemEntry): boolean;
  /** The number of items in the list, for `Combobox.Status`. */
  count(): number;
  readonly list: ActiveDescendantList<ComboboxItemEntry>;
  /** The List's `id`, which the Input names before the List is rendered. */
  readonly listId: string;
  /** The input, once rendered: focused by the Trigger and Clear. */
  input: HTMLInputElement | undefined;
  /** The hidden input, once rendered: the form's view of the value. */
  hiddenInput: HTMLInputElement | undefined;
  /** The `data-*` attributes of the Input, the Trigger and the Popup. */
  readonly attributes: ComboboxStateAttributes;
  /** The Root's props, for the parts' elements. */
  readonly props: ComboboxStateProps;
}

/** Creates a combobox's state and its list navigation. */
export function createCombobox(props: ComboboxStateProps): Combobox {
  const [open, setOpen] = createControllableSignal<boolean, OpenChangeDetails>({
    get value() {
      return props.open;
    },
    get defaultValue() {
      return props.defaultOpen ?? false;
    },
    onChange: (value, details) => props.onOpenChange?.(value, details),
  });
  const [value, setValue, requestedValue] = createControllableSignal<
    string | null
  >({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? null;
    },
    onChange: (value) => props.onValueChange?.(value),
  });
  // `null` until the user, a selection or a reset sets a text: the input
  // then shows the selected item's label, once it has mounted (README,
  // "Two values"). The consumer only ever sees a string.
  const [text, setText, requestedText] = createControllableSignal<
    string | null,
    InputValueChangeDetails
  >({
    get value() {
      return props.inputValue;
    },
    get defaultValue() {
      return props.defaultInputValue ?? null;
    },
    onChange: (text, details) => props.onInputValueChange?.(text!, details),
  });
  // Disabled items stay reachable; Home and End belong to the text, so the
  // arrow keys wrap, as the list autocomplete example's do (README).
  const list = createActiveDescendantList<ComboboxItemEntry>({
    get open() {
      return open();
    },
    wrap: true,
  });
  const labelOfValue = (selected: string | null) => {
    const item = list.items().find((item) => item.value === selected);
    // An item's text is always given: its `label`, else its content.
    return item?.text!.trim();
  };
  // The selected item's label, kept while the consumer has filtered that
  // item out of the list, so focus leaving can put it back. Runs again when
  // an item mounts or leaves, and when the value changes; a string, so an
  // equal label stops there.
  let labelled: string | null = null;
  const selectedLabel = createMemo((previous: string | undefined) => {
    const selected = value();
    const label =
      labelOfValue(selected) ?? (selected === labelled ? previous : undefined);
    labelled = selected;
    return label;
  });
  // A memo, so that the input's draft, derived from it, is not derived
  // again, over an edit, when nothing it shows changed.
  const inputValue = createMemo(() => text() ?? selectedLabel() ?? "");
  // What the input shows after the sets of this turn.
  const requestedInputValue = () =>
    requestedText() ?? untrack(selectedLabel) ?? "";
  let edited = false;
  const setInputValue = (next: string, details: InputValueChangeDetails) => {
    // Whether the user has edited the text since it was last set for
    // another reason: only then does focus leaving change anything.
    edited = details.reason === "input-change";
    if (next !== requestedInputValue()) setText(next, details);
  };
  // Through the hidden input, which fires the events a native control
  // fires, so the form sees them; the Combobox takes the value from its
  // `change`.
  const commit = (next: string | null) => {
    if (next === requestedValue()) return;
    const input = combobox.hiddenInput;
    if (!input) return setValue(next);
    input.value = next ?? "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const combobox: Combobox = {
    open,
    setOpen,
    value,
    setValue,
    inputValue,
    setInputValue,
    select: (item, event) => {
      if (!item || item.disabled) return false;
      commit(item.value);
      setInputValue(item.text!.trim(), { reason: "item-press", event });
      return true;
    },
    clear: (event, reason) => {
      commit(null);
      setInputValue("", { reason, event });
    },
    revert: (event) => {
      // An untouched Combobox keeps its value, though its text may be
      // empty while its items have not mounted.
      if (!edited) return;
      if (!requestedInputValue().trim()) {
        commit(null);
        setInputValue("", { reason: "focus-out", event });
        return;
      }
      const selected = requestedValue();
      const label =
        selected === null
          ? ""
          : (labelOfValue(selected) ?? selectedLabel() ?? "");
      setInputValue(label, { reason: "focus-out", event });
    },
    labelOfValue,
    // Only while open, as the input names it.
    isActive: (item) => open() && list.isActive(item),
    count: () => list.items().length,
    list,
    listId: createUniqueId(),
    input: undefined,
    hiddenInput: undefined,
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
  return combobox;
}

// `null` outside a Root, so that the part can name what is missing.
export const ComboboxContext = createContext<Combobox | null>(null);

export function useComboboxContext(): Combobox {
  const context = useContext(ComboboxContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Combobox parts must be placed within <Combobox.Root>.",
    );
  }
  return context!;
}
