import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import { activeLabel, item, pressOn } from "../list-navigation/helpers.ts";
import TypeaheadFixture from "./TypeaheadFixture.tsx";

const fixture = "/test/floating/typeahead/TypeaheadFixture.tsx";

describe("typeahead hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  // The server render runs the module: one that read `document` or
  // `window` there, or made its collator at import time, would fail it.
  it("renders no active item on the server", async () => {
    const container = await renderOnServer(fixture);

    expect(container.querySelectorAll("[role=menuitem]")).toHaveLength(3);
    expect(container.querySelectorAll("[role=option]")).toHaveLength(4);
    expect(container.querySelector("[data-active]")).toBeNull();
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and typing works afterwards", async () => {
    // jsdom has no scrolling: list navigation's scroll into view is a no-op.
    Element.prototype.scrollIntoView ??= () => {};
    const container = await renderOnServer(fixture);
    const serverItem = container.querySelector("[role=menuitem]");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <TypeaheadFixture />, { hydrate: container });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(item("Kiwi")).toBe(serverItem);

    await pressOn(item("Kiwi"), "m");
    expect(activeLabel()).toBe("Mango");

    // The menu's Mango stays active, so the select's is read from its
    // trigger.
    const trigger = screen.getByRole("combobox");
    await pressOn(trigger, "c");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-activedescendant", item("Cherry").id);
  });
});
