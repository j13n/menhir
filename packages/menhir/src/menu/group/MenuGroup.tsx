import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createIdSlot } from "../../core/slot.ts";
import { MenuGroupContext } from "./MenuGroupContext.ts";

export interface MenuGroupProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * Renders a group of items, `<div role="group">`, named by the GroupLabel
 * inside it, for both `Menu.Group` and `Menu.RadioGroup`. `props` are the
 * consumer's, less the group's own.
 */
export function renderGroup(
  props: MenuGroupProps,
  rest: JSX.HTMLAttributes<HTMLElement>,
): JSX.Element {
  const [labelId, registerLabelId] = createIdSlot();
  const elementProps = mergeElementProps(
    {
      role: "group",
      // The consumer's, else the GroupLabel's id, while one is rendered.
      // Kept out of the merge ("`undefined` is a value", PLAN.md section 8).
      get "aria-labelledby"() {
        return props["aria-labelledby"] ?? labelId();
      },
    },
    omit(rest, "aria-labelledby"),
  );
  return (
    <MenuGroupContext value={{ registerLabelId }}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </MenuGroupContext>
  );
}

/**
 * Items that belong together: a `<div role="group">` named by its
 * `Menu.GroupLabel`. Place it inside `Menu.Popup`.
 */
export function MenuGroup(props: MenuGroupProps) {
  return renderGroup(props, omit(props, "render"));
}
