// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import { stubDialog } from "../../../test/dialog/stubDialog.ts";
import {
  centerOf,
  keyboard,
  nextTask,
  press,
  wheel,
} from "../../../test/floating/input.ts";
import type { DialogRootProps } from "../../dialog/root/DialogRoot.tsx";
import { AlertDialog } from "../index.ts";

function dialog() {
  return screen.getByRole<HTMLDialogElement>("alertdialog", { hidden: true });
}
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

/** A point on the backdrop: the top left corner of the viewport. */
const backdrop = { x: 5, y: 5 };

/** Cancel, the least destructive action, first, unless `actions` says. */
function DeleteDialog(props: DialogRootProps & { actions?: JSX.Element }) {
  return (
    <AlertDialog.Root
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
    >
      <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
      <AlertDialog.Popup>
        <AlertDialog.Title>Delete this file?</AlertDialog.Title>
        <AlertDialog.Description>It cannot be undone.</AlertDialog.Description>
        {props.actions ?? (
          <>
            <AlertDialog.Close>Cancel</AlertDialog.Close>
            <AlertDialog.Close>Delete</AlertDialog.Close>
          </>
        )}
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
}

describeConformance(
  "<AlertDialog.Popup />",
  (props) => (
    <AlertDialog.Root>
      <AlertDialog.Popup {...props} />
    </AlertDialog.Root>
  ),
  { tagName: "DIALOG" },
);

describe("<AlertDialog.Popup />", () => {
  const { render } = createRenderer();
  stubDialog();
  afterEach(async () => {
    vi.restoreAllMocks();
    if (!isJSDOM) {
      scrollTo(0, 0);
      // Its `scrollend` comes later; the next test's input must not see it.
      await nextTask();
    }
  });

  it("renders a <dialog> with the alertdialog role, closed until opened", async () => {
    const { user } = await render(() => <DeleteDialog />);

    expect(dialog().tagName).toBe("DIALOG");
    expect(dialog()).toHaveAttribute("role", "alertdialog");
    expect(dialog().open).toBe(false);

    await user.click(button("Delete file"));
    expect(dialog().open).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "opens modal, in the top layer above an element with a high z-index",
    async () => {
      const { user } = await render(() => (
        <>
          <DeleteDialog />
          <div
            data-testid="cover"
            style={{ position: "fixed", inset: "0", "z-index": "9999" }}
          />
        </>
      ));

      await user.click(button("Delete file"));

      expect(screen.getByRole("alertdialog")).toBe(dialog());
      expect(dialog().matches(":modal")).toBe(true);
      const { x, y } = centerOf(dialog());
      expect(dialog().contains(document.elementFromPoint(x, y))).toBe(true);
    },
  );

  it.skipIf(isJSDOM)("makes the page outside inert while open", async () => {
    const { user } = await render(() => (
      <>
        <button type="button">Outside</button>
        <DeleteDialog />
      </>
    ));

    await user.click(button("Delete file"));
    button("Outside").focus();

    expect(dialog().contains(document.activeElement)).toBe(true);
  });

  describe("naming", () => {
    it("is named by its Title and described by its Description, the message", async () => {
      await render(() => <DeleteDialog defaultOpen />);
      await nextTask();

      expect(dialog()).toHaveAccessibleName("Delete this file?");
      expect(dialog()).toHaveAccessibleDescription("It cannot be undone.");
    });

    it("takes an aria-label without a Title", async () => {
      await render(() => (
        <AlertDialog.Root defaultOpen>
          <AlertDialog.Popup aria-label="Delete this file?">
            <AlertDialog.Close>Cancel</AlertDialog.Close>
          </AlertDialog.Popup>
        </AlertDialog.Root>
      ));
      await nextTask();

      expect(dialog()).not.toHaveAttribute("aria-labelledby");
      expect(dialog()).toHaveAccessibleName("Delete this file?");
    });
  });

  it("lets the consumer's role win", async () => {
    await render(() => (
      <AlertDialog.Root>
        <AlertDialog.Popup role="dialog" aria-label="Notice" />
      </AlertDialog.Root>
    ));

    expect(screen.getByRole("dialog", { hidden: true }).tagName).toBe("DIALOG");
    expect(screen.queryByRole("alertdialog", { hidden: true })).toBeNull();
  });

  describe.skipIf(isJSDOM)("focus", () => {
    it("moves focus to the first focusable element on opening: Cancel, placed first", async () => {
      const { user } = await render(() => <DeleteDialog />);

      await user.click(button("Delete file"));
      await nextTask();

      expect(document.activeElement).toBe(button("Cancel"));
    });

    it("moves focus to the element with autofocus on opening: Cancel, placed last", async () => {
      const { user } = await render(() => (
        <DeleteDialog
          actions={
            <>
              <AlertDialog.Close>Delete</AlertDialog.Close>
              <AlertDialog.Close autofocus>Cancel</AlertDialog.Close>
            </>
          }
        />
      ));

      await user.click(button("Delete file"));
      await nextTask();

      expect(document.activeElement).toBe(button("Cancel"));
    });

    it("wraps Tab from the last element to the first, and Shift+Tab back", async () => {
      const { user } = await render(() => <DeleteDialog />);

      await user.click(button("Delete file"));
      await nextTask();
      button("Delete").focus();

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(button("Cancel"));

      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(button("Delete"));
    });

    it("returns focus to the Trigger once closed", async () => {
      const { user } = await render(() => <DeleteDialog />);

      await user.click(button("Delete file"));
      await user.click(button("Cancel"));
      await nextTask();

      expect(dialog().open).toBe(false);
      expect(document.activeElement).toBe(button("Delete file"));
    });
  });

  describe.skipIf(isJSDOM)("dismissal", () => {
    it("closes on Escape, reporting escape-key with the key event", async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <DeleteDialog onOpenChange={onOpenChange} />
      ));

      await user.click(button("Delete file"));
      await keyboard("{Escape}");
      await nextTask();

      expect(dialog().open).toBe(false);
      const [open, details] = onOpenChange.mock.calls.at(-1)!;
      expect(open).toBe(false);
      expect(details.reason).toBe("escape-key");
      expect(details.event.key).toBe("Escape");
    });

    it("stays open on a press on the backdrop, and reports nothing", async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <DeleteDialog onOpenChange={onOpenChange} />
      ));

      await user.click(button("Delete file"));
      onOpenChange.mockClear();
      await press(backdrop);
      await nextTask();

      expect(dialog().matches(":modal")).toBe(true);
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  it.skipIf(isJSDOM)(
    "keeps the page from scrolling while open, and lets it scroll once closed",
    async () => {
      const { user } = await render(() => (
        <>
          <DeleteDialog />
          <div style={{ height: "5000px" }}>Page</div>
        </>
      ));

      await user.click(button("Delete file"));
      await wheel(backdrop);
      expect(scrollY).toBe(0);

      await user.click(button("Cancel"));
      await nextTask();
      await wheel(backdrop);
      expect(scrollY).toBeGreaterThan(0);
    },
  );

  it("keeps its behaviour when render returns a <dialog>", async () => {
    const { user } = await render(() => (
      <AlertDialog.Root>
        <AlertDialog.Trigger>Delete file</AlertDialog.Trigger>
        <AlertDialog.Popup
          aria-label="Delete this file?"
          render={(props) => <dialog data-custom="" {...props} />}
        />
      </AlertDialog.Root>
    ));

    await user.click(button("Delete file"));

    expect(dialog()).toHaveAttribute("data-custom", "");
    expect(dialog().open).toBe(true);
  });

  it("warns in development, naming AlertDialog.Popup, when render does not render a <dialog>", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <AlertDialog.Root>
        <AlertDialog.Popup render={(props) => <div {...props} />} />
      </AlertDialog.Root>
    ));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "AlertDialog.Popup's render function rendered a <div>",
      ),
    );
  });

  it("throws a descriptive error outside <AlertDialog.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <AlertDialog.Popup />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Dialog parts must be placed within <Dialog.Root>, and Alert Dialog parts within <AlertDialog.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
