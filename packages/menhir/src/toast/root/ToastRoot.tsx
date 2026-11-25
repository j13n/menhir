import type { JSX } from "@solidjs/web";
import {
  createEffect,
  createSignal,
  merge,
  omit,
  onSettled,
  untrack,
} from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { afterExit } from "../../floating/presence/exit.ts";
import type {
  ToastEntry,
  ToastOptions,
  ToastRecord,
} from "../manager/createToastManager.ts";
import { useToastProviderContext } from "../provider/ToastProviderContext.ts";
import { useToastRegionContext } from "../region/ToastRegionContext.ts";
import { ToastRootContext } from "./ToastRootContext.ts";
import type {
  ToastRootContextValue,
  ToastStateAttributes,
} from "./ToastRootContext.ts";

export interface ToastRootProps<
  T = unknown,
> extends JSX.HTMLAttributes<HTMLElement> {
  /** The toast to render, as `Toast.Region` hands it to its child. Read once. */
  toast: ToastEntry<T>;
  render?: RenderProp;
}

/**
 * One toast: a `<div>`, a `role="alert"` when its priority is `high`. It
 * leaves when its time ends, on Escape with focus inside it, and through
 * its `Toast.Close`, its `Toast.Action` and the manager's `remove()`; once
 * closed it has `data-closed` and stays until its exit animation has
 * ended. `--toast-index` is its place from the front, 0 for the newest,
 * which also has `data-front`. Render it from `Toast.Region`'s child.
 */
export function ToastRoot<T = unknown>(props: ToastRootProps<T>) {
  const provider = useToastProviderContext();
  const region = useToastRegionContext();
  const toast = untrack(() => props.toast) as ToastRecord;
  let element: HTMLElement | undefined;
  const [actions, setActions] = createSignal(0);

  // The time left, and the options and duration it was counted from: new
  // options, as after `update()`, start it again.
  let left = 0;
  let counted: [ToastOptions, number] | undefined;
  createEffect(
    () => ({
      open: toast.open,
      paused: region.paused(),
      options: toast.options(),
      duration: toast.duration ?? (actions() ? Infinity : provider.duration()),
    }),
    ({ open, paused, options, duration }) => {
      if (counted?.[0] !== options || counted[1] !== duration) {
        counted = [options, duration];
        left = duration;
      }
      if (!open || paused || left === Infinity) return;
      const started = Date.now();
      const timer = setTimeout(
        () => provider.manager.close(toast.id, { reason: "timeout" }),
        left,
      );
      return () => {
        clearTimeout(timer);
        left -= Date.now() - started;
      };
    },
  );

  createEffect(
    () => toast.open,
    (open) => {
      if (open) return;
      region.release(element!);
      return afterExit(element!, () => provider.manager.drop(toast));
    },
  );

  onSettled(() => {
    toast.mounted = true;
    return () => {
      toast.mounted = false;
      // Unmounted while it left: nothing else takes it off the list.
      if (!untrack(() => toast.open)) provider.manager.drop(toast);
    };
  });

  const attributes: ToastStateAttributes = {
    get "data-open"() {
      return toast.open ? "" : undefined;
    },
    get "data-closed"() {
      return toast.open ? undefined : "";
    },
  };

  const context: ToastRootContextValue = {
    toast,
    close: (reason, event) =>
      provider.manager.close(toast.id, { reason, event }),
    registerAction() {
      setActions((count) => count + 1);
      return () => setActions((count) => count - 1);
    },
    attributes,
  };

  const ownProps = merge(attributes, {
    get role() {
      return toast.priority === "high" ? ("alert" as const) : undefined;
    },
    get "data-priority"() {
      return toast.priority;
    },
    get "data-front"() {
      return region.index(toast) ? undefined : "";
    },
    get style() {
      return { "--toast-index": region.index(toast) };
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing || event.defaultPrevented)
        return;
      // Handled: a dialog under the toast stays open.
      event.preventDefault();
      context.close("escape-key", event);
    },
    ref: (root: HTMLElement) => {
      element = root;
    },
  } satisfies ElementProps);
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "toast"),
  );
  return (
    <ToastRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </ToastRootContext>
  );
}
