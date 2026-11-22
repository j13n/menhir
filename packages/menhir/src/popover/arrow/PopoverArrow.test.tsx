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
import { Popover } from "../index.ts";

const popup = () => screen.getByRole("dialog", { hidden: true });
const arrow = () => screen.getByTestId("arrow");

/** A 40 by 20 Trigger fixed at `left`, and a 100 by 50 Popup below it. */
function Notifications(props: { left: string }) {
  return (
    <Popover.Root defaultOpen>
      <Popover.Trigger
        style={{
          position: "fixed",
          left: props.left,
          top: "200px",
          width: "40px",
          height: "20px",
          margin: 0,
          padding: 0,
          border: 0,
        }}
      >
        Notifications
      </Popover.Trigger>
      <Popover.Popup
        aria-label="Notifications"
        style={{ width: "100px", height: "50px", padding: 0, border: 0 }}
      >
        <Popover.Arrow
          data-testid="arrow"
          style={{ position: "absolute", width: "10px", height: "10px" }}
        />
      </Popover.Popup>
    </Popover.Root>
  );
}

describeConformance(
  "<Popover.Arrow />",
  (props) => (
    <Popover.Root>
      <Popover.Popup>
        <Popover.Arrow {...props} />
      </Popover.Popup>
    </Popover.Root>
  ),
  { tagName: "DIV" },
);

describe("<Popover.Arrow />", () => {
  const { render } = createRenderer();
  stubPopover();

  it("renders an aria-hidden <div>", async () => {
    await render(() => <Notifications left="200px" />);

    expect(arrow().tagName).toBe("DIV");
    expect(arrow()).toHaveAttribute("aria-hidden", "true");
  });

  it.skipIf(isJSDOM).each([
    ["in the middle", "200px"],
    ["at the viewport's left edge, where the Popup shifts", "0px"],
  ])("points at the Trigger's center %s", async (_where, left) => {
    await render(() => <Notifications left={left} />);
    const trigger = screen.getByRole("button", { name: "Notifications" });

    await vi.waitFor(() => expect(arrow().style.left).not.toBe(""));
    const triggerBox = trigger.getBoundingClientRect();
    const arrowBox = arrow().getBoundingClientRect();
    expect(arrowBox.left + arrowBox.width / 2).toBeCloseTo(
      triggerBox.left + triggerBox.width / 2,
      0,
    );
  });

  it.skipIf(isJSDOM)("has the Popup's data-side and data-align", async () => {
    await render(() => <Notifications left="200px" />);

    await vi.waitFor(() =>
      expect(popup()).toHaveAttribute("data-side", "bottom"),
    );
    expect(arrow()).toHaveAttribute("data-side", "bottom");
    expect(arrow()).toHaveAttribute("data-align", "center");
  });

  it("throws a descriptive error outside <Popover.Popup>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Popover.Root>
          <Popover.Arrow />
        </Popover.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Popover.Arrow must be placed within <Popover.Popup>.",
      ),
    ).toBeInTheDocument();
  });
});
