// The test list is in src/avatar/README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  fireEvent,
  isJSDOM,
  renderOnServer,
} from "#test-utils";

import AvatarBrokenFixture from "./AvatarBrokenFixture.tsx";
import AvatarFixture, { picture } from "./AvatarFixture.tsx";

const fixture = "/test/avatar/AvatarFixture.tsx";
const brokenFixture = "/test/avatar/AvatarBrokenFixture.tsx";

/** Resolves on the server image's own `load` or `error`, before hydration. */
function settled(container: HTMLElement) {
  const image = container.querySelector("img")!;
  return new Promise<string>((resolve) => {
    image.addEventListener("load", () => resolve("load"), { once: true });
    image.addEventListener("error", () => resolve("error"), { once: true });
  });
}

describe("<Avatar.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("holds the img and the Fallback beneath it, and the Fallback alone without a src, in the server HTML", async () => {
    const container = await renderOnServer(fixture);

    const image = container.querySelector("#jane-image")!;
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute("src", picture);
    expect(image).toHaveAttribute("alt", "Jane Doe");
    expect(image).toHaveAttribute("data-loading", "");
    expect(container.querySelector("#jane-fallback")).toHaveTextContent("JD");
    // Root and Fallback learn the status once the Image is mounted (README).
    expect(container.querySelector("#jane")).toHaveAttribute("data-idle", "");

    const john = container.querySelector("#john")!;
    expect(john.querySelector("img")).toBeNull();
    expect(container.querySelector("#john-fallback")).toHaveAttribute(
      "data-idle",
      "",
    );
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements and follows the picture afterwards", async () => {
    const container = await renderOnServer(fixture);
    const serverImage = container.querySelector("#jane-image");
    const serverFallback = container.querySelector("#john-fallback");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <AvatarFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector("#jane-image")).toBe(serverImage);
    expect(container.querySelector("#john-fallback")).toBe(serverFallback);

    const jane = container.querySelector("#jane")!;
    // jsdom loads no images: fire the event a browser fires.
    if (isJSDOM) fireEvent.load(serverImage!);
    await expect.poll(() => jane.hasAttribute("data-loaded")).toBe(true);
    expect(container.querySelector("#jane-fallback")).toBeNull();

    await user.click(container.querySelector("button")!);
    if (isJSDOM) {
      // A browser fails the new picture before this line could look.
      expect(jane).toHaveAttribute("data-loading", "");
      fireEvent.error(serverImage!);
    }
    await expect.poll(() => jane.hasAttribute("data-error")).toBe(true);
    expect(jane.querySelector("img")).toBeNull();
    expect(container.querySelector("#jane-fallback")).toHaveAccessibleName(
      "Jane Doe",
    );
  });

  it.skipIf(isJSDOM)(
    "is loaded once hydrated when the picture loaded before, and removes the Fallback",
    async () => {
      const container = await renderOnServer(fixture);
      expect(await settled(container)).toBe("load");

      await render(() => <AvatarFixture />, { hydrate: container });
      await afterFlush();

      const jane = container.querySelector("#jane")!;
      expect(jane).toHaveAttribute("data-loaded", "");
      expect(container.querySelector("#jane-image")).toHaveAttribute(
        "data-loaded",
        "",
      );
      expect(container.querySelector("#jane-fallback")).toBeNull();
    },
  );

  it.skipIf(isJSDOM)(
    "is an error once hydrated when the picture failed before: the img goes and the Fallback stays",
    async () => {
      const container = await renderOnServer(brokenFixture);
      expect(await settled(container)).toBe("error");

      await render(() => <AvatarBrokenFixture />, { hydrate: container });
      await afterFlush();

      const jane = container.querySelector("#jane")!;
      expect(jane).toHaveAttribute("data-error", "");
      expect(jane.querySelector("img")).toBeNull();
      expect(container.querySelector("#jane-fallback")).toHaveAttribute(
        "data-error",
        "",
      );
    },
  );
});
