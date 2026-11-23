import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { createComboboxBase } from "../../combobox/root/ComboboxContext.ts";
import type {
  ComboboxBase,
  InputValueChangeReason,
} from "../../combobox/root/ComboboxContext.ts";
import type { OpenChangeDetails } from "../../floating/dismissal/reason.ts";

/**
 * Why the text changed: Combobox's reasons for its input value, but
 * `focus-out`, since focus leaving keeps the text.
 *
 * - `input-change`: the user typed or edited it.
 * - `item-press`: an item was accepted, and the text is its `value`.
 * - `escape-key`: Escape on a closed list emptied it.
 * - `clear-press`: `Autocomplete.Clear` emptied it.
 * - `reset`: its form was reset.
 */
export type ValueChangeReason = Exclude<InputValueChangeReason, "focus-out">;

/** The second argument of `onValueChange`. */
export interface ValueChangeDetails {
  readonly reason: ValueChangeReason;
  readonly event: Event;
}

/** The props of `Autocomplete.Root`, less its children. */
export interface AutocompleteStateProps {
  /** The text in the input, when controlled. */
  value?: string;
  /** The text at first, when uncontrolled. Default `""`. */
  defaultValue?: string;
  /**
   * Called with the new text, and why, when the user types, accepts an
   * item or empties it, or its form is reset. Filter by it for
   * `input-change` only. When controlled, the text changes only if `value`
   * does.
   */
  onValueChange?: (text: string, details: ValueChangeDetails) => void;
  /** Whether the list is open, when controlled. */
  open?: boolean;
  /** Whether the list is open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with the new value, and why, when the user opens or closes the
   * list. When controlled, the list changes only if `open` does.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /** Submitted with the form, as the input's `name`. */
  name?: string;
  /** The `id` of the form it belongs to, when it is not inside it. */
  form?: string;
  /** Whether the form can be submitted only with some text. */
  required?: boolean;
  /** Whether it ignores the user. It cannot be focused either. */
  disabled?: boolean;
}

/** What `Autocomplete.Root` shares with its parts, through Combobox's context. */
export interface Autocomplete extends ComboboxBase {
  readonly component: "Autocomplete";
  /** Asks for a text, saying why. */
  setInputValue(text: string, details: ValueChangeDetails): void;
  /** The Root's props, for the Input. */
  readonly props: AutocompleteStateProps;
}

/** Creates an autocomplete's state, on Combobox's shared state. */
export function createAutocomplete(
  props: AutocompleteStateProps,
): Autocomplete {
  const [text, setText, requestedText] = createControllableSignal<
    string,
    ValueChangeDetails
  >({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? "";
    },
    onChange: (text, details) => props.onValueChange?.(text, details),
  });
  return {
    ...createComboboxBase(props),
    component: "Autocomplete",
    inputValue: text,
    setInputValue: setText,
    select: (item, event) => {
      if (!item || item.disabled) return false;
      setText(item.value, { reason: "item-press", event });
      return true;
    },
    clear: (event, reason) => {
      if (!requestedText()) return false;
      setText("", { reason, event });
      return true;
    },
    props,
  };
}
