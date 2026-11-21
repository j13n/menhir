// The test list is in ../README.md.
import { createSignal, Errored, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Meter } from "../index.ts";

describeConformance(
  "<Meter.Value />",
  (props) => (
    <Meter.Root value={40} aria-label="Battery">
      <Meter.Value {...props} />
    </Meter.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Meter.Value />", () => {
  const { render } = createRenderer();

  it("shows the text of aria-valuetext as the value changes", async () => {
    const [value, setValue] = createSignal(40);
    await render(() => (
      <Meter.Root value={value()} max={200} aria-label="Battery">
        <Meter.Value data-testid="value" />
      </Meter.Root>
    ));

    const text = screen.getByTestId("value");
    expect(text.tagName).toBe("SPAN");
    expect(screen.getByRole("meter")).toContainElement(text);
    expect(text).toHaveTextContent(/^20%$/);

    setValue(150);
    flush();
    expect(text).toHaveTextContent(/^75%$/);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "75%");
  });

  it("shows the value in the Root's format", async () => {
    await render(() => (
      <Meter.Root
        value={120}
        max={500}
        format={{ style: "unit", unit: "gigabyte" }}
        aria-label="Storage"
      >
        <Meter.Value data-testid="value" />
      </Meter.Root>
    ));

    expect(screen.getByTestId("value")).toHaveTextContent(/^120 GB$/);
  });

  it("shows the consumer's aria-valuetext in place of its own", async () => {
    await render(() => (
      <Meter.Root
        value={50}
        aria-valuetext="50% (6 hours) remaining"
        aria-label="Battery"
      >
        <Meter.Value data-testid="value" />
      </Meter.Root>
    ));

    expect(screen.getByTestId("value")).toHaveTextContent(
      /^50% \(6 hours\) remaining$/,
    );
  });

  it("throws a descriptive error outside <Meter.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Meter.Value />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Meter parts must be placed within <Meter.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
