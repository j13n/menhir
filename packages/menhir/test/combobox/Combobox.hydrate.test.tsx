import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import ComboboxFixture from "./ComboboxFixture.tsx";

const fixture = "/test/combobox/ComboboxFixture.tsx";
const combobox = (name: string) =>
  screen.getByRole("combobox", { name }) as HTMLInputElement;
const item = (name: string) =>
  screen.getByRole("option", { name, hidden: true });
const activeOf = (name: string) => {
  const id = combobox(name).getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
};

describe("<Combobox.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Input with defaultInputValue, the hidden input with the value, the Trigger and a hidden Popup with its List and items, linked by ids, with no item active", async () => {
    const container = await renderOnServer(fixture);
    const fruit = combobox("Fruit");
    const list = screen.getByTestId("fruit-list");
    const popup = screen.getByTestId("fruit-popup");
    const hidden = fruit.nextElementSibling as HTMLInputElement;
    const trigger = screen.getByRole("button", { name: "Show fruits" });

    expect(fruit).toHaveAttribute("value", "Banana");
    expect(fruit).toHaveAttribute("aria-expanded", "false");
    expect(fruit).not.toHaveAttribute("aria-activedescendant");
    expect(list.id).not.toBe("");
    expect(fruit).toHaveAttribute("aria-controls", list.id);
    expect(trigger).toHaveAttribute("aria-controls", list.id);
    expect(list).toHaveAttribute("role", "listbox");
    expect(popup).toHaveAttribute("popover", "manual");
    expect(popup.matches(":popover-open")).toBe(false);
    expect(hidden).toHaveAttribute("name", "fruit");
    expect(hidden).toHaveAttribute("value", "banana");
    expect(item("Apple")).toHaveAttribute("aria-selected", "false");
    expect(item("Banana")).toHaveAttribute("aria-selected", "true");
    expect(item("Banana").id).not.toBe("");
    expect(container.querySelector("[data-active]")).toBeNull();
    expect(screen.getByTestId("fruit-status")).toBeEmptyDOMElement();
    // No label for a value without defaultInputValue: the items come after
    // the Input.
    expect(combobox("Size").value).toBe("");
    container.remove();
  });

  it("renders a defaultOpen Combobox closed, with data-open", async () => {
    const container = await renderOnServer(fixture);
    const popup = screen.getByTestId("colour-popup");

    expect(popup.matches(":popover-open")).toBe(false);
    expect(popup).toHaveAttribute("data-open", "");
    expect(combobox("Colour")).toHaveAttribute("aria-expanded", "true");
    container.remove();
  });

  it("adopts the server's elements without warnings, shows the selected item's label without defaultInputValue, and opens a defaultOpen Combobox", async () => {
    const container = await renderOnServer(fixture);
    const serverInput = combobox("Fruit");
    const serverPopup = screen.getByTestId("colour-popup");

    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <ComboboxFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(combobox("Fruit")).toBe(serverInput);
    expect(serverInput.value).toBe("Banana");
    expect(combobox("Size").value).toBe("Medium");
    expect(screen.getByTestId("colour-popup")).toBe(serverPopup);
    expect(serverPopup.matches(":popover-open")).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "opens by click and by key after hydration, and selects an item",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <ComboboxFixture />, {
        hydrate: container,
      });
      const popup = screen.getByTestId("fruit-popup");
      const fruit = combobox("Fruit");
      await nextTask();

      await user.click(screen.getByRole("button", { name: "Show fruits" }));
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(fruit);
      expect(screen.getByTestId("fruit-status")).toHaveTextContent("3 fruits");

      await keyboard("{Escape}");
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(false);

      await keyboard("{ArrowDown}");
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(true);
      expect(activeOf("Fruit")).toBe("Apple");

      await keyboard("{ArrowDown}{ArrowDown}{Enter}");
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(false);
      expect(fruit.value).toBe("Lemon");
      expect((fruit.nextElementSibling as HTMLInputElement).value).toBe(
        "lemon",
      );
    },
  );
});
