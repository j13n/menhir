// The test list and the cases left out are in ./README.md.
import { afterEach, describe, expect, it } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { keyboard, nextTask, press, wheel } from "../../test/floating/input.ts";
import { Dialog } from "./index.ts";

const dialogNamed = (name: string) =>
  screen.getByRole<HTMLDialogElement>("dialog", { name, hidden: true });
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

/** A point on the backdrop: the top left corner of the viewport. */
const backdrop = { x: 5, y: 5 };

// An outer dialog whose Popup holds a second Dialog, as an app nests them:
// a settings dialog that opens a confirmation.
function Nested() {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger>Settings</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Root>
            <Dialog.Trigger>Reset</Dialog.Trigger>
            <Dialog.Popup>
              <Dialog.Title>Reset settings?</Dialog.Title>
              <button type="button">Keep</button>
              <Dialog.Close>Cancel</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
          <Dialog.Close>Close settings</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>
      <div style={{ height: "5000px" }}>Page</div>
    </>
  );
}

describe.skipIf(isJSDOM)("nested <Dialog.Root />s", () => {
  const { render } = createRenderer();
  afterEach(async () => {
    scrollTo(0, 0);
    // Its `scrollend` comes later; the next test's input must not see it.
    await nextTask();
  });

  async function openBoth() {
    const result = await render(() => <Nested />);
    await result.user.click(button("Settings"));
    await result.user.click(button("Reset"));
    await nextTask();
    return result;
  }

  it("opens the inner one over the outer one, which is inert", async () => {
    await openBoth();
    const outer = dialogNamed("Settings");
    const inner = dialogNamed("Reset settings?");

    expect(inner.matches(":modal")).toBe(true);
    expect(outer.open).toBe(true);
    button("Close settings").focus();
    expect(inner.contains(document.activeElement)).toBe(true);
  });

  it("closes the inner one, then the outer one, on Escape, returning focus to each Trigger in turn", async () => {
    await openBoth();
    const outer = dialogNamed("Settings");
    const inner = dialogNamed("Reset settings?");

    await keyboard("{Escape}");
    await nextTask();
    expect(inner.open).toBe(false);
    expect(outer.matches(":modal")).toBe(true);
    expect(document.activeElement).toBe(button("Reset"));

    await keyboard("{Escape}");
    await nextTask();
    expect(outer.open).toBe(false);
    expect(document.activeElement).toBe(button("Settings"));
  });

  it("closes only the inner one on a press on its backdrop", async () => {
    await openBoth();
    const outer = dialogNamed("Settings");
    const inner = dialogNamed("Reset settings?");

    await press(backdrop);
    await nextTask();

    expect(inner.open).toBe(false);
    expect(outer.matches(":modal")).toBe(true);
  });

  it("wraps Tab inside the inner one", async () => {
    await openBoth();
    button("Cancel").focus();

    await keyboard("{Tab}");

    expect(document.activeElement).toBe(button("Keep"));
  });

  it("keeps the page locked until the outer one has closed too", async () => {
    const { user } = await openBoth();

    await user.click(button("Cancel"));
    await nextTask();
    await wheel(backdrop);
    expect(scrollY).toBe(0);

    await user.click(button("Close settings"));
    await nextTask();
    await wheel(backdrop);
    expect(scrollY).toBeGreaterThan(0);
  });
});
