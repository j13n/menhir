import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import DialogFixture from "./DialogFixture.tsx";
import { stubDialog } from "./stubDialog.ts";

const fixture = "/test/dialog/DialogFixture.tsx";

describe("<Dialog.Root /> hydration", () => {
  const { render } = createRenderer();
  stubDialog();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Trigger and a closed dialog in the server HTML", async () => {
    const container = await renderOnServer(fixture);
    const trigger = screen.getByRole("button", { name: "Edit" });
    const edit = screen.getByTestId("edit");

    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("data-closed", "");
    expect(edit.tagName).toBe("DIALOG");
    expect(edit).not.toHaveAttribute("open");
    expect(edit).toHaveAttribute("data-closed", "");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("renders a defaultOpen dialog closed, with data-open, naming no Title yet", async () => {
    const container = await renderOnServer(fixture);
    const welcome = screen.getByTestId("welcome");

    expect(welcome).not.toHaveAttribute("open");
    expect(welcome).toHaveAttribute("data-open", "");
    expect(welcome).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByTestId("edit")).not.toHaveAttribute("aria-labelledby");
    container.remove();
  });

  it("adopts the server's elements without warnings, and opens a defaultOpen dialog named by its Title", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = screen.getByRole("button", { name: "Edit" });
    const serverWelcome = screen.getByTestId("welcome");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <DialogFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Edit" })).toBe(serverTrigger);
    const welcome = screen.getByTestId("welcome") as HTMLDialogElement;
    expect(welcome).toBe(serverWelcome);
    expect(welcome.open).toBe(true);
    if (!isJSDOM) expect(welcome.matches(":modal")).toBe(true);
    expect(welcome).toHaveAccessibleName("Welcome");
  });

  it.skipIf(isJSDOM)(
    "opens by click and by Enter after hydration",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <DialogFixture />, {
        hydrate: container,
      });
      const edit = screen.getByTestId("edit") as HTMLDialogElement;
      await user.click(screen.getByRole("button", { name: "Start" }));
      await nextTask();

      await user.click(screen.getByRole("button", { name: "Edit" }));
      expect(edit.matches(":modal")).toBe(true);
      expect(edit).toHaveAccessibleName("Edit profile");
      expect(edit).toHaveAccessibleDescription("Shown on your posts.");

      await user.click(screen.getByRole("button", { name: "Done" }));
      await nextTask();
      expect(edit.open).toBe(false);
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Edit" }),
      );

      await keyboard("{Enter}");
      expect(edit.matches(":modal")).toBe(true);
    },
  );
});
