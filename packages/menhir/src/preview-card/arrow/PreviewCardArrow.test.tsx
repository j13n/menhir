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
import { PreviewCard } from "../index.ts";

const popup = () => screen.getByTestId("popup");
const arrow = () => screen.getByTestId("arrow");

/** A 40 by 20 Trigger fixed at (200, 200), and a 100 by 30 Popup below it. */
function Ada() {
  return (
    <PreviewCard.Root defaultOpen>
      <PreviewCard.Trigger
        href="#ada"
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
        Ada
      </PreviewCard.Trigger>
      <PreviewCard.Popup
        data-testid="popup"
        style={{
          width: "100px",
          height: "30px",
          padding: 0,
          border: 0,
          overflow: "visible",
        }}
      >
        Ada Lovelace
        <PreviewCard.Arrow
          data-testid="arrow"
          style={{ position: "absolute", width: "10px", height: "10px" }}
        />
      </PreviewCard.Popup>
    </PreviewCard.Root>
  );
}

describeConformance(
  "<PreviewCard.Arrow />",
  (props) => (
    <PreviewCard.Root>
      <PreviewCard.Popup>
        <PreviewCard.Arrow {...props} />
      </PreviewCard.Popup>
    </PreviewCard.Root>
  ),
  { tagName: "DIV" },
);

describe("<PreviewCard.Arrow />", () => {
  const { render } = createRenderer();
  stubPopover();

  it("renders an aria-hidden <div>", async () => {
    await render(() => <Ada />);

    expect(arrow().tagName).toBe("DIV");
    expect(arrow()).toHaveAttribute("aria-hidden", "true");
  });

  it.skipIf(isJSDOM)(
    "points at the Trigger's center, with the Popup's data-side and data-align",
    async () => {
      await render(() => <Ada />);
      const trigger = screen.getByRole("link", { name: "Ada" });

      await vi.waitFor(() => expect(arrow().style.left).not.toBe(""));
      const triggerBox = trigger.getBoundingClientRect();
      const arrowBox = arrow().getBoundingClientRect();
      expect(arrowBox.left + arrowBox.width / 2).toBeCloseTo(
        triggerBox.left + triggerBox.width / 2,
        0,
      );
      expect(popup()).toHaveAttribute("data-side", "bottom");
      expect(arrow()).toHaveAttribute("data-side", "bottom");
      expect(arrow()).toHaveAttribute("data-align", "center");
    },
  );

  it("throws a descriptive error outside <PreviewCard.Popup>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <PreviewCard.Root>
          <PreviewCard.Arrow />
        </PreviewCard.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] PreviewCard.Arrow must be placed within <PreviewCard.Popup>.",
      ),
    ).toBeInTheDocument();
  });
});
