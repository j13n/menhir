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
import type { CheckboxGroupRootProps } from "../root/CheckboxGroupRoot.tsx";

const box = (name: string) => screen.getByRole("checkbox", { name });
const parent = () => box("All");
const letters = ["a", "b", "c"];

/** A group with a Parent over a, b and c, and a box for each. */
function Group(props: CheckboxGroupRootProps & { parentDisabled?: boolean }) {
  return (
    <form data-testid="form">
      <CheckboxGroup.Root name="letters" {...props}>
        <label>
          <CheckboxGroup.Parent
            values={letters}
            disabled={props.parentDisabled}
          >
            <CheckboxGroup.Indicator data-testid="indicator" />
          </CheckboxGroup.Parent>
          All
        </label>
        <label>
          <CheckboxGroup.Item value="a" />a
        </label>
        <label>
          <CheckboxGroup.Item value="b" />b
        </label>
        <label>
          <CheckboxGroup.Item value="c" />c
        </label>
      </CheckboxGroup.Root>
    </form>
  );
}

/** Which of the boxes are checked, by name. */
const checkedBoxes = () =>
  letters.filter((name) => box(name).getAttribute("aria-checked") === "true");

describeConformance(
  "<CheckboxGroup.Parent />",
  (props) => (
    <CheckboxGroup.Root>
      <CheckboxGroup.Parent values={["a"]} {...props} />
    </CheckboxGroup.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<CheckboxGroup.Parent />", () => {
  const { render } = createRenderer();

  it.each([
    [[], "false", "data-unchecked"],
    [["b"], "mixed", "data-indeterminate"],
    [["a", "b"], "mixed", "data-indeterminate"],
    [["c", "a", "b"], "true", "data-checked"],
  ])("with %j checked, is %s", async (defaultValue, ariaChecked, attribute) => {
    await render(() => <Group defaultValue={defaultValue} />);

    expect(parent()).toHaveAttribute("aria-checked", ariaChecked);
    expect(parent()).toHaveAttribute(attribute, "");
    expect(screen.getByTestId("indicator")).toHaveAttribute(attribute, "");
  });

  it("follows the boxes as the user checks them", async () => {
    const { user } = await render(() => <Group />);

    await user.click(box("a"));
    expect(parent()).toHaveAttribute("aria-checked", "mixed");
    await user.click(box("b"));
    await user.click(box("c"));
    expect(parent()).toHaveAttribute("aria-checked", "true");
    await user.click(box("b"));
    expect(parent()).toHaveAttribute("aria-checked", "mixed");
  });

  it("unchecks every box when checked", async () => {
    const { user } = await render(() => (
      <Group defaultValue={["a", "b", "c"]} />
    ));

    await user.click(parent());
    expect(parent()).toHaveAttribute("aria-checked", "false");
    expect(checkedBoxes()).toEqual([]);
  });

  it("checks every box when mixed", async () => {
    const { user } = await render(() => <Group defaultValue={["b"]} />);

    await user.click(parent());
    expect(parent()).toHaveAttribute("aria-checked", "true");
    expect(checkedBoxes()).toEqual(["a", "b", "c"]);
  });

  it("checks every box when unchecked with no combination remembered", async () => {
    const { user } = await render(() => <Group />);

    await user.keyboard("[Tab]");
    expect(parent()).toHaveFocus();
    await user.keyboard("[Space]");
    expect(parent()).toHaveAttribute("aria-checked", "true");
    expect(checkedBoxes()).toEqual(["a", "b", "c"]);
  });

  it("cycles mixed, checked, unchecked, then back to the last mixed combination", async () => {
    const { user } = await render(() => <Group defaultValue={["a", "c"]} />);

    await user.click(parent());
    expect(checkedBoxes()).toEqual(["a", "b", "c"]);
    await user.click(parent());
    expect(checkedBoxes()).toEqual([]);
    await user.click(parent());
    expect(parent()).toHaveAttribute("aria-checked", "mixed");
    expect(checkedBoxes()).toEqual(["a", "c"]);
    await user.click(parent());
    expect(checkedBoxes()).toEqual(["a", "b", "c"]);
  });

  it("remembers the combination the user makes by changing a box", async () => {
    const { user } = await render(() => <Group defaultValue={["a"]} />);

    await user.click(parent());
    // Checked: unchecking a box makes a new mixed state.
    await user.click(box("c"));
    expect(parent()).toHaveAttribute("aria-checked", "mixed");
    await user.click(parent());
    await user.click(parent());
    expect(checkedBoxes()).toEqual([]);

    await user.click(parent());
    expect(checkedBoxes()).toEqual(["a", "b"]);
  });

  it("checks every box when the user's last change left none checked", async () => {
    const { user } = await render(() => <Group defaultValue={["a"]} />);

    await user.click(parent());
    await user.click(parent());
    // Unchecked by the parent, then the user checks and unchecks a box:
    // the combination the user made last is none, so nothing is brought
    // back.
    await user.click(box("b"));
    await user.click(box("b"));

    await user.click(parent());
    expect(checkedBoxes()).toEqual(["a", "b", "c"]);
  });

  it("covers only its values: other values are kept and make it neither mixed nor unchecked", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Group
        defaultValue={["z", "a", "b", "c"]}
        onValueChange={onValueChange}
      />
    ));

    expect(parent()).toHaveAttribute("aria-checked", "true");
    await user.click(parent());
    expect(onValueChange).toHaveBeenLastCalledWith(["z"]);
    expect(parent()).toHaveAttribute("aria-checked", "false");

    await user.click(parent());
    expect(onValueChange).toHaveBeenLastCalledWith(["z", "a", "b", "c"]);
  });

  it("submits nothing itself", async () => {
    const { user } = await render(() => <Group />);

    await user.click(parent());
    const form = screen.getByTestId<HTMLFormElement>("form");
    expect([...new FormData(form).keys()]).toEqual([
      "letters",
      "letters",
      "letters",
    ]);
  });

  it("is disabled with the group, and by its own disabled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <>
        <Group disabled />
        <CheckboxGroup.Root onValueChange={onValueChange}>
          <CheckboxGroup.Parent values={["x"]} aria-label="Own" disabled />
        </CheckboxGroup.Root>
      </>
    ));

    expect(parent()).toBeDisabled();
    expect(parent()).toHaveAttribute("data-disabled", "");
    expect(box("Own")).toBeDisabled();
    await user.click(box("Own"));
    await afterFlush();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("asks a controlled group with the whole new list", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Group value={["b"]} onValueChange={onValueChange} />
    ));

    await user.click(parent());
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["b", "a", "c"]);
    expect(parent()).toHaveAttribute("aria-checked", "mixed");
  });

  it("throws a descriptive error outside CheckboxGroup.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <CheckboxGroup.Parent values={["a"]} />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] CheckboxGroup parts must be placed within <CheckboxGroup.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
