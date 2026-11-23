import type { JSX } from "@solidjs/web";
import { createUniqueId, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useSelectGroupContext } from "../group/SelectGroupContext.ts";

export interface SelectGroupLabelProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The label of a group, which names it in `aria-labelledby`: a `<div>`,
 * not reached by the keys. Place it inside `Select.Group`.
 */
export function SelectGroupLabel(props: SelectGroupLabelProps) {
  const group = useSelectGroupContext();
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one. Kept out of the merge,
  // where a wrapper's `id={undefined}` would remove it.
  const id = () => props.id ?? generated;
  // Named once mounted, so the group names only a label that is rendered,
  // and none in the server HTML, as a popup's Title.
  onSettled(() => group.registerLabelId(id));
  const elementProps = mergeElementProps(
    {
      get id() {
        return id();
      },
    },
    omit(props, "render", "id"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
