// Queries the Combobox tests share. The Popup and its List are hidden while
// closed, so each looks at hidden elements too.
import { screen } from "@solidjs/testing-library";

export const input = () => screen.getByRole("combobox") as HTMLInputElement;
export const list = () => screen.getByRole("listbox", { hidden: true });
/** The Popup, the popover around the List. */
export const popup = () => list().closest("[popover]") as HTMLElement;
export const shown = () => popup().matches(":popover-open");
export const item = (name: string) =>
  screen.getByRole("option", { name, hidden: true });
/** The names of the items in the list, in order. */
export const items = () =>
  screen
    .queryAllByRole("option", { hidden: true })
    .map((option) => option.textContent);
/** The hidden input, the form's view of the Combobox. */
export const hiddenInput = () => input().nextElementSibling as HTMLInputElement;
/** The label of the item the input names in `aria-activedescendant`. */
export const active = () => {
  const id = input().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
};
/** The labels of the selected items, if any. */
export const selected = () =>
  screen
    .queryAllByRole("option", { hidden: true })
    .filter((option) => option.getAttribute("aria-selected") === "true")
    .map((option) => option.textContent);
