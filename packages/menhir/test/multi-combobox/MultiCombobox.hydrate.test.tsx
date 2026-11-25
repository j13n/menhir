import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import MultiComboboxFixture from "./MultiComboboxFixture.tsx";

const fixture = "/test/multi-combobox/MultiComboboxFixture.tsx";
const combobox = (name: string) =>
  screen.getByRole("combobox", { name }) as HTMLInputElement;
const item = (name: string) =>
  screen.getByRole("option", { name, hidden: true });
const chipLabels = () =>
  Array.from(
    screen.getByTestId("chips").querySelectorAll(":scope > div"),
    (chip) => chip.textContent!.replace("×", ""),
  );
const submitted = () =>
  Array.from(
    document.querySelectorAll<HTMLInputElement>(
      "input[type=hidden][name=toppings]",
    ),
    (input) => input.value,
  );

describe("<MultiCombobox.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the chips of defaultValue, the Input with defaultInputValue, a hidden input per value and a hidden Popup with selected items, closed, linked by ids", async () => {
    const container = await renderOnServer(fixture);
    const toppings = combobox("Toppings");
    const list = screen.getByTestId("toppings-list");
    const popup = screen.getByTestId("toppings-popup");

    expect(chipLabels()).toEqual(["Olives", "Cheese"]);
    expect(toppings).toHaveAttribute("value", "on");
    expect(toppings).toHaveAttribute("aria-expanded", "false");
    expect(toppings).toHaveAttribute("aria-controls", list.id);
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    expect(popup).toHaveAttribute("popover", "manual");
    expect(popup.matches(":popover-open")).toBe(false);
    expect(submitted()).toEqual(["olives", "cheese"]);
    expect(item("Cheese")).toHaveAttribute("aria-selected", "true");
    expect(item("Olives")).toHaveAttribute("aria-selected", "true");
    expect(item("Onions")).toHaveAttribute("aria-selected", "false");
    expect(container.querySelector("[data-active]")).toBeNull();
    container.remove();
  });

  it("adopts the server's elements without warnings, and opens a defaultOpen Multi Combobox", async () => {
    const container = await renderOnServer(fixture);
    const serverInput = combobox("Toppings");
    const serverChip = screen.getByTestId("chips").firstElementChild;
    const serverPopup = screen.getByTestId("colour-popup");

    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <MultiComboboxFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(combobox("Toppings")).toBe(serverInput);
    expect(screen.getByTestId("chips").firstElementChild).toBe(serverChip);
    expect(serverInput.value).toBe("on");
    expect(serverPopup.matches(":popover-open")).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "adds a value and removes one after hydration",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <MultiComboboxFixture />, {
        hydrate: container,
      });
      const toppings = combobox("Toppings");
      await nextTask();

      toppings.focus();
      await keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");
      await nextTask();
      expect(chipLabels()).toEqual(["Olives", "Cheese", "Onions"]);
      expect(submitted()).toEqual(["olives", "cheese", "onions"]);
      expect(toppings.value).toBe("");
      expect(document.activeElement).toBe(toppings);

      await user.click(screen.getByRole("button", { name: "Remove Olives" }));
      await nextTask();
      expect(chipLabels()).toEqual(["Cheese", "Onions"]);
      expect(submitted()).toEqual(["cheese", "onions"]);
      expect(document.activeElement).toBe(toppings);
    },
  );
});
