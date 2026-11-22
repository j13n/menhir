import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import PopoverFixture from "./PopoverFixture.tsx";
import { stubPopover } from "./stubPopover.ts";

const fixture = "/test/popover/PopoverFixture.tsx";

describe("<Popover.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Trigger and a hidden popover in the server HTML", async () => {
    const container = await renderOnServer(fixture);
    const trigger = screen.getByRole("button", { name: "Notifications" });
    const notifications = screen.getByTestId("notifications");

    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(notifications.id).not.toBe("");
    expect(trigger).toHaveAttribute("popovertarget", notifications.id);
    expect(trigger).toHaveAttribute("aria-controls", notifications.id);
    expect(notifications).toHaveAttribute("popover", "auto");
    expect(notifications).toHaveAttribute("role", "dialog");
    expect(notifications).toHaveAttribute("data-closed", "");
    expect(notifications.matches(":popover-open")).toBe(false);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("renders a defaultOpen popover hidden, with data-open, no position and no Title named yet", async () => {
    const container = await renderOnServer(fixture);
    const tips = screen.getByTestId("tips");

    expect(tips.matches(":popover-open")).toBe(false);
    expect(tips).toHaveAttribute("data-open", "");
    expect(tips).not.toHaveAttribute("data-side");
    expect(tips).not.toHaveAttribute("style");
    expect(tips).not.toHaveAttribute("aria-labelledby");
    container.remove();
  });

  it("adopts the server's elements without warnings, and shows a defaultOpen popover, placed and named by its Title", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = screen.getByRole("button", { name: "Notifications" });
    const serverTips = screen.getByTestId("tips");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <PopoverFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Notifications" })).toBe(
      serverTrigger,
    );
    const tips = screen.getByTestId("tips");
    expect(tips).toBe(serverTips);
    expect(tips.matches(":popover-open")).toBe(true);
    await vi.waitFor(() => expect(tips).toHaveAttribute("data-side", "bottom"));
    expect(tips).toHaveAccessibleName("Welcome");
  });

  it.skipIf(isJSDOM)(
    "opens by click and by Enter after hydration",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <PopoverFixture />, {
        hydrate: container,
      });
      const notifications = screen.getByTestId("notifications");
      await nextTask();

      await user.click(screen.getByRole("button", { name: "Notifications" }));
      await nextTask();
      expect(notifications.matches(":popover-open")).toBe(true);
      expect(notifications).toHaveAccessibleName("All caught up");
      expect(notifications).toHaveAccessibleDescription(
        "No new notifications.",
      );

      await user.click(screen.getByRole("button", { name: "Close" }));
      await nextTask();
      expect(notifications.matches(":popover-open")).toBe(false);
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Notifications" }),
      );

      await keyboard("{Enter}");
      await nextTask();
      expect(notifications.matches(":popover-open")).toBe(true);
    },
  );
});
