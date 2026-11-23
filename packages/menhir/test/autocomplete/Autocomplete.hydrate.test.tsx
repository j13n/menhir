import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import AutocompleteFixture from "./AutocompleteFixture.tsx";

const fixture = "/test/autocomplete/AutocompleteFixture.tsx";
const autocomplete = (name: string) =>
  screen.getByRole("combobox", { name }) as HTMLInputElement;
const item = (name: string) =>
  screen.getByRole("option", { name, hidden: true });
const activeOf = (name: string) => {
  const id = autocomplete(name).getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
};

describe("<Autocomplete.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Input with defaultValue as its value and its name, and a hidden Popup with its List and items, linked by ids, with no item active", async () => {
    const container = await renderOnServer(fixture);
    const city = autocomplete("City");
    const list = screen.getByTestId("city-list");
    const popup = screen.getByTestId("city-popup");
    const trigger = screen.getByRole("button", { name: "Show cities" });

    expect(city).toHaveAttribute("value", "Os");
    expect(city).toHaveAttribute("name", "city");
    expect(city).toHaveAttribute("aria-expanded", "false");
    expect(city).not.toHaveAttribute("aria-activedescendant");
    expect(city.nextElementSibling).toBe(trigger);
    expect(list.id).not.toBe("");
    expect(city).toHaveAttribute("aria-controls", list.id);
    expect(trigger).toHaveAttribute("aria-controls", list.id);
    expect(list).toHaveAttribute("role", "listbox");
    expect(popup).toHaveAttribute("popover", "manual");
    expect(popup.matches(":popover-open")).toBe(false);
    expect(item("Oslo").id).not.toBe("");
    expect(item("Oslo")).not.toHaveAttribute("aria-selected");
    expect(container.querySelector("[data-active]")).toBeNull();
    expect(screen.getByTestId("city-status")).toBeEmptyDOMElement();
    container.remove();
  });

  it("renders a defaultOpen Autocomplete closed, with data-open", async () => {
    const container = await renderOnServer(fixture);
    const popup = screen.getByTestId("colour-popup");

    expect(popup.matches(":popover-open")).toBe(false);
    expect(popup).toHaveAttribute("data-open", "");
    expect(autocomplete("Colour")).toHaveAttribute("aria-expanded", "true");
    container.remove();
  });

  it("adopts the server's elements without warnings, and opens a defaultOpen Autocomplete", async () => {
    const container = await renderOnServer(fixture);
    const serverInput = autocomplete("City");
    const serverPopup = screen.getByTestId("colour-popup");

    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <AutocompleteFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(autocomplete("City")).toBe(serverInput);
    expect(serverInput.value).toBe("Os");
    expect(screen.getByTestId("colour-popup")).toBe(serverPopup);
    expect(serverPopup.matches(":popover-open")).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "opens by click and by key after hydration, and accepts a suggestion",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <AutocompleteFixture />, {
        hydrate: container,
      });
      const popup = screen.getByTestId("city-popup");
      const city = autocomplete("City");
      await nextTask();

      await user.click(screen.getByRole("button", { name: "Show cities" }));
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(city);
      expect(screen.getByTestId("city-status")).toHaveTextContent("3 cities");

      await keyboard("{Escape}");
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(false);

      await keyboard("{ArrowDown}");
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(true);
      expect(activeOf("City")).toBe("Bergen");

      await keyboard("{ArrowDown}{ArrowDown}{Enter}");
      await nextTask();
      expect(popup.matches(":popover-open")).toBe(false);
      expect(city.value).toBe("Tromsø");
    },
  );
});
