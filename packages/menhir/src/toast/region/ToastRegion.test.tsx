// The test list and the cases left out are in ../README.md.
import { flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  movePointer,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import {
  Notifications,
  region,
  rendered,
} from "../../../test/toast/Notifications.tsx";
import type { TestData } from "../../../test/toast/Notifications.tsx";
import { createToastManager, Toast } from "../index.ts";

stubPopover();

describeConformance(
  "<Toast.Region />",
  (props) => (
    <Toast.Provider manager={createToastManager()}>
      <Toast.Region {...props}>{() => null}</Toast.Region>
    </Toast.Provider>
  ),
  { tagName: "DIV" },
);

describe("<Toast.Region />", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  const add = (toasts: ReturnType<typeof createToastManager<TestData>>) => {
    const id = toasts.add({ title: "Saved", duration: Infinity });
    flush();
    return id;
  };

  it("renders a shown, polite region with no toast", async () => {
    await render(() => <Notifications toasts={createToastManager()} />);
    expect(region().tagName).toBe("DIV");
    expect(region()).toHaveAttribute("popover", "manual");
    expect(region()).toHaveAttribute("aria-live", "polite");
    expect(region()).toHaveAttribute("tabindex", "-1");
    expect(region().matches(":popover-open")).toBe(true);
    expect(region().children).toHaveLength(0);
  });

  it("renders its child once per toast, oldest first, and a later toast after them", async () => {
    const toasts = createToastManager<TestData>();
    const first = toasts.add({ title: "First", duration: Infinity });
    const second = toasts.add({ title: "Second", duration: Infinity });
    await render(() => <Notifications toasts={toasts} />);
    expect(rendered()).toEqual([first, second]);
    const firstElement = screen.getByTestId(first);

    const third = toasts.add({ title: "Third", duration: Infinity });
    flush();
    expect(rendered()).toEqual([first, second, third]);
    // Added, not rendered again: a live region announces additions.
    expect(screen.getByTestId(first)).toBe(firstElement);
    expect(region()).toHaveTextContent("FirstSecondThird");
  });

  it("has --toast-count", async () => {
    const toasts = createToastManager<TestData>();
    await render(() => <Notifications toasts={toasts} />);
    expect(region().style.getPropertyValue("--toast-count")).toBe("0");
    add(toasts);
    add(toasts);
    expect(region().style.getPropertyValue("--toast-count")).toBe("2");
  });

  it("renders as many as limit, and the next once one has left", async () => {
    const toasts = createToastManager<TestData>();
    await render(() => <Notifications toasts={toasts} limit={2} />);
    const first = add(toasts);
    const second = add(toasts);
    const third = add(toasts);
    expect(rendered()).toEqual([first, second]);

    toasts.remove(first);
    flush();
    await afterFlush();
    expect(rendered()).toEqual([second, third]);
  });

  it("has data-expanded while the pointer is on it, and while focus is inside it", async () => {
    const toasts = createToastManager<TestData>();
    await render(() => <Notifications toasts={toasts} />);
    const id = add(toasts);
    expect(region()).not.toHaveAttribute("data-expanded");

    fireEvent.pointerEnter(region());
    expect(region()).toHaveAttribute("data-expanded", "");
    fireEvent.pointerLeave(region());
    expect(region()).not.toHaveAttribute("data-expanded");

    const close = screen.getByRole("button", {
      name: `Close ${id}`,
      hidden: true,
    });
    close.focus();
    flush();
    expect(region()).toHaveAttribute("data-expanded", "");
    close.blur();
    flush();
    expect(region()).not.toHaveAttribute("data-expanded");
  });

  it("takes focus on F6 when it has a toast, and not when it has none", async () => {
    const toasts = createToastManager<TestData>();
    await render(() => (
      <Notifications toasts={toasts}>
        <button type="button">Page</button>
      </Notifications>
    ));
    const page = screen.getByRole("button", { name: "Page" });
    page.focus();

    expect(fireEvent.keyDown(page, { key: "F6" })).toBe(true);
    expect(document.activeElement).toBe(page);

    add(toasts);
    // Handled, so the browser does not also move to its own panes.
    expect(fireEvent.keyDown(page, { key: "F6" })).toBe(false);
    expect(document.activeElement).toBe(region());
  });

  it("takes another hotkey, or none", async () => {
    const toasts = createToastManager<TestData>();
    add(toasts);
    const first = await render(() => (
      <Notifications toasts={toasts} hotkey="F8" />
    ));
    fireEvent.keyDown(document.body, { key: "F6" });
    expect(document.activeElement).not.toBe(region());
    fireEvent.keyDown(document.body, { key: "F8" });
    expect(document.activeElement).toBe(region());
    first.unmount();

    await render(() => <Notifications toasts={toasts} hotkey={false} />);
    fireEvent.keyDown(document.body, { key: "F6" });
    expect(document.activeElement).not.toBe(region());
  });

  it.skipIf(isJSDOM)(
    "is in the top layer, above an element with a high z-index",
    async () => {
      const toasts = createToastManager<TestData>();
      await render(() => (
        <Notifications
          toasts={toasts}
          regionStyle={{ inset: "0 auto auto 0", margin: 0 }}
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              "z-index": 2147483647,
            }}
          />
        </Notifications>
      ));
      const id = add(toasts);
      const { x, y } = centerOf(screen.getByTestId(id));
      expect(region().contains(document.elementFromPoint(x, y))).toBe(true);
    },
  );

  describe.skipIf(isJSDOM)("with a modal dialog", () => {
    const dialog = (name: string) =>
      screen.getByTestId(name) as HTMLDialogElement;

    function Page(props: {
      toasts: ReturnType<typeof createToastManager<TestData>>;
    }) {
      return (
        <div data-testid="page">
          <Notifications
            toasts={props.toasts}
            regionStyle={{ inset: "0 auto auto 0", margin: 0 }}
          >
            <dialog
              data-testid="Outer"
              style={{
                width: "100vw",
                height: "100vh",
                "max-width": "none",
                "max-height": "none",
                margin: 0,
              }}
            >
              <button type="button">In outer</button>
            </dialog>
            <dialog data-testid="Inner">
              <button type="button">In inner</button>
            </dialog>
          </Notifications>
        </div>
      );
    }

    it("is held by a dialog opened after it: a toast is above the dialog and takes a press", async () => {
      const toasts = createToastManager<TestData>();
      const onOpenChange = vi.fn();
      await render(() => <Page toasts={toasts} />);
      const id = toasts.add({
        title: "Saved",
        duration: Infinity,
        onOpenChange,
      });
      flush();
      const home = region().parentElement;

      dialog("Outer").showModal();
      await nextTask();
      expect(region().parentElement).toBe(dialog("Outer"));
      expect(region().matches(":popover-open")).toBe(true);
      expect(home).not.toBe(dialog("Outer"));

      const close = screen.getByRole("button", { name: `Close ${id}` });
      const { x, y } = centerOf(close);
      expect(document.elementFromPoint(x, y)).toBe(close);
      await press(centerOf(close));
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
        reason: "close-press",
        event: expect.objectContaining({ type: "click" }),
      });
    });

    it("is no longer expanded once it has moved, though no pointer left it", async () => {
      const toasts = createToastManager<TestData>();
      await render(() => <Page toasts={toasts} />);
      add(toasts);
      // The real pointer is elsewhere, so it enters nothing after the move.
      await movePointer([{ x: 600, y: 500 }]);
      fireEvent.pointerEnter(region());
      expect(region()).toHaveAttribute("data-expanded", "");

      dialog("Outer").showModal();
      await nextTask();
      flush();
      expect(region().parentElement).toBe(dialog("Outer"));
      expect(region()).not.toHaveAttribute("data-expanded");
    });

    it("goes back to its place when the dialog closes, still shown", async () => {
      const toasts = createToastManager<TestData>();
      await render(() => <Page toasts={toasts} />);
      const id = add(toasts);
      const home = region().parentElement;
      const after = region().nextSibling;

      dialog("Outer").showModal();
      await nextTask();
      dialog("Outer").close();
      await nextTask();
      expect(region().parentElement).toBe(home);
      expect(region().nextSibling).toBe(after);
      expect(region().matches(":popover-open")).toBe(true);
      expect(rendered()).toEqual([id]);
    });

    it("is in the dialog opened last, then in the one before it", async () => {
      const toasts = createToastManager<TestData>();
      await render(() => <Page toasts={toasts} />);
      add(toasts);

      dialog("Outer").showModal();
      await nextTask();
      dialog("Inner").showModal();
      await nextTask();
      expect(region().parentElement).toBe(dialog("Inner"));
      expect(region().matches(":popover-open")).toBe(true);

      dialog("Inner").close();
      await nextTask();
      expect(region().parentElement).toBe(dialog("Outer"));
      expect(region().matches(":popover-open")).toBe(true);
    });

    it("is held by a dialog open before it mounts", async () => {
      const outer = document.body.appendChild(document.createElement("dialog"));
      outer.showModal();
      try {
        const toasts = createToastManager<TestData>();
        await render(() => <Notifications toasts={toasts} />);
        expect(region().parentElement).toBe(outer);
        expect(region().matches(":popover-open")).toBe(true);
      } finally {
        outer.close();
        await nextTask();
        outer.remove();
      }
    });

    it("leaves the document when unmounted in a dialog", async () => {
      const toasts = createToastManager<TestData>();
      const { unmount } = await render(() => <Page toasts={toasts} />);
      add(toasts);
      const outer = dialog("Outer");
      document.body.append(outer);
      outer.showModal();
      await nextTask();
      const element = region();
      expect(element.parentElement).toBe(outer);

      unmount();
      expect(element.isConnected).toBe(false);
      outer.close();
      outer.remove();
    });
  });
});
