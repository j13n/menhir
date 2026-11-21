// The test list is in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Checkbox } from "../index.ts";

describeConformance(
  "<Checkbox.Indicator />",
  (props) => (
    <Checkbox.Root>
      <Checkbox.Indicator {...props} />
    </Checkbox.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Checkbox.Indicator />", () => {
  const { render } = createRenderer();

  it("renders a span inside the checkbox", async () => {
    await render(() => (
      <Checkbox.Root>
        <Checkbox.Indicator data-testid="indicator" class="indicator" />
      </Checkbox.Root>
    ));

    const indicator = screen.getByTestId("indicator");
    expect(indicator.tagName).toBe("SPAN");
    expect(indicator).toHaveClass("indicator");
    expect(screen.getByRole("checkbox")).toContainElement(indicator);
  });

  it("throws a descriptive error outside <Checkbox.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Checkbox.Indicator />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Checkbox parts must be placed within <Checkbox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
