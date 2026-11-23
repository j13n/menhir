import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useNavigationMenuRootContext } from "../root/NavigationMenuRootContext.ts";

// The default element is an `<a>`, so its attributes are typed here; a
// render function types its own element's.
export interface NavigationMenuLinkProps
  extends
    JSX.HTMLAttributes<HTMLElement>,
    Pick<
      JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
      | "href"
      | "target"
      | "rel"
      | "download"
      | "hreflang"
      | "ping"
      | "referrerpolicy"
      | "type"
    > {
  render?: RenderProp;
}

/**
 * A link of the navigation: an `<a>` that closes the open Panel when it is
 * activated, by pointer or by Enter, so a router's page change leaves no
 * menu open. Pass `href`, and `aria-current="page"` on the current page's
 * link. Place it anywhere inside `NavigationMenu.Root`.
 */
export function NavigationMenuLink(props: NavigationMenuLinkProps) {
  const root = useNavigationMenuRootContext("Link");
  const ownProps: ElementProps = {
    onClick: (event: MouseEvent) => root.close({ reason: "link-press", event }),
  };
  const elementProps = mergeElementProps(ownProps, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <a {...p} />);
}
