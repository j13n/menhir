// The test list and the cases left out are in ../README.md.
import { flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Notifications, rendered } from "../../../test/toast/Notifications.tsx";
import type { TestData } from "../../../test/toast/Notifications.tsx";
import { listWithToast } from "../../../test/toast/listWithToast.ts";
import { createToastManager, Toast } from "../index.ts";

stubPopover();

/** Lets a closed toast leave: its exit ends in a microtask of its own. */
async function settle() {
  flush();
  await afterFlush();
  flush();
}

describe("with an exit that does not end", () => {
  // The suite looks at the part after a press, which closes the toast: an
  // animation that keeps running keeps it in the document.
  beforeEach(() => {
    vi.spyOn(Element.prototype, "getAnimations").mockReturnValue([
      {
        playState: "running",
        effect: { getComputedTiming: () => ({ endTime: 100 }) },
        finished: new Promise(() => {}),
      } as unknown as Animation,
    ]);
  });
  afterEach(() => vi.restoreAllMocks());

  describeConformance(
    "<Toast.Close />",
    (props) => (
      // A list for each render: a press closes its toast.
      <Toast.Provider manager={listWithToast()}>
        <Toast.Region>
          {(toast) => (
            <Toast.Root toast={toast}>
              <Toast.Close {...props} />
            </Toast.Root>
          )}
        </Toast.Region>
      </Toast.Provider>
    ),
    { tagName: "BUTTON" },
  );
});

describe("<Toast.Close />", () => {
  const { render } = createRenderer();

  it("renders a button with type button, with the toast's state", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Saved", duration: Infinity });
    await render(() => <Notifications toasts={toasts} />);
    const close = screen.getByRole("button", {
      name: `Close ${id}`,
      hidden: true,
    });
    expect(close.tagName).toBe("BUTTON");
    expect(close).toHaveAttribute("type", "button");
    expect(close).toHaveAttribute("data-open", "");
  });

  it("closes the toast on a press, reporting close-press with the click", async () => {
    const toasts = createToastManager<TestData>();
    const onOpenChange = vi.fn();
    const other = toasts.add({ title: "Other", duration: Infinity });
    const id = toasts.add({ title: "Saved", duration: Infinity, onOpenChange });
    await render(() => <Notifications toasts={toasts} />);

    fireEvent.click(
      screen.getByRole("button", { name: `Close ${id}`, hidden: true }),
    );
    await settle();
    expect(rendered()).toEqual([other]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "close-press",
      event: expect.objectContaining({ type: "click" }),
    });
  });

  it("warns when render is not a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const toasts = createToastManager();
    toasts.add({ title: "Saved", duration: Infinity });
    await render(() => (
      <Toast.Provider manager={toasts}>
        <Toast.Region>
          {(toast) => (
            <Toast.Root toast={toast}>
              <Toast.Close render={(props) => <span {...props} />} />
            </Toast.Root>
          )}
        </Toast.Region>
      </Toast.Provider>
    ));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Toast.Close's render function rendered a <span>",
      ),
    );
    warn.mockRestore();
  });
});
