// Spike for #6: render to a string on the server, then hydrate. Runs against
// the throwaway Switch until #15.
import { describe, expect, it } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import SwitchFixture from "./SwitchFixture.tsx";

describe("<Switch.Root /> hydration", () => {
  const { render } = createRenderer();

  it("hydrates the server-rendered element and responds to keys", async () => {
    const container = await renderOnServer("/test/spike/SwitchFixture.tsx");
    const serverElement = container.querySelector("[role=switch]");
    expect(serverElement).not.toBeNull();

    const { user } = await render(() => <SwitchFixture />, {
      hydrate: container,
    });

    const switchEl = screen.getByRole("switch");
    // Hydration adopts the server's element. A client render would replace it.
    expect(switchEl).toBe(serverElement);
    expect(switchEl).toHaveAttribute("aria-checked", "false");

    await user.keyboard("[Tab]");
    await user.keyboard("[Enter]");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });
});
