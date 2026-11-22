import type { JSX } from "@solidjs/web";
import { createUniqueId, merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useDialogRootContext } from "../root/DialogRootContext.ts";

export interface DialogDescriptionProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * What the dialog is for, which describes the Popup in
 * `aria-describedby`: a `<p>`. Place it inside `Dialog.Popup`.
 */
export function DialogDescription(props: DialogDescriptionProps) {
  const root = useDialogRootContext();
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one. Kept out of the merge,
  // where a wrapper's `id={undefined}` would remove it ("`undefined` is a
  // value", PLAN.md section 8).
  const id = () => props.id ?? generated;
  // Named once mounted, so the Popup names only a Description that is
  // rendered, and none in the server HTML (README, "Decisions").
  onSettled(() => root.registerDescriptionId(id));
  const ownProps = merge(root.attributes, {
    get id() {
      return id();
    },
  });
  const elementProps = mergeElementProps(ownProps, omit(props, "render", "id"));
  return renderElement(props, elementProps, (p) => <p {...p} />);
}
