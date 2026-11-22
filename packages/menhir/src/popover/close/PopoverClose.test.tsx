// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  fireEvent,
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
const close = () => screen.getByRole("button", { name: "Close", hidden: true });

function Notifications(props: { defaultOpen?: boolean; close?: JSX.Element }) {
  return (
    <Popover.Root defaultOpen={props.defaultOpen}>
      <Popover.Trigger>Notifications</Popover.Trigger>
      <Popover.Popup aria-label="Notifications">
        {props.close ?? <Popover.Close>Close</Popover.Close>}
      </Popover.Popup>
    </Popover.Root>
  );
}

describeConformance(
  "<Popover.Close />",
  (props) => (
    <Popover.Root>
      <Popover.Close {...props} />
    </Popover.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Popover.Close />", () => {
  const { render } = createRenderer();
  stubPopover();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button, named by its content", async () => {
    await render(() => <Notifications defaultOpen />);

    expect(close()).toHaveAttribute("type", "button");
    expect(close()).toHaveAccessibleName("Close");
  });

  it("closes the popover on click", async () => {
    const { user } = await render(() => <Notifications defaultOpen />);

    await user.click(close());

    await vi.waitFor(() => expect(shown()).toBe(false));
  });

  it.skipIf(isJSDOM).each(["{Enter}", " "])(
    "closes the popover with %j while focused, and focus returns to the Trigger",
    async (key) => {
      await render(() => <Notifications />);
      await press(centerOf(trigger()));
      await nextTask();

      close().focus();
      await keyboard(key);
      await nextTask();

      expect(shown()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    },
  );

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <Notifications
        defaultOpen
        close={
          <form onSubmit={onSubmit}>
            <Popover.Close>Close</Popover.Close>
          </form>
        }
      />
    ));

    await user.click(close());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    await render(() => (
      <Notifications
        close={<Popover.Close onClick={onClick}>Close</Popover.Close>}
      />
    ));

    fireEvent.click(close());

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <Notifications
        close={
          <Popover.Close render={(props) => <div {...props} />}>
            Close
          </Popover.Close>
        }
      />
    ));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("Popover.Close");
  });

  it("throws a descriptive error outside <Popover.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Popover.Close>Close</Popover.Close>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Popover parts must be placed within <Popover.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
