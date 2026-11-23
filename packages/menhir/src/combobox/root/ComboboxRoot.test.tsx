// The test list and the cases left out are in ../README.md.
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import {
  active,
  hiddenInput,
  input,
  item,
  popup,
  selected,
  shown,
} from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

const trigger = () => screen.getByRole("button", { name: "Show fruits" });

describe("<Combobox.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Combobox.Root>
        <span data-testid="child" />
      </Combobox.Root>
    ));

    expect(container.firstElementChild).toBe(screen.getByTestId("child"));
  });

  it("is closed by default, with data-closed", async () => {
    await render(() => <Fruit />);

    expect(shown()).toBe(false);
    expect(input()).toHaveAttribute("data-closed", "");
    expect(popup()).toHaveAttribute("data-closed", "");
    expect(popup()).not.toHaveAttribute("data-open");
  });

  it("starts open with defaultOpen, with data-open and no item active", async () => {
    await render(() => <Fruit defaultOpen />);
    await afterFlush();

    expect(shown()).toBe(true);
    expect(input()).toHaveAttribute("data-open", "");
    expect(popup()).toHaveAttribute("data-open", "");
    expect(active()).toBeUndefined();
    expect(document.querySelector("[data-active]")).toBeNull();
  });

  it("opens and closes on the Trigger when uncontrolled, reporting each change", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Fruit onOpenChange={onOpenChange} />);

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });
  });

  it("only asks when open is controlled, and follows it", async () => {
    const onOpenChange = vi.fn();
    const [open, setOpen] = createSignal(false);
    const { user } = await render(() => (
      <Fruit open={open()} onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(shown()).toBe(false);

    setOpen(true);
    flush();
    expect(shown()).toBe(true);

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(true);
  });

  it("selects nothing by default; defaultValue selects an item, whose label the input shows once mounted", async () => {
    await render(() => (
      <>
        <Fruit defaultValue="blueberry" />
        <Combobox.Root>
          <Combobox.Input aria-label="Empty" />
        </Combobox.Root>
      </>
    ));
    await afterFlush();

    const fruit = screen.getByRole("combobox", { name: "Fruit" });
    expect(selected()).toEqual(["Blueberry"]);
    expect(fruit).toHaveValue("Blueberry");
    expect(fruit.nextElementSibling).toHaveValue("blueberry");
    expect(screen.getByRole("combobox", { name: "Empty" })).toHaveValue("");
  });

  it("starts with defaultInputValue as the text", async () => {
    await render(() => <Fruit defaultValue="banana" defaultInputValue="Ban" />);
    await afterFlush();

    expect(input()).toHaveValue("Ban");
  });

  it("selects an item when uncontrolled, reporting the value and its label", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));

    await user.click(trigger());
    await user.click(item("Cherry"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(onInputValueChange).toHaveBeenCalledWith("Cherry", {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
    expect(selected()).toEqual(["Cherry"]);
    expect(input()).toHaveValue("Cherry");
  });

  it("only asks when the value is controlled, and follows it", async () => {
    const onValueChange = vi.fn();
    const [value, setValue] = createSignal<string | null>("apple");
    const { user } = await render(() => (
      <Fruit value={value()} onValueChange={onValueChange} />
    ));
    await afterFlush();

    await user.click(trigger());
    await user.click(item("Cherry"));
    await afterFlush();
    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(selected()).toEqual(["Apple"]);
    expect(hiddenInput()).toHaveValue("apple");

    setValue("banana");
    flush();
    expect(selected()).toEqual(["Banana"]);
    expect(hiddenInput()).toHaveValue("banana");

    setValue(null);
    flush();
    expect(selected()).toEqual([]);
    expect(hiddenInput()).toHaveValue("");
  });

  it("only asks when the input value is controlled, and keeps the controlled text", async () => {
    const onInputValueChange = vi.fn();
    const [text, setText] = createSignal("App");
    const { user } = await render(() => (
      <Fruit inputValue={text()} onInputValueChange={onInputValueChange} />
    ));

    await user.type(input(), "x");
    await afterFlush();
    expect(onInputValueChange).toHaveBeenCalledWith("Appx", {
      reason: "input-change",
      event: expect.any(Event),
    });
    expect(input()).toHaveValue("App");

    setText("Ch");
    flush();
    expect(input()).toHaveValue("Ch");
  });

  it("changes before async work that onValueChange starts settles", async () => {
    const { user } = await render(() => (
      <Fruit onValueChange={() => new Promise(() => {})} />
    ));

    await user.click(trigger());
    await user.click(item("Banana"));
    await afterFlush();

    expect(selected()).toEqual(["Banana"]);
    expect(input()).toHaveValue("Banana");
    expect(shown()).toBe(false);
  });
});
