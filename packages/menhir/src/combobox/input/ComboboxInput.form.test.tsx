// The hidden input, the form's view of the Combobox. The test list and the
// cases left out are in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import type { FruitProps } from "../../../test/combobox/Fruit.tsx";
import {
  hiddenInput,
  input,
  item,
  selected,
} from "../../../test/combobox/queries.ts";

const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => Object.fromEntries(new FormData(form()));

/** A Fruit combobox in a form with a submit and a reset button. */
function FruitForm(props: FruitProps & { onSubmit?: () => void }) {
  return (
    <form
      data-testid="form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.();
      }}
    >
      <Fruit name="fruit" {...props} />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<Combobox.Input /> in a form", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a hidden input after the Input, out of the accessibility tree and the tab order, holding the value", async () => {
    await render(() => (
      <>
        <Fruit defaultValue="banana" />
        <Fruit />
      </>
    ));
    const [first, second] = screen.getAllByRole("combobox");

    const filled = first!.nextElementSibling as HTMLInputElement;
    expect(filled.tagName).toBe("INPUT");
    expect(filled).toHaveAttribute("aria-hidden", "true");
    expect(filled).toHaveAttribute("tabindex", "-1");
    expect(filled.value).toBe("banana");
    expect((second!.nextElementSibling as HTMLInputElement).value).toBe("");
  });

  it("puts name, form, required and disabled on the hidden input, and no name on the Input", async () => {
    await render(() => (
      <>
        <form id="order" />
        <Fruit name="fruit" form="order" required disabled />
      </>
    ));

    expect(hiddenInput()).toHaveAttribute("name", "fruit");
    expect(hiddenInput()).toHaveAttribute("form", "order");
    expect(hiddenInput()).toBeRequired();
    expect(hiddenInput()).toBeDisabled();
    for (const name of ["name", "form", "required"])
      expect(input()).not.toHaveAttribute(name);
  });

  it("submits the value under its name, not the text", async () => {
    const { user } = await render(() => <FruitForm defaultValue="cherry" />);
    await afterFlush();
    expect(submitted()).toEqual({ fruit: "cherry" });

    await user.clear(input());
    await user.type(input(), "app");
    expect(submitted()).toEqual({ fruit: "cherry" });
  });

  it("submits nothing while disabled", async () => {
    await render(() => <FruitForm defaultValue="cherry" disabled />);

    expect(submitted()).toEqual({});
  });

  it("fires input and change that reach the form, whose FormData has the new value", async () => {
    const seen: string[] = [];
    const record = (event: Event) => {
      // The Input's own typing is no change of the value.
      if (event.target === input()) return;
      seen.push(`${event.type}:${String(submitted().fruit)}`);
    };
    const { user } = await render(() => <FruitForm defaultOpen />);
    form().addEventListener("input", record);
    form().addEventListener("change", record);
    await afterFlush();

    await user.click(item("Banana"));
    await afterFlush();

    expect(seen).toEqual(["input:banana", "change:banana"]);
  });

  it("required blocks submission while no item is selected, even with text, and not once one is", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <FruitForm required onSubmit={onSubmit} />
    ));

    await user.type(input(), "Apple");
    await afterFlush();
    expect(form().checkValidity()).toBe(false);
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).not.toHaveBeenCalled();

    input().focus();
    await user.keyboard("{ArrowDown}{Enter}");
    await afterFlush();
    expect(form().checkValidity()).toBe(true);
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // jsdom does not focus the invalid control.
  it.skipIf(isJSDOM)(
    "moves focus to the Input when the browser blocks the submission",
    async () => {
      const { user } = await render(() => <FruitForm required />);

      await user.click(screen.getByRole("button", { name: "Send" }));

      expect(document.activeElement).toBe(input());
    },
  );

  it("a form reset puts back defaultValue and the default item's label", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <FruitForm
        defaultValue="apple"
        defaultOpen
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    await afterFlush();
    await user.click(item("Cherry"));
    await afterFlush();
    expect(input()).toHaveValue("Cherry");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await afterFlush();

    expect(onValueChange).toHaveBeenLastCalledWith("apple");
    expect(onInputValueChange).toHaveBeenLastCalledWith("Apple", {
      reason: "reset",
      event: expect.any(Event),
    });
    expect(selected()).toEqual(["Apple"]);
    expect(input()).toHaveValue("Apple");
    expect(hiddenInput().value).toBe("apple");
  });

  it("a form reset puts back defaultInputValue, and no value without a defaultValue", async () => {
    const { user } = await render(() => (
      <FruitForm defaultInputValue="Ch" defaultOpen />
    ));
    await afterFlush();
    await user.click(item("Cherry"));
    await afterFlush();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await afterFlush();

    expect(selected()).toEqual([]);
    expect(input()).toHaveValue("Ch");
    expect(hiddenInput().value).toBe("");
  });

  it("a form reset only asks when controlled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <FruitForm
        value="cherry"
        inputValue="Cherry"
        defaultValue="apple"
        onValueChange={onValueChange}
      />
    ));
    await afterFlush();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("apple");
    expect(selected()).toEqual(["Cherry"]);
    expect(hiddenInput().value).toBe("cherry");
    expect(input()).toHaveValue("Cherry");
  });
});
