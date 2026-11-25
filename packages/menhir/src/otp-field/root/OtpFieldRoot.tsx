import type { JSX } from "@solidjs/web";
import { createMemo, createSignal, merge, omit } from "solid-js";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { OtpFieldRootContext } from "./OtpFieldRootContext.ts";
import type {
  OtpFieldRootContextValue,
  OtpFieldSelection,
} from "./OtpFieldRootContext.ts";

export interface OtpFieldRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The number of characters in the code, one box each. */
  length: number;
  /** The code, when controlled; `""` when empty. */
  value?: string;
  /** The code to start with when uncontrolled, and the one a form reset puts back. */
  defaultValue?: string;
  /** Called with the new code when the user edits it, and on a form reset. */
  onValueChange?: (value: string) => void;
  /** Called with the code once a user's edit fills the last box, and the field has taken it. */
  onComplete?: (value: string) => void;
  /**
   * A regular expression, as a string, that each character must match, as
   * the native `pattern` attribute takes one. Default `[0-9]`, digits.
   * A character it refuses is tried in upper case, then in lower case.
   */
  pattern?: string;
  /** The name the code is submitted under. */
  name?: string;
  /** The `id` of the form the code belongs to, when the field is not inside it. */
  form?: string;
  /** Whether the form can be submitted only with a code. */
  required?: boolean;
  /** Whether the field ignores the user, and the form submits nothing. */
  disabled?: boolean;
  /** Whether the user can see and select the code, but not change it. */
  readOnly?: boolean;
  /** Renders the Root as another element or component. Read once. */
  render?: RenderProp;
}

/**
 * The OTP field: a `<div>` that holds the code, around the Input, which lies
 * over it, and a Slot per character. Its `id`, `aria-describedby` and
 * `aria-invalid` go on the Input, so it joins a Field as `Field.Control`'s
 * `render`.
 */
export function OtpFieldRoot(props: OtpFieldRootProps) {
  const [value, setValue, requested] = createControllableSignal<string>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? "";
    },
    onChange: (next) => props.onValueChange?.(next),
  });
  const [selection, setSelection] = createSignal<OtpFieldSelection>();
  const matcher = createMemo(
    () => new RegExp(`^(?:${props.pattern ?? "[0-9]"})$`, "v"),
  );
  const takes = (character: string) => matcher().test(character);

  const context: OtpFieldRootContextValue = {
    props,
    value,
    setValue: (next) => setValue(next),
    requested,
    selection,
    setSelection: (next) => setSelection(next),
    takes,
    clean: (text) => {
      let code = "";
      for (const character of text) {
        const upper = character.toUpperCase();
        const lower = character.toLowerCase();
        code += takes(character)
          ? character
          : takes(upper)
            ? upper
            : takes(lower)
              ? lower
              : "";
      }
      return code;
    },
    attributes: {
      get "data-disabled"() {
        return props.disabled ? "" : undefined;
      },
      get "data-readonly"() {
        return props.readOnly ? "" : undefined;
      },
      get "data-required"() {
        return props.required ? "" : undefined;
      },
    },
    slots: [],
  };

  const ownProps = merge(context.attributes, {
    // The Input lies over the Root, and nothing else.
    style: "position:relative",
  }) as ElementProps;
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "length",
      "value",
      "defaultValue",
      "onValueChange",
      "onComplete",
      "pattern",
      "name",
      "form",
      "required",
      "disabled",
      "readOnly",
      "id",
      "aria-describedby",
      "aria-invalid",
    ),
  );
  return (
    <OtpFieldRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </OtpFieldRootContext>
  );
}
