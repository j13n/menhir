import { createSignal, merge, onFlush, onSettled, untrack } from "solid-js";

import type { ElementProps } from "../../core/renderElement.tsx";
import type { OpenChangeReason } from "../../floating/dismissal/reason.ts";
import type { ComboboxBase } from "../root/ComboboxContext.ts";

/** The props `createComboboxInput` gives the `<input>`. */
export type ComboboxInputElementProps = ElementProps & {
  type: string;
  autocomplete: string;
  value: string;
  disabled?: boolean;
};

/**
 * The input of a combobox, the code `Combobox.Input` and
 * `Autocomplete.Input` share: its attributes, typing, the keys, focus
 * leaving, and the draft its `value` binds to. Focus leaving closes the
 * list and then calls `onFocusOut`, which a Combobox puts its text back
 * in; an Autocomplete keeps the text, and passes none. Returns its props
 * and `syncText`, which puts the element back to the combobox's text once
 * that has settled, as after a form reset.
 */
export function createComboboxInput(
  combobox: ComboboxBase,
  onFocusOut?: (event: FocusEvent) => void,
): {
  props: ComboboxInputElementProps;
  syncText(): void;
} {
  const { list } = combobox;
  let input: HTMLInputElement | undefined;

  const details = <R>(reason: R, event: Event) => ({ reason, event });
  const setOpen = (open: boolean, reason: OpenChangeReason, event: Event) =>
    combobox.setOpen(open, details(reason, event));
  // What the input's `value` binds to: the combobox's text, and each edit
  // as it is made. The combobox writes its own text after the event's flush
  // (`createControllableSignal`), and a binding that re-ran in that flush,
  // as `aria-activedescendant` does when typing empties the active item,
  // would write the old text over the edit.
  const [draft, setDraft] = createSignal(() => combobox.inputValue());
  // Puts the draft and the element back to the combobox's text, once that
  // has settled: a controlled consumer may have declined the edit, and a
  // form reset sets the element without an `input` event.
  const syncText = () => {
    const text = untrack(combobox.inputValue);
    setDraft(text);
    // Only when it differs, since a write moves the caret to the end.
    if (input && input.value !== text) input.value = text;
  };

  const props = merge(combobox.attributes, {
    type: "text",
    role: "combobox",
    "aria-autocomplete": "list",
    autocomplete: "off",
    get value() {
      return draft();
    },
    get disabled() {
      return combobox.props.disabled;
    },
    get "aria-expanded"() {
      return combobox.open() ? "true" : "false";
    },
    "aria-controls": combobox.listId,
    // Only while open, as an item's `data-active`.
    get "aria-activedescendant"() {
      return combobox.open() ? list.activeId() : undefined;
    },
    get "aria-required"() {
      return combobox.props.required ? "true" : undefined;
    },
    onInput: (event: Event) => {
      setDraft(input!.value);
      combobox.setInputValue(input!.value, details("input-change", event));
      // The keys start again from the text (README, "Keys while open").
      list.move(undefined);
      setOpen(true, "input-change", event);
      onFlush(syncText);
    },
    onKeyDown: (event: KeyboardEvent) => {
      // An input method's keys, such as the Enter that commits what it
      // composed (README, "An input method's composition").
      if (event.isComposing || event.keyCode === 229) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      const isOpen = combobox.open();
      const { key, altKey } = event;
      if (key === "ArrowDown" || key === "ArrowUp") {
        const down = key === "ArrowDown";
        if (altKey) {
          // Alt+Down opens without moving, Alt+Up closes.
          if (down === isOpen) return;
          setOpen(down, "arrow-key", event);
        } else if (!isOpen) {
          setOpen(true, "arrow-key", event);
          // While closed, the move waits for the list to open.
          const items = list.items();
          list.move(down ? items[0] : items[items.length - 1]);
        } else if (!list.onKeyDown(event)) return;
      } else if (key === "Enter" && !altKey) {
        if (!isOpen) return;
        const item = list.active();
        if (!item) {
          // A form submits, as it would from a text input.
          setOpen(false, "enter-key", event);
          return;
        }
        if (combobox.select(item, event)) setOpen(false, "item-press", event);
      } else if (key === "Escape" && !altKey) {
        if (isOpen) setOpen(false, "escape-key", event);
        // Nothing to close or clear: a dialog around it may close.
        else if (!combobox.clear(event, "escape-key")) return;
      } else return;
      event.preventDefault();
    },
    onBlur: (event: FocusEvent) => {
      // Focus lost to another window comes back to the input.
      if (!document.hasFocus()) return;
      setOpen(false, "focus-out", event);
      onFocusOut?.(event);
    },
    ref: (element: HTMLElement) => {
      input = element as HTMLInputElement;
      combobox.input = input;
    },
  } satisfies ComboboxInputElementProps);
  return { props, syncText };
}

/**
 * Calls `reset` when the form of `input()` is reset, from the time the
 * part has settled: a form reset puts a control back to its default, and
 * so it does a combobox, through its setters, so that a controlled one
 * asks. The browser resets the form's inputs after the event, to their
 * `value` attributes; an `onFlush` in `reset` runs after that.
 */
export function onFormReset(
  input: () => HTMLInputElement | undefined,
  reset: (event: Event) => void,
): void {
  onSettled(() => {
    const form = input()?.form;
    if (!form) return;
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  });
}
