// The hidden input, the form's view of the Select. The test list and the
// cases left out are in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/select/Fruit.tsx";
import type { FruitProps } from "../../../test/select/Fruit.tsx";
import {
  input,
  item,
  selected,
  trigger,
} from "../../../test/select/queries.ts";

const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => Object.fromEntries(new FormData(form()));

/** A Fruit select in a form with a submit and a reset button. */
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
      <button type="reset">Clear</button>
    </form>
  );
}

/** What the browser does when it fills the input in. */
function fill(value: string) {
  input().value = value;
  fireEvent.input(input());
  fireEvent.change(input());
}

describe("<Select.Trigger /> in a form", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a hidden input after the button, out of the accessibility tree and the tab order, holding the value", async () => {
    await render(() => (
      <>
        <Fruit defaultValue="banana" />
        <Fruit />
      </>
    ));
    const [first, second] = screen.getAllByRole("combobox");

    const filled = first!.nextElementSibling as HTMLInputElement;
    expect(filled.tagName).toBe("INPUT");
    expect(filled.type).toBe("text");
    expect(filled).toHaveAttribute("aria-hidden", "true");
    expect(filled).toHaveAttribute("tabindex", "-1");
    expect(filled.value).toBe("banana");
    expect((second!.nextElementSibling as HTMLInputElement).value).toBe("");
  });

  it("puts name, form, required, disabled and autocomplete on the input only", async () => {
    await render(() => (
      <>
        <form id="order" />
        <Fruit name="fruit" form="order" required disabled autocomplete="off" />
      </>
    ));

    expect(input()).toHaveAttribute("name", "fruit");
    expect(input()).toHaveAttribute("form", "order");
    expect(input()).toBeRequired();
    expect(input()).toBeDisabled();
    expect(input()).toHaveAttribute("autocomplete", "off");
    for (const name of ["name", "form", "required", "autocomplete"])
      expect(trigger()).not.toHaveAttribute(name);
  });

  it("submits the value under its name, and an empty string for none", async () => {
    await render(() => <FruitForm defaultValue="cherry" />);
    expect(submitted()).toEqual({ fruit: "cherry" });
  });

  it("submits nothing while disabled", async () => {
    await render(() => <FruitForm defaultValue="cherry" disabled />);

    expect(submitted()).toEqual({});
  });

  it("submits to the form named by form", async () => {
    await render(() => (
      <>
        <form id="order" data-testid="form" />
        <Fruit name="fruit" form="order" defaultValue="apple" />
      </>
    ));

    expect(submitted()).toEqual({ fruit: "apple" });
  });

  it("fires input and change that reach the form, whose FormData has the new value", async () => {
    const seen: string[] = [];
    const record = (event: Event) =>
      seen.push(`${event.type}:${String(submitted().fruit)}`);
    const { user } = await render(() => <FruitForm defaultOpen />);
    form().addEventListener("input", record);
    form().addEventListener("change", record);
    await afterFlush();

    await user.click(item("Banana"));
    await afterFlush();

    expect(seen).toEqual(["input:banana", "change:banana"]);
  });

  it("required blocks submission while no item is selected, and not once one is", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <FruitForm required defaultOpen onSubmit={onSubmit} />
    ));
    await afterFlush();

    expect(form().checkValidity()).toBe(false);
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(item("Apple"));
    await afterFlush();
    expect(form().checkValidity()).toBe(true);
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // jsdom does not focus the invalid control.
  it.skipIf(isJSDOM)(
    "moves focus to the Trigger when the browser blocks the submission",
    async () => {
      const { user } = await render(() => <FruitForm required />);

      await user.click(screen.getByRole("button", { name: "Send" }));

      expect(document.activeElement).toBe(trigger());
    },
  );

  it("a form reset goes back to defaultValue", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <FruitForm
        defaultValue="apple"
        defaultOpen
        onValueChange={onValueChange}
      />
    ));
    await afterFlush();
    await user.click(item("Cherry"));
    await afterFlush();
    expect(selected()).toEqual(["Cherry"]);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await afterFlush();

    expect(onValueChange).toHaveBeenLastCalledWith("apple");
    expect(selected()).toEqual(["Apple"]);
    expect(input().value).toBe("apple");
  });

  it("a form reset goes back to none without a defaultValue", async () => {
    const { user } = await render(() => <FruitForm defaultOpen />);
    await afterFlush();
    await user.click(item("Cherry"));
    await afterFlush();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await afterFlush();

    expect(selected()).toEqual([]);
    expect(input().value).toBe("");
  });

  it("a form reset only asks when controlled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <FruitForm
        value="cherry"
        defaultValue="apple"
        onValueChange={onValueChange}
      />
    ));

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("apple");
    expect(selected()).toEqual(["Cherry"]);
    expect(input().value).toBe("cherry");
  });

  it("autofill: a change of the input with an item's value selects it", async () => {
    const onValueChange = vi.fn();
    await render(() => <FruitForm onValueChange={onValueChange} />);

    fill("banana");
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(selected()).toEqual(["Banana"]);
    expect(input().value).toBe("banana");
  });

  it("autofill: a change with an item's label, in another case, selects it", async () => {
    const onValueChange = vi.fn();
    await render(() => <FruitForm onValueChange={onValueChange} />);

    fill("CHERRY");
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(selected()).toEqual(["Cherry"]);
    expect(input().value).toBe("cherry");
  });

  it("autofill: a change with neither puts the input back", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <FruitForm defaultValue="apple" onValueChange={onValueChange} />
    ));

    fill("Durian");
    await afterFlush();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(selected()).toEqual(["Apple"]);
    expect(input().value).toBe("apple");
  });
});
