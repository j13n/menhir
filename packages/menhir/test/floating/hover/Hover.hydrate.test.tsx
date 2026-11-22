import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  fireEvent,
  renderOnServer,
  screen,
} from "#test-utils";

import HoverFixture from "./HoverFixture.tsx";

const fixture = "/test/floating/hover/HoverFixture.tsx";

describe("hover hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the module: one that read `document` or
  // `window` there would fail it. Its listeners and timers start only in
  // effects and event handlers, which do not run on the server.
  it("renders the popups closed on the server", async () => {
    const container = await renderOnServer(fixture);

    expect(container.querySelectorAll("[role=tooltip]")).toHaveLength(2);
    expect(container.querySelector("[data-open]")).toBeNull();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and opens on hover afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = container.querySelector("button")!;

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <HoverFixture />, { hydrate: container });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    const trigger = screen.getByRole("button", { name: "First trigger" });
    expect(trigger).toBe(serverTrigger);

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    await afterFlush();
    expect(screen.getByTestId("First")).toHaveAttribute("data-open");

    // The group carries on: the second opens at once.
    fireEvent.pointerEnter(
      screen.getByRole("button", { name: "Second trigger" }),
      { pointerType: "mouse" },
    );
    await afterFlush();
    expect(screen.getByTestId("Second")).toHaveAttribute("data-open");
    expect(screen.getByTestId("First")).not.toHaveAttribute("data-open");
  });
});
