// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { Errored } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Radio } from "../index.ts";

describeConformance(
  "<Radio.Indicator />",
  (props) => (
    <Radio.Root>
      <Radio.Item value="a">
        <Radio.Indicator {...props} />
      </Radio.Item>
    </Radio.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Radio.Indicator />", () => {
  const { render } = createRenderer();

  it("renders a span inside the radio, carrying its Item's data attributes", async () => {
    await render(() => (
      <Radio.Root defaultValue="a">
        <Radio.Item value="a" aria-label="a">
          <Radio.Indicator data-testid="indicator" />
        </Radio.Item>
      </Radio.Root>
    ));

    const indicator = screen.getByTestId("indicator");
    expect(indicator.tagName).toBe("SPAN");
    expect(screen.getByRole("radio", { name: "a" })).toContainElement(
      indicator,
    );
    expect(indicator).toHaveAttribute("data-checked", "");
  });

  it("throws a descriptive error outside <Radio.Item>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Radio.Root>
          <Radio.Indicator />
        </Radio.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Radio.Indicator must be placed within <Radio.Item>.",
      ),
    ).toBeInTheDocument();
  });
});
