import { onSettled, untrack } from "solid-js";

import type { ElementProps } from "../../core/renderElement.tsx";
import { useToolbarRootContext } from "../root/ToolbarRootContext.ts";
import type { ToolbarItemEntry } from "../root/ToolbarRootContext.ts";

/**
 * Makes the part an item of its toolbar, whatever its element: it claims
 * the server's tab stop, registers with the Root once mounted, and returns
 * its own props, the roving `tabindex` and Toolbar's `disabled` as
 * `aria-disabled`, which keeps the item focusable (README, "Decisions").
 * Pass the props as they are, so `disabled` is read where it is used, and
 * what a kind of item adds to the Root's keys, as `Toolbar.Input` does.
 */
export function createToolbarItem(
  props: { disabled?: boolean },
  keys?: Pick<ToolbarItemEntry, "keeps" | "enter">,
): { own: ElementProps; disabled: () => boolean } {
  const toolbar = useToolbarRootContext();
  let element: HTMLElement | undefined;
  const disabled = () => !!(toolbar.disabled() || props.disabled);
  // Read once: the tab stop of the server HTML, and of the first render.
  const first = untrack(() => toolbar.claimTabStop(disabled()));
  // Mounted, so its place in the document is known.
  onSettled(() => toolbar.register({ ...keys, element: element!, disabled }));
  return {
    own: {
      get tabindex() {
        return toolbar.isTabStop(element, first) ? 0 : -1;
      },
      // Solid 2.0 removes an attribute set to false, so spell the value out.
      get "aria-disabled"() {
        return disabled() ? "true" : undefined;
      },
      get "data-disabled"() {
        return disabled() ? "" : undefined;
      },
      onFocus: () => toolbar.setActive(element!),
      ref: (el) => {
        element = el;
      },
    },
    disabled,
  };
}
