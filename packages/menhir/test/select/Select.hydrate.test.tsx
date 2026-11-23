import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import SelectFixture from "./SelectFixture.tsx";

const fixture = "/test/select/SelectFixture.tsx";
const trigger = (name: string) => screen.getByRole("combobox", { name });
const item = (name: string) =>
  screen.getByRole("option", { name, hidden: true });
const activeOf = (name: string) => {
  const id = trigger(name).getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.textContent : undefined;
};

describe("<Select.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Trigger, the hidden input with the value and a hidden Popup with its items, linked by ids, with no item active", async () => {
    const container = await renderOnServer(fixture);
    const fruit = trigger("Fruit");
    const list = screen.getByTestId("fruit-list");
    const input = fruit.nextElementSibling as HTMLInputElement;

    expect(fruit).toHaveAttribute("aria-haspopup", "listbox");
    expect(fruit).toHaveAttribute("aria-expanded", "false");
    expect(fruit).not.toHaveAttribute("aria-activedescendant");
    expect(list.id).not.toBe("");
    expect(fruit).toHaveAttribute("popovertarget", list.id);
    expect(fruit).toHaveAttribute("aria-controls", list.id);
    expect(list).toHaveAttribute("role", "listbox");
    expect(list).toHaveAttribute("popover", "auto");
    expect(list).toHaveAttribute("aria-labelledby", "fruit");
    expect(list.matches(":popover-open")).toBe(false);
    expect(input).toHaveAttribute("name", "fruit");
    expect(input).toHaveAttribute("value", "banana");
    expect(item("Apple")).toHaveAttribute("aria-selected", "false");
    expect(item("🍌 Banana")).toHaveAttribute("aria-selected", "true");
    expect(item("🍌 Banana").id).not.toBe("");
    expect(container.querySelector("[data-active]")).toBeNull();
    // A GroupLabel registers once mounted, so the server names none.
    expect(container.querySelector('[role="group"]')).not.toHaveAttribute(
      "aria-labelledby",
    );
    container.remove();
  });

  it("shows the value as the Value's text, or what its function returns", async () => {
    const container = await renderOnServer(fixture);

    // The items come after the Value, so the server knows no label.
    expect(screen.getByTestId("fruit-value")).toHaveTextContent("banana");
    expect(screen.getByTestId("size-value")).toHaveTextContent("Medium");
    expect(screen.getByTestId("colour-value")).toHaveTextContent(
      "Pick a colour",
    );
    expect(screen.getByTestId("colour-value")).toHaveAttribute(
      "data-placeholder",
      "",
    );
    container.remove();
  });

  it("renders a defaultOpen Select closed, with data-open", async () => {
    const container = await renderOnServer(fixture);
    const list = screen.getByTestId("colour-list");

    expect(list.matches(":popover-open")).toBe(false);
    expect(list).toHaveAttribute("data-open", "");
    expect(trigger("Colour")).toHaveAttribute("aria-expanded", "true");
    container.remove();
  });

  it("adopts the server's elements without warnings, shows the selected item's label, and opens a defaultOpen Select", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = trigger("Fruit");
    const serverValue = screen.getByTestId("fruit-value");
    const serverList = screen.getByTestId("colour-list");

    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <SelectFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(trigger("Fruit")).toBe(serverTrigger);
    expect(screen.getByTestId("fruit-value")).toBe(serverValue);
    expect(serverValue).toHaveTextContent("Banana");
    expect(serverValue).not.toHaveTextContent("🍌");
    expect(screen.getByTestId("size-value")).toHaveTextContent("Medium");
    expect(screen.getByTestId("colour-list")).toBe(serverList);
    expect(serverList.matches(":popover-open")).toBe(true);
    await vi.waitFor(() => expect(activeOf("Colour")).toBe("Red"));
  });

  it.skipIf(isJSDOM)(
    "opens by click and by key after hydration, and selects an item",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <SelectFixture />, {
        hydrate: container,
      });
      const list = screen.getByTestId("fruit-list");
      const fruit = trigger("Fruit");
      await nextTask();

      await user.click(fruit);
      await nextTask();
      expect(list.matches(":popover-open")).toBe(true);
      expect(activeOf("Fruit")).toBe("🍌 Banana");
      expect(document.activeElement).toBe(fruit);

      await keyboard("{Escape}");
      await nextTask();
      expect(list.matches(":popover-open")).toBe(false);

      await keyboard("{Enter}");
      await nextTask();
      expect(list.matches(":popover-open")).toBe(true);

      await keyboard("{ArrowDown}{Enter}");
      await nextTask();
      expect(list.matches(":popover-open")).toBe(false);
      expect(screen.getByTestId("fruit-value")).toHaveTextContent("Lemon");
      expect((fruit.nextElementSibling as HTMLInputElement).value).toBe(
        "lemon",
      );
    },
  );
});
