// Combobox's parts inside a Multi Combobox, and the parts of one Root
// inside another. The test list and the cases left out are in README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../test/menu/stubMenu.ts";
import { Toppings } from "../../test/multi-combobox/Toppings.tsx";
import {
  active,
  chipLabels,
  input,
  shown,
} from "../../test/multi-combobox/queries.ts";
import { Autocomplete } from "../autocomplete/index.ts";
import { Combobox } from "../combobox/index.ts";
import { MultiCombobox } from "./index.ts";

describe("Combobox's parts in <MultiCombobox.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("Clear empties the text and every value, reporting clear-press, and focuses the input", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["olives", "cheese"]}
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    await user.type(input(), "on");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith([]);
    expect(onInputValueChange).toHaveBeenLastCalledWith("", {
      reason: "clear-press",
      event: expect.any(MouseEvent),
    });
    expect(chipLabels()).toEqual([]);
    expect(input()).toHaveValue("");
    expect(document.activeElement).toBe(input());
  });

  it("the Trigger opens and closes the list", async () => {
    const { user } = await render(() => <Toppings />);
    const trigger = screen.getByRole("button", { name: "Show toppings" });

    await user.click(trigger);
    await afterFlush();
    expect(shown()).toBe(true);
    await user.click(trigger);
    await afterFlush();
    expect(shown()).toBe(false);
  });

  it("the Status counts the items while the list is open", async () => {
    const { user } = await render(() => <Toppings />);

    await user.type(input(), "on");
    await afterFlush();
    expect(screen.getByTestId("status")).toHaveTextContent("1 toppings");
  });

  it("reaches items in a Group, named by its GroupLabel, in document order", async () => {
    const { user } = await render(() => (
      <Toppings>
        <MultiCombobox.Item value="cheese">Cheese</MultiCombobox.Item>
        <MultiCombobox.Group>
          <MultiCombobox.GroupLabel>Vegetables</MultiCombobox.GroupLabel>
          <MultiCombobox.Item value="olives">Olives</MultiCombobox.Item>
        </MultiCombobox.Group>
      </Toppings>
    ));

    expect(
      screen.getByRole("group", { name: "Vegetables", hidden: true }),
    ).toBeInTheDocument();
    input().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Olives");
    await user.keyboard("{Enter}");
    await afterFlush();
    expect(chipLabels()).toEqual(["Olives"]);
  });

  it("Combobox's and Autocomplete's own Input and Item throw inside MultiCombobox.Root, naming it", async () => {
    await render(() => (
      <MultiCombobox.Root>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <Combobox.Input />
        </Errored>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <Autocomplete.Item value="x" />
        </Errored>
      </MultiCombobox.Root>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>, not <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Error: [menhir] Autocomplete parts must be placed within <Autocomplete.Root>, not <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
