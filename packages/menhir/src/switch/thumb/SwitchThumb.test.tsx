// The test list is in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Switch } from "../index.ts";

describeConformance(
  "<Switch.Thumb />",
  (props) => (
    <Switch.Root>
      <Switch.Thumb {...props} />
    </Switch.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Switch.Thumb />", () => {
  const { render } = createRenderer();

  it("renders a span inside the switch", async () => {
    await render(() => (
      <Switch.Root>
        <Switch.Thumb data-testid="thumb" class="thumb" />
      </Switch.Root>
    ));

    const thumb = screen.getByTestId("thumb");
    expect(thumb.tagName).toBe("SPAN");
    expect(thumb).toHaveClass("thumb");
    expect(screen.getByRole("switch")).toContainElement(thumb);
  });

  it("throws a descriptive error outside <Switch.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Switch.Thumb />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Switch parts must be placed within <Switch.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
