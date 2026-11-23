import type { JSX } from "@solidjs/web";
import {
  createSignal,
  merge,
  omit,
  onFlush,
  onSettled,
  untrack,
} from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useComboboxContext } from "../root/ComboboxContext.ts";
import type { OpenChangeReason } from "../../floating/dismissal/reason.ts";

export interface ComboboxInputProps extends JSX.HTMLAttributes<HTMLElement> {
  /** What the browser may suggest. Default `"off"`, so its list does not cover the Combobox's. */
  autocomplete?: string;
  /** Shown while the input is empty. */
  placeholder?: string;
  render?: RenderProp;
}

/**
 * The combobox itself: an `<input type="text" role="combobox"
 * aria-autocomplete="list">` with `aria-expanded`, naming the List in
 * `aria-controls` and the active item in `aria-activedescendant`. It keeps
 * focus while the list is open: typing opens and filters it, and the arrow
 * keys, Enter and Escape act on it. A visually hidden `<input>` follows it,
 * the form's view of the value. Name it with a `<label>`. Place it inside
 * `Combobox.Root`.
 */
export function ComboboxInput(props: ComboboxInputProps) {
  const combobox = useComboboxContext();
  const { list } = combobox;
  let input: HTMLInputElement | undefined;
  let hiddenInput: HTMLInputElement | undefined;

  const details = <R,>(reason: R, event: Event) => ({ reason, event });
  const setOpen = (open: boolean, reason: OpenChangeReason, event: Event) =>
    combobox.setOpen(open, details(reason, event));
  // What the input's `value` binds to: the Combobox's text, and each edit
  // as it is made. The Combobox writes its own text after the event's flush
  // (`createControllableSignal`), and a binding that re-ran in that flush,
  // as `aria-activedescendant` does when typing empties the active item,
  // would write the old text over the edit.
  const [draft, setDraft] = createSignal(() => combobox.inputValue());
  // Puts the draft and the element back to the Combobox's text, once that
  // has settled: a controlled Combobox's consumer may have declined the
  // edit, and a form reset sets the element without an `input` event.
  const syncText = () => {
    const text = untrack(combobox.inputValue);
    setDraft(text);
    // Only when it differs, since a write moves the caret to the end.
    if (input && input.value !== text) input.value = text;
  };

  const ownProps = merge(combobox.attributes, {
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
        else if (combobox.inputValue() || combobox.value() !== null)
          combobox.clear(event, "escape-key");
        // Nothing to close or clear: a dialog around it may close.
        else return;
      } else return;
      event.preventDefault();
    },
    onBlur: (event: FocusEvent) => {
      // Focus lost to another window comes back to the input.
      if (!document.hasFocus()) return;
      setOpen(false, "focus-out", event);
      combobox.revert(event);
    },
    ref: (element: HTMLElement) => {
      input = element as HTMLInputElement;
      combobox.input = input;
    },
  } satisfies ElementProps & {
    type: string;
    autocomplete: string;
    value: string;
    disabled?: boolean;
  });

  // A selection, which the Combobox makes through the hidden input.
  const onHiddenChange = () => {
    combobox.setValue(hiddenInput!.value || null);
    onFlush(syncHidden);
  };
  // Puts the hidden input back to the value, once that has settled.
  const syncHidden = () => {
    if (hiddenInput) hiddenInput.value = untrack(combobox.value) ?? "";
  };
  // A form reset puts a control back to its default, and so it does the
  // Combobox: through the setters, so that a controlled Combobox asks.
  onSettled(() => {
    const form = hiddenInput?.form;
    if (!form) return;
    const onReset = (event: Event) => {
      const value = combobox.props.defaultValue ?? null;
      combobox.setValue(value);
      combobox.setInputValue(
        combobox.props.defaultInputValue ?? combobox.labelOfValue(value) ?? "",
        details("reset", event),
      );
      // The browser resets the inputs after this event, to their `value`
      // attributes; `onFlush` runs after that.
      onFlush(() => {
        syncHidden();
        syncText();
      });
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  });

  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return (
    <>
      {renderElement(props, elementProps, (p) => (
        <input {...p} />
      ))}
      <input
        aria-hidden="true"
        tabindex={-1}
        style={visuallyHidden}
        name={combobox.props.name}
        form={combobox.props.form}
        required={combobox.props.required}
        disabled={combobox.props.disabled}
        value={combobox.value() ?? ""}
        onChange={onHiddenChange}
        // The browser focuses an invalid input when it blocks a submission.
        // The user knows the visible input, not the hidden one.
        onFocus={() => combobox.input?.focus()}
        ref={(element) => {
          hiddenInput = element;
          combobox.hiddenInput = element;
        }}
      />
    </>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
