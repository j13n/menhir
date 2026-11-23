import {
  createListNavigation,
  type ListItem,
  type ListNavigation,
  type ListNavigationOptions,
} from "./listNavigation.ts";

/**
 * List navigation where focus moves to the active item (roving `tabindex`),
 * as in a menu. The item part registers once mounted, sets `tabindex` to 0
 * on the active item and -1 on the others, and hands its key and pointer
 * events over:
 *
 * ```ts
 * const list = createRovingList<Entry>({
 *   get open() { return open(); },
 *   reachable: (item) => true,
 * });
 * // In the item part:
 * onSettled(() => list.register(item));
 * const ownProps = {
 *   get tabindex() { return list.isActive(item) ? 0 : -1; },
 *   get "data-active"() { return list.isActive(item) ? "" : undefined; },
 *   onKeyDown: (event) => list.onKeyDown(event),
 *   onPointerMove: (event) => list.onPointerMove(item, event),
 * };
 * ```
 */
export function createRovingList<T extends ListItem>(
  options: ListNavigationOptions<T>,
): ListNavigation<T> {
  return createListNavigation(options, (item) =>
    item.element.focus({ preventScroll: true }),
  );
}
