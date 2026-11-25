// The test list and the cases left out are in ../README.md.
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import {
  active,
  chipLabels,
  input,
  item,
  selected,
  shown,
  submitted,
} from "../../../test/multi-combobox/queries.ts";
import { MultiCombobox } from "../index.ts";

const trigger = () => screen.getByRole("button", { name: "Show toppings" });

describe("<MultiCombobox.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <MultiCombobox.Root>
        <span data-testid="child" />
      </MultiCombobox.Root>
    ));

    expect(container.firstElementChild).toBe(screen.getByTestId("child"));
  });

  it("is closed by default", async () => {
    await render(() => <Toppings />);

    expect(shown()).toBe(false);
  });

  it("starts open with defaultOpen, with no item active", async () => {
    await render(() => <Toppings defaultOpen />);
    await afterFlush();

    expect(shown()).toBe(true);
    expect(active()).toBeUndefined();
  });

  it("selects nothing by default; defaultValue selects those items and shows their chips", async () => {
    await render(() => <Toppings defaultValue={["olives", "cheese"]} />);
    await afterFlush();

    expect(selected()).toEqual(["Cheese", "Olives"]);
    expect(chipLabels()).toEqual(["Olives", "Cheese"]);
    expect(submitted()).toEqual(["olives", "cheese"]);
    expect(input()).toHaveValue("");
  });

  it("adds a selected item when uncontrolled, reporting the list and an empty text", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["olives"]}
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));

    await user.type(input(), "ch");
    await user.click(item("Cheese"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith(["olives", "cheese"]);
    expect(onInputValueChange).toHaveBeenLastCalledWith("", {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
    expect(chipLabels()).toEqual(["Olives", "Cheese"]);
    expect(input()).toHaveValue("");
    expect(shown()).toBe(true);
  });

  it("only asks when the value is controlled, and follows it", async () => {
    const onValueChange = vi.fn();
    const [value, setValue] = createSignal(["olives"]);
    const { user } = await render(() => (
      <Toppings value={value()} onValueChange={onValueChange} />
    ));

    await user.click(trigger());
    await user.click(item("Cheese"));
    await afterFlush();
    expect(onValueChange).toHaveBeenCalledWith(["olives", "cheese"]);
    expect(chipLabels()).toEqual(["Olives"]);
    expect(submitted()).toEqual(["olives"]);

    setValue(["onions", "cheese"]);
    flush();
    expect(selected()).toEqual(["Cheese", "Onions"]);
    expect(chipLabels()).toEqual(["Onions", "Cheese"]);
    expect(submitted()).toEqual(["onions", "cheese"]);

    setValue([]);
    flush();
    expect(chipLabels()).toEqual([]);
    expect(submitted()).toEqual([]);
  });

  it("only asks when the input value is controlled, and keeps the controlled text", async () => {
    const onInputValueChange = vi.fn();
    const [text, setText] = createSignal("Ol");
    const { user } = await render(() => (
      <Toppings inputValue={text()} onInputValueChange={onInputValueChange} />
    ));

    await user.type(input(), "x");
    await afterFlush();
    expect(onInputValueChange).toHaveBeenCalledWith("Olx", {
      reason: "input-change",
      event: expect.any(Event),
    });
    expect(input()).toHaveValue("Ol");

    setText("On");
    flush();
    expect(input()).toHaveValue("On");
  });

  it("changes before async work that onValueChange starts settles", async () => {
    const { user } = await render(() => (
      <Toppings onValueChange={() => new Promise(() => {})} />
    ));

    await user.click(trigger());
    await user.click(item("Olives"));
    await afterFlush();

    expect(selected()).toEqual(["Olives"]);
    expect(chipLabels()).toEqual(["Olives"]);
    expect(shown()).toBe(true);
  });
});
