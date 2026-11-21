import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import MeterFixture from "./MeterFixture.tsx";

const fixture = "/test/meter/MeterFixture.tsx";

describe("<Meter.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("carries its role and value in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const storage = container.querySelector<HTMLElement>("#storage")!;
    expect(storage).toHaveAttribute("role", "meter");
    expect(storage).toHaveAttribute("aria-valuemin", "0");
    expect(storage).toHaveAttribute("aria-valuemax", "200");
    expect(storage).toHaveAttribute("aria-valuenow", "50");
    expect(storage).toHaveAttribute("aria-valuetext", "25%");
    expect(storage.style.getPropertyValue("--meter")).toBe("25%");
    expect(container.querySelector("#storage-value")).toHaveTextContent(
      /^25%$/,
    );
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and follows value afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverStorage = container.querySelector("#storage");
    const serverValue = container.querySelector("#storage-value");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <MeterFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const storage = container.querySelector<HTMLElement>("#storage")!;
    expect(storage).toBe(serverStorage);
    const value = container.querySelector("#storage-value")!;
    expect(value).toBe(serverValue);

    await user.click(container.querySelector("button")!);
    expect(storage).toHaveAttribute("aria-valuenow", "150");
    expect(storage).toHaveAttribute("aria-valuetext", "75%");
    expect(storage.style.getPropertyValue("--meter")).toBe("75%");
    expect(value).toHaveTextContent(/^75%$/);
  });
});
