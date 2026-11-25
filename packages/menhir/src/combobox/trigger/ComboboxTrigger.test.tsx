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
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import { input, list, shown } from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

const trigger = () => screen.getByRole("button", { name: "Show fruits" });

describeConformance(
  "<Combobox.Trigger />",
  (props) => (
    <Combobox.Root>
      <Combobox.Trigger {...props} />
    </Combobox.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Combobox.Trigger />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button out of the tab order, with aria-controls naming the List and aria-expanded", async () => {
    const { user } = await render(() => <Fruit />);

    expect(trigger()).toHaveAttribute("type", "button");
    expect(trigger()).toHaveAttribute("tabindex", "-1");
    expect(trigger()).toHaveAttribute("aria-controls", list().id);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger());
    await afterFlush();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("data-open", "");
  });

  it("opens the list with no item active and focuses the input; a second click closes it", async () => {
    const { user } = await render(() => <Fruit />);

    await user.click(trigger());
    await afterFlush();

    expect(shown()).toBe(true);
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    expect(document.activeElement).toBe(input());

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(false);
  });

  it.skipIf(isJSDOM)("keeps focus in the input on a press", async () => {
    const { user } = await render(() => <Fruit />);
    await user.type(input(), "b");
    await afterFlush();

    await press(centerOf(trigger()));
    await afterFlush();

    expect(document.activeElement).toBe(input());
    expect(shown()).toBe(false);
    // Focus never left, so the text stays as typed.
    expect(input()).toHaveValue("b");
  });

  it("is disabled when the Root is", async () => {
    await render(() => <Fruit disabled />);

    expect(trigger()).toBeDisabled();
    expect(trigger()).toHaveAttribute("data-disabled", "");
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <Combobox.Root>
        <Combobox.Trigger render={(props) => <span {...props} />} />
      </Combobox.Root>
    ));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Combobox.Trigger's render function rendered a <span>",
      ),
    );
  });

  it("throws a descriptive error outside Combobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Combobox.Trigger />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>, Autocomplete parts within <Autocomplete.Root>, and MultiCombobox parts within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
