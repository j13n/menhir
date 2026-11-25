// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, press } from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import {
  chipLabels,
  input,
  shown,
} from "../../../test/multi-combobox/queries.ts";
import { MultiCombobox } from "../index.ts";

describeConformance(
  "<MultiCombobox.ChipRemove />",
  (props) => (
    <MultiCombobox.Root>
      <MultiCombobox.Chip value="one">
        <MultiCombobox.ChipRemove {...props} />
      </MultiCombobox.Chip>
    </MultiCombobox.Root>
  ),
  { tagName: "BUTTON" },
);

const remove = (label: string) =>
  screen.getByRole("button", { name: `Remove ${label}` });

describe("<MultiCombobox.ChipRemove />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button out of the tab order, named by the consumer's aria-label", async () => {
    await render(() => <Toppings defaultValue={["olives"]} />);

    expect(remove("Olives")).toHaveAttribute("type", "button");
    expect(remove("Olives")).toHaveAttribute("tabindex", "-1");
  });

  it("takes its chip's value out on a click and focuses the input, leaving the list as it was", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["olives", "cheese"]}
        onValueChange={onValueChange}
      />
    ));

    await user.click(remove("Olives"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith(["cheese"]);
    expect(chipLabels()).toEqual(["Cheese"]);
    expect(document.activeElement).toBe(input());
    expect(shown()).toBe(false);
  });

  it.skipIf(isJSDOM)(
    "keeps the list open and focus in the input on a press",
    async () => {
      const { user } = await render(() => (
        <Toppings defaultValue={["olives", "cheese"]} />
      ));
      await user.type(input(), "o");
      await afterFlush();

      await press(centerOf(remove("Olives")));
      await afterFlush();

      expect(chipLabels()).toEqual(["Cheese"]);
      expect(document.activeElement).toBe(input());
      expect(shown()).toBe(true);
      expect(input()).toHaveValue("o");
    },
  );

  it("is disabled while the Root is", async () => {
    await render(() => <Toppings defaultValue={["olives"]} disabled />);

    expect(remove("Olives")).toBeDisabled();
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <MultiCombobox.Root>
        <MultiCombobox.Chip value="one">
          <MultiCombobox.ChipRemove render={(props) => <span {...props} />} />
        </MultiCombobox.Chip>
      </MultiCombobox.Root>
    ));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("MultiCombobox.ChipRemove"),
    );
  });

  it("throws a descriptive error outside MultiCombobox.Chip", async () => {
    await render(() => (
      <MultiCombobox.Root>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <MultiCombobox.ChipRemove />
        </Errored>
      </MultiCombobox.Root>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] MultiCombobox.ChipRemove must be placed within <MultiCombobox.Chip>.",
      ),
    ).toBeInTheDocument();
  });
});
