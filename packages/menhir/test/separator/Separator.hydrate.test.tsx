import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import SeparatorFixture from "./SeparatorFixture.tsx";

const fixture = "/test/separator/SeparatorFixture.tsx";

describe("<Separator.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("carries its role and orientation in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const sections = container.querySelector("#sections");
    expect(sections).toHaveAttribute("role", "separator");
    expect(sections).toHaveAttribute("aria-orientation", "horizontal");
    expect(sections).toHaveAttribute("data-horizontal", "");
    expect(sections).not.toHaveAttribute("data-vertical");
    const sideBySide = container.querySelector("#side-by-side");
    expect(sideBySide).toHaveAttribute("role", "separator");
    expect(sideBySide).toHaveAttribute("aria-orientation", "vertical");
    expect(sideBySide).toHaveAttribute("data-vertical", "");
    expect(sideBySide).not.toHaveAttribute("data-horizontal");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and follows orientation afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverSections = container.querySelector("#sections");
    const serverSideBySide = container.querySelector("#side-by-side");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <SeparatorFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    expect(container.querySelector("#sections")).toBe(serverSections);
    const sideBySide = container.querySelector("#side-by-side")!;
    expect(sideBySide).toBe(serverSideBySide);

    await user.click(container.querySelector("button")!);
    expect(sideBySide).toHaveAttribute("aria-orientation", "horizontal");
    expect(sideBySide).toHaveAttribute("data-horizontal", "");
    expect(sideBySide).not.toHaveAttribute("data-vertical");
  });
});
