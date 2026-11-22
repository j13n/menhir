// The test list and the cases left out are in ./README.md.
import { describe, expect, it } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../dialog/index.ts";
import {
  centerOf,
  keyboard,
  nextTask,
  press,
} from "../../test/floating/input.ts";
import { Popover } from "./index.ts";

const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
const popover = (name: string) => screen.getByLabelText(name);
const shown = (name: string) => popover(name).matches(":popover-open");

/** Opens a popup from its Trigger with a real press, as a user would. */
async function open(trigger: string) {
  await press(centerOf(button(trigger)));
  await nextTask();
}

describe.skipIf(isJSDOM)("nested popups", () => {
  const { render } = createRenderer();

  it("closes a Popover opened from inside another, then the outer one, one Escape each, focus returning to each Trigger", async () => {
    await render(() => (
      <Popover.Root>
        <Popover.Trigger>Outer</Popover.Trigger>
        <Popover.Popup aria-label="Outer popover">
          <p>Outer content</p>
          <Popover.Root>
            <Popover.Trigger>Inner</Popover.Trigger>
            <Popover.Popup aria-label="Inner popover" side="right">
              <button type="button">Inside inner</button>
            </Popover.Popup>
          </Popover.Root>
        </Popover.Popup>
      </Popover.Root>
    ));
    await open("Outer");
    await open("Inner");
    expect(shown("Outer popover")).toBe(true);
    expect(shown("Inner popover")).toBe(true);
    button("Inside inner").focus();

    await keyboard("{Escape}");
    await nextTask();
    expect(shown("Inner popover")).toBe(false);
    expect(shown("Outer popover")).toBe(true);
    expect(document.activeElement).toBe(button("Inner"));

    await keyboard("{Escape}");
    await nextTask();
    expect(shown("Outer popover")).toBe(false);
    expect(document.activeElement).toBe(button("Outer"));
  });

  it("closes only the inner Popover on a press in the outer one", async () => {
    await render(() => (
      <Popover.Root>
        <Popover.Trigger>Outer</Popover.Trigger>
        <Popover.Popup aria-label="Outer popover">
          <p>Outer content</p>
          <Popover.Root>
            <Popover.Trigger>Inner</Popover.Trigger>
            <Popover.Popup aria-label="Inner popover" side="right">
              Inner content
            </Popover.Popup>
          </Popover.Root>
        </Popover.Popup>
      </Popover.Root>
    ));
    await open("Outer");
    await open("Inner");

    await press(centerOf(screen.getByText("Outer content")));
    await nextTask();

    expect(shown("Inner popover")).toBe(false);
    expect(shown("Outer popover")).toBe(true);
  });

  it("closes a Popover inside a Dialog, then the Dialog, one Escape each, focus returning to each Trigger", async () => {
    await render(() => (
      <Dialog.Root>
        <Dialog.Trigger>Edit</Dialog.Trigger>
        <Dialog.Popup aria-label="Edit profile">
          <Popover.Root>
            <Popover.Trigger>Help</Popover.Trigger>
            <Popover.Popup aria-label="Help">
              <button type="button">Inside help</button>
            </Popover.Popup>
          </Popover.Root>
        </Dialog.Popup>
      </Dialog.Root>
    ));
    const dialog = () => popover("Edit profile") as HTMLDialogElement;
    await open("Edit");
    await open("Help");
    button("Inside help").focus();

    await keyboard("{Escape}");
    await nextTask();
    expect(shown("Help")).toBe(false);
    expect(dialog().open).toBe(true);
    expect(document.activeElement).toBe(button("Help"));

    await keyboard("{Escape}");
    await nextTask();
    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(button("Edit"));
  });

  it("keeps a Popover open under a Dialog opened from it, and closes the Dialog, then the Popover, one Escape each, focus returning to each Trigger", async () => {
    await render(() => (
      <Popover.Root>
        <Popover.Trigger>Account</Popover.Trigger>
        <Popover.Popup aria-label="Account">
          <Dialog.Root>
            <Dialog.Trigger>Sign out</Dialog.Trigger>
            <Dialog.Popup aria-label="Sign out?">
              <Dialog.Close>Cancel</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </Popover.Popup>
      </Popover.Root>
    ));
    const dialog = () => popover("Sign out?") as HTMLDialogElement;
    await open("Account");
    await open("Sign out");
    expect(dialog().matches(":modal")).toBe(true);
    expect(shown("Account")).toBe(true);

    await keyboard("{Escape}");
    await nextTask();
    expect(dialog().open).toBe(false);
    expect(shown("Account")).toBe(true);
    expect(document.activeElement).toBe(button("Sign out"));

    await keyboard("{Escape}");
    await nextTask();
    expect(shown("Account")).toBe(false);
    expect(document.activeElement).toBe(button("Account"));
  });
});
