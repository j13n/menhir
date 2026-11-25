import { createUniqueId, onFlush, untrack } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { createComboboxBase } from "../../combobox/root/ComboboxContext.ts";
import type {
  ComboboxBase,
  InputValueChangeDetails,
} from "../../combobox/root/ComboboxContext.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";

/** The props of `MultiCombobox.Root`, less its children. */
export interface MultiComboboxStateProps {
  /** The selected items' `value`s, in the order selected, when controlled. `[]` for none. */
  value?: string[];
  /** The items selected at first, when uncontrolled. */
  defaultValue?: string[];
  /**
   * Called with the new list when the user selects an item or takes one out,
   * empties the Multi Combobox, or its form is reset. When controlled, the
   * list changes only if `value` does.
   */
  onValueChange?: (value: string[]) => void;
  /** The text in the input, when controlled. */
  inputValue?: string;
  /** The text in the input at first, when uncontrolled. Default `""`. */
  defaultInputValue?: string;
  /**
   * Called with the new text, and why, when the user types, selects an item,
   * which empties it, or empties it, when focus leaves, or when its form is
   * reset. Filter by it for `input-change` only. When controlled, the text
   * changes only if `inputValue` does.
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
  /** The name each value is submitted under, one entry per value. */
  name?: string;
  /** The `id` of the form it belongs to, when it is not inside it. */
  form?: string;
  /** Whether the form can be submitted only once an item is selected. */
  required?: boolean;
  /** Whether it ignores the user. It cannot be focused either. */
  disabled?: boolean;
}

/** What `MultiCombobox.Root` shares with its parts, through Combobox's context. */
export interface MultiCombobox extends ComboboxBase {
  readonly component: "MultiCombobox";
  /** The selected items' values, in the order selected. */
  value(): string[];
  /** Asks for a list of values, as a form reset does. */
  setValue(value: string[]): void;
  /** Asks for a text, saying why. */
  setInputValue(text: string, details: InputValueChangeDetails): void;
  /**
   * Takes `value` out, as a chip's keys and its remove button do, then
   * focuses the chip of `focusValue`, else the input, once the list has
   * settled without it.
   */
  remove(value: string, focusValue?: string): void;
  /** Focuses the chip of `value`, else the input when it has none. */
  focusChip(value: string | undefined): void;
  /** Each value's Chip, once mounted, for the keys between them. */
  readonly chips: Map<string, HTMLElement>;
  /** The Chips box, once rendered: what the Popup is placed against. */
  box: HTMLElement | undefined;
  /**
   * The hidden radio that holds `required` and fires `input` and `change`
   * for the form, once rendered.
   */
  validityInput: HTMLInputElement | undefined;
  /** The name the radio takes when the Root has none. */
  readonly validityName: string;
  /** The Root's props, for the parts' elements. */
  readonly props: MultiComboboxStateProps;
}

/** Creates a multi combobox's state, on Combobox's shared state. */
export function createMultiCombobox(
  props: MultiComboboxStateProps,
): MultiCombobox {
  const [value, setValue, requested] = createControllableSignal<string[]>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? [];
    },
    onChange: (value) => props.onValueChange?.(value),
  });
  const [text, setText, requestedText] = createControllableSignal<
    string,
    InputValueChangeDetails
  >({
    get value() {
      return props.inputValue;
    },
    get defaultValue() {
      return props.defaultInputValue ?? "";
    },
    onChange: (text, details) => props.onInputValueChange?.(text, details),
  });
  // A change the user makes. Once the list has settled, and the hidden
  // inputs with it, the radio fires the events a native control fires, so
  // a Field is touched and a Form hides its error under the `name`; not
  // for a change a controlled consumer declined.
  const commit = (next: string[], then?: () => void) => {
    const before = untrack(value);
    setValue(next);
    onFlush(() => {
      const input = multi.validityInput;
      if (untrack(value) !== before && input) {
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      then?.();
    });
  };
  const multi: MultiCombobox = {
    ...createComboboxBase(props),
    component: "MultiCombobox",
    value,
    setValue,
    inputValue: text,
    setInputValue: setText,
    select: (item, event) => {
      if (item && !item.disabled) {
        const list = requested();
        commit(
          list.includes(item.value)
            ? list.filter((other) => other !== item.value)
            : [...list, item.value],
        );
        setText("", { reason: "item-press", event });
      }
      // The list stays open, for the next item.
    },
    clear: (event, reason) => {
      const empty = !requested().length;
      // Escape empties the text, never the values: Clear empties both.
      if (!requestedText() && (empty || reason === "escape-key")) return false;
      if (reason === "clear-press" && !empty) commit([]);
      setText("", { reason, event });
      return true;
    },
    remove: (removed, focusValue) =>
      commit(
        requested().filter((other) => other !== removed),
        // Unless a controlled consumer kept it.
        () => untrack(value).includes(removed) || multi.focusChip(focusValue),
      ),
    focusChip: (chip) => (multi.chips.get(chip!) ?? multi.input)?.focus(),
    chips: new Map(),
    box: undefined,
    validityInput: undefined,
    validityName: createUniqueId(),
    props,
  };
  return multi;
}

/**
 * The arrow key that points back, towards the chips before: Left, or Right
 * when `element` is laid out right to left, which it inherits.
 */
export const backKey = (element: Element) =>
  getComputedStyle(element).direction === "rtl" ? "ArrowRight" : "ArrowLeft";
