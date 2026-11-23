import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  isJSDOM,
  renderOnServer,
  screen,
} from "#test-utils";

import { centerOf, movePointer, nextTask } from "../floating/input.ts";
import NavigationMenuFixture from "./NavigationMenuFixture.tsx";

const fixture = "/test/navigation-menu/NavigationMenuFixture.tsx";

const button = (name: string) => screen.getByRole("button", { name });
const link = (name: string) => screen.getByRole("link", { name, hidden: true });
const panelOf = (trigger: HTMLElement) =>
  document.getElementById(trigger.getAttribute("aria-controls")!)!;

describe("<NavigationMenu.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the modules: one that read `document` or
  // `window` there would fail it.
  it("renders the nav, the Triggers naming hidden Panels, and their links in the server HTML", async () => {
    const container = await renderOnServer(fixture);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const products = button("Products");
    const panel = panelOf(products);

    expect(nav.tagName).toBe("NAV");
    expect(products).toHaveAttribute("type", "button");
    expect(products).toHaveAttribute("aria-expanded", "false");
    expect(products).not.toHaveAttribute("aria-haspopup");
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("data-closed", "");
    expect(panel).toContainElement(link("Switch"));
    expect(link("Switch")).toHaveAttribute("href", "#switch");
    expect(panelOf(button("Docs")).id).not.toBe(panel.id);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("renders a defaultValue Panel shown in the server HTML", async () => {
    const container = await renderOnServer(fixture);
    const help = button("Help");

    expect(help).toHaveAttribute("aria-expanded", "true");
    expect(panelOf(help)).not.toHaveAttribute("hidden");
    expect(panelOf(help)).toHaveAttribute("data-open", "");
    expect(screen.getByRole("link", { name: "Contact" })).toBeVisible();
    container.remove();
  });

  it("adopts the server's elements and ids, and opens Panels by click and by key afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverTrigger = button("Products");
    const serverIds = [...container.querySelectorAll("[id]")].map(
      (element) => element.id,
    );

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <NavigationMenuFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const products = button("Products");
    expect(products).toBe(serverTrigger);
    expect([...container.querySelectorAll("[id]")].map((e) => e.id)).toEqual(
      serverIds,
    );
    expect(button("Help")).toHaveAttribute("aria-expanded", "true");

    await user.click(products);
    expect(products).toHaveAttribute("aria-expanded", "true");
    expect(panelOf(products)).not.toHaveAttribute("hidden");

    await user.keyboard("[Enter]");
    expect(products).toHaveAttribute("aria-expanded", "false");
    expect(panelOf(products)).toHaveAttribute("hidden");

    const docs = button("Docs");
    docs.focus();
    await user.keyboard("[Enter]");
    expect(docs).toHaveAttribute("aria-expanded", "true");
    expect(panelOf(docs)).not.toHaveAttribute("hidden");

    await user.keyboard("[Space]");
    expect(docs).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("[Space]");
    expect(docs).toHaveAttribute("aria-expanded", "true");
  });

  it.skipIf(isJSDOM)("opens a Panel on hover after hydration", async () => {
    await movePointer([{ x: 380, y: 400 }]);
    const container = await renderOnServer(fixture);
    await render(() => <NavigationMenuFixture />, { hydrate: container });
    const products = button("Products");
    await nextTask();

    await movePointer([centerOf(products)]);
    // The default delay, 300 ms.
    await new Promise((resolve) => setTimeout(resolve, 350));
    await afterFlush();

    expect(products).toHaveAttribute("aria-expanded", "true");
    expect(panelOf(products)).not.toHaveAttribute("hidden");
  });
});
