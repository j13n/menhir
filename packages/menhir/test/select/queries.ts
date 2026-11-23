// Queries the Select tests share. The Popup is hidden while closed, so
// each looks at hidden elements too.
import { screen } from "@solidjs/testing-library";

export const trigger = () => screen.getByRole("combobox");
export const popup = () => screen.getByRole("listbox", { hidden: true });
export const shown = () => popup().matches(":popover-open");
export const item = (name: string) =>
  screen.getByRole("option", { name, hidden: true });
/** The hidden input, the form's view of the Select. */
export const input = () => trigger().nextElementSibling as HTMLInputElement;
/** The label of the item the Trigger names in `aria-activedescendant`. */
export const active = () => {
  const id = trigger().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
};
/** The label of the selected item, if any. */
export const selected = () =>
  screen
    .queryAllByRole("option", { hidden: true })
    .filter((option) => option.getAttribute("aria-selected") === "true")
    .map((option) => option.textContent);
