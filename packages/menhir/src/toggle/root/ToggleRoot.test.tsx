// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import type { JSX } from "@solidjs/web";
import { Loading, createMemo, createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Toggle } from "../index.ts";

describeConformance("<Toggle.Root />", (props) => <Toggle.Root {...props} />, {
  tagName: "BUTTON",
});

describe("<Toggle.Root />", () => {
  const { render } = createRenderer();

  it("renders a button of type button", async () => {
    await render(() => <Toggle.Root>Bold</Toggle.Root>);

    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle).toHaveAttribute("type", "button");
  });

  it("is not pressed by default", async () => {
    await render(() => <Toggle.Root>Bold</Toggle.Root>);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("can be pressed by default", async () => {
    await render(() => <Toggle.Root defaultPressed>Bold</Toggle.Root>);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles on click and reports each new value", async () => {
    const onPressedChange = vi.fn();
    await render(() => (
      <Toggle.Root onPressedChange={onPressedChange}>Bold</Toggle.Root>
    ));

    const toggle = screen.getByRole("button");
    expect(onPressedChange).not.toHaveBeenCalled();

    fireEvent.click(toggle);
    await afterFlush();
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(toggle);
    await afterFlush();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles off when pressed by default", async () => {
    const onPressedChange = vi.fn();
    await render(() => (
      <Toggle.Root defaultPressed onPressedChange={onPressedChange}>
        Bold
      </Toggle.Root>
    ));

    const toggle = screen.getByRole("button");
    fireEvent.click(toggle);
    await afterFlush();

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenCalledWith(false);
  });

  it.each([true, false])(
    "stays put when controlled (pressed=%s) and asks for the change",
    async (pressed) => {
      const onPressedChange = vi.fn();
      await render(() => (
        <Toggle.Root pressed={pressed} onPressedChange={onPressedChange}>
          Bold
        </Toggle.Root>
      ));

      const toggle = screen.getByRole("button");
      fireEvent.click(toggle);
      await afterFlush();

      expect(onPressedChange).toHaveBeenCalledWith(!pressed);
      expect(toggle).toHaveAttribute("aria-pressed", String(pressed));
    },
  );

  it("follows a controlled value changed from outside", async () => {
    const [pressed, setPressed] = createSignal(false);
    await render(() => <Toggle.Root pressed={pressed()}>Bold</Toggle.Root>);

    const toggle = screen.getByRole("button");
    setPressed(true);
    flush();
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    setPressed(false);
    flush();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("turns on before async work that onPressedChange starts settles", async () => {
    const [bold, setBold] = createSignal(false);
    let resolveStatus!: (status: string) => void;
    await render(() => {
      const status = createMemo(() =>
        bold()
          ? new Promise<string>((resolve) => (resolveStatus = resolve))
          : "plain",
      );
      return (
        <Loading fallback="loading">
          <Toggle.Root onPressedChange={(pressed) => setBold(pressed)}>
            Bold
          </Toggle.Root>
          <output>{status()}</output>
        </Loading>
      );
    });

    const toggle = screen.getByRole("button");
    fireEvent.click(toggle);
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("plain");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    resolveStatus("bold");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("bold");
  });

  it.each([{ key: "Enter" }, { key: "Space" }])(
    "focuses with Tab, toggles with $key and keeps focus",
    async ({ key }) => {
      const { user } = await render(() => <Toggle.Root>Bold</Toggle.Root>);

      const toggle = screen.getByRole("button");
      await user.keyboard("[Tab]");
      expect(toggle).toHaveFocus();

      await user.keyboard(`[${key}]`);
      expect(toggle).toHaveAttribute("aria-pressed", "true");
      expect(toggle).toHaveFocus();

      await user.keyboard(`[${key}]`);
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    },
  );

  it("lets the consumer's attributes override its own", async () => {
    // `aria-pressed` is the only attribute of its own that a consumer can
    // type. This shows that the consumer's value wins, not that "mixed" is
    // supported (README, "Left out").
    await render(() => <Toggle.Root aria-pressed="mixed">Bold</Toggle.Root>);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "mixed");
  });

  describe("names", () => {
    it("is named by its content, which stays the same when pressed", async () => {
      await render(() => <Toggle.Root defaultPressed>Mute</Toggle.Root>);

      expect(
        screen.getByRole("button", { name: "Mute", pressed: true }),
      ).toBeInTheDocument();
    });

    it("takes the consumer's id", async () => {
      await render(() => <Toggle.Root id="bold">Bold</Toggle.Root>);

      expect(screen.getByRole("button")).toHaveAttribute("id", "bold");
    });

    it.each([
      ["aria-label", "Bold"],
      ["aria-labelledby", "bold-label"],
      ["aria-describedby", "bold-description"],
    ])("passes %s through", async (name, value) => {
      await render(() => <Toggle.Root {...{ [name]: value }} />);

      expect(screen.getByRole("button")).toHaveAttribute(name, value);
    });
  });

  describe("disabled", () => {
    it("disables the button natively", async () => {
      await render(() => <Toggle.Root disabled>Bold</Toggle.Root>);

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("has no disabled attribute when not disabled", async () => {
      await render(() => <Toggle.Root>Bold</Toggle.Root>);

      expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
    });

    it("cannot be focused or toggled", async () => {
      const onPressedChange = vi.fn();
      const { user } = await render(() => (
        <Toggle.Root disabled onPressedChange={onPressedChange}>
          Bold
        </Toggle.Root>
      ));

      const toggle = screen.getByRole("button");
      await user.keyboard("[Tab]");
      expect(toggle).not.toHaveFocus();

      await user.click(toggle);
      fireEvent.click(toggle);
      await afterFlush();

      expect(toggle).toHaveAttribute("aria-pressed", "false");
      expect(onPressedChange).not.toHaveBeenCalled();
    });

    it("follows disabled changing while rendered", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => <Toggle.Root disabled={disabled()}>Bold</Toggle.Root>);

      const toggle = screen.getByRole("button");
      setDisabled(true);
      flush();
      expect(toggle).toBeDisabled();
      fireEvent.click(toggle);
      await afterFlush();
      expect(toggle).toHaveAttribute("aria-pressed", "false");

      setDisabled(false);
      flush();
      fireEvent.click(toggle);
      await afterFlush();
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("puts its state in data attributes", async () => {
    const [disabled, setDisabled] = createSignal(true);
    await render(() => (
      <Toggle.Root defaultPressed disabled={disabled()}>
        Bold
      </Toggle.Root>
    ));

    const toggle = screen.getByRole("button");
    expect(toggle).toHaveAttribute("data-pressed", "");
    expect(toggle).not.toHaveAttribute("data-unpressed");
    expect(toggle).toHaveAttribute("data-disabled", "");

    setDisabled(false);
    flush();
    fireEvent.click(toggle);
    await afterFlush();

    expect(toggle).toHaveAttribute("data-unpressed", "");
    expect(toggle).not.toHaveAttribute("data-pressed");
    expect(toggle).not.toHaveAttribute("data-disabled");
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    await render(() => <Toggle.Root onClick={onClick}>Bold</Toggle.Root>);

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form onSubmit={onSubmit}>
        <Toggle.Root>Bold</Toggle.Root>
      </form>
    ));

    const toggle = screen.getByRole("button");
    await user.click(toggle);
    await user.keyboard("[Enter]");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  describe("render and element props", () => {
    function Button(props: JSX.IntrinsicElements["button"]) {
      return <button data-styled="" {...props} />;
    }

    it("keeps the toggle's behaviour when rendered with a button component", async () => {
      const { user } = await render(() => (
        <Toggle.Root render={Button}>Bold</Toggle.Root>
      ));

      const toggle = screen.getByRole("button");
      expect(toggle).toHaveAttribute("data-styled", "");
      await user.keyboard("[Tab]");
      await user.keyboard("[Space]");
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("warns in development when render does not render a button", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        await render(() => (
          <Toggle.Root render={(props) => <div {...props} />}>Bold</Toggle.Root>
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });

    it("does not warn when render renders a button", async () => {
      const warn = vi.spyOn(console, "warn");
      try {
        await render(() => <Toggle.Root render={Button}>Bold</Toggle.Root>);

        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });
  });
});
