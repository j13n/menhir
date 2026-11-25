// The test list and the cases left out are in ../README.md.
import { Errored, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { movePointer, nextTask } from "../../../test/floating/input.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import {
  Notifications,
  region,
  rendered,
  toast,
} from "../../../test/toast/Notifications.tsx";
import type { TestData } from "../../../test/toast/Notifications.tsx";
import { createToastManager, Toast } from "../index.ts";

stubPopover();

const closeButton = (id: string) =>
  screen.getByRole("button", { name: `Close ${id}`, hidden: true });

/** Lets a closed toast leave: its exit ends in a microtask of its own. */
async function settle() {
  flush();
  await afterFlush();
  flush();
}

{
  const toasts = createToastManager();
  toasts.add({ id: "conformance", title: "Saved", duration: Infinity });
  describeConformance(
    "<Toast.Root />",
    (props) => (
      <Toast.Provider manager={toasts}>
        <Toast.Region>
          {(toast) => <Toast.Root toast={toast} {...props} />}
        </Toast.Region>
      </Toast.Provider>
    ),
    { tagName: "DIV" },
  );
}

describe("<Toast.Root />", () => {
  const { render } = createRenderer();
  // The timers wait while the pointer is on the Region, and in a browser
  // the real pointer rests wherever the test before left it.
  beforeEach(async () => {
    if (!isJSDOM) await movePointer([{ x: 1, y: 1 }]);
  });
  beforeEach(() =>
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] }),
  );
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const wait = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
    await settle();
  };

  it("renders a div with data-open and data-priority, and no role", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Saved" });
    await render(() => <Notifications toasts={toasts} />);
    expect(toast(id).tagName).toBe("DIV");
    expect(toast(id)).toHaveAttribute("data-open", "");
    expect(toast(id)).not.toHaveAttribute("data-closed");
    expect(toast(id)).toHaveAttribute("data-priority", "low");
    expect(toast(id)).not.toHaveAttribute("role");
  });

  it("is an alert when its priority is high", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Connection lost", priority: "high" });
    await render(() => <Notifications toasts={toasts} />);
    expect(toast(id)).toHaveAttribute("role", "alert");
    expect(toast(id)).toHaveAttribute("data-priority", "high");
  });

  it("has --toast-index, 0 for the newest, which alone has data-front", async () => {
    const toasts = createToastManager<TestData>();
    const first = toasts.add({ title: "First" });
    const second = toasts.add({ title: "Second" });
    await render(() => <Notifications toasts={toasts} />);
    const index = (id: string) =>
      toast(id).style.getPropertyValue("--toast-index");
    expect([index(first), index(second)]).toEqual(["1", "0"]);
    expect(toast(first)).not.toHaveAttribute("data-front");
    expect(toast(second)).toHaveAttribute("data-front", "");

    const third = toasts.add({ title: "Third" });
    flush();
    expect([index(first), index(second), index(third)]).toEqual([
      "2",
      "1",
      "0",
    ]);
    expect(toast(second)).not.toHaveAttribute("data-front");
    expect(toast(third)).toHaveAttribute("data-front", "");
  });

  it("leaves after 5000 ms by default, reporting timeout with no event", async () => {
    const toasts = createToastManager<TestData>();
    const onOpenChange = vi.fn();
    const id = toasts.add({ title: "Saved", onOpenChange });
    await render(() => <Notifications toasts={toasts} />);

    await wait(4999);
    expect(rendered()).toEqual([id]);
    expect(onOpenChange).not.toHaveBeenCalled();
    await wait(1);
    expect(rendered()).toEqual([]);
    expect(toasts.toasts()).toEqual([]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "timeout",
    });
  });

  it("takes the Provider's duration, its own before that, and Infinity", async () => {
    const toasts = createToastManager<TestData>();
    const byProvider = toasts.add({ title: "Provider" });
    toasts.add({ title: "Own", duration: 100 });
    const kept = toasts.add({ title: "Kept", duration: Infinity });
    await render(() => <Notifications toasts={toasts} duration={1000} />);

    await wait(100);
    expect(rendered()).toEqual([byProvider, kept]);
    await wait(900);
    expect(rendered()).toEqual([kept]);
    await wait(100_000);
    expect(rendered()).toEqual([kept]);
  });

  it("pauses while the pointer is on the Region, and goes on with the time left", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Saved", duration: 1000 });
    await render(() => <Notifications toasts={toasts} />);

    await wait(600);
    fireEvent.pointerEnter(region());
    await wait(5000);
    expect(rendered()).toEqual([id]);

    fireEvent.pointerLeave(region());
    await wait(399);
    expect(rendered()).toEqual([id]);
    await wait(1);
    expect(rendered()).toEqual([]);
  });

  it("pauses while focus is inside the Region", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Saved", duration: 1000 });
    await render(() => <Notifications toasts={toasts} />);

    closeButton(id).focus();
    flush();
    await wait(5000);
    expect(rendered()).toEqual([id]);

    closeButton(id).blur();
    flush();
    await wait(1000);
    expect(rendered()).toEqual([]);
  });

  it("waits from the start when mounted while the page is hidden", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Saved", duration: 1000 });
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    await render(() => <Notifications toasts={toasts} />);
    await wait(5000);
    expect(rendered()).toEqual([id]);

    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    await wait(1000);
    expect(rendered()).toEqual([]);
  });

  it("pauses while the page is hidden", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Saved", duration: 1000 });
    await render(() => <Notifications toasts={toasts} />);
    const hidden = vi.spyOn(document, "hidden", "get");

    hidden.mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    await wait(5000);
    expect(rendered()).toEqual([id]);

    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    await wait(1000);
    expect(rendered()).toEqual([]);
  });

  it("shows what update() changed, and starts the time again", async () => {
    const toasts = createToastManager<TestData>();
    const id = toasts.add({ title: "Uploading", duration: 1000 });
    await render(() => <Notifications toasts={toasts} />);
    const element = toast(id);

    await wait(900);
    toasts.update(id, { title: "Uploaded", priority: "high" });
    flush();
    expect(toast(id)).toBe(element);
    expect(element).toHaveTextContent("Uploaded");
    expect(element).toHaveAttribute("role", "alert");

    await wait(999);
    expect(rendered()).toEqual([id]);
    await wait(1);
    expect(rendered()).toEqual([]);
  });

  it("closes on Escape with focus inside, reporting escape-key, and marks the key handled", async () => {
    const toasts = createToastManager<TestData>();
    const onOpenChange = vi.fn();
    const other = toasts.add({ title: "Other" });
    const id = toasts.add({ title: "Saved", onOpenChange });
    await render(() => <Notifications toasts={toasts} />);

    closeButton(id).focus();
    expect(fireEvent.keyDown(closeButton(id), { key: "Escape" })).toBe(false);
    await settle();
    expect(rendered()).toEqual([other]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "escape-key",
      event: expect.objectContaining({ type: "keydown", key: "Escape" }),
    });
  });

  it("closes when the manager removes it, reporting remove", async () => {
    const toasts = createToastManager<TestData>();
    const onOpenChange = vi.fn();
    const id = toasts.add({ title: "Saved", onOpenChange });
    const other = toasts.add({ title: "Other" });
    await render(() => <Notifications toasts={toasts} />);

    toasts.remove(id);
    await settle();
    expect(rendered()).toEqual([other]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "remove",
    });
  });

  it("throws a descriptive error outside <Toast.Region>", async () => {
    const toasts = createToastManager();
    toasts.add({ title: "Saved" });
    flush();
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Toast.Provider manager={toasts}>
          <Toast.Root toast={toasts.toasts()[0]!} />
        </Toast.Provider>
      </Errored>
    ));
    expect(
      screen.getByText(
        "Error: [menhir] Toast.Root must be placed within <Toast.Region>.",
      ),
    ).toBeInTheDocument();
  });
});

