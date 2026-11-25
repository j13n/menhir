// The test list and the cases left out are in ../README.md.
import { flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { keyboard, movePointer } from "../../../test/floating/input.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import {
  Notifications,
  region,
  rendered,
} from "../../../test/toast/Notifications.tsx";
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
    "<Toast.Action />",
    (props) => (
      // A list for each render: a press closes its toast.
      <Toast.Provider manager={listWithToast()}>
        <Toast.Region>
          {(toast) => (
            <Toast.Root toast={toast}>
              <Toast.Action {...props} />
            </Toast.Root>
          )}
        </Toast.Region>
      </Toast.Provider>
    ),
    { tagName: "BUTTON" },
  );
});

const undo = () => screen.getByRole("button", { name: "Undo", hidden: true });

describe("<Toast.Action />", () => {
  const { render } = createRenderer();
  // The timers wait while the pointer is on the Region, and in a browser
  // the real pointer rests wherever the test before left it.
  beforeEach(async () => {
    if (!isJSDOM) await movePointer([{ x: 1, y: 1 }]);
  });
  beforeEach(() =>
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] }),
  );
  afterEach(() => vi.useRealTimers());

  const wait = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
    await settle();
  };

  it("renders a button with type button, with the toast's state", async () => {
    const toasts = createToastManager<TestData>();
    toasts.add({ title: "Deleted", data: { action: "Undo" } });
    await render(() => <Notifications toasts={toasts} />);
    expect(undo().tagName).toBe("BUTTON");
    expect(undo()).toHaveAttribute("type", "button");
    expect(undo()).toHaveAttribute("data-open", "");
  });

  it("calls the consumer's onClick, then closes the toast, reporting action-press with the click", async () => {
    const toasts = createToastManager<TestData>();
    const calls: string[] = [];
    const onOpenChange = vi.fn(() => calls.push("onOpenChange"));
    const onAction = vi.fn(() => calls.push("onClick"));
    toasts.add({ title: "Deleted", data: { action: "Undo" }, onOpenChange });
    await render(() => <Notifications toasts={toasts} onAction={onAction} />);

    fireEvent.click(undo());
    await settle();
    expect(calls).toEqual(["onClick", "onOpenChange"]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "action-press",
      event: expect.objectContaining({ type: "click" }),
    });
    expect(rendered()).toEqual([]);
  });

  it("keeps a toast with an Action until it is closed", async () => {
    const toasts = createToastManager<TestData>();
    const plain = toasts.add({ title: "Saved" });
    const withAction = toasts.add({
      title: "Deleted",
      data: { action: "Undo" },
    });
    await render(() => <Notifications toasts={toasts} />);
    expect(rendered()).toEqual([plain, withAction]);

    await wait(100_000);
    expect(rendered()).toEqual([withAction]);
  });

  it("lets a toast with an Action leave after a duration of its own", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({
      title: "Deleted",
      duration: 8000,
      data: { action: "Undo" },
    });
    await render(() => <Notifications toasts={toasts} />);

    await wait(7999);
    expect(rendered()).toEqual([id]);
    await wait(1);
    expect(rendered()).toEqual([]);
  });
});

describe.skipIf(isJSDOM)("<Toast.Action /> in a browser", () => {
  const { render } = createRenderer();

  it("is reached by Tab from the Region after F6, and acts on Enter", async () => {
    const toasts = createToastManager<TestData>();
    const onAction = vi.fn();
    toasts.add({ title: "Deleted", data: { action: "Undo" } });
    await render(() => (
      <Notifications toasts={toasts} onAction={onAction}>
        <button type="button">Page</button>
      </Notifications>
    ));
    screen.getByRole("button", { name: "Page" }).focus();

    await keyboard("{F6}");
    expect(document.activeElement).toBe(region());
    await keyboard("{Tab}");
    expect(document.activeElement).toBe(undo());
    await keyboard("{Enter}");
    await settle();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(rendered()).toEqual([]);
  });
});
