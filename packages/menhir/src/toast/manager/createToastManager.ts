import { isServer } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import type { Accessor } from "solid-js";

/**
 * How a toast is announced: `low` when the user is idle, by the Region's
 * `aria-live="polite"`; `high` at once, as a `role="alert"`.
 */
export type ToastPriority = "low" | "high";

/**
 * Why a toast closed, the `reason` of `onOpenChange`'s details:
 *
 * - `timeout`: its `duration` ended.
 * - `close-press`: its `Toast.Close`, pressed by pointer or keyboard.
 * - `action-press`: its `Toast.Action`, pressed by pointer or keyboard.
 * - `swipe`: swiped away (`Toast.swipe`).
 * - `escape-key`: Escape, with focus inside it.
 * - `remove`: the manager's `remove()`.
 */
export type ToastCloseReason =
  | "timeout"
  | "close-press"
  | "action-press"
  | "swipe"
  | "escape-key"
  | "remove";

/**
 * The second argument of a toast's `onOpenChange`. `event` is the click,
 * key or pointer event that closed it; `timeout` and `remove` have none.
 */
export interface ToastOpenChangeDetails {
  readonly reason: ToastCloseReason;
  readonly event?: Event;
}

/** What `add()` and `update()` take. */
export interface ToastOptions<T = unknown> {
  /** The toast's id. Default: one the manager makes. */
  id?: string;
  /** What `Toast.Title` renders. */
  title?: JSX.Element;
  /** What `Toast.Description` renders. */
  description?: JSX.Element;
  /** Default `"low"`. */
  priority?: ToastPriority;
  /**
   * How long it stays, in milliseconds; `Infinity` until it is closed.
   * Default: the Provider's, and none for a toast with a `Toast.Action`.
   */
  duration?: number;
  /** Anything else the app's toast needs, such as its kind. */
  data?: T;
  /** Called with `false`, and why, when the toast closes. */
  onOpenChange?: (open: boolean, details: ToastOpenChangeDetails) => void;
}

/**
 * A listed toast, as `Toast.Region` hands it to its function child. Its
 * fields are read where they are used, so they follow `update()`.
 */
export interface ToastEntry<T = unknown> {
  readonly id: string;
  readonly title: JSX.Element;
  readonly description: JSX.Element;
  readonly priority: ToastPriority;
  readonly duration: number | undefined;
  readonly data: T | undefined;
  /** False once it has closed, while its exit animation runs. */
  readonly open: boolean;
}

/** The list of toasts, which the app makes and hands to `Toast.Provider`. */
export interface ToastManager<T = unknown> {
  /**
   * Adds a toast and returns its id. With the id of a listed toast, it
   * updates that one. Does nothing on the server.
   */
  add(options: ToastOptions<T>): string;
  /** Changes the fields given of a listed toast, and starts its time again. */
  update(id: string, options: Omit<ToastOptions<T>, "id">): void;
  /** Closes the toast with this id, or every toast. */
  remove(id?: string): void;
  /** The listed toasts, oldest first. */
  toasts: Accessor<readonly ToastEntry<T>[]>;
}

/** What the parts use of a listed toast, besides its fields. */
export interface ToastRecord<T = unknown> extends ToastEntry<T> {
  /** The options last given: a new object after each `update()`. */
  options: Accessor<ToastOptions<T>>;
  /** Whether a `Toast.Root` renders it, which then runs its exit. */
  mounted: boolean;
}

/** What the parts use of a manager, besides what the app does. */
export interface ToastManagerInternals<T = unknown> extends ToastManager<T> {
  toasts: Accessor<readonly ToastRecord<T>[]>;
  /** Closes an open toast, saying why. Its exit follows. */
  close(id: string, details: ToastOpenChangeDetails): void;
  /** Takes a toast off the list, once its exit has ended. */
  drop(toast: ToastRecord<T>): void;
}

/**
 * Makes the list of toasts an app shows through `Toast.Provider`. Make it
 * where the code that adds toasts can import it:
 *
 * ```ts
 * export const toasts = createToastManager();
 *
 * toasts.add({ title: "Saved" });
 * ```
 *
 * Call it from event handlers, actions and `onSettled`, not from a
 * component's body. On the server `add()` adds nothing, so a manager shared
 * between requests stays empty.
 */
export function createToastManager<T = unknown>(): ToastManager<T> {
  let made = 0;
  // The list as it is now: a signal is read as it was until the flush.
  let records: ToastRecord<T>[] = [];
  const [toasts, setToasts] = createSignal<readonly ToastRecord<T>[]>(records);
  const current = new Map<
    string,
    {
      options: ToastOptions<T>;
      setOptions(options: ToastOptions<T>): void;
      open: boolean;
      setOpen(open: boolean): void;
      record: ToastRecord<T>;
    }
  >();

  const drop = (record: ToastRecord<T>) => {
    // Not a newer toast that took the id of one that has left.
    if (current.get(record.id)?.record !== record) return;
    current.delete(record.id);
    records = records.filter((each) => each !== record);
    setToasts(records);
  };

  const close = (id: string, details: ToastOpenChangeDetails) => {
    const toast = current.get(id);
    if (!toast?.open) return;
    toast.open = false;
    toast.setOpen(false);
    toast.options.onOpenChange?.(false, details);
    if (!toast.record.mounted) drop(toast.record);
  };

  const update = (id: string, options: ToastOptions<T>) => {
    const toast = current.get(id);
    if (!toast) return;
    toast.options = { ...toast.options, ...options, id };
    toast.setOptions(toast.options);
  };

  const manager: ToastManagerInternals<T> = {
    toasts,
    add(given) {
      const id = given.id ?? `toast-${++made}`;
      if (isServer) return id;
      const listed = current.get(id);
      if (listed?.open) {
        update(id, given);
        return id;
      }
      // One that has closed and is still leaving makes way at once.
      if (listed) drop(listed.record);
      const [options, setOptions] = createSignal<ToastOptions<T>>(given);
      const [open, setOpen] = createSignal(true);
      const record: ToastRecord<T> = {
        id,
        options,
        mounted: false,
        get title() {
          return options().title;
        },
        get description() {
          return options().description;
        },
        get priority() {
          return options().priority ?? "low";
        },
        get duration() {
          return options().duration;
        },
        get data() {
          return options().data;
        },
        get open() {
          return open();
        },
      };
      current.set(id, {
        options: given,
        setOptions,
        open: true,
        setOpen,
        record,
      });
      records = [...records, record];
      setToasts(records);
      return id;
    },
    update,
    remove(id) {
      for (const each of id === undefined ? [...current.keys()] : [id])
        close(each, { reason: "remove" });
    },
    close,
    drop,
  };
  return manager;
}
