import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, screen } from "#test-utils";

import { Toggle } from "../../test/core/Toggle.tsx";

describe("createControllableSignal", () => {
  const { render } = createRenderer();

  describe("uncontrolled", () => {
    it("starts at the default, changes when set and reports the change", async () => {
      const onPressedChange = vi.fn();
      const { user } = await render(() => (
        <Toggle defaultPressed onPressedChange={onPressedChange} />
      ));
      const button = screen.getByRole("button", { name: "Toggle" });
      expect(button).toHaveAttribute("aria-pressed", "true");

      await user.click(button);

      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(onPressedChange.mock.calls).toEqual([[false]]);
    });

    it("reads the default once", async () => {
      const [defaultPressed, setDefaultPressed] = createSignal(false);
      await render(() => <Toggle defaultPressed={defaultPressed()} />);

      setDefaultPressed(true);
      flush();

      expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("controlled", () => {
    it("follows the prop and only reports a set", async () => {
      const onPressedChange = vi.fn();
      const [pressed, setPressed] = createSignal(false);
      const { user } = await render(() => (
        <Toggle pressed={pressed()} onPressedChange={onPressedChange} />
      ));
      const button = screen.getByRole("button", { name: "Toggle" });

      await user.click(button);
      expect(onPressedChange.mock.calls).toEqual([[true]]);
      expect(button).toHaveAttribute("aria-pressed", "false");

      // The consumer ignored the change, so the next click asks again.
      await user.click(button);
      expect(onPressedChange.mock.calls).toEqual([[true], [true]]);

      setPressed(true);
      flush();
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  // Reads lag writes until the next flush, so the second set must not be
  // compared with the value from before the first.
  it.each(["uncontrolled", "controlled"])(
    "applies and reports two sets in one handler (%s)",
    async (mode) => {
      const [pressed, setPressed] = createSignal(false);
      const onPressedChange = vi.fn((value: boolean) => setPressed(value));
      const { user } = await render(() =>
        mode === "controlled" ? (
          <Toggle pressed={pressed()} onPressedChange={onPressedChange} />
        ) : (
          <Toggle onPressedChange={onPressedChange} />
        ),
      );

      await user.click(
        screen.getByRole("button", { name: "Press and release" }),
      );

      expect(onPressedChange.mock.calls).toEqual([[true], [false]]);
      expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    },
  );

  // A switch is usually a bug in the consumer, so development builds warn,
  // as Base UI and React's own inputs do. The value still falls back.
  describe("switching between controlled and uncontrolled", () => {
    afterEach(() => vi.restoreAllMocks());

    it.each([
      {
        from: "controlled",
        start: false as boolean | undefined,
        next: undefined,
      },
      { from: "uncontrolled", start: undefined, next: true },
    ])(
      "warns in development when switching from $from",
      async ({ start, next }) => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const [pressed, setPressed] = createSignal<boolean | undefined>(start);
        await render(() => <Toggle pressed={pressed()} />);
        expect(warn).not.toHaveBeenCalled();

        setPressed(next);
        flush();

        expect(warn).toHaveBeenCalledOnce();
        expect(String(warn.mock.calls[0]?.[0])).toMatch(/controlled/);
      },
    );

    it("does not warn while the mode stays the same", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const [pressed, setPressed] = createSignal(false);
      await render(() => <Toggle pressed={pressed()} />);

      setPressed(true);
      flush();

      expect(warn).not.toHaveBeenCalled();
    });
  });

  it.each([
    { mode: "uncontrolled", props: { defaultPressed: true } },
    { mode: "controlled", props: { pressed: true } },
  ])("does not report setting the current value ($mode)", async ({ props }) => {
    const onPressedChange = vi.fn();
    const { user } = await render(() => (
      <Toggle {...props} onPressedChange={onPressedChange} />
    ));

    await user.click(screen.getByRole("button", { name: "Press" }));

    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
