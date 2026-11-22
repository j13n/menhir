// The test list and the cases left out are in ../README.md.
import { createMemo, createSignal, flush, Loading, Show } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { stubDialog } from "../../../test/dialog/stubDialog.ts";
import { keyboard, nextTask } from "../../../test/floating/input.ts";
import { Dialog } from "../index.ts";
import type { DialogRootProps } from "./DialogRoot.tsx";

function dialog() {
  return screen.getByRole<HTMLDialogElement>("dialog", { hidden: true });
}
const trigger = () => screen.getByRole("button", { name: "Edit" });
const close = () => screen.getByRole("button", { name: "Done", hidden: true });

function EditDialog(props: DialogRootProps) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger>Edit</Dialog.Trigger>
      <Dialog.Popup data-testid="popup">
        <Dialog.Title data-testid="title">Edit profile</Dialog.Title>
        <Dialog.Description data-testid="description">
          Your name is shown on your posts.
        </Dialog.Description>
        <Dialog.Close>Done</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/** Every element a part of `EditDialog` renders. */
const parts = () => [
  trigger(),
  dialog(),
  screen.getByTestId("title"),
  screen.getByTestId("description"),
  close(),
];

describe("<Dialog.Root />", () => {
  const { render } = createRenderer();
  stubDialog();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Dialog.Root>
        <span>Inside</span>
      </Dialog.Root>
    ));

    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("is closed by default, with data-closed on every part", async () => {
    await render(() => <EditDialog />);

    expect(dialog().open).toBe(false);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }
  });

  it("starts open with defaultOpen, with data-open on every part", async () => {
    await render(() => <EditDialog defaultOpen />);

    expect(dialog().open).toBe(true);
    for (const part of parts()) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
  });

  it("opens from the Trigger and closes from Close, reporting each with its reason", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <EditDialog onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    expect(dialog().open).toBe(true);
    expect(dialog()).toHaveAttribute("data-open", "");

    await user.click(close());
    await vi.waitFor(() => expect(dialog().open).toBe(false));
    expect(dialog()).toHaveAttribute("data-closed", "");

    expect(
      onOpenChange.mock.calls.map(([open, details]) => [
        open,
        details.reason,
        details.event.type,
      ]),
    ).toEqual([
      [true, "trigger-press", "click"],
      [false, "close-press", "click"],
    ]);
  });

  it("keeps a controlled open dialog open, and asks to close it", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <EditDialog open onOpenChange={onOpenChange} />
    ));

    await user.click(close());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange.mock.calls[0]![0]).toBe(false);
    expect(dialog().open).toBe(true);
    expect(dialog()).toHaveAttribute("data-open", "");
  });

  it("keeps a controlled closed dialog closed, and asks to open it", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <EditDialog open={false} onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange.mock.calls[0]![0]).toBe(true);
    expect(dialog().open).toBe(false);
  });

  it("follows a controlled value changed from outside", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <EditDialog open={open()} />);

    setOpen(true);
    flush();
    expect(dialog().open).toBe(true);
    expect(dialog()).toHaveAttribute("data-open", "");

    setOpen(false);
    flush();
    await vi.waitFor(() => expect(dialog().open).toBe(false));
    expect(dialog()).toHaveAttribute("data-closed", "");
  });

  it("opens before async work that onOpenChange starts settles", async () => {
    const [opened, setOpened] = createSignal(false);
    let resolveDetails!: (details: string) => void;
    const { user } = await render(() => {
      const details = createMemo(() =>
        opened()
          ? new Promise<string>((resolve) => (resolveDetails = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <EditDialog onOpenChange={(value) => setOpened(value)} />
          <output>{details()}</output>
        </Loading>
      );
    });

    await user.click(trigger());
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(dialog().open).toBe(true);

    resolveDetails("loaded");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });

  describe.skipIf(isJSDOM)("controlled, with no Trigger", () => {
    function Page(props: { returnFocus?: () => HTMLElement | undefined }) {
      const [open, setOpen] = createSignal(false);
      const [opener, setOpener] = createSignal(true);
      let fallback: HTMLButtonElement | undefined;
      return (
        <>
          <Show when={opener()}>
            <button type="button" onClick={() => setOpen(true)}>
              Rename
            </button>
          </Show>
          <button type="button" ref={(el) => (fallback = el)}>
            Fallback
          </button>
          <Dialog.Root open={open()} onOpenChange={setOpen}>
            <Dialog.Popup
              aria-label="Rename"
              returnFocus={
                props.returnFocus &&
                ((focused) =>
                  (focused as HTMLElement | null) ??
                  props.returnFocus!() ??
                  fallback)
              }
            >
              <button type="button" onClick={() => setOpener(false)}>
                Remove opener
              </button>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      );
    }

    it("returns focus to the app's button that opened it", async () => {
      const { user } = await render(() => <Page />);
      const opener = screen.getByRole("button", { name: "Rename" });

      await user.click(opener);
      expect(dialog().matches(":modal")).toBe(true);
      await keyboard("{Escape}");
      await nextTask();

      expect(dialog().open).toBe(false);
      expect(document.activeElement).toBe(opener);
    });

    it("moves focus to returnFocus's fallback once that button is gone", async () => {
      const { user } = await render(() => (
        <Page returnFocus={() => undefined} />
      ));

      await user.click(screen.getByRole("button", { name: "Rename" }));
      await user.click(screen.getByRole("button", { name: "Remove opener" }));
      await keyboard("{Escape}");
      await nextTask();

      expect(dialog().open).toBe(false);
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Fallback" }),
      );
    });
  });
});
