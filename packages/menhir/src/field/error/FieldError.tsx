import type { JSX } from "@solidjs/web";
import { Show, createUniqueId, merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useFieldRootContext } from "../root/FieldRootContext.ts";

/** A flag of the browser's validity, such as `"valueMissing"`. */
export type ValidityFlag = Exclude<keyof ValidityState, "valid">;

export interface FieldErrorProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * Shows the Error only while the browser's validity has this flag, such
   * as `"valueMissing"`, so each state gets its own message.
   */
  match?: ValidityFlag;
  render?: RenderProp;
}

/**
 * The field's error message: a `<p>`, rendered only while the field shows
 * an error, which the control names in `aria-describedby` while it is
 * rendered. Without children it shows the error from outside, else the
 * browser's message. Place it inside `Field.Root`.
 */
export function FieldError(props: FieldErrorProps) {
  const root = useFieldRootContext();
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one. Kept out of the merge,
  // where a wrapper's `id={undefined}` would remove it ("`undefined` is a
  // value", PLAN.md section 8).
  const id = () => props.id ?? generated;
  // Without children, an Error with no message to show is not rendered,
  // so the control never names an empty element. Whether children were
  // passed is fixed by the JSX, so the key is checked, not their value.
  const shown = () =>
    root.showsError() &&
    (props.match === undefined || !!root.validity()?.[props.match]) &&
    ("children" in props || !!root.message());
  // Registered once mounted, as a popup's Title is, so that the control
  // names it only while it is rendered, and in the same update.
  onSettled(() => root.registerError({ id, shown }));
  const ownProps = merge(root.attributes, {
    get id() {
      return id();
    },
    get children() {
      return props.children ?? root.message();
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "id", "match", "children"),
  );
  return (
    <Show when={shown()}>
      {renderElement(props, elementProps, (p) => (
        <p {...p} />
      ))}
    </Show>
  );
}
