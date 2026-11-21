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

import { Collapsible } from "../index.ts";

describeConformance(
  "<Collapsible.Root />",
  (props) => <Collapsible.Root {...props} />,
  { tagName: "DIV" },
);

type RootProps = Parameters<typeof Collapsible.Root>[0];

// A Root with both parts.
function Details(props: RootProps & { children?: JSX.Element }) {
  return (
    <Collapsible.Root {...props}>
      <Collapsible.Trigger>Details</Collapsible.Trigger>
      <Collapsible.Panel>Content</Collapsible.Panel>
    </Collapsible.Root>
  );
}

describe("<Collapsible.Root />", () => {
  const { render } = createRenderer();
  const trigger = () => screen.getByRole("button", { name: "Details" });
  const panel = () => screen.getByText("Content");

  it("is closed by default", async () => {
    await render(() => <Details />);

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(panel()).not.toBeVisible();
  });

  it("starts open with defaultOpen", async () => {
    await render(() => <Details defaultOpen />);

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(panel()).toBeVisible();
  });

  it("opens and closes on click and reports each new value", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Details onOpenChange={onOpenChange} />);
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(trigger());
    await afterFlush();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(panel()).toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(trigger());
    await afterFlush();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(panel()).not.toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it.each([true, false])(
    "stays put when controlled (open=%s) and asks for the change",
    async (open) => {
      const onOpenChange = vi.fn();
      await render(() => <Details open={open} onOpenChange={onOpenChange} />);

      fireEvent.click(trigger());
      await afterFlush();

      expect(onOpenChange).toHaveBeenCalledWith(!open);
      expect(trigger()).toHaveAttribute("aria-expanded", String(open));
      expect(panel()).toHaveProperty("hidden", !open);
    },
  );

  it("follows a controlled value changed from outside", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Details open={open()} />);

    setOpen(true);
    flush();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(panel()).toBeVisible();

    setOpen(false);
    flush();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(panel()).not.toBeVisible();
  });

  it("opens before async work that onOpenChange starts settles", async () => {
    const [open, setOpen] = createSignal(false);
    let resolveDetails!: (details: string) => void;
    await render(() => {
      const details = createMemo(() =>
        open()
          ? new Promise<string>((resolve) => (resolveDetails = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <Details onOpenChange={(value) => setOpen(value)} />
          <output>{details()}</output>
        </Loading>
      );
    });

    fireEvent.click(trigger());
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(panel()).toBeVisible();

    resolveDetails("loaded");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });

  describe("disabled", () => {
    it("disables the Trigger natively, which cannot be focused or toggled", async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <Details disabled onOpenChange={onOpenChange} />
      ));

      expect(trigger()).toBeDisabled();
      await user.keyboard("[Tab]");
      expect(trigger()).not.toHaveFocus();

      await user.click(trigger());
      fireEvent.click(trigger());
      await afterFlush();

      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("has no disabled attribute when not disabled", async () => {
      await render(() => <Details />);

      expect(trigger()).not.toHaveAttribute("disabled");
    });

    it("keeps the Panel's state", async () => {
      await render(() => <Details defaultOpen disabled />);

      expect(panel()).toBeVisible();
    });

    it("follows disabled changing while rendered", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => <Details disabled={disabled()} />);

      setDisabled(true);
      flush();
      expect(trigger()).toBeDisabled();
      fireEvent.click(trigger());
      await afterFlush();
      expect(trigger()).toHaveAttribute("aria-expanded", "false");

      setDisabled(false);
      flush();
      fireEvent.click(trigger());
      await afterFlush();
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("puts its state in data attributes on every part", async () => {
    const [disabled, setDisabled] = createSignal(true);
    await render(() => (
      <Details data-testid="root" defaultOpen disabled={disabled()} />
    ));

    const parts = [screen.getByTestId("root"), trigger(), panel()];
    for (const part of parts) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
      expect(part).toHaveAttribute("data-disabled", "");
    }

    setDisabled(false);
    flush();
    fireEvent.click(trigger());
    await afterFlush();

    for (const part of parts) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
      expect(part).not.toHaveAttribute("data-disabled");
    }
  });
});
