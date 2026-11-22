import { createSignal, flush, Show } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../../../test/floating/scroll-lock/Dialog.tsx";
import { trackListeners } from "../../../test/floating/listeners.ts";
import {
  centerOf,
  keyboard,
  nextTask,
  touchScroll,
  wheel,
} from "../../../test/floating/input.ts";

function button(name: string) {
  return screen.getByRole("button", { name });
}

/** Content that makes the page taller than the viewport. */
function TallPage() {
  return <div style={{ height: "5000px" }}>Page</div>;
}

/** A point on the backdrop: the top left corner of the viewport. */
const backdrop = { x: 5, y: 5 };

describe("createScrollLock", () => {
  const { render } = createRenderer();
  afterEach(async () => {
    vi.restoreAllMocks();
    scrollTo(0, 0);
    // Its `scrollend` comes later; the next test's input must not see it.
    await nextTask();
  });

  it.skipIf(isJSDOM)(
    "without the lock, the wheel and PageDown scroll the page behind a modal dialog",
    async () => {
      const { user } = await render(() => (
        <>
          <Dialog lock={false}>
            <p tabindex="-1">Text</p>
          </Dialog>
          <TallPage />
        </>
      ));

      await user.click(button("Dialog trigger"));
      await wheel(backdrop);
      expect(scrollY).toBeGreaterThan(0);

      scrollTo(0, 0);
      screen.getByText("Text").focus();
      await keyboard("{PageDown}");
      await wheel(backdrop, 0);
      expect(scrollY).toBeGreaterThan(0);
    },
  );

  it.skipIf(isJSDOM)(
    "while open, the wheel over the backdrop, PageDown and a touch drag do not scroll the page",
    async () => {
      const { user } = await render(() => (
        <>
          <Dialog>
            <p tabindex="-1">Text</p>
          </Dialog>
          <TallPage />
        </>
      ));

      await user.click(button("Dialog trigger"));
      await wheel(backdrop);
      screen.getByText("Text").focus();
      await keyboard("{PageDown}");
      await touchScroll({ x: 5, y: innerHeight - 5 }, 500);

      expect(scrollY).toBe(0);
    },
  );

  it.skipIf(isJSDOM)("lets the page scroll again once closed", async () => {
    const { user } = await render(() => (
      <>
        <Dialog />
        <TallPage />
      </>
    ));

    await user.click(button("Dialog trigger"));
    await user.click(button("Close Dialog"));
    await wheel(backdrop);

    expect(scrollY).toBeGreaterThan(0);
  });

  it.skipIf(isJSDOM)(
    "leaves the scroll position where it was on locking and unlocking",
    async () => {
      // Opened and closed from code: a click would scroll its button into
      // view.
      const [open, setOpen] = createSignal(false);
      await render(() => (
        <>
          <Dialog open={open()} onOpenChange={setOpen} />
          <TallPage />
        </>
      ));
      scrollTo(0, 1000);

      setOpen(true);
      flush();
      expect(document.documentElement.style.overflowY).toBe("hidden");
      expect(scrollY).toBe(1000);
      setOpen(false);
      flush();
      await nextTask();

      expect(document.documentElement.style.overflowY).toBe("");
      expect(scrollY).toBe(1000);
    },
  );

  it.skipIf(isJSDOM)(
    "lets a scrollable area in the dialog scroll, and at its end the page does not",
    async () => {
      const { user } = await render(() => (
        <>
          <Dialog>
            <div
              data-testid="area"
              style={{ height: "100px", overflow: "auto" }}
            >
              <div style={{ height: "1000px" }}>Long content</div>
            </div>
          </Dialog>
          <TallPage />
        </>
      ));
      await user.click(button("Dialog trigger"));
      const area = screen.getByTestId("area");

      await wheel(centerOf(area), 300);
      expect(area.scrollTop).toBeGreaterThan(0);

      area.scrollTop = area.scrollHeight;
      await nextTask();
      await wheel(centerOf(area), 300);
      expect(scrollY).toBe(0);
    },
  );

  it.skipIf(isJSDOM)(
    "needs no lock for a page that scrolls in another element: it does not scroll behind the dialog",
    async () => {
      const { user } = await render(() => (
        <main data-testid="main" style={{ height: "100vh", overflow: "auto" }}>
          <Dialog lock={false}>
            <p tabindex="-1">Text</p>
          </Dialog>
          <TallPage />
        </main>
      ));
      const main = screen.getByTestId("main");

      await user.click(button("Dialog trigger"));
      await wheel(backdrop);
      screen.getByText("Text").focus();
      await keyboard("{PageDown}");
      await touchScroll({ x: 5, y: innerHeight - 5 }, 500);
      expect(main.scrollTop).toBe(0);

      // The same input scrolls it once the dialog has closed.
      await user.click(button("Close Dialog"));
      await wheel(backdrop);
      expect(main.scrollTop).toBeGreaterThan(0);
    },
  );

  describe("the styles of <html>", () => {
    const html = document.documentElement;
    afterEach(() => html.removeAttribute("style"));

    /** Renders a dialog controlled by a signal, and returns its setter. */
    async function renderDialog() {
      const [open, setOpen] = createSignal(false);
      await render(() => (
        <>
          <Dialog open={open()} onOpenChange={setOpen} />
          <TallPage />
        </>
      ));
      return async (value: boolean) => {
        setOpen(value);
        flush();
        await nextTask();
      };
    }

    it("sets nothing while closed", async () => {
      await renderDialog();

      expect(html.style.cssText).toBe("");
    });

    it("puts back none when <html> had none", async () => {
      const setOpen = await renderDialog();

      await setOpen(true);
      expect(html.style.overflow).toBe("hidden");
      await setOpen(false);

      // An empty `style` attribute may stay.
      expect(html.style.cssText).toBe("");
    });

    it.each([
      "overflow: auto; padding-right: 4px; color: red;",
      "overflow-y: scroll;",
      "overflow-x: clip !important; padding-right: 1em;",
    ])("puts back exactly what <html> had: %s", async (own) => {
      html.setAttribute("style", own);
      const setOpen = await renderDialog();

      await setOpen(true);
      expect(html.style.overflowY).toBe("hidden");
      await setOpen(false);

      expect(html.style.cssText).toBe(own.trim());
    });

    it("keeps a style written to <html> while locked", async () => {
      const setOpen = await renderDialog();

      await setOpen(true);
      html.style.colorScheme = "dark";
      await setOpen(false);

      expect(html.style.cssText).toBe("color-scheme: dark;");
    });
  });

  describe("the layout", () => {
    const html = document.documentElement;
    afterEach(() => html.removeAttribute("style"));

    function rectOf(element: Element) {
      const { left, width } = element.getBoundingClientRect();
      return { left, width };
    }

    async function renderPage(options: { tall?: boolean } = {}) {
      const [open, setOpen] = createSignal(false);
      await render(() => (
        <>
          <div
            data-testid="fixed"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: "var(--hidden-scrollbar-width, 0px)",
              height: "10px",
            }}
          />
          <div
            data-testid="plain-fixed"
            style={{ position: "fixed", top: 0, left: 0, right: 0 }}
          />
          <Dialog open={open()} onOpenChange={setOpen} />
          <div
            data-testid="content"
            style={{ height: options.tall === false ? "10px" : "5000px" }}
          />
        </>
      ));
      return async (value: boolean) => {
        setOpen(value);
        flush();
        await nextTask();
      };
    }

    it.skipIf(isJSDOM)(
      "keeps the content's width and place with a scrollbar, adding to the page's own padding",
      async () => {
        html.style.paddingRight = "10px";
        const setOpen = await renderPage();
        const content = screen.getByTestId("content");
        const before = rectOf(content);
        // The page has a scrollbar, 15 px wide.
        expect(innerWidth - html.clientWidth).toBe(15);

        await setOpen(true);
        expect(rectOf(content)).toEqual(before);
        await setOpen(false);

        expect(rectOf(content)).toEqual(before);
        expect(html.style.cssText).toBe("padding-right: 10px;");
      },
    );

    it.skipIf(isJSDOM)(
      "keeps a fixed element that uses --hidden-scrollbar-width in place",
      async () => {
        const setOpen = await renderPage();
        const fixed = screen.getByTestId("fixed");
        const before = rectOf(fixed);

        await setOpen(true);

        expect(rectOf(fixed)).toEqual(before);
      },
    );

    it.skipIf(isJSDOM)(
      "adds no padding with scrollbar-gutter: stable, and nothing moves",
      async () => {
        html.style.scrollbarGutter = "stable";
        const setOpen = await renderPage();
        const content = screen.getByTestId("content");
        const plainFixed = screen.getByTestId("plain-fixed");
        const before = [rectOf(content), rectOf(plainFixed)];

        await setOpen(true);

        expect(html.style.paddingRight).toBe("");
        expect(html.style.getPropertyValue("--hidden-scrollbar-width")).toBe(
          "",
        );
        expect([rectOf(content), rectOf(plainFixed)]).toEqual(before);
      },
    );

    it.skipIf(isJSDOM)("adds no padding with no scrollbar", async () => {
      const setOpen = await renderPage({ tall: false });

      await setOpen(true);

      expect(html.style.paddingRight).toBe("");
    });
  });

  describe("the count and the popup's life", () => {
    const html = document.documentElement;
    afterEach(() => html.removeAttribute("style"));

    function locked() {
      return html.style.overflowY === "hidden";
    }

    async function settle() {
      flush();
      await nextTask();
    }

    it.each(["inner", "outer"] as const)(
      "unlocks the page when the last of two nested dialogs closes, the %s first",
      async (first) => {
        const [outer, setOuter] = createSignal(false);
        const [inner, setInner] = createSignal(false);
        await render(() => (
          <Dialog label="Outer" open={outer()} onOpenChange={setOuter}>
            <Dialog label="Inner" open={inner()} onOpenChange={setInner} />
          </Dialog>
        ));
        const close = { inner: setInner, outer: setOuter };
        const last = first === "inner" ? "outer" : "inner";

        setOuter(true);
        await settle();
        setInner(true);
        await settle();
        close[first](false);
        await settle();
        expect(locked()).toBe(true);
        close[last](false);
        await settle();

        expect(locked()).toBe(false);
      },
    );

    it.skipIf(isJSDOM)(
      "unlocks the page when Escape closes the dialog",
      async () => {
        const { user } = await render(() => <Dialog />);

        await user.click(button("Dialog trigger"));
        await keyboard("{Escape}");
        await nextTask();

        expect(screen.getByTestId("Dialog")).not.toHaveAttribute("open");
        expect(locked()).toBe(false);
      },
    );

    it.skipIf(isJSDOM)(
      "keeps the page locked when the dialog refuses an Escape, even the second, which the browser closes",
      async () => {
        await render(() => <Dialog open={true} />);
        await settle();

        await keyboard("{Escape}");
        await nextTask();
        await keyboard("{Escape}");
        await nextTask();

        expect(screen.getByTestId("Dialog")).toHaveAttribute("open");
        expect(locked()).toBe(true);
      },
    );

    it.skipIf(isJSDOM)(
      "keeps the page locked while a closing dialog is still shown, as with an exit animation",
      async () => {
        let finishClosing!: () => void;
        const [open, setOpen] = createSignal(true);
        await render(() => (
          <Dialog
            open={open()}
            onOpenChange={setOpen}
            deferClose={(close) => (finishClosing = close)}
          />
        ));
        await settle();

        setOpen(false);
        await settle();
        expect(locked()).toBe(true);
        finishClosing();
        await nextTask();

        expect(locked()).toBe(false);
      },
    );

    it.skipIf(isJSDOM)(
      "holds one lock for a dialog opened again before it had closed",
      async () => {
        let finishClosing!: () => void;
        const [open, setOpen] = createSignal(true);
        await render(() => (
          <Dialog
            open={open()}
            onOpenChange={setOpen}
            deferClose={(close) => (finishClosing = close)}
          />
        ));
        await settle();

        setOpen(false);
        await settle();
        setOpen(true);
        await settle();
        expect(locked()).toBe(true);
        setOpen(false);
        await settle();
        finishClosing();
        await nextTask();

        expect(locked()).toBe(false);
      },
    );

    it("unlocks the page when a dialog is disposed while open", async () => {
      const [shown, setShown] = createSignal(true);
      await render(() => (
        <Show when={shown()}>
          <Dialog defaultOpen />
        </Show>
      ));
      await settle();
      expect(locked()).toBe(true);

      setShown(false);
      await settle();

      expect(locked()).toBe(false);
    });
    it.skipIf(isJSDOM)(
      "listens only while a closing dialog is still shown, and stops on close, on opening again and on disposal",
      async () => {
        const listeners = trackListeners();
        let finishClosing!: () => void;
        const [open, setOpen] = createSignal(true);
        const { unmount } = await render(() => (
          <Dialog
            open={open()}
            onOpenChange={setOpen}
            deferClose={(close) => (finishClosing = close)}
          />
        ));
        await settle();
        listeners.mark();
        // Dismissal listens for `close` as well; only the lock listens for
        // `toggle`, which it adds and removes with its `close`.
        const toggle = () =>
          listeners.added().filter((type) => type === "toggle");
        const closing = async () => {
          setOpen(false);
          await settle();
          expect(toggle()).toEqual(["toggle"]);
        };

        await closing();
        finishClosing();
        await nextTask();
        expect(toggle()).toEqual([]);

        setOpen(true);
        await settle();
        await closing();
        setOpen(true);
        await settle();
        expect(toggle()).toEqual([]);

        await closing();
        unmount();
        expect(toggle()).toEqual([]);
      },
    );
  });
});
