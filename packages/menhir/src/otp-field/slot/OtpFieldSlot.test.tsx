// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { Errored } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { OtpField } from "../index.ts";

describeConformance(
  "<OtpField.Slot />",
  (props) => (
    <OtpField.Root length={4} defaultValue="12">
      <OtpField.Input />
      <OtpField.Slot index={0} {...props} />
    </OtpField.Root>
  ),
  { tagName: "DIV" },
);

describe("<OtpField.Slot />", () => {
  const { render } = createRenderer();

  it("renders a <div aria-hidden> with the character at index, and data-filled; empty without one", async () => {
    await render(() => (
      <OtpField.Root length={4} defaultValue="12">
        <OtpField.Input />
        <OtpField.Slot index={1} data-testid="filled" />
        <OtpField.Slot index={2} data-testid="empty" />
      </OtpField.Root>
    ));
    const filled = screen.getByTestId("filled");
    const empty = screen.getByTestId("empty");

    expect(filled.tagName).toBe("DIV");
    expect(filled).toHaveAttribute("aria-hidden", "true");
    expect(filled).toHaveTextContent("2");
    expect(filled).toHaveAttribute("data-filled", "");
    expect(empty).toHaveTextContent("");
    expect(empty).not.toHaveAttribute("data-filled");
    expect(filled).not.toHaveAttribute("data-active");
    expect(filled).not.toHaveAttribute("data-caret");
  });

  it("renders the consumer's children after the character", async () => {
    await render(() => (
      <OtpField.Root length={4} defaultValue="7">
        <OtpField.Slot index={0} data-testid="slot">
          <span class="caret" />
        </OtpField.Slot>
      </OtpField.Root>
    ));

    expect(screen.getByTestId("slot").innerHTML).toBe(
      '7<span class="caret"></span>',
    );
  });

  it("throws a descriptive error outside <OtpField.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <OtpField.Slot index={0} />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] OtpField parts must be placed within <OtpField.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
