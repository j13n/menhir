import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard } from "../input.ts";
import FocusFixture from "./FocusFixture.tsx";

const fixture = "/test/floating/focus/FocusFixture.tsx";

describe("focus hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the dialog closed, with its autofocus attribute", async () => {
    const container = await renderOnServer(fixture);

    const dialog = container.querySelector("dialog")!;
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog.querySelector("[autofocus]")).toHaveTextContent("Second");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements without warnings", async () => {
    const container = await renderOnServer(fixture);
    const serverDialog = container.querySelector("dialog")!;

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <FocusFixture />, { hydrate: container });

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector("dialog")).toBe(serverDialog);
  });

  it.skipIf(isJSDOM)(
    "after hydration and opening, Tab wraps and focus returns",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <FocusFixture />, {
        hydrate: container,
      });

      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));
      expect(document.activeElement).toHaveTextContent("Second");
      screen.getByRole("button", { name: "Close Dialog" }).focus();
      await keyboard("{Tab}");
      expect(document.activeElement).toHaveTextContent("First");
      await user.click(screen.getByRole("button", { name: "Close Dialog" }));
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Page" }),
      );
    },
  );
});
