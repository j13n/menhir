import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { keyboard, nextTask } from "../floating/input.ts";
import { stubPopover } from "../popover/stubPopover.ts";
import MenuFixture from "./MenuFixture.tsx";

const fixture = "/test/menu/MenuFixture.tsx";
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });

describe("<Menu.Root /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Trigger and a hidden Popup, linked by ids, with no item active", async () => {
    const container = await renderOnServer(fixture);
    const trigger = screen.getByRole("button", { name: "Edit" });
    const edit = screen.getByTestId("edit");

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(edit.id).not.toBe("");
    expect(trigger).toHaveAttribute("popovertarget", edit.id);
    expect(edit).toHaveAttribute("role", "menu");
    expect(edit).toHaveAttribute("popover", "auto");
    expect(edit).toHaveAttribute("aria-labelledby", trigger.id);
    expect(edit.matches(":popover-open")).toBe(false);
    expect(container.querySelector("[data-active]")).toBeNull();
    expect(container.querySelector('[tabindex="0"]')).toBeNull();
    // A GroupLabel registers once mounted, so the server names none.
    expect(container.querySelector('[role="group"]')).not.toHaveAttribute(
      "aria-labelledby",
    );
    expect(screen.getByTestId("share")).toHaveAttribute(
      "aria-labelledby",
      item("Share").id,
    );
    container.remove();
  });

  it("renders a defaultOpen Menu closed, with data-open", async () => {
    const container = await renderOnServer(fixture);
    const view = screen.getByTestId("view");

    expect(view.matches(":popover-open")).toBe(false);
    expect(view).toHaveAttribute("data-open", "");
    container.remove();
  });

  it("adopts the server's elements without warnings, and opens a defaultOpen Menu with focus on its first item", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = screen.getByRole("button", { name: "Edit" });
    const serverView = screen.getByTestId("view");

    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <MenuFixture />, { hydrate: container });
    await nextTask();

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Edit" })).toBe(serverTrigger);
    expect(screen.getByTestId("view")).toBe(serverView);
    expect(serverView.matches(":popover-open")).toBe(true);
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(item("Zoom in")),
    );
  });

  it.skipIf(isJSDOM)(
    "opens by click and by Enter after hydration",
    async () => {
      const container = await renderOnServer(fixture);
      const { user } = await render(() => <MenuFixture />, {
        hydrate: container,
      });
      const edit = screen.getByTestId("edit");
      const trigger = screen.getByRole("button", { name: "Edit" });
      await nextTask();

      await user.click(trigger);
      await nextTask();
      expect(edit.matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();
      expect(edit.matches(":popover-open")).toBe(false);
      expect(document.activeElement).toBe(trigger);

      await keyboard("{Enter}");
      await nextTask();
      expect(edit.matches(":popover-open")).toBe(true);
      expect(document.activeElement).toBe(item("Copy"));
    },
  );
});