describe.skipIf(isJSDOM)("<Toast.Root /> in a browser", () => {
  const { render } = createRenderer();

  it("hands focus to the Region when it closes holding it, and back to the page with the last toast", async () => {
    const toasts = createToastManager<TestData>();
    const first = toasts.add({ title: "First", duration: Infinity });
    const second = toasts.add({ title: "Second", duration: Infinity });
    await render(() => (
      <Notifications toasts={toasts}>
        <button type="button">Page</button>
      </Notifications>
    ));
    const page = screen.getByRole("button", { name: "Page" });
    page.focus();
    fireEvent.keyDown(page, { key: "F6" });
    expect(document.activeElement).toBe(region());

    closeButton(second).focus();
    closeButton(second).click();
    await settle();
    expect(rendered()).toEqual([first]);
    expect(document.activeElement).toBe(region());

    closeButton(first).focus();
    closeButton(first).click();
    await settle();
    expect(rendered()).toEqual([]);
    expect(document.activeElement).toBe(page);
  });

  it("makes way at once for a toast added under its id while it leaves", async () => {
    const style = document.head.appendChild(document.createElement("style"));
    style.textContent =
      "@keyframes toast-out { to { opacity: 0 } } [data-closed] { animation: toast-out 100ms }";
    try {
      const toasts = createToastManager<TestData>();
      toasts.add({ id: "network", title: "Offline", duration: Infinity });
      await render(() => <Notifications toasts={toasts} />);
      const leaving = toast("network");

      toasts.remove("network");
      flush();
      await nextTask();
      expect(leaving).toHaveAttribute("data-closed", "");

      toasts.add({ id: "network", title: "Online", duration: Infinity });
      flush();
      expect(rendered()).toEqual(["network"]);
      expect(toast("network")).not.toBe(leaving);
      expect(toast("network")).toHaveAttribute("data-open", "");
      expect(toast("network")).toHaveTextContent("Online");

      // The exit of the one that left does not take the new one along.
      await new Promise((resolve) => setTimeout(resolve, 200));
      flush();
      expect(rendered()).toEqual(["network"]);
      expect(toasts.toasts()).toHaveLength(1);
    } finally {
      style.remove();
    }
  });

  it("stays with data-closed while its exit animation runs, then leaves", async () => {
    const style = document.head.appendChild(document.createElement("style"));
    style.textContent =
      "@keyframes toast-out { to { opacity: 0 } } [data-closed] { animation: toast-out 100ms }";
    try {
      const toasts = createToastManager<TestData>();
      const id = toasts.add({ title: "Saved", duration: Infinity });
      await render(() => <Notifications toasts={toasts} />);

      toasts.remove(id);
      flush();
      await nextTask();
      expect(rendered()).toEqual([id]);
      expect(toast(id)).toHaveAttribute("data-closed", "");
      expect(toast(id)).not.toHaveAttribute("data-open");
      expect(toasts.toasts()).toHaveLength(1);

      await vi.waitFor(() => expect(rendered()).toEqual([]));
      expect(toasts.toasts()).toEqual([]);
    } finally {
      style.remove();
    }
  });
});
