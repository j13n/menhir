import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";

export interface SeparatorRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Whether the separator divides content stacked above and below, or side by side. */
  orientation?: "horizontal" | "vertical";
  render?: RenderProp;
}

/**
 * A line between sections of content or groups of items: a
 * `<div role="separator">`.
 */
export function SeparatorRoot(props: SeparatorRootProps) {
  const vertical = () => props.orientation === "vertical";
  const ownProps: ElementProps = {
    role: "separator",
    // Written out when horizontal too, the role's implicit value, so that
    // a style can select either.
    get "aria-orientation"() {
      return vertical() ? "vertical" : "horizontal";
    },
    get "data-horizontal"() {
      return vertical() ? undefined : "";
    },
    get "data-vertical"() {
      return vertical() ? "" : undefined;
    },
  };
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "orientation"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
