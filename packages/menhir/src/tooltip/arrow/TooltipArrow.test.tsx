// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Tooltip } from "../index.ts";

const popup = () => screen.getByRole("tooltip", { hidden: true });
const arrow = () => screen.getByTestId("arrow");

/** A 40 by 20 Trigger fixed at (200, 200), and a 100 by 30 Popup above it. */
function Bold() {
  return (
    <Tooltip.Root defaultOpen>
      <Tooltip.Trigger
        style={{
          position: "fixed",
          left: "200px",
          top: "200px",
          width: "40px",
          height: "20px",
          margin: 0,
          padding: 0,
          border: 0,
        }}
      >
        Bold
      </Tooltip.Trigger>
      <Tooltip.Popup
        style={{
          width: "100px",
          height: "30px",
          padding: 0,
          border: 0,
          overflow: "visible",
        }}
      >
        Ctrl+B
        <Tooltip.Arrow
          data-testid="arrow"
          style={{ position: "absolute", width: "10px", height: "10px" }}
        />
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

describeConformance(
  "<Tooltip.Arrow />",
  (props) => (
    <Tooltip.Root>
      <Tooltip.Popup>
        <Tooltip.Arrow {...props} />
      </Tooltip.Popup>
    </Tooltip.Root>
  ),
  { tagName: "DIV" },
);

describe("<Tooltip.Arrow />", () => {
  const { render } = createRenderer();
  stubPopover();

  it("renders an aria-hidden <div>, leaving the tooltip's text alone", async () => {
    await render(() => <Bold />);

    expect(arrow().tagName).toBe("DIV");
    expect(arrow()).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("button", { name: "Bold" }),
    ).toHaveAccessibleDescription("Ctrl+B");
  });

  it.skipIf(isJSDOM)(
    "points at the Trigger's center, with the Popup's data-side and data-align",
    async () => {
      await render(() => <Bold />);
      const trigger = screen.getByRole("button", { name: "Bold" });

      await vi.waitFor(() => expect(arrow().style.left).not.toBe(""));
      const triggerBox = trigger.getBoundingClientRect();
      const arrowBox = arrow().getBoundingClientRect();
      expect(arrowBox.left + arrowBox.width / 2).toBeCloseTo(
        triggerBox.left + triggerBox.width / 2,
        0,
      );
      expect(popup()).toHaveAttribute("data-side", "top");
      expect(arrow()).toHaveAttribute("data-side", "top");
      expect(arrow()).toHaveAttribute("data-align", "center");
    },
  );

  it("throws a descriptive error outside <Tooltip.Popup>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Tooltip.Root>
          <Tooltip.Arrow />
        </Tooltip.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Tooltip.Arrow must be placed within <Tooltip.Popup>.",
      ),
    ).toBeInTheDocument();
  });
});
