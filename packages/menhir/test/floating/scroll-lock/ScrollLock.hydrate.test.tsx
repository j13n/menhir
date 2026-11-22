import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { wheel } from "../input.ts";
import ScrollLockFixture from "./ScrollLockFixture.tsx";

const fixture = "/test/floating/scroll-lock/ScrollLockFixture.tsx";

describe("scroll lock hydration", () => {
  const { render } = createRenderer();
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute("style");
    scrollTo(0, 0);
  });

  // The server render runs the module: one that read `document` or
  // `window` there would fail it.
  it("renders the dialog closed", async () => {
    const container = await renderOnServer(fixture);

    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements without warnings", async () => {
    const container = await renderOnServer(fixture);
    const serverDialog = container.querySelector("dialog")!;

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <ScrollLockFixture />, { hydrate: container });

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector("dialog")).toBe(serverDialog);
  });

  it.skipIf(isJSDOM)(
    "after hydration, opening locks the page and closing unlocks it",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <ScrollLockFixture />, {
        hydrate: container,
      });

      await user.click(screen.getByRole("button", { name: "Dialog trigger" }));
      await wheel({ x: 5, y: 5 });
      expect(scrollY).toBe(0);

      await user.click(screen.getByRole("button", { name: "Close Dialog" }));
      await wheel({ x: 5, y: 5 });
      expect(scrollY).toBeGreaterThan(0);
    },
  );
});
