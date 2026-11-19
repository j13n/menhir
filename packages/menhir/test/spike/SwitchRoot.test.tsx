// Ported from Base UI v1.9.0, packages/react/src/switch/root/SwitchRoot.test.tsx
// ("can be activated with $key key"). Base UI is MIT licensed; its notice is
// in LICENSE. Spike for #5: runs against a throwaway Switch until #15.
import { describe, expect, it } from "vitest";

import { createRenderer, screen } from "#test-utils";

import { Switch } from "../../src/switch/index.ts";

describe("<Switch.Root />", () => {
  const { render } = createRenderer();

  describe("interactions", () => {
    it.each([{ key: "Enter" }, { key: "Space" }])(
      "can be activated with $key key",
      async ({ key }) => {
        const { user } = await render(() => <Switch.Root />);

        const switchEl = screen.getByRole("switch");
        expect(switchEl).toHaveAttribute("aria-checked", "false");

        await user.keyboard("[Tab]");
        expect(switchEl).toHaveFocus();

        await user.keyboard(`[${key}]`);
        expect(switchEl).toHaveAttribute("aria-checked", "true");
      },
    );
  });
});
