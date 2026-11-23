import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  fireEvent,
  isJSDOM,
  renderOnServer,
  screen,
} from "#test-utils";

import { keyboard, menuKey, nextTask } from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import ContextMenuFixture from "./ContextMenuFixture.tsx";

const fixture = "/test/context-menu/ContextMenuFixture.tsx";
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });

describe("<ContextMenu.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Trigger and a hidden Popup, with no item active", async () => {
    const container = await renderOnServer(fixture);
    const files = screen.getByTestId("files");
    const file = screen.getByTestId("file");

    expect(files.tagName).toBe("DIV");
    expect(files).toHaveAttribute("data-closed", "");
    expect(files).not.toHaveAttribute("role");
    expect(file).toHaveAttribute("role", "menu");
    expect(file).toHaveAttribute("popover", "auto");
    expect(file).toHaveAttribute("aria-label", "File");
    expect(file).not.toHaveAttribute("aria-labelledby");
    expect(file.matches(":popover-open")).toBe(false);
    expect(container.querySelector("[data-active]")).toBeNull();
    expect(screen.getByTestId("share")).toHaveAttribute(
      "aria-labelledby",
      item("Share").id,
    );
    container.remove();
  });

  it("renders a defaultOpen Context Menu closed, with data-open", async () => {
    const container = await renderOnServer(fixture);
    const view = screen.getByTestId("view");

    expect(view.matches(":popover-open")).toBe(false);
    expect(view).toHaveAttribute("data-open", "");
    expect(screen.getByTestId("canvas")).toHaveAttribute("data-open", "");
    container.remove();
  });

  it("adopts the server's elements without warnings, and opens a defaultOpen Context Menu with focus on its first item", async () => {
    const container = await renderOnServer(fixture);
    const serverFiles = screen.getByTestId("files");
    const serverView = screen.getByTestId("view");

    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <ContextMenuFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByTestId("files")).toBe(serverFiles);
    expect(screen.getByTestId("view")).toBe(serverView);
    expect(serverView.matches(":popover-open")).toBe(true);
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(item("Zoom in")),
    );
  });

  it("opens by a contextmenu after hydration", async () => {
    const container = await renderOnServer(fixture);
    await render(() => <ContextMenuFixture />, { hydrate: container });
    const file = screen.getByTestId("file");
    await nextTask();

    fireEvent.contextMenu(screen.getByTestId("files"));
    await nextTask();

    expect(file.matches(":popover-open")).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));
  });

  it.skipIf(isJSDOM)(
    "opens by the Menu key after hydration, and returns focus on Escape",
    async () => {
      const container = await renderOnServer(fixture);
      await render(() => <ContextMenuFixture />, { hydrate: container });
      const file = screen.getByTestId("file");
      const files = screen.getByTestId("files");
      await nextTask();
      // The defaultOpen menu holds focus: close it first.
      await keyboard("{Escape}");
      await nextTask();

      files.focus();
      await menuKey();
      await nextTask();
      expect(file.matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();
      expect(file.matches(":popover-open")).toBe(false);
      expect(document.activeElement).toBe(files);
    },
  );
});
