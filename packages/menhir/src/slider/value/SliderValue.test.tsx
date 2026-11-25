// The test list is in ../README.md.
import { Errored, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Slider } from "../index.ts";

describeConformance(
  "<Slider.Value />",
  (props) => (
    <Slider.Root>
      <Slider.Value {...props} />
    </Slider.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Slider.Value />", () => {
  const { render } = createRenderer();

  it("renders a span with the value's text, which follows the value", async () => {
    const [value, setValue] = createSignal(1969);
    await render(() => (
      <Slider.Root
        value={value()}
        min={1900}
        max={2025}
        format={{ useGrouping: false }}
      >
        <Slider.Value data-testid="value" />
        <Slider.Thumb aria-label="Year" />
      </Slider.Root>
    ));
    const text = screen.getByTestId("value");

    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveTextContent(/^1969$/);

    setValue(2001);
    flush();
    expect(text).toHaveTextContent(/^2001$/);
    expect(screen.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      "2001",
    );
  });

  it("shows the text a format function returns", async () => {
    await render(() => (
      <Slider.Root
        defaultValue={2}
        max={3}
        format={(value) => ["Off", "Low", "Medium", "High"][value]!}
      >
        <Slider.Value data-testid="value" />
      </Slider.Root>
    ));

    expect(screen.getByTestId("value")).toHaveTextContent(/^Medium$/);
  });

  it("throws a descriptive error outside <Slider.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Slider.Value />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Slider parts must be placed within <Slider.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
