// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Errored } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { CheckboxGroup } from "../index.ts";

const box = (name: string) => screen.getByRole("checkbox", { name });

describeConformance(
  "<CheckboxGroup.Item />",
  (props) => (
    <CheckboxGroup.Root>
      <CheckboxGroup.Item value="a" {...props} />
    </CheckboxGroup.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<CheckboxGroup.Item />", () => {
  const { render } = createRenderer();

  it("renders a checkbox button, checked while the group's value has its value", async () => {
    await render(() => (
      <CheckboxGroup.Root defaultValue={["b"]}>
        <CheckboxGroup.Item value="a" aria-label="a" />
        <CheckboxGroup.Item value="b" aria-label="b" />
      </CheckboxGroup.Root>
    ));

    expect(box("a").tagName).toBe("BUTTON");
    expect(box("a")).toHaveAttribute("type", "button");
    expect(box("a")).toHaveAttribute("aria-checked", "false");
    expect(box("b")).toHaveAttribute("aria-checked", "true");
  });

  it("toggles on click and with Space, adding and taking out its value", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <CheckboxGroup.Root onValueChange={onValueChange}>
        <CheckboxGroup.Item value="a" aria-label="a" />
      </CheckboxGroup.Root>
    ));

    await user.click(box("a"));
    expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
    expect(box("a")).toHaveAttribute("aria-checked", "true");

    await user.keyboard("[Space]");
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(box("a")).toHaveAttribute("aria-checked", "false");
  });

  it("gives its hidden input the group's name and form, and its own value", async () => {
    await render(() => (
      <CheckboxGroup.Root name="letters" form="elsewhere">
        <CheckboxGroup.Item value="a" aria-label="a" />
      </CheckboxGroup.Root>
    ));

    const input = document.querySelector("input[type=checkbox][name]")!;
    expect(input).toHaveAttribute("name", "letters");
    expect(input).toHaveAttribute("value", "a");
    expect(input).toHaveAttribute("form", "elsewhere");
  });

  it("disables only its own box, and keeps its value in the list", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <CheckboxGroup.Root defaultValue={["a"]} onValueChange={onValueChange}>
        <CheckboxGroup.Item value="a" aria-label="a" disabled />
        <CheckboxGroup.Item value="b" aria-label="b" />
      </CheckboxGroup.Root>
    ));

    expect(box("a")).toBeDisabled();
    expect(box("a")).toHaveAttribute("data-disabled", "");
    expect(box("b")).not.toBeDisabled();

    await user.click(box("a"));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(box("b"));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("stays checked and is submitted when read-only, unlike a disabled box", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form data-testid="form" onSubmit={onSubmit}>
        <CheckboxGroup.Root
          name="cookies"
          required
          defaultValue={["essential", "locked"]}
        >
          <CheckboxGroup.Item
            value="essential"
            aria-label="Essential"
            readOnly
          />
          <CheckboxGroup.Item value="locked" aria-label="Locked" disabled />
        </CheckboxGroup.Root>
        <button type="submit">Save</button>
      </form>
    ));

    await user.click(box("Essential"));
    expect(box("Essential")).toHaveAttribute("aria-checked", "true");
    expect(
      new FormData(screen.getByTestId<HTMLFormElement>("form")).getAll(
        "cookies",
      ),
    ).toEqual(["essential"]);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("passes the consumer's props to the Checkbox", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <CheckboxGroup.Root onValueChange={onValueChange}>
        <CheckboxGroup.Item
          value="a"
          id="item-a"
          class="box"
          aria-label="Letter a"
          readOnly
          render={(props) => <button {...props} data-rendered="" />}
        />
      </CheckboxGroup.Root>
    ));

    const item = box("Letter a");
    expect(item).toHaveAttribute("id", "item-a");
    expect(item).toHaveClass("box");
    expect(item).toHaveAttribute("aria-readonly", "true");
    expect(item).toHaveAttribute("data-rendered", "");

    await user.click(item);
    await afterFlush();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("gives the Indicator the box's state", async () => {
    const { user } = await render(() => (
      <CheckboxGroup.Root>
        <CheckboxGroup.Item value="a" aria-label="a">
          <CheckboxGroup.Indicator data-testid="indicator" />
        </CheckboxGroup.Item>
      </CheckboxGroup.Root>
    ));

    const indicator = screen.getByTestId("indicator");
    expect(indicator).toHaveAttribute("data-unchecked", "");
    await user.click(box("a"));
    expect(indicator).toHaveAttribute("data-checked", "");
  });

  it("throws a descriptive error outside CheckboxGroup.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <CheckboxGroup.Item value="a" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] CheckboxGroup parts must be placed within <CheckboxGroup.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
