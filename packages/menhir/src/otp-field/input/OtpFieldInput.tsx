import type { JSX } from "@solidjs/web";
import { createEffect, merge, omit, onFlush, untrack } from "solid-js";

import { onFormReset } from "../../core/formReset.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useOtpFieldRootContext } from "../root/OtpFieldRootContext.ts";

export interface OtpFieldInputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "ref" | "id" | "value" | "defaultValue" | "type"
> {
  ref?: JSX.Ref<HTMLElement>;
  /** Renders the input with your own component, which must render an `<input>`. Read once. */
  render?: RenderProp;
}

/**
 * The control: an `<input autocomplete="one-time-code">`, invisible and
 * stretched over the Root, so a press on a box lands on it. It takes the
 * Root's `id`; place it inside `OtpField.Root`.
 */
export function OtpFieldInput(props: OtpFieldInputProps) {
  const root = useOtpFieldRootContext();
  let input!: HTMLInputElement;
  // The selection and the text before an edit, from its `beforeinput`, to
  // tell what the edit inserted.
  let before: [start: number, end: number, text: string] | undefined;
  // Whether an input method is composing: a write to the element would end
  // the composition.
  let composing = false;

  const length = () => root.props.length;
  const readSelection = () =>
    root.setSelection(
      document.activeElement === input
        ? [input.selectionStart!, input.selectionEnd!]
        : undefined,
    );
  const select = (start: number, end = start) => {
    input.setSelectionRange(start, end);
    readSelection();
  };
  // Selects the character in box `index`, or puts the caret in the first
  // empty box for a box after it: one text has no gap.
  const place = (index: number) => {
    const text = input.value;
    const box = Math.max(0, Math.min(index, length() - 1));
    if (box < text.length) select(box, box + 1);
    else select(text.length);
  };
  // The box nearest a press, so a press on a gap or a separator goes to one.
  const nearest = (event: MouseEvent) => {
    let nearestIndex = 0;
    let least = Infinity;
    root.slots.forEach((slot, index) => {
      const rect = slot.getBoundingClientRect();
      const distance = Math.hypot(
        event.clientX - rect.left - rect.width / 2,
        event.clientY - rect.top - rect.height / 2,
      );
      if (distance < least) {
        least = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  };

  // A form reset puts a control back to its default, and so it does this
  // one: through the setter, so that a controlled field asks. The element's
  // text is bound as its `defaultValue`, which the browser resets it to, so
  // nothing is held.
  onFormReset(
    () => input.form,
    () => root.setValue(untrack(() => root.props.defaultValue) ?? ""),
  );

  const ownProps = merge(root.attributes, {
    type: "text",
    autocomplete: "one-time-code",
    // A keypad of digits for a code of digits.
    get inputmode() {
      return root.takes("0") && !root.takes("a") && !root.takes("A")
        ? "numeric"
        : "text";
    },
    // The browser's check of the whole code: full, and of characters the
    // pattern takes. Not `minlength`, whose "too short" counts only a
    // user's edit, nor `maxlength`, which cuts a paste before it is cleaned.
    get pattern() {
      return `(?:${root.props.pattern ?? "[0-9]"}){${length()}}`;
    },
    // The `value` attribute, not the property: a binding of `value` would
    // write the text again over the user's when any other attribute of the
    // element changes. The attribute is the server's text, and the text a
    // form reset puts back.
    get defaultValue() {
      return root.value();
    },
    get id() {
      return root.props.id;
    },
    get name() {
      return root.props.name;
    },
    get form() {
      return root.props.form;
    },
    get required() {
      return root.props.required;
    },
    get disabled() {
      return root.props.disabled;
    },
    get readonly() {
      return root.props.readOnly;
    },
    // From a Field around the Root, which is its Control.
    get "aria-describedby"() {
      return root.props["aria-describedby"];
    },
    get "aria-invalid"() {
      return root.props["aria-invalid"];
    },
    style:
      "position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;margin:0;opacity:0;z-index:1;font-size:16px",
    onBeforeInput: () => {
      before = [input.selectionStart!, input.selectionEnd!, input.value];
    },
    onInput: () => {
      const raw = input.value;
      const previous = root.requested();
      // Without a `beforeinput`, as from some autofills, the edit replaced
      // the whole text.
      const [start, end, text] = before ?? [0, previous.length, previous];
      before = undefined;
      const inserted = raw.slice(start, raw.length - text.length + end);
      const code = root.clean(inserted);
      // An insertion with nothing the pattern takes is declined, so a letter
      // typed over a selected digit keeps the digit.
      let next = text;
      let caret = start;
      if (!inserted || code) {
        if (code.length >= length()) {
          // A whole code, pasted or filled, replaces the value.
          next = code.slice(0, length());
          caret = length();
        } else {
          next = root.clean(raw);
          caret = root.clean(raw.slice(0, input.selectionStart!)).length;
          // Too long, from typing at a caret inside a full code, as Up or a
          // screen reader places it: the edit types over the characters
          // after it, then the end is cut.
          next = (
            next.slice(0, caret) +
            next.slice(caret + Math.max(0, next.length - length()))
          ).slice(0, length());
        }
      }
      root.setValue(next);
      onFlush(() => {
        const value = untrack(root.value);
        if (!composing) {
          if (input.value !== value) input.value = value;
          if (document.activeElement === input) {
            if (value === text) {
              // Declined: the field and its selection stay as they were.
              select(start, end);
            } else {
              caret = Math.min(caret, value.length);
              // Typing inside the code types over the next character.
              if (inserted && caret < value.length) select(caret, caret + 1);
              else select(caret);
            }
          }
        }
        if (value === next && next !== text && next.length === length()) {
          root.props.onComplete?.(next);
        }
      });
    },
    onCompositionStart: () => {
      composing = true;
    },
    onCompositionEnd: () => {
      composing = false;
      onFlush(() => {
        const value = untrack(root.value);
        const caret = root.clean(
          input.value.slice(0, input.selectionStart!),
        ).length;
        if (input.value !== value) input.value = value;
        select(Math.min(caret, value.length));
      });
    },
    // Over the browser's choice, which is the whole text on Tab.
    onFocus: () => place(input.value.length),
    onBlur: readSelection,
    // A selection the browser made: Shift with an arrow, a select-all.
    // Firefox fires no `select` for Shift with an arrow, so `keyup` too.
    onSelect: readSelection,
    onKeyUp: readSelection,
    onKeyDown: (event: KeyboardEvent) => {
      if (
        composing ||
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      )
        return;
      const { key } = event;
      const start = input.selectionStart!;
      const end = input.selectionEnd!;
      // Right to left, the boxes run from the right.
      const back =
        getComputedStyle(input).direction === "rtl"
          ? "ArrowRight"
          : "ArrowLeft";
      if (key === back) place(start - 1);
      else if (key === "ArrowLeft" || key === "ArrowRight")
        place(start === end ? start + 1 : end);
      else if (key === "Home") place(0);
      else if (key === "End") place(input.value.length);
      else return;
      event.preventDefault();
    },
    onPointerDown: (event: PointerEvent) => {
      // A touch is the browser's, so the phone opens its keyboard; the box
      // is selected on the click.
      if (event.pointerType === "touch" || event.button || input.disabled)
        return;
      // No caret of the browser's in the invisible text, and no selection
      // dragged across it.
      event.preventDefault();
      input.focus();
      place(nearest(event));
    },
    // `detail` 0 is a click with no press, from assistive technology.
    onClick: (event: MouseEvent) => {
      if (event.detail) place(nearest(event));
    },
    ref: (element: HTMLElement) => {
      input = element as HTMLInputElement;
    },
  }) as ElementProps;

  // The app changed the value: the element shows it, over its text.
  createEffect(
    () => root.value(),
    (value) => {
      if (composing || input.value === value) return;
      input.value = value;
      onFlush(readSelection);
    },
  );

  // Typed for an input; the merge takes any element's attributes.
  const consumerProps = omit(props, "render");
  const elementProps = mergeElementProps(
    ownProps,
    consumerProps as JSX.HTMLAttributes<HTMLElement>,
  );
  return renderElement(props, elementProps, (p) => <input {...p} />);
}
