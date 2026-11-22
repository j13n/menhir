// The test list and the cases left out are in ./README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubDialog } from "../../test/dialog/stubDialog.ts";
import { AlertDialog } from "./index.ts";
import type { DialogRootProps } from "../dialog/root/DialogRoot.tsx";

function dialog() {
  return screen.getByRole<HTMLDialogElement>("alertdialog", { hidden: true });
}
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

function DeleteDialog(props: DialogRootProps) {
  return (
    <AlertDialog.Root
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
    >
      <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
      <AlertDialog.Popup>
        <AlertDialog.Title>Delete this file?</AlertDialog.Title>
        <AlertDialog.Description>It cannot be undone.</AlertDialog.Description>
        <AlertDialog.Close>Cancel</AlertDialog.Close>
        <AlertDialog.Close>Delete</AlertDialog.Close>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
}

describe("<AlertDialog />", () => {
  const { render } = createRenderer();
  stubDialog();
  afterEach(() => vi.restoreAllMocks());

  it("opens from its Trigger and closes from Close, reporting each reason", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <DeleteDialog onOpenChange={onOpenChange} />
    ));

    await user.click(button("Delete file"));
    await afterFlush();
    expect(dialog().open).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });

    await user.click(button("Cancel"));
    await vi.waitFor(() => expect(dialog().open).toBe(false));
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "close-press",
      event: expect.any(MouseEvent),
    });
  });

  it("starts open with defaultOpen, every part with data-open", async () => {
    await render(() => <DeleteDialog defaultOpen />);

    expect(dialog().open).toBe(true);
    for (const part of [
      button("Delete file"),
      dialog(),
      screen.getByText("Delete this file?"),
      screen.getByText("It cannot be undone."),
      button("Cancel"),
    ]) {
      expect(part).toHaveAttribute("data-open", "");
    }
  });

  it.each<[string, () => JSX.Element]>([
    ["Popup", () => <AlertDialog.Popup />],
    ["Title", () => <AlertDialog.Title />],
    ["Close", () => <AlertDialog.Close />],
  ])(
    "throws an error naming AlertDialog.Root when its %s is outside it",
    async (_, part) => {
      await render(() => (
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          {part()}
        </Errored>
      ));

      expect(
        screen.getByText(/Alert Dialog parts within <AlertDialog\.Root>/),
      ).toBeInTheDocument();
    },
  );
});
