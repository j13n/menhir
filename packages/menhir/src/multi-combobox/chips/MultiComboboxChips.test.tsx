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

import { press } from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import { input, popup } from "../../../test/multi-combobox/queries.ts";
import { MultiCombobox } from "../index.ts";

describeConformance(
  "<MultiCombobox.Chips />",
  (props) => (
    <MultiCombobox.Root>
      <MultiCombobox.Chips {...props} />
    </MultiCombobox.Root>
  ),
  { tagName: "DIV" },
);

const chips = () => screen.getByTestId("chips");

describe("<MultiCombobox.Chips />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a div with data-open or data-closed and data-disabled", async () => {
    const { user } = await render(() => <Toppings />);

    expect(chips().tagName).toBe("DIV");
    expect(chips()).not.toHaveAttribute("role");
    expect(chips()).toHaveAttribute("data-closed", "");
    await user.type(input(), "o");
    await afterFlush();
    expect(chips()).toHaveAttribute("data-open", "");
  });

  it("has data-disabled while the Root is disabled", async () => {
    await render(() => <Toppings disabled />);

    expect(chips()).toHaveAttribute("data-disabled", "");
  });

  it.skipIf(isJSDOM)(
    "focuses the input on a press on its background",
    async () => {
      await render(() => <Toppings defaultValue={["olives"]} />);
      chips().style.padding = "20px";
      const { left, top } = chips().getBoundingClientRect();

      await press({ x: left + 5, y: top + 5 });

      expect(document.activeElement).toBe(input());
    },
  );

  it.skipIf(isJSDOM)("is what the Popup is placed against", async () => {
    const { user } = await render(() => (
      <Toppings defaultValue={["olives", "cheese"]} />
    ));
    chips().style.cssText = "display:flex;padding:8px;width:300px";
    await user.click(screen.getByRole("button", { name: "Show toppings" }));
    await afterFlush();
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Measured by its width, since `shift` may move it along the side.
    const box = chips().getBoundingClientRect();
    expect(popup().style.getPropertyValue("--anchor-width")).toBe(
      `${box.width}px`,
    );
    expect(popup().getBoundingClientRect().top).toBeCloseTo(box.bottom, 0);
  });

  it.skipIf(isJSDOM)(
    "leaves the Popup against the Input without Chips",
    async () => {
      const { user } = await render(() => <Toppings noChips />);
      await user.click(screen.getByRole("button", { name: "Show toppings" }));
      await afterFlush();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const box = input().getBoundingClientRect();
      expect(popup().style.getPropertyValue("--anchor-width")).toBe(
        `${box.width}px`,
      );
      expect(popup().getBoundingClientRect().top).toBeCloseTo(box.bottom, 0);
    },
  );

  it("throws a descriptive error outside MultiCombobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <MultiCombobox.Chips />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] MultiCombobox parts must be placed within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
