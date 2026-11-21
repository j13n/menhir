import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import ProgressFixture from "./ProgressFixture.tsx";

const fixture = "/test/progress/ProgressFixture.tsx";

describe("<Progress.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("carries its role, value and state in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const upload = container.querySelector<HTMLElement>("#upload")!;
    expect(upload).toHaveAttribute("role", "progressbar");
    expect(upload).toHaveAttribute("aria-valuemin", "0");
    expect(upload).toHaveAttribute("aria-valuemax", "200");
    expect(upload).toHaveAttribute("aria-valuenow", "50");
    expect(upload).toHaveAttribute("aria-valuetext", "25%");
    expect(upload).toHaveAttribute("data-progressing", "");
    expect(upload.style.getPropertyValue("--progress")).toBe("25%");
    expect(container.querySelector("#upload-value")).toHaveTextContent(/^25%$/);
    expect(container.querySelector("#upload-indicator")).toHaveAttribute(
      "data-progressing",
      "",
    );

    const loading = container.querySelector<HTMLElement>("#loading")!;
    expect(loading).toHaveAttribute("role", "progressbar");
    expect(loading).not.toHaveAttribute("aria-valuenow");
    expect(loading).not.toHaveAttribute("aria-valuetext");
    expect(loading).toHaveAttribute("data-indeterminate", "");
    expect(loading.style.getPropertyValue("--progress")).toBe("");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and follows value afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverUpload = container.querySelector("#upload");
    const serverValue = container.querySelector("#upload-value");
    const serverIndicator = container.querySelector("#upload-indicator");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <ProgressFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();

    const upload = container.querySelector<HTMLElement>("#upload")!;
    expect(upload).toBe(serverUpload);
    const value = container.querySelector("#upload-value")!;
    expect(value).toBe(serverValue);
    const indicator = container.querySelector("#upload-indicator")!;
    expect(indicator).toBe(serverIndicator);

    const [finish, restart] = container.querySelectorAll("button");
    await user.click(finish!);
    expect(upload).toHaveAttribute("aria-valuenow", "200");
    expect(upload).toHaveAttribute("aria-valuetext", "100%");
    expect(upload.style.getPropertyValue("--progress")).toBe("100%");
    expect(value).toHaveTextContent(/^100%$/);
    expect(indicator).toHaveAttribute("data-complete", "");

    await user.click(restart!);
    expect(upload).not.toHaveAttribute("aria-valuenow");
    expect(upload.style.getPropertyValue("--progress")).toBe("");
    expect(value).toBeEmptyDOMElement();
    expect(indicator).toHaveAttribute("data-indeterminate", "");
  });
});
