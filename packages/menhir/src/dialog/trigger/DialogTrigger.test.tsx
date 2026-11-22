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
import { keyboard } from "../../../test/floating/input.ts";
import { Dialog } from "../index.ts";

function dialog() {
  return screen.getByRole<HTMLDialogElement>("dialog", { hidden: true });
}
const trigger = () => screen.getByRole("button", { name: "Edit" });

function EditDialog(props: { trigger?: JSX.Element }) {
  return (
    <Dialog.Root>
      {props.trigger ?? <Dialog.Trigger>Edit</Dialog.Trigger>}
      <Dialog.Popup aria-label="Edit profile">
        <Dialog.Close>Done</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

describeConformance(
  "<Dialog.Trigger />",
  (props) => (
    <Dialog.Root>
      <Dialog.Trigger {...props} />
    </Dialog.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Dialog.Trigger />", () => {
  const { render } = createRenderer();
  stubDialog();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button with aria-haspopup, and no aria-expanded or aria-controls", async () => {
    await render(() => <EditDialog />);

    expect(trigger()).toHaveAttribute("type", "button");
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger()).not.toHaveAttribute("aria-expanded");
    expect(trigger()).not.toHaveAttribute("aria-controls");
  });

  it("is named by its content, and takes the consumer's id", async () => {
    await render(() => (
      <EditDialog trigger={<Dialog.Trigger id="edit">Edit</Dialog.Trigger>} />
    ));

    expect(trigger()).toHaveAccessibleName("Edit");
    expect(trigger()).toHaveAttribute("id", "edit");
  });

  it("opens the dialog on click", async () => {
    const { user } = await render(() => <EditDialog />);

    await user.click(trigger());

    expect(dialog().open).toBe(true);
  });

  it.skipIf(isJSDOM).each(["{Enter}", " "])(
    "opens the dialog with %j while focused",
    async (key) => {
      await render(() => <EditDialog />);

      trigger().focus();
      await keyboard(key);

      expect(dialog().matches(":modal")).toBe(true);
    },
  );

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form onSubmit={onSubmit}>
        <EditDialog />
      </form>
    ));

    await user.click(trigger());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    await render(() => (
      <EditDialog
        trigger={<Dialog.Trigger onClick={onClick}>Edit</Dialog.Trigger>}
      />
    ));

    fireEvent.click(trigger());

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps its behaviour when render returns a button component", async () => {
    const Button = (props: JSX.HTMLAttributes<HTMLButtonElement>) => (
      <button data-button="" {...props} />
    );
    const { user } = await render(() => (
      <EditDialog
        trigger={<Dialog.Trigger render={Button}>Edit</Dialog.Trigger>}
      />
    ));

    await user.click(trigger());

    expect(trigger()).toHaveAttribute("data-button", "");
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(dialog().open).toBe(true);
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <EditDialog
        trigger={
          <Dialog.Trigger render={(props) => <div {...props} />}>
            Edit
          </Dialog.Trigger>
        }
      />
    ));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("Dialog.Trigger");
  });

  it("throws a descriptive error outside <Dialog.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Dialog.Trigger>Edit</Dialog.Trigger>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Dialog parts must be placed within <Dialog.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
