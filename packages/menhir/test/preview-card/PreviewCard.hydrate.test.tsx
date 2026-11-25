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
import PreviewCardFixture from "./PreviewCardFixture.tsx";

const fixture = "/test/preview-card/PreviewCardFixture.tsx";
const away = { x: 380, y: 400 };

describe("<PreviewCard.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the link and a hidden popover in the server HTML", async () => {
    const container = await renderOnServer(fixture);
    const trigger = screen.getByRole("link", { name: "Ada" });
    const ada = screen.getByTestId("ada");

    expect(trigger).toHaveAttribute("href", "#ada");
    expect(trigger).not.toHaveAttribute("aria-describedby");
    expect(ada).toHaveAttribute("popover", "manual");
    expect(ada).not.toHaveAttribute("role");
    expect(ada).toHaveAttribute("data-closed", "");
    expect(ada.matches(":popover-open")).toBe(false);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("keeps a paragraph whole around a link whose Popup is a <span>", async () => {
    const container = await renderOnServer(fixture);
    const paragraph = screen.getByTestId("paragraph");

    expect(paragraph).toContainElement(
      screen.getByRole("link", { name: "Ada" }),
    );
    expect(paragraph).toContainElement(screen.getByTestId("ada"));
    expect(paragraph).toHaveTextContent(/, in 1843\.$/);
    container.remove();
  });

  it("renders a defaultOpen card hidden, with data-open and no position", async () => {
    const container = await renderOnServer(fixture);
    const charles = screen.getByTestId("charles");

    expect(charles.matches(":popover-open")).toBe(false);
    expect(charles).toHaveAttribute("data-open", "");
    expect(charles).not.toHaveAttribute("data-side");
    expect(charles).not.toHaveAttribute("style");
    container.remove();
  });

  it("adopts the server's elements without warnings, and shows a defaultOpen card, placed", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = screen.getByRole("link", { name: "Ada" });
    const serverCharles = screen.getByTestId("charles");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <PreviewCardFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Ada" })).toBe(serverTrigger);
    const charles = screen.getByTestId("charles");
    expect(charles).toBe(serverCharles);
    expect(charles.matches(":popover-open")).toBe(true);
    await vi.waitFor(() =>
      expect(charles).toHaveAttribute("data-side", "bottom"),
    );
  });

  it.skipIf(isJSDOM)(
    "opens on hover and on keyboard focus after hydration",
    async () => {
      await movePointer([away]);
      const container = await renderOnServer(fixture);
      await render(() => <PreviewCardFixture />, { hydrate: container });
      const trigger = screen.getByRole("link", { name: "Ada" });
      const ada = screen.getByTestId("ada");
      await nextTask();

      await movePointer([centerOf(trigger)]);
      await afterFlush();
      expect(ada.matches(":popover-open")).toBe(true);
      // In steps, as a mouse moves, so it leaves the safe area.
      await movePointer(line(centerOf(trigger), away));
      await nextTask();
      expect(ada.matches(":popover-open")).toBe(false);

      screen.getByRole("button", { name: "Before" }).focus();
      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(trigger);
      expect(ada.matches(":popover-open")).toBe(true);
    },
  );
});
