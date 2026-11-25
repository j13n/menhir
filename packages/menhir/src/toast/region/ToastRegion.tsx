import type { JSX } from "@solidjs/web";
import {
  createMemo,
  createSignal,
  For,
  omit,
  onSettled,
  untrack,
} from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import type { ToastEntry } from "../manager/createToastManager.ts";
import { useToastProviderContext } from "../provider/ToastProviderContext.ts";
import { hostInDialog } from "./dialogHost.ts";
import { ToastRegionContext } from "./ToastRegionContext.ts";
import type { ToastRegionContextValue } from "./ToastRegionContext.ts";

export interface ToastRegionProps<T = unknown> extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children"
> {
  /**
   * The key that moves focus to the Region while it has a toast, as
   * `KeyboardEvent.key` names it, or `false` for none. Default `"F6"`.
   */
  hotkey?: string | false;
  /** Renders one toast: a `Toast.Root` with the toast it is given. */
  children: (toast: ToastEntry<T>) => JSX.Element;
  render?: RenderProp;
}

/**
 * Where the toasts are: a `<div popover="manual" role="region">` in the
 * top layer, a landmark and a polite live region that is there before its
 * first toast. Give it a name with `aria-label`, and place it with CSS: it
 * is shown from mount, also while empty. Its child is a function that
 * renders one toast. While a modal dialog is open it is inside that dialog,
 * so its toasts stay usable. Place it inside `Toast.Provider`.
 */
export function ToastRegion<T = unknown>(props: ToastRegionProps<T>) {
  const provider = useToastProviderContext();
  const renderToast = untrack(() => props.children);
  let element: HTMLElement | undefined;
  // Where focus was before it entered the Region.
  let before: Element | null = null;

  const [hovered, setHovered] = createSignal(false);
  const [focused, setFocused] = createSignal(false);
  const [hidden, setHidden] = createSignal(false);

  const toasts = createMemo(() => {
    const all = provider.manager.toasts();
    const limit = provider.limit();
    return limit === undefined ? all : all.slice(0, limit);
  });

  const context: ToastRegionContextValue = {
    paused: () => hovered() || focused() || hidden(),
    index: (toast) => toasts().length - 1 - toasts().indexOf(toast),
    release(toast) {
      if (!toast.contains(document.activeElement)) return;
      if (untrack(() => toasts().some((each) => each.open))) element!.focus();
      else if (before instanceof HTMLElement && before.isConnected)
        before.focus();
    },
  };

  onSettled(() => {
    const unhost = hostInDialog(element!, () => {
      // Neither the pointer nor focus is on it once it has moved.
      setHovered(false);
      setFocused(false);
    });
    const onKeyDown = (event: KeyboardEvent) => {
      const hotkey = untrack(() => props.hotkey) ?? "F6";
      if (
        event.key !== hotkey ||
        event.defaultPrevented ||
        !untrack(toasts).length
      )
        return;
      event.preventDefault();
      element!.focus();
    };
    const onVisibilityChange = () => setHidden(document.hidden);
    // Mounted in a background tab, the timers wait from the start.
    onVisibilityChange();
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      unhost();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  });

  const ownProps = {
    popover: "manual",
    role: "region",
    "aria-live": "polite",
    tabindex: "-1",
    get "data-expanded"() {
      return hovered() || focused() ? "" : undefined;
    },
    get style() {
      return { "--toast-count": toasts().length };
    },
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onFocusIn: (event: FocusEvent) => {
      if (!element!.contains(event.relatedTarget as Node | null))
        before = event.relatedTarget as Element | null;
      setFocused(true);
    },
    onFocusOut: (event: FocusEvent) => {
      if (!element!.contains(event.relatedTarget as Node | null))
        setFocused(false);
    },
    ref: (region: HTMLElement) => {
      element = region;
    },
    get children() {
      return (
        <ToastRegionContext value={context}>
          <For each={toasts()}>
            {(toast) => renderToast(toast as ToastEntry<T>)}
          </For>
        </ToastRegionContext>
      );
    },
  } satisfies ElementProps;
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "hotkey", "children"),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}
