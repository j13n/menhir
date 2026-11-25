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
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import {
  hiddenInput,
  input,
  selected,
} from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

const clear = () => screen.getByRole("button", { name: "Clear" });

describeConformance(
  "<Combobox.Clear />",
  (props) => (
    <Combobox.Root>
      <Combobox.Clear {...props} />
    </Combobox.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Combobox.Clear />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button out of the tab order", async () => {
    await render(() => <Fruit />);

    expect(clear()).toHaveAttribute("type", "button");
    expect(clear()).toHaveAttribute("tabindex", "-1");
  });

  it("empties the text and the value, and focuses the input", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit
        defaultValue="banana"
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    await afterFlush();
    expect(input()).toHaveValue("Banana");

    await user.click(clear());
    await afterFlush();

    expect(input()).toHaveValue("");
    expect(hiddenInput()).toHaveValue("");
    expect(selected()).toEqual([]);
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onInputValueChange).toHaveBeenCalledWith("", {
      reason: "clear-press",
      event: expect.any(MouseEvent),
    });
    expect(document.activeElement).toBe(input());
  });

  it("is disabled when the Root is", async () => {
    await render(() => <Fruit disabled />);

    expect(clear()).toBeDisabled();
  });

  it("throws a descriptive error outside Combobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Combobox.Clear />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>, Autocomplete parts within <Autocomplete.Root>, and MultiCombobox parts within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
