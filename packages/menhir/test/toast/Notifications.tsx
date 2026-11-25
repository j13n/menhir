// What the tests of Toast render: a Provider and a Region whose toasts have
// every part. The Action is rendered for a toast whose data asks for one.
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

import { screen } from "#test-utils";

import { Toast } from "../../src/toast/index.ts";
import type { ToastEntry, ToastManager } from "../../src/toast/index.ts";
import type { ToastProviderProps } from "../../src/toast/provider/ToastProvider.tsx";
import type { ToastRegionProps } from "../../src/toast/region/ToastRegion.tsx";

export interface TestData {
  action?: string;
}

export type NotificationsProps = Omit<
  ToastProviderProps<TestData>,
  "manager" | "children"
> & {
  toasts: ToastManager<TestData>;
  hotkey?: ToastRegionProps["hotkey"];
  regionStyle?: ToastRegionProps["style"];
  onAction?: (event: MouseEvent) => void;
  rootRef?: JSX.HTMLAttributes<HTMLElement>["ref"];
  regionRef?: JSX.HTMLAttributes<HTMLElement>["ref"];
  children?: JSX.Element;
};

export function Notifications(props: NotificationsProps) {
  return (
    <Toast.Provider
      manager={props.toasts}
      duration={props.duration}
      limit={props.limit}
    >
      {props.children}
      <Toast.Region
        aria-label="Notifications"
        hotkey={props.hotkey}
        style={props.regionStyle}
        ref={props.regionRef}
      >
        {(toast: ToastEntry<TestData>) => (
          <Toast.Root toast={toast} data-testid={toast.id} ref={props.rootRef}>
            <Toast.Title />
            <Toast.Description />
            <Show when={toast.data?.action}>
              <Toast.Action onClick={props.onAction}>
                {toast.data?.action}
              </Toast.Action>
            </Show>
            <Toast.Close aria-label={`Close ${toast.id}`} />
          </Toast.Root>
        )}
      </Toast.Region>
    </Toast.Provider>
  );
}

export const region = () =>
  screen.getByRole("region", { name: "Notifications", hidden: true });

/** The ids of the rendered toasts, in document order. */
export const rendered = () =>
  [...region().children].map((toast) => toast.getAttribute("data-testid"));

export const toast = (id: string) => screen.getByTestId(id);
