// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Popover } from "../index.ts";

describeConformance(
  "<Popover.Description />",
  (props) => (
    <Popover.Root>
      <Popover.Description {...props} />
    </Popover.Root>
  ),
  { tagName: "P" },
);

describe("<Popover.Description />", () => {
  const { render } = createRenderer();

  it("renders a <p> with a generated id, which differs between two popovers", async () => {
    await render(() => (
      <>
        <Popover.Root>
          <Popover.Description>First</Popover.Description>
        </Popover.Root>
        <Popover.Root>
          <Popover.Description>Second</Popover.Description>
        </Popover.Root>
      </>
    ));
    const first = screen.getByText("First");
    const second = screen.getByText("Second");

    expect(first.tagName).toBe("P");
    expect(first.id).not.toBe("");
    expect(second.id).not.toBe("");
    expect(first.id).not.toBe(second.id);
  });

  it("keeps the consumer's id", async () => {
    await render(() => (
      <Popover.Root>
        <Popover.Description id="own">Text</Popover.Description>
      </Popover.Root>
    ));

    expect(screen.getByText("Text")).toHaveAttribute("id", "own");
  });

  it("throws a descriptive error outside <Popover.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Popover.Description>Text</Popover.Description>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Popover parts must be placed within <Popover.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
