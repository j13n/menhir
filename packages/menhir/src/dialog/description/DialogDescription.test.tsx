// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Dialog } from "../index.ts";

describeConformance(
  "<Dialog.Description />",
  (props) => (
    <Dialog.Root>
      <Dialog.Description {...props} />
    </Dialog.Root>
  ),
  { tagName: "P" },
);

describe("<Dialog.Description />", () => {
  const { render } = createRenderer();

  it("renders a <p> with a generated id, which differs between two dialogs", async () => {
    await render(() => (
      <>
        <Dialog.Root>
          <Dialog.Description>First</Dialog.Description>
        </Dialog.Root>
        <Dialog.Root>
          <Dialog.Description>Second</Dialog.Description>
        </Dialog.Root>
      </>
    ));
    const first = screen.getByText("First");
    const second = screen.getByText("Second");

    expect(first.tagName).toBe("P");
    expect(first.id).not.toBe("");
    expect(second.id).not.toBe("");
    expect(first.id).not.toBe(second.id);
  });

  it("throws a descriptive error outside <Dialog.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Dialog.Description>Text</Dialog.Description>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Dialog parts must be placed within <Dialog.Root>, and Alert Dialog parts within <AlertDialog.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
