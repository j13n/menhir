import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  isJSDOM,
  renderOnServer,
  screen,
} from "#test-utils";

import {
  centerOf,
  keyboard,
  line,
  movePointer,
  nextTask,
} from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import TooltipFixture from "./TooltipFixture.tsx";

const fixture = "/test/tooltip/TooltipFixture.tsx";

describe("<Tooltip.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Trigger, described by a hidden popover, in the server HTML", async () => {
    const container = await renderOnServer(fixture);
    const trigger = screen.getByRole("button", { name: "Bold" });
    const bold = screen.getByTestId("bold");

    expect(trigger).toHaveAttribute("type", "button");
    expect(bold.id).not.toBe("");
    expect(trigger).toHaveAttribute("aria-describedby", bold.id);
    expect(trigger).toHaveAccessibleDescription("Ctrl+B");
    expect(bold).toHaveAttribute("popover", "manual");
    expect(bold).toHaveAttribute("role", "tooltip");
    expect(bold).toHaveAttribute("data-closed", "");
    expect(bold.matches(":popover-open")).toBe(false);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("renders a defaultOpen tooltip hidden, with data-open and no position", async () => {
    const container = await renderOnServer(fixture);
    const help = screen.getByTestId("help");

    expect(help.matches(":popover-open")).toBe(false);
    expect(help).toHaveAttribute("data-open", "");
    expect(help).not.toHaveAttribute("data-side");
    expect(help).not.toHaveAttribute("style");
    container.remove();
  });

  it("adopts the server's elements without warnings, and shows a defaultOpen tooltip, placed", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = screen.getByRole("button", { name: "Bold" });
    const serverHelp = screen.getByTestId("help");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <TooltipFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Bold" })).toBe(serverTrigger);
    const help = screen.getByTestId("help");
    expect(help).toBe(serverHelp);
    expect(help.matches(":popover-open")).toBe(true);
    await vi.waitFor(() => expect(help).toHaveAttribute("data-side", "top"));
  });

  it.skipIf(isJSDOM)(
    "opens on hover and on keyboard focus after hydration",
    async () => {
      await movePointer([{ x: 380, y: 400 }]);
      const container = await renderOnServer(fixture);
      await render(() => <TooltipFixture />, { hydrate: container });
      const trigger = screen.getByRole("button", { name: "Bold" });
      const bold = screen.getByTestId("bold");
      await nextTask();

      await movePointer([centerOf(trigger)]);
      await afterFlush();
      expect(bold.matches(":popover-open")).toBe(true);
      // In steps, as a mouse moves, so it leaves the safe area.
      await movePointer(line(centerOf(trigger), { x: 380, y: 400 }));
      await nextTask();
      expect(bold.matches(":popover-open")).toBe(false);

      screen.getByRole("button", { name: "Before" }).focus();
      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(trigger);
      expect(bold.matches(":popover-open")).toBe(true);
    },
  );
});
