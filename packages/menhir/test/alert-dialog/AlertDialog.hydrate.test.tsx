import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { stubDialog } from "../dialog/stubDialog.ts";
import { keyboard, nextTask } from "../floating/input.ts";
import AlertDialogFixture from "./AlertDialogFixture.tsx";

const fixture = "/test/alert-dialog/AlertDialogFixture.tsx";

describe("<AlertDialog.Root /> hydration", () => {
  const { render } = createRenderer();
  stubDialog();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Trigger and a closed alertdialog in the server HTML", async () => {
    const container = await renderOnServer(fixture);
    const trigger = screen.getByRole("button", { name: "Delete file" });
    const remove = screen.getByTestId("delete");

    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("data-closed", "");
    expect(remove.tagName).toBe("DIALOG");
    expect(remove).toHaveAttribute("role", "alertdialog");
    expect(remove).not.toHaveAttribute("open");
    expect(remove).toHaveAttribute("data-closed", "");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("renders a defaultOpen alert dialog closed, with data-open, naming nothing yet", async () => {
    const container = await renderOnServer(fixture);
    const expired = screen.getByTestId("expired");

    expect(expired).not.toHaveAttribute("open");
    expect(expired).toHaveAttribute("data-open", "");
    expect(expired).not.toHaveAttribute("aria-labelledby");
    expect(expired).not.toHaveAttribute("aria-describedby");
    container.remove();
  });

  it("adopts the server's elements without warnings, and opens a defaultOpen alert dialog named and described", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = screen.getByRole("button", { name: "Delete file" });
    const serverExpired = screen.getByTestId("expired");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <AlertDialogFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Delete file" })).toBe(
      serverTrigger,
    );
    const expired = screen.getByTestId("expired") as HTMLDialogElement;
    expect(expired).toBe(serverExpired);
    expect(expired.open).toBe(true);
    if (!isJSDOM) expect(expired.matches(":modal")).toBe(true);
    expect(expired).toHaveAccessibleName("Session expired");
    expect(expired).toHaveAccessibleDescription("Sign in again to go on.");
  });

  it.skipIf(isJSDOM)(
    "opens by click and by Enter after hydration",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <AlertDialogFixture />, {
        hydrate: container,
      });
      const remove = screen.getByTestId("delete") as HTMLDialogElement;
      await user.click(screen.getByRole("button", { name: "Sign in" }));
      await nextTask();

      await user.click(screen.getByRole("button", { name: "Delete file" }));
      expect(remove.matches(":modal")).toBe(true);
      expect(remove).toHaveAccessibleName("Delete this file?");
      expect(remove).toHaveAccessibleDescription("It cannot be undone.");

      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await nextTask();
      expect(remove.open).toBe(false);
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Delete file" }),
      );

      await keyboard("{Enter}");
      expect(remove.matches(":modal")).toBe(true);
    },
  );
});
