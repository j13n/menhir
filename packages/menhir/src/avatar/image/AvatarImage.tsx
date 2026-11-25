import type { JSX } from "@solidjs/web";
import { Show, createSignal, merge, omit, onSettled } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import {
  createStatusAttributes,
  useAvatarRootContext,
} from "../root/AvatarRootContext.ts";
import type { AvatarLoadingStatus } from "../root/AvatarRootContext.ts";

/** How a picture that finished went. */
type SettledStatus = Extract<AvatarLoadingStatus, "loaded" | "error">;

export interface AvatarImageProps extends Omit<
  JSX.ImgHTMLAttributes<HTMLImageElement>,
  "ref"
> {
  /** Typed for any element, as every part's ref is. */
  ref?: JSX.Ref<HTMLElement>;
  render?: RenderProp;
}

/**
 * The picture: an `<img>`, rendered while it loads and once it has loaded.
 * Name it with `alt`. Place it inside `Avatar.Root`.
 */
export function AvatarImage(props: AvatarImageProps) {
  const root = useAvatarRootContext();
  // How the last `src` that finished went. A `src` that has not is loading.
  const [settled, setSettled] = createSignal<{
    src: string;
    status: SettledStatus;
  }>();
  const status = (): AvatarLoadingStatus => {
    const src = props.src;
    if (!src) return "idle";
    const last = settled();
    return last?.src === src ? last.status : "loading";
  };
  const finish = (result: SettledStatus) => {
    const src = props.src;
    if (src) setSettled({ src, status: result });
  };
  let element: HTMLImageElement | undefined;
  onSettled(() => {
    // An image in the server HTML may have loaded, or failed, before any
    // listener was attached, and fires nothing more.
    if (element?.complete) finish(element.naturalWidth ? "loaded" : "error");
    return root.registerImage(status);
  });
  const attributes = createStatusAttributes(status);
  const ownProps: ElementProps = merge(attributes, {
    onLoad: () => finish("loaded"),
    onError: () => finish("error"),
    ref: (el: HTMLElement) => {
      element = el as HTMLImageElement;
    },
  });
  // An `<img>`'s own attributes, which spread onto any element.
  const consumerProps = omit(
    props,
    "render",
  ) as JSX.HTMLAttributes<HTMLElement>;
  const elementProps = mergeElementProps(ownProps, consumerProps);
  return (
    <Show when={status() === "loading" || status() === "loaded"}>
      {renderElement(props, elementProps, (p) => (
        <img {...(p as JSX.ImgHTMLAttributes<HTMLImageElement>)} />
      ))}
    </Show>
  );
}
