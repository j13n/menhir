import {
  createListNavigation,
  type ListItem,
  type ListNavigation,
  type ListNavigationOptions,
} from "./listNavigation.ts";

/** An item named in `aria-activedescendant`, which needs an `id`. */
export interface ActiveDescendantItem extends ListItem {
  readonly id: string;
}

/** What `createActiveDescendantList` returns. */
export interface ActiveDescendantList<
  T extends ActiveDescendantItem,
> extends ListNavigation<T> {
  /** The active item's `id`, for `aria-activedescendant`, if any. */
  activeId(): string | undefined;
}

/**
 * List navigation where focus stays on another element, such as a
 * combobox's input, which names the active item in `aria-activedescendant`.
 * The item part takes `props.id ?? createUniqueId()` and registers once
 * mounted, so the server HTML names no item:
 *
 * ```ts
 * const list = createActiveDescendantList<Entry>({
 *   get open() { return open(); },
 * });
 * // On the input:
 * const inputProps = {
 *   get "aria-activedescendant"() { return list.activeId(); },
 *   onKeyDown: (event) => list.onKeyDown(event),
 * };
 * // In the item part:
 * onSettled(() => list.register(item));
 * ```
 */
export function createActiveDescendantList<T extends ActiveDescendantItem>(
  options: ListNavigationOptions<T>,
): ActiveDescendantList<T> {
  const list = createListNavigation(options);
  return { ...list, activeId: () => list.active()?.id };
}
