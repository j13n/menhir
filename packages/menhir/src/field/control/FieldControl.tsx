import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useFieldRootContext } from "../root/FieldRootContext.ts";

export interface FieldControlProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "id" | "ref"
> {
  /** Typed for any element, since `render` may render a `<textarea>` or a `<select>`. */
  ref?: JSX.Ref<HTMLElement>;
  /**
   * Renders the control as another element or component, such as a
   * `<textarea>`, a `<select>` or `Switch.Root`, which gets the field's
   * `id`, `name`, `disabled`, `aria-describedby`, `aria-invalid` and
   * `data-*` attributes. Read once.
   */
  render?: RenderProp;
}

/** The own props of a control, with the attributes of a form control. */
type ControlElementProps = ElementProps & {
  name?: string;
  disabled?: boolean;
};

/**
 * The field's control: an `<input>`, or what `render` renders, with the
 * field's `id`, which the Label names, its `name` and `disabled`, and
 * `aria-describedby` naming the Description and the rendered Error. Takes
 * no `id`: the Root generates it. Place it inside `Field.Root`.
 */
export function FieldControl(props: FieldControlProps) {
  const root = useFieldRootContext();
  const ownProps: ControlElementProps = merge(root.attributes, {
    id: root.controlId,
    get name() {
      return root.name();
    },
    get disabled() {
      return root.disabled();
    },
    // Solid 2.0 removes an attribute set to false, so spell the value out.
    get "aria-invalid"() {
      return root.showsError() ? ("true" as const) : undefined;
    },
    // The consumer's wins. Kept out of the merge, where a wrapper's
    // `aria-describedby={undefined}` would remove the Field's ("`undefined`
    // is a value", PLAN.md section 8).
    get "aria-describedby"() {
      return props["aria-describedby"] ?? root.describedBy();
    },
  });
  const consumerProps = omit(
    props,
    "render",
    "id" as keyof FieldControlProps,
    "aria-describedby",
  );
  // Typed for an input; the merge takes any element's attributes.
  const elementProps = mergeElementProps(
    ownProps,
    consumerProps as JSX.HTMLAttributes<HTMLElement>,
  );
  return renderElement(props, elementProps, (p) => <input {...p} />);
}
