// The test list and the cases left out are in ./README.md. A Tooltip next
// to the popups that open above or around it (#26, "Left out").
import { beforeEach, describe, expect, it } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../dialog/index.ts";
import { Popover } from "../popover/index.ts";
import {
  centerOf,
  keyboard,
  movePointer,
  nextTask,
  press,
} from "../../test/floating/input.ts";
import { Tooltip } from "./index.ts";

const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
const tooltip = () => screen.getByRole("tooltip", { hidden: true });
const tooltipShown = () => tooltip().matches(":popover-open");
/** A point that the tests' elements never cover. */
const away = { x: 380, y: 400 };

/** Opens the tooltip on the Trigger named "Notifications", as `how` says. */
async function openTooltip(how: "pointer" | "keyboard") {
  if (how === "pointer") {
    await movePointer([centerOf(button("Notifications"))]);
  } else {
    button("Before").focus();
    await keyboard("{Tab}");
  }
  await afterFlush();
  expect(tooltipShown()).toBe(true);
}

/** Presses the Trigger named "Notifications", as `how` says. */
async function pressTrigger(how: "pointer" | "keyboard") {
  if (how === "pointer") await press(centerOf(button("Notifications")));
  else await keyboard("{Enter}");
  await nextTask();
}

describe.skipIf(isJSDOM)("Tooltip with other popups", () => {
  const { render } = createRenderer();
  beforeEach(async () => {
    await movePointer([away]);
  });

  it.each(["pointer", "keyboard"] as const)(
    "closes when a press by %s on its Trigger opens a Popover, and the first Escape closes the Popover",
    async (how) => {
      await render(() => (
        <>
          <button type="button">Before</button>
          <Popover.Root>
            <Tooltip.Root delay={0}>
              <Tooltip.Trigger render={(p) => <Popover.Trigger {...p} />}>
                Notifications
              </Tooltip.Trigger>
              <Tooltip.Popup>Your notifications</Tooltip.Popup>
            </Tooltip.Root>
            <Popover.Popup aria-label="Inbox">Nothing new</Popover.Popup>
          </Popover.Root>
        </>
      ));
      const popover = () => screen.getByRole("dialog", { hidden: true });
      await openTooltip(how);

      await pressTrigger(how);
      expect(popover().matches(":popover-open")).toBe(true);
      expect(tooltipShown()).toBe(false);

      await keyboard("{Escape}");
      await nextTask();
      expect(popover().matches(":popover-open")).toBe(false);
    },
  );

  it.each(["pointer", "keyboard"] as const)(
    "closes when a press by %s on its Trigger opens a Dialog, and the first Escape closes the Dialog",
    async (how) => {
      await render(() => (
        <>
          <button type="button">Before</button>
          <Dialog.Root>
            <Tooltip.Root delay={0}>
              <Tooltip.Trigger render={(p) => <Dialog.Trigger {...p} />}>
                Notifications
              </Tooltip.Trigger>
              <Tooltip.Popup>Your notifications</Tooltip.Popup>
            </Tooltip.Root>
            <Dialog.Popup aria-label="Inbox">
              <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      ));
      const dialog = () =>
        screen.getByRole("dialog", { hidden: true }) as HTMLDialogElement;
      await openTooltip(how);

      await pressTrigger(how);
      expect(dialog().open).toBe(true);
      expect(tooltipShown()).toBe(false);

      await keyboard("{Escape}");
      await nextTask();
      expect(dialog().open).toBe(false);
    },
  );

  it("closes on Escape inside a Dialog, which stays open until the next Escape", async () => {
    await render(() => (
      <Dialog.Root defaultOpen>
        <Dialog.Popup aria-label="Editor">
          <button type="button">Before</button>
          <Tooltip.Root>
            <Tooltip.Trigger>Bold</Tooltip.Trigger>
            <Tooltip.Popup>Ctrl+B</Tooltip.Popup>
          </Tooltip.Root>
        </Dialog.Popup>
      </Dialog.Root>
    ));
    const dialog = () =>
      screen.getByRole("dialog", { hidden: true }) as HTMLDialogElement;
    await nextTask();
    button("Before").focus();
    await keyboard("{Tab}");
    await afterFlush();
    expect(tooltipShown()).toBe(true);

    await keyboard("{Escape}");
    await nextTask();
    expect(tooltipShown()).toBe(false);
    expect(dialog().open).toBe(true);
    expect(document.activeElement).toBe(button("Bold"));

    await keyboard("{Escape}");
    await nextTask();
    expect(dialog().open).toBe(false);
  });
});
