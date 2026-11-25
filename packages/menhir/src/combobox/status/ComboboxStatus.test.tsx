// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import { input } from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

const status = () => screen.getByTestId("status");

describeConformance(
  "<Combobox.Status />",
  (props) => (
    <Combobox.Root>
      <Combobox.Status {...props}>{() => null}</Combobox.Status>
    </Combobox.Root>
  ),
  { tagName: "DIV" },
);

describe("<Combobox.Status />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders a status, empty while the list is closed", async () => {
    await render(() => <Fruit />);

    expect(status().tagName).toBe("DIV");
    expect(status()).toHaveAttribute("role", "status");
    expect(status()).toBeEmptyDOMElement();
  });

  it("shows what its function returns for the number of items while open, and follows filtering", async () => {
    const { user } = await render(() => <Fruit />);

    await user.type(input(), "b");
    await afterFlush();
    expect(status()).toHaveTextContent("2 fruits");

    await user.type(input(), "l");
    await afterFlush();
    expect(status()).toHaveTextContent("1 fruits");

    await user.type(input(), "x");
    await afterFlush();
    expect(status()).toHaveTextContent("0 fruits");

    await user.keyboard("{Escape}");
    await afterFlush();
    expect(status()).toBeEmptyDOMElement();
  });

  it("throws a descriptive error outside Combobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Combobox.Status>{() => null}</Combobox.Status>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>, Autocomplete parts within <Autocomplete.Root>, and MultiCombobox parts within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
