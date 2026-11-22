// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  keyboard,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Popover } from "../index.ts";

const popup = () => screen.getByRole("dialog", { hidden: true });
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("button", { name: "Notifications" });

function Notifications(props: { trigger?: JSX.Element }) {
  return (
    <Popover.Root>
      {props.trigger ?? <Popover.Trigger>Notifications</Popover.Trigger>}
      <Popover.Popup aria-label="Notifications">
        <Popover.Close>Close</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  );
}

describeConformance(
  "<Popover.Trigger />",
  (props) => (
    <Popover.Root>
      <Popover.Trigger {...props} />
    </Popover.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Popover.Trigger />", () => {
  const { render } = createRenderer();
  stubPopover();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button with aria-haspopup, popovertarget and aria-controls naming the Popup", async () => {
    await render(() => <Notifications />);

    expect(trigger()).toHaveAttribute("type", "button");
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(popup().id).not.toBe("");
    expect(trigger()).toHaveAttribute("popovertarget", popup().id);
    expect(trigger()).toHaveAttribute("aria-controls", popup().id);
  });

  it("has aria-expanded false while closed and true while open", async () => {
    const { user } = await render(() => <Notifications />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger());
    await afterFlush();

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("is named by its content, and takes the consumer's id", async () => {
    await render(() => (
      <Notifications
        trigger={<Popover.Trigger id="bell">Notifications</Popover.Trigger>}
      />
    ));

    expect(trigger()).toHaveAccessibleName("Notifications");
    expect(trigger()).toHaveAttribute("id", "bell");
  });

  it("opens the popover on click", async () => {
    const { user } = await render(() => <Notifications />);

    await user.click(trigger());
    await afterFlush();

    expect(shown()).toBe(true);
  });

  it.skipIf(isJSDOM).each(["{Enter}", " "])(
    "opens the popover with %j while focused",
    async (key) => {
      await render(() => <Notifications />);

      trigger().focus();
      await keyboard(key);
      await nextTask();

      expect(shown()).toBe(true);
      expect(document.activeElement).toBe(trigger());
    },
  );

  it.skipIf(isJSDOM)(
    "closes the open popover on a press, without opening it again",
    async () => {
      const onToggle = vi.fn();
      await render(() => <Notifications />);
      popup().addEventListener("toggle", onToggle);

      await press(centerOf(trigger()));
      await nextTask();
      expect(shown()).toBe(true);

      await press(centerOf(trigger()));
      await nextTask();

      expect(shown()).toBe(false);
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
      // Shown once and hidden once: neither the browser's light dismiss
      // nor its `popovertarget` toggled it as well.
      expect(onToggle).toHaveBeenCalledTimes(2);
    },
  );

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form onSubmit={onSubmit}>
        <Notifications />
      </form>
    ));

    await user.click(trigger());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    const { user } = await render(() => (
      <Notifications
        trigger={
          <Popover.Trigger onClick={onClick}>Notifications</Popover.Trigger>
        }
      />
    ));

    await user.click(trigger());

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps its behaviour when render renders a button component", async () => {
    const Button = (props: JSX.HTMLAttributes<HTMLButtonElement>) => (
      <button class="button" {...props} />
    );
    const { user } = await render(() => (
      <Notifications
        trigger={
          <Popover.Trigger render={Button}>Notifications</Popover.Trigger>
        }
      />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(trigger()).toHaveClass("button");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(shown()).toBe(true);
  });

  it("warns in development when render does not render a <button>", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <Notifications
        trigger={
          <Popover.Trigger render={(props) => <span {...props} />}>
            Notifications
          </Popover.Trigger>
        }
      />
    ));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("Popover.Trigger");
  });

  it("throws a descriptive error outside <Popover.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Popover.Trigger>Notifications</Popover.Trigger>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Popover parts must be placed within <Popover.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
