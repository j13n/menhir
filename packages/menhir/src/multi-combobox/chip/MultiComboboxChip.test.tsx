// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import {
  chip,
  chipLabels,
  input,
} from "../../../test/multi-combobox/queries.ts";
import { MultiCombobox } from "../index.ts";

describeConformance(
  "<MultiCombobox.Chip />",
  (props) => (
    <MultiCombobox.Root>
      <MultiCombobox.Chip value="one" {...props} />
    </MultiCombobox.Root>
  ),
  { tagName: "DIV" },
);

const focused = () => document.activeElement;

describe("<MultiCombobox.Chip />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a div out of the tab order, with no role, named by its text", async () => {
    await render(() => <Toppings defaultValue={["olives"]} />);

    expect(chip("Olives").tagName).toBe("DIV");
    expect(chip("Olives")).toHaveAttribute("tabindex", "-1");
    expect(chip("Olives")).not.toHaveAttribute("role");
    expect(chip("Olives")).not.toHaveAttribute("data-disabled");
  });

  it("has data-disabled while the Root is disabled", async () => {
    await render(() => <Toppings defaultValue={["olives"]} disabled />);

    expect(chip("Olives")).toHaveAttribute("data-disabled", "");
  });

  it("moves to the chip before on Left, staying on the first, and to the one after on Right, then the input", async () => {
    const { user } = await render(() => (
      <Toppings defaultValue={["olives", "cheese", "onions"]} />
    ));
    chip("Cheese").focus();

    await user.keyboard("{ArrowLeft}");
    expect(focused()).toBe(chip("Olives"));
    await user.keyboard("{ArrowLeft}");
    expect(focused()).toBe(chip("Olives"));
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(focused()).toBe(chip("Onions"));
    await user.keyboard("{ArrowRight}");
    expect(focused()).toBe(input());
  });

  it("swaps Left and Right, right to left", async () => {
    const { user } = await render(() => (
      <div dir="rtl" style={{ direction: "rtl" }}>
        <Toppings defaultValue={["olives", "cheese"]} />
      </div>
    ));
    chip("Cheese").focus();

    await user.keyboard("{ArrowRight}");
    expect(focused()).toBe(chip("Olives"));
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(focused()).toBe(input());
  });

  it("removes it on Backspace and focuses the chip before it, else the one after it, else the input", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["olives", "cheese", "onions"]}
        onValueChange={onValueChange}
      />
    ));
    chip("Cheese").focus();

    await user.keyboard("{Backspace}");
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith(["olives", "onions"]);
    expect(chipLabels()).toEqual(["Olives", "Onions"]);
    expect(focused()).toBe(chip("Olives"));

    await user.keyboard("{Backspace}");
    await afterFlush();
    expect(chipLabels()).toEqual(["Onions"]);
    expect(focused()).toBe(chip("Onions"));

    await user.keyboard("{Backspace}");
    await afterFlush();
    expect(chipLabels()).toEqual([]);
    expect(focused()).toBe(input());
  });

  it("removes it on Delete and focuses the chip that took its place, else the input", async () => {
    const { user } = await render(() => (
      <Toppings defaultValue={["olives", "cheese"]} />
    ));
    chip("Olives").focus();

    await user.keyboard("{Delete}");
    await afterFlush();
    expect(chipLabels()).toEqual(["Cheese"]);
    expect(focused()).toBe(chip("Cheese"));

    await user.keyboard("{Delete}");
    await afterFlush();
    expect(chipLabels()).toEqual([]);
    expect(focused()).toBe(input());
  });

  it("removes the chips from the last as Backspace is held from an empty input", async () => {
    const { user } = await render(() => (
      <Toppings defaultValue={["olives", "cheese"]} />
    ));
    input().focus();

    await user.keyboard("{Backspace}{Backspace}");
    await afterFlush();
    expect(chipLabels()).toEqual(["Olives"]);
    expect(focused()).toBe(chip("Olives"));
  });

  it("keeps a chip, and focus on it, when a controlled consumer declines the removal", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings value={["olives", "cheese"]} onValueChange={onValueChange} />
    ));
    chip("Cheese").focus();

    await user.keyboard("{Backspace}");
    await afterFlush();
    expect(onValueChange).toHaveBeenCalledWith(["olives"]);
    expect(chipLabels()).toEqual(["Olives", "Cheese"]);
    expect(focused()).toBe(chip("Cheese"));
  });

  it("leaves the keys alone with Shift, Ctrl, Alt or Meta held", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["olives", "cheese"]}
        onValueChange={onValueChange}
      />
    ));
    chip("Cheese").focus();

    for (const modifier of ["Shift", "Control", "Alt", "Meta"]) {
      await user.keyboard(
        `{${modifier}>}{ArrowLeft}{Backspace}{Delete}{/${modifier}}`,
      );
    }
    await afterFlush();
    expect(focused()).toBe(chip("Cheese"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("neither removes nor moves while the Root is disabled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["olives", "cheese"]}
        disabled
        onValueChange={onValueChange}
      />
    ));
    chip("Cheese").focus();

    await user.keyboard("{ArrowLeft}{Backspace}{Delete}");
    await afterFlush();
    expect(focused()).toBe(chip("Cheese"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("throws a descriptive error outside MultiCombobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <MultiCombobox.Chip value="one" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] MultiCombobox parts must be placed within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
