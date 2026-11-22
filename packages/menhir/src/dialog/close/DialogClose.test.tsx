// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { stubDialog } from "../../../test/dialog/stubDialog.ts";
import { keyboard, nextTask } from "../../../test/floating/input.ts";
import { Dialog } from "../index.ts";

function dialog() {
  return screen.getByRole<HTMLDialogElement>("dialog", { hidden: true });
}
const close = () => screen.getByRole("button", { name: "Done", hidden: true });

function EditDialog(props: { close?: JSX.Element }) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Popup aria-label="Edit profile">
        {props.close ?? <Dialog.Close>Done</Dialog.Close>}
      </Dialog.Popup>
    </Dialog.Root>
  );
}

describeConformance(
  "<Dialog.Close />",
  (props) => (
    <Dialog.Root>
      <Dialog.Close {...props} />
    </Dialog.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Dialog.Close />", () => {
  const { render } = createRenderer();
  stubDialog();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button, named by its content", async () => {
    await render(() => <EditDialog />);

    expect(close()).toHaveAttribute("type", "button");
    expect(close()).toHaveAccessibleName("Done");
  });

  it("closes the dialog on click", async () => {
    const { user } = await render(() => <EditDialog />);

    await user.click(close());

    await vi.waitFor(() => expect(dialog().open).toBe(false));
  });

  it.skipIf(isJSDOM).each(["{Enter}", " "])(
    "closes the dialog with %j while focused",
    async (key) => {
      await render(() => <EditDialog />);

      close().focus();
      await keyboard(key);
      await nextTask();

      expect(dialog().open).toBe(false);
    },
  );

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <EditDialog
        close={
          <form onSubmit={onSubmit}>
            <Dialog.Close>Done</Dialog.Close>
          </form>
        }
      />
    ));

    await user.click(close());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    await render(() => (
      <EditDialog close={<Dialog.Close onClick={onClick}>Done</Dialog.Close>} />
    ));

    fireEvent.click(close());

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <EditDialog
        close={
          <Dialog.Close render={(props) => <div {...props} />}>
            Done
          </Dialog.Close>
        }
      />
    ));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("Dialog.Close");
  });

  it("throws a descriptive error outside <Dialog.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Dialog.Close>Done</Dialog.Close>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Dialog parts must be placed within <Dialog.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
