// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { ToggleGroup } from "../index.ts";

describeConformance(
  "<ToggleGroup.Item />",
  (props) => (
    <ToggleGroup.Root aria-label="Format">
      <ToggleGroup.Item value="bold" {...props} />
    </ToggleGroup.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<ToggleGroup.Item />", () => {
  const { render } = createRenderer();

  it("renders a toggle button of type button", async () => {
    await render(() => (
      <ToggleGroup.Root aria-label="Format">
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const item = screen.getByRole("button", { name: "Bold", pressed: false });
    expect(item.tagName).toBe("BUTTON");
    expect(item).toHaveAttribute("type", "button");
  });

  it("passes aria-label through", async () => {
    await render(() => (
      <ToggleGroup.Root aria-label="Format">
        <ToggleGroup.Item value="bold" aria-label="Bold">
          B
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("puts its state in data attributes", async () => {
    await render(() => (
      <ToggleGroup.Root aria-label="Format" multiple defaultValue={["bold"]}>
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        <ToggleGroup.Item value="italic" disabled>
          Italic
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    expect(bold).toHaveAttribute("data-pressed", "");
    expect(bold).not.toHaveAttribute("data-unpressed");
    expect(bold).not.toHaveAttribute("data-disabled");
    expect(italic).toHaveAttribute("data-unpressed", "");
    expect(italic).not.toHaveAttribute("data-pressed");
    expect(italic).toHaveAttribute("data-disabled", "");
  });

  it("is natively disabled, and not pressed by a click, when disabled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <ToggleGroup.Root aria-label="Format" onValueChange={onValueChange}>
        <ToggleGroup.Item value="bold" disabled>
          Bold
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const item = screen.getByRole("button");
    expect(item).toBeDisabled();
    await user.click(item);
    fireEvent.click(item);
    await afterFlush();

    expect(item).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("calls the consumer's onClick, onKeyDown and onFocus with its own", async () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const { user } = await render(() => (
      <ToggleGroup.Root aria-label="Format">
        <ToggleGroup.Item
          value="bold"
          onClick={onClick}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        >
          Bold
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const bold = screen.getByRole("button", { name: "Bold" });
    await user.keyboard("[Tab]");
    expect(onFocus).toHaveBeenCalledTimes(1);

    await user.keyboard("[Space]");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(bold).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("[ArrowRight]");
    expect(onKeyDown).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus();
  });

  describe("render", () => {
    function Button(props: JSX.IntrinsicElements["button"]) {
      return <button data-styled="" {...props} />;
    }

    it("keeps the item's behaviour when rendered with a button component", async () => {
      const { user } = await render(() => (
        <ToggleGroup.Root aria-label="Format">
          <ToggleGroup.Item value="bold" render={Button}>
            Bold
          </ToggleGroup.Item>
          <ToggleGroup.Item value="italic" render={Button}>
            Italic
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      ));

      const bold = screen.getByRole("button", { name: "Bold" });
      expect(bold).toHaveAttribute("data-styled", "");
      await user.keyboard("[Tab][Space]");
      expect(bold).toHaveAttribute("aria-pressed", "true");
      await user.keyboard("[ArrowRight]");
      expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus();
    });

    it("warns in development when render does not render a button", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        await render(() => (
          <ToggleGroup.Root aria-label="Format">
            <ToggleGroup.Item
              value="bold"
              render={(props) => <div {...props} />}
            >
              Bold
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("ToggleGroup.Item");
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });
  });

  it("throws a descriptive error outside <ToggleGroup.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <ToggleGroup.Item value="bold" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] ToggleGroup parts must be placed within <ToggleGroup.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
