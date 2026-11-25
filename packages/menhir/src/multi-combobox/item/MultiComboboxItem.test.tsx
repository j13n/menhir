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
  item,
  selected,
  shown,
} from "../../../test/multi-combobox/queries.ts";
import { Combobox } from "../../combobox/index.ts";
import { MultiCombobox } from "../index.ts";

describeConformance(
  "<MultiCombobox.Item />",
  (props) => (
    <MultiCombobox.Root>
      <MultiCombobox.List>
        <MultiCombobox.Item value="one" {...props} />
      </MultiCombobox.List>
    </MultiCombobox.Root>
  ),
  { tagName: "DIV" },
);

describe("<MultiCombobox.Item />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders an option with aria-selected true while selected and false otherwise, and data-selected or data-unselected", async () => {
    await render(() => <Toppings defaultValue={["olives", "cheese"]} />);

    expect(item("Olives")).toHaveAttribute("aria-selected", "true");
    expect(item("Olives")).toHaveAttribute("data-selected", "");
    expect(item("Onions")).toHaveAttribute("aria-selected", "false");
    expect(item("Onions")).toHaveAttribute("data-unselected", "");
    expect(selected()).toEqual(["Cheese", "Olives"]);
  });

  it("adds it on a click, keeps the list open and focus in the input, and takes it out on a second", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Toppings onOpenChange={onOpenChange} />
    ));
    await user.type(input(), "o");
    await afterFlush();

    await user.click(item("Olives"));
    await afterFlush();
    expect(chipLabels()).toEqual(["Olives"]);
    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    await user.click(item("Olives"));
    await afterFlush();
    expect(chipLabels()).toEqual([]);
    expect(item("Olives")).toHaveAttribute("aria-selected", "false");
    expect(shown()).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "keeps the list open and focus in the input on a press",
    async () => {
      const { user } = await render(() => <Toppings />);
      await user.type(input(), "o");
      await afterFlush();

      await press(centerOf(item("Onions")));
      await afterFlush();

      expect(chipLabels()).toEqual(["Onions"]);
      expect(document.activeElement).toBe(input());
      expect(shown()).toBe(true);
    },
  );

  it("is neither added nor taken out while disabled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["cheese"]}
        defaultOpen
        onValueChange={onValueChange}
      >
        <MultiCombobox.Item value="cheese" disabled>
          Cheese
        </MultiCombobox.Item>
        <MultiCombobox.Item value="olives" disabled>
          Olives
        </MultiCombobox.Item>
      </Toppings>
    ));
    await afterFlush();

    await user.click(item("Cheese"));
    await user.click(item("Olives"));
    input().focus();
    await user.keyboard("{ArrowDown}{Enter}");
    await afterFlush();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(item("Cheese")).toHaveAttribute("aria-disabled", "true");
  });

  it("gives Combobox's ItemIndicator inside it its data-selected or data-unselected", async () => {
    await render(() => <Toppings defaultValue={["olives"]} />);

    const indicator = (name: string) =>
      item(name).querySelector("[aria-hidden]")!;
    expect(indicator("Olives")).toHaveAttribute("data-selected", "");
    expect(indicator("Onions")).toHaveAttribute("data-unselected", "");
  });

  it("throws a descriptive error outside MultiCombobox.Root, and inside Combobox.Root", async () => {
    await render(() => (
      <>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <MultiCombobox.Item value="one" />
        </Errored>
        <Combobox.Root>
          <Errored fallback={(error) => <p>{String(error())}</p>}>
            <MultiCombobox.Item value="one" />
          </Errored>
        </Combobox.Root>
      </>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] MultiCombobox parts must be placed within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Error: [menhir] MultiCombobox parts must be placed within <MultiCombobox.Root>, not <Combobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
