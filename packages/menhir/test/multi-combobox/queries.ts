// Queries the Multi Combobox tests share. The Popup and its List are hidden
// while closed, so each looks at hidden elements too.
import { screen } from "@solidjs/testing-library";

export const input = () => screen.getByRole("combobox") as HTMLInputElement;
export const list = () => screen.getByRole("listbox", { hidden: true });
/** The Popup, the popover around the List. */
export const popup = () => list().closest("[popover]") as HTMLElement;
export const shown = () => popup().matches(":popover-open");
export const item = (name: string) =>
  screen.getByRole("option", { name, hidden: true });
/** The label of the item the input names in `aria-activedescendant`. */
export const active = () => {
  const id = input().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
};
/** The labels of the selected items, in the list's order. */
export const selected = () =>
  screen
    .queryAllByRole("option", { hidden: true })
    .filter((option) => option.getAttribute("aria-selected") === "true")
    .map((option) => option.textContent?.replace("✓", ""));
/** The chips, in order: each a focusable element with no role. */
export const chips = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-testid=chips] > div[tabindex]",
    ),
  );
/** The chip that shows `label`. */
export const chip = (label: string) =>
  chips().find((chip) => chip.textContent!.startsWith(label))!;
/** The labels the chips show, in order. */
export const chipLabels = () =>
  chips().map((chip) => chip.textContent!.replace("×", ""));
/** The values of the hidden inputs the form receives, in order. */
export const submitted = () =>
  Array.from(
    document.querySelectorAll<HTMLInputElement>("input[type=hidden]"),
  ).map((input) => input.value);
