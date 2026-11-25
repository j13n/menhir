// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import { input, list } from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

describeConformance(
  "<Combobox.List />",
  (props) => (
    <Combobox.Root>
      <Combobox.List {...props} />
    </Combobox.Root>
  ),
  { tagName: "DIV" },
);

describe("<Combobox.List />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders a listbox with the Root's id, which the Input names, named by the consumer", async () => {
    await render(() => <Fruit />);

    expect(list().tagName).toBe("DIV");
    expect(list().id).not.toBe("");
    expect(input()).toHaveAttribute("aria-controls", list().id);
    expect(list()).toHaveAccessibleName("Fruit");
  });

  it("throws a descriptive error outside Combobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Combobox.List />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>, Autocomplete parts within <Autocomplete.Root>, and MultiCombobox parts within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
