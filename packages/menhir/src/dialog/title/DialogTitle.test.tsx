// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Dialog } from "../index.ts";

describeConformance(
  "<Dialog.Title />",
  (props) => (
    <Dialog.Root>
      <Dialog.Title {...props} />
    </Dialog.Root>
  ),
  { tagName: "H2" },
);

describe("<Dialog.Title />", () => {
  const { render } = createRenderer();

  it("renders an <h2> with a generated id, which differs between two dialogs", async () => {
    await render(() => (
      <>
        <Dialog.Root>
          <Dialog.Title>First</Dialog.Title>
        </Dialog.Root>
        <Dialog.Root>
          <Dialog.Title>Second</Dialog.Title>
        </Dialog.Root>
      </>
    ));
    const first = screen.getByText("First");
    const second = screen.getByText("Second");

    expect(first.tagName).toBe("H2");
    expect(first.id).not.toBe("");
    expect(second.id).not.toBe("");
    expect(first.id).not.toBe(second.id);
  });

  it("throws a descriptive error outside <Dialog.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Dialog.Title>Title</Dialog.Title>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Dialog parts must be placed within <Dialog.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
