// The test list is in ../README.md.
import { createSignal, Errored, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Progress } from "../index.ts";

describeConformance(
  "<Progress.Value />",
  (props) => (
    <Progress.Root value={40} aria-label="Upload">
      <Progress.Value {...props} />
    </Progress.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Progress.Value />", () => {
  const { render } = createRenderer();

  it("shows the text of aria-valuetext as the value changes", async () => {
    const [value, setValue] = createSignal<number | null>(40);
    await render(() => (
      <Progress.Root value={value()} max={200} aria-label="Upload">
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    const text = screen.getByTestId("value");
    expect(text.tagName).toBe("SPAN");
    expect(screen.getByRole("progressbar")).toContainElement(text);
    expect(text).toHaveTextContent(/^20%$/);

    setValue(150);
    flush();
    expect(text).toHaveTextContent(/^75%$/);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "75%",
    );
  });

  it("shows the value in the Root's format", async () => {
    await render(() => (
      <Progress.Root
        value={42}
        max={200}
        format={{ style: "unit", unit: "megabyte" }}
        aria-label="Upload"
      >
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    expect(screen.getByTestId("value")).toHaveTextContent(/^42 MB$/);
  });

  it("shows the consumer's aria-valuetext in place of its own", async () => {
    await render(() => (
      <Progress.Root
        value={3}
        max={10}
        aria-valuetext="3 of 10 files"
        aria-label="Upload"
      >
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    expect(screen.getByTestId("value")).toHaveTextContent(/^3 of 10 files$/);
  });

  it("is empty while indeterminate", async () => {
    const [value, setValue] = createSignal<number | null>(40);
    await render(() => (
      <Progress.Root value={value()} aria-label="Upload">
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    setValue(null);
    flush();
    expect(screen.getByTestId("value")).toBeEmptyDOMElement();
  });

  it("carries the Root's data attributes", async () => {
    await render(() => (
      <Progress.Root value={100} aria-label="Upload">
        <Progress.Value data-testid="value" />
      </Progress.Root>
    ));

    const text = screen.getByTestId("value");
    expect(text).toHaveAttribute("data-complete", "");
    expect(text).not.toHaveAttribute("data-progressing");
    expect(text).not.toHaveAttribute("data-indeterminate");
  });

  it("throws a descriptive error outside <Progress.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Progress.Value />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Progress parts must be placed within <Progress.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
