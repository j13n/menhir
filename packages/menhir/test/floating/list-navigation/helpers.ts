// Queries and input for the tests of `floating/list-navigation`, against
// the test lists in Menu.tsx and Combobox.tsx. Keys are real input in
// Chromium (../input.ts) and Testing Library's events in jsdom.
import { fireEvent, isJSDOM, screen } from "#test-utils";

import { keyboard } from "../input.ts";
import { Combobox } from "./Combobox.tsx";
import { Menu } from "./Menu.tsx";

/** The two ways of holding focus, for `describe.each`. */
export const forms = [
  { form: "roving", List: Menu },
  { form: "aria-activedescendant", List: Combobox },
] as const;

/** The item with that label, a menu item or an option. */
export function item(label: string): HTMLElement {
  return screen.getByText(label, {
    selector: "[role=menuitem], [role=option]",
  });
}

/** The label of the item that carries `data-active`, if any. */
export function activeLabel(): string | undefined {
  const active = document.querySelectorAll("[data-active]");
  if (active.length > 1) throw new Error("More than one item is active");
  return active[0]?.textContent ?? undefined;
}

/**
 * Where a key goes: the combobox's input, else the focused menu item, else
 * the first menu item.
 */
export function keyTarget(): HTMLElement {
  const focused = document.activeElement;
  return (
    document.querySelector<HTMLElement>("[role=combobox]") ??
    (focused instanceof HTMLElement && focused.matches("[role=menuitem]")
      ? focused
      : document.querySelector<HTMLElement>("[role=menuitem]")!)
  );
}

const modifiers = {
  altKey: "Alt",
  ctrlKey: "Control",
  metaKey: "Meta",
  shiftKey: "Shift",
} as const;

/**
 * Presses a key on `target`, and resolves to whether its default action was
 * left alone, as `fireEvent` returns. In Chromium the key is real: `target`
 * is focused first, without scrolling, unless it has focus.
 */
export async function pressOn(
  target: HTMLElement,
  key: string,
  init: Pick<KeyboardEventInit, keyof typeof modifiers> = {},
): Promise<boolean> {
  if (isJSDOM) return fireEvent.keyDown(target, { key, ...init });
  if (document.activeElement !== target) target.focus({ preventScroll: true });
  const held = Object.entries(modifiers).flatMap(([flag, name]) =>
    init[flag as keyof typeof modifiers] ? [name] : [],
  );
  let leftAlone = true;
  // After every handler: the delegated ones are on the document. The key's
  // own event, not that of a modifier held before it.
  const record = (event: KeyboardEvent) => {
    if (event.key === key) leftAlone = !event.defaultPrevented;
  };
  window.addEventListener("keydown", record);
  try {
    await keyboard(
      held.map((name) => `{${name}>}`).join("") +
        `{${key}}` +
        held.map((name) => `{/${name}}`).join(""),
    );
  } finally {
    window.removeEventListener("keydown", record);
  }
  return leftAlone;
}

/** Presses a key where the test list takes keys (`keyTarget`). */
export function press(
  key: string,
  init?: Pick<KeyboardEventInit, keyof typeof modifiers>,
): Promise<boolean> {
  return pressOn(keyTarget(), key, init);
}
