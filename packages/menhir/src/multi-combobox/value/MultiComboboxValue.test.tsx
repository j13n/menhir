// The test list and the cases left out are in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import { chip, item } from "../../../test/multi-combobox/queries.ts";
import { MultiCombobox } from "../index.ts";

describe("<MultiCombobox.Value />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("calls its function for each value, in order, and renders what it returns, no element of its own", async () => {
    const { container } = await render(() => (
      <MultiCombobox.Root defaultValue={["b", "a"]}>
        <MultiCombobox.Value>
          {(value) => <span data-testid="value">{value}</span>}
        </MultiCombobox.Value>
      </MultiCombobox.Root>
    ));

    expect(
      screen.getAllByTestId("value").map((span) => span.textContent),
    ).toEqual(["b", "a"]);
    expect(container.firstElementChild).toBe(screen.getAllByTestId("value")[0]);
  });

  it("keeps a chip while its value is: selecting another creates no chip again", async () => {
    const { user } = await render(() => (
      <Toppings defaultValue={["olives"]} defaultOpen />
    ));
    await afterFlush();
    const olives = chip("Olives");

    await user.click(item("Cheese"));
    await afterFlush();

    expect(chip("Olives")).toBe(olives);
  });
});
