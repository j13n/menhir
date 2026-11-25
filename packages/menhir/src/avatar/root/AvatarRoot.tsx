import type { JSX } from "@solidjs/web";
import { createEffect, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { createSlot } from "../../core/slot.ts";
import {
  AvatarRootContext,
  createStatusAttributes,
} from "./AvatarRootContext.ts";
import type { AvatarLoadingStatus } from "./AvatarRootContext.ts";

export interface AvatarRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * Called with each status the avatar moves to: `loading` once an Image
   * with a `src` is mounted or its `src` changes, then `loaded` or `error`,
   * and `idle` when the Image or its `src` goes. Not called for the `idle`
   * it starts at.
   */
  onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
  render?: RenderProp;
}

/**
 * The avatar itself: a `<span>` around its Image and Fallback, with their
 * loading status.
 */
export function AvatarRoot(props: AvatarRootProps) {
  const [imageStatus, registerImage] = createSlot<AvatarLoadingStatus>();
  const status = () => imageStatus() ?? "idle";
  const attributes = createStatusAttributes(status);
  let reported: AvatarLoadingStatus = "idle";
  createEffect(status, (next) => {
    if (next === reported) return;
    reported = next;
    props.onLoadingStatusChange?.(next);
  });
  const elementProps = mergeElementProps(
    attributes,
    omit(props, "render", "onLoadingStatusChange"),
  );
  return (
    <AvatarRootContext value={{ status, attributes, registerImage }}>
      {renderElement(props, elementProps, (p) => (
        <span {...p} />
      ))}
    </AvatarRootContext>
  );
}
