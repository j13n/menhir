import { onFlush, onSettled, untrack } from "solid-js";

/** The props of a control that its hidden input takes, read where used. */
export interface HiddenInputProps {
  readonly name?: string;
  readonly value?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly form?: string;
  /** Whether a click is canceled, so the input keeps its checkedness. */
  readonly readOnly?: boolean;
}

/**
 * The form's view of a control whose element is a native button (PLAN.md
 * section 8, "The hidden input is the form's view of the control"): a
 * visually hidden `<input type="checkbox">` or `<input type="radio">`,
 * rendered after the button, for Switch, Checkbox and a Radio's Items.
 * Returns the input, which the button clicks, so the form sees the input's
 * native `input` and `change` events:
 *
 * ```tsx
 * const input = createHiddenInput(
 *   "checkbox",
 *   props,
 *   checked,
 *   setChecked,
 *   () => button,
 *   () => setChecked(props.defaultChecked ?? false),
 * );
 * // The button's own props: onClick: () => input.click()
 * ```
 *
 * - `props` are the control's own, read where they are used.
 * - `checked` is the control's state, which the input follows, and
 *   `setChecked` asks for the input's checkedness once the user changed it.
 * - `button` is where focus goes when the browser focuses the input, as it
 *   does when it blocks a submission.
 * - `reset` asks for the control's default on a form reset, through the
 *   setter, so that a controlled control asks. A Radio's Items each ask
 *   the group, which asks once.
 *
 * A plain function with positional parameters, not a component with props:
 * a component would wrap each prop in a getter, and an options object
 * would spell out each name. Measured on 2026-11-24, Switch and Checkbox
 * are 30 B larger each than with a copy of their own (src/radio/README.md,
 * "Size").
 */
export function createHiddenInput(
  type: "checkbox" | "radio",
  props: HiddenInputProps,
  checked: () => boolean,
  setChecked: (checked: boolean) => void,
  button: () => HTMLElement | undefined,
  reset: () => void,
): HTMLInputElement {
  let input: HTMLInputElement | undefined;
  // Puts the input back to the control's value, once that has settled. The
  // `checked` binding writes the DOM only when the value changes, so it does
  // not undo a change of the input that the control did not take.
  const sync = () => {
    if (input) input.checked = untrack(checked);
  };
  const onClick = (event: MouseEvent) => {
    // The click the button sends the input is an implementation detail:
    // ancestors already received the user's click.
    event.stopPropagation();
    // Canceling the click keeps the input as it was and fires no `input` or
    // `change` event, whoever clicked it.
    if (props.readOnly) event.preventDefault();
  };
  // A form reset puts a native control back to its default, and so it does
  // this one: through the setter, so that a controlled control asks.
  onSettled(() => {
    const form = input?.form;
    if (!form) return;
    const onReset = () => {
      reset();
      // The browser resets the input after this event, to its `checked`
      // attribute, which the binding does not set. `onFlush` runs after
      // that, as the event has finished by then.
      onFlush(sync);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  });
  return (
    // The element, for the button to click. On the server it is the HTML,
    // which nothing clicks.
    <input
      type={type}
      aria-hidden="true"
      tabindex={-1}
      style={visuallyHidden}
      name={props.name}
      value={props.value}
      disabled={props.disabled}
      required={props.required}
      form={props.form}
      checked={checked()}
      onChange={() => {
        setChecked(input!.checked);
        // The browser has already changed the input, so the form's own
        // listeners, which run after this one, see the new value. The two
        // differ afterwards only when a controlled control's consumer
        // declined the change.
        onFlush(sync);
      }}
      // The browser focuses an invalid input when it blocks a submission.
      // The user knows the control, not the hidden input.
      onFocus={() => button()?.focus()}
      ref={(element) => {
        input = element;
        // Solid delegates click handlers to the document, so this one is a
        // native listener, to act before the click bubbles.
        element.addEventListener("click", onClick);
      }}
    />
  ) as HTMLInputElement;
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
