import { flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import { stubPopover } from "../popover/stubPopover.ts";
import ToastFixture, { toasts } from "./ToastFixture.tsx";

const fixture = "/test/toast/ToastFixture.tsx";

// Not by its name: an element that is not displayed has none to a query,
// and the Region is shown only once hydrated.
const region = () => screen.getByRole("region", { hidden: true });

describe("<Toast.Region /> hydration", () => {
  const { render } = createRenderer();
  stubPopover();
  afterEach(() => {
    toasts.remove();
    flush();
    vi.restoreAllMocks();
  });

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the Region, not shown, and no toast in the server HTML, though the module added one", async () => {
    const container = await renderOnServer(fixture);
    expect(region().tagName).toBe("DIV");
    expect(region()).toHaveAttribute("aria-label", "Notifications");
    expect(region()).toHaveAttribute("popover", "manual");
    expect(region()).toHaveAttribute("aria-live", "polite");
    expect(region()).toHaveAttribute("tabindex", "-1");
    expect(region().matches(":popover-open")).toBe(false);
    expect(region().children).toHaveLength(0);
    expect(container).not.toHaveTextContent("Added by the module");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's Region without warnings, shows it, and renders a toast added after", async () => {
    // The client's copy of the module added its toast too; the server's
    // HTML has none, so the list is emptied to match it.
    toasts.remove();
    flush();
    const container = await renderOnServer(fixture);
    const serverRegion = region();
    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");

    await render(() => <ToastFixture />, { hydrate: container });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(region()).toBe(serverRegion);
    expect(region().matches(":popover-open")).toBe(true);

    toasts.add({ id: "saved", title: "Saved", duration: Infinity });
    flush();
    expect(screen.getByTestId("saved")).toHaveTextContent("Saved");
    expect(region()).toContainElement(screen.getByTestId("saved"));
  });
});
