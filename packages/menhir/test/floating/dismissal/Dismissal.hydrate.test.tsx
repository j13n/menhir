import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  fireEvent,
  isJSDOM,
  renderOnServer,
  screen,
} from "#test-utils";

import DismissalFixture from "./DismissalFixture.tsx";
import { keyboard, nextTask } from "./input.ts";

const fixture = "/test/floating/dismissal/DismissalFixture.tsx";

describe("dismissal hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the popups closed on the server", async () => {
    const container = await renderOnServer(fixture);

    // A closed <dialog> has no role for Testing Library.
    const dialog = container.querySelector("dialog")!;
    expect(dialog).not.toHaveAttribute("open");
    expect(container.querySelector("[data-open]")).toBeNull();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and closes the popups on Escape afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverDialog = container.querySelector("dialog")!;

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <DismissalFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    const dialog = container.querySelector("dialog")!;
    expect(dialog).toBe(serverDialog);

    const tooltip = screen.getByTestId("Tooltip");
    await user.click(screen.getByRole("button", { name: "Tooltip trigger" }));
    expect(tooltip).toHaveAttribute("data-open");
    fireEvent.keyDown(document.body, { key: "Escape" });
    await vi.waitFor(() => expect(tooltip).not.toHaveAttribute("data-open"));

    if (isJSDOM) return;
    await user.click(screen.getByRole("button", { name: "Dialog trigger" }));
    expect(dialog.matches(":modal")).toBe(true);
    await keyboard("{Escape}");
    await nextTask();
    expect(dialog.open).toBe(false);
  });
});
