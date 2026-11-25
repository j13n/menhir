// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import { input, list } from "../../../test/multi-combobox/queries.ts";
import { MultiCombobox } from "../index.ts";

describeConformance(
  "<MultiCombobox.List />",
  (props) => (
    <MultiCombobox.Root>
      <MultiCombobox.List {...props} />
    </MultiCombobox.Root>
  ),
  { tagName: "DIV" },
);

describe("<MultiCombobox.List />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders a listbox with aria-multiselectable and the id the Input names, named by the consumer", async () => {
    await render(() => <Toppings />);

    expect(list()).toHaveAttribute("aria-multiselectable", "true");
    expect(input()).toHaveAttribute("aria-controls", list().id);
    expect(
      screen.getByRole("listbox", { name: "Toppings", hidden: true }),
    ).toBe(list());
  });
});
