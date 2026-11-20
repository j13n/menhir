import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer } from "#test-utils";

import ToggleFixture from "./ToggleFixture.tsx";

describe("createControllableSignal hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it.each(["uncontrolled", "controlled"])(
    "renders the value on the server and changes it after hydration (%s)",
    async (mode) => {
      const container = await renderOnServer("/test/core/ToggleFixture.tsx");
      const serverButton = container.querySelector<HTMLElement>(
        `[data-testid=${mode}] [aria-label=Toggle]`,
      )!;
      expect(serverButton).toHaveAttribute("aria-pressed", "true");

      // A hydration mismatch is reported on the console, not thrown.
      const warn = vi.spyOn(console, "warn");
      const error = vi.spyOn(console, "error");
      const { user } = await render(() => <ToggleFixture />, {
        hydrate: container,
      });
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      const button = container.querySelector<HTMLElement>(
        `[data-testid=${mode}] [aria-label=Toggle]`,
      )!;
      expect(button).toBe(serverButton);
      await user.click(button);
      expect(button).toHaveAttribute("aria-pressed", "false");
    },
  );
});
