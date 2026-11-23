import type { JSX } from "@solidjs/web";
import { createContext, omit, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

import { createControllableSignal } from "../../core/createControllableSignal.ts";
import type { RenderProp } from "../../core/renderElement.tsx";
import { renderGroup } from "../group/MenuGroup.tsx";

export interface MenuRadioGroupProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The checked item's value, when controlled; `null` for none. */
  value?: string | null;
  /** The checked item's value at first, when uncontrolled. Default `null`. */
  defaultValue?: string | null;
  /**
   * Called with the new value when the user checks an item. When
   * controlled, the group changes only if `value` does.
   */
  onValueChange?: (value: string) => void;
  render?: RenderProp;
}

/** What a radio group shares with its items. */
export interface MenuRadioGroupContextValue {
  value(): string | null;
  setValue(value: string): void;
}

// `null` outside a radio group, so that the part can name what is missing.
export const MenuRadioGroupContext =
  createContext<MenuRadioGroupContextValue | null>(null);

export function useMenuRadioGroupContext(): MenuRadioGroupContextValue {
  const context = useContext(MenuRadioGroupContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Menu.RadioItem must be placed within <Menu.RadioGroup>.",
    );
  }
  return context!;
}

/**
 * Options of which one is checked: a `<div role="group">` that holds the
 * checked `Menu.RadioItem`'s value, named by its `Menu.GroupLabel`. Place
 * it inside `Menu.Popup`.
 */
export function MenuRadioGroup(props: MenuRadioGroupProps) {
  const [value, setValue] = createControllableSignal<string | null>({
    get value() {
      return props.value;
    },
    get defaultValue() {
      return props.defaultValue ?? null;
    },
    onChange: (next) => {
      if (next !== null) props.onValueChange?.(next);
    },
  });
  return (
    <MenuRadioGroupContext value={{ value, setValue }}>
      {renderGroup(
        props,
        omit(props, "render", "value", "defaultValue", "onValueChange"),
      )}
    </MenuRadioGroupContext>
  );
}
