// The test list is in ../README.md.
import { createSignal, Errored, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Progress } from "../index.ts";

describeConformance(
  "<Progress.Indicator />",
  (props) => (
    <Progress.Root value={40} aria-label="Upload">
      <Progress.Indicator {...props} />
    </Progress.Root>
  ),
  { tagName: "DIV" },
);

describe("<Progress.Indicator />", () => {
  const { render } = createRenderer();

  it("renders a div inside the progress bar", async () => {
    await render(() => (
      <Progress.Root value={40} aria-label="Upload">
        <Progress.Indicator data-testid="indicator" class="indicator" />
      </Progress.Root>
    ));

    const indicator = screen.getByTestId("indicator");
    expect(indicator.tagName).toBe("DIV");
    expect(indicator).toHaveClass("indicator");
    expect(screen.getByRole("progressbar")).toContainElement(indicator);
  });

  it("carries the Root's data attributes as the value changes", async () => {
    const [value, setValue] = createSignal<number | null>(40);
    await render(() => (
      <Progress.Root value={value()} aria-label="Upload">
        <Progress.Indicator data-testid="indicator" />
      </Progress.Root>
    ));

    const indicator = screen.getByTestId("indicator");
    expect(indicator).toHaveAttribute("data-progressing", "");
    expect(indicator).not.toHaveAttribute("data-indeterminate");
    expect(indicator).not.toHaveAttribute("data-complete");

    setValue(100);
    flush();
    expect(indicator).toHaveAttribute("data-complete", "");
    expect(indicator).not.toHaveAttribute("data-progressing");

    setValue(null);
    flush();
    expect(indicator).toHaveAttribute("data-indeterminate", "");
    expect(indicator).not.toHaveAttribute("data-complete");
  });

  it("throws a descriptive error outside <Progress.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Progress.Indicator />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Progress parts must be placed within <Progress.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
