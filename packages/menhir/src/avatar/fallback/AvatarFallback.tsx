import type { JSX } from "@solidjs/web";
import { Show, merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useAvatarRootContext } from "../root/AvatarRootContext.ts";

export interface AvatarFallbackProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * What shows in place of the picture, such as initials: a `<span>`,
 * rendered until the picture has loaded. Give it the picture's name, with
 * `role="img"` and `aria-label`; it is `aria-hidden` while the picture,
 * already named, loads above it. Place it inside `Avatar.Root`.
 */
export function AvatarFallback(props: AvatarFallbackProps) {
  const root = useAvatarRootContext();
  const elementProps = mergeElementProps(
    merge(root.attributes, {
      get "aria-hidden"() {
        return root.status() === "loading" ? ("true" as const) : undefined;
      },
    }),
    omit(props, "render"),
  );
  return (
    <Show when={root.status() !== "loaded"}>
      {renderElement(props, elementProps, (p) => (
        <span {...p} />
      ))}
    </Show>
  );
}
