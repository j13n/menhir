import { render as renderInto } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { Dialog } from "../../../test/floating/focus/Dialog.tsx";
import { keyboard } from "../../../test/floating/input.ts";
import { trackListeners } from "../../../test/floating/listeners.ts";

function button(name: string) {
  return screen.getByRole("button", { name });
}

describe("createTabWrap", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it.skipIf(isJSDOM)(
    "without the wrap, lets Tab leave the dialog from the last element",
    async () => {
      await render(() => (
        <Dialog defaultOpen wrap={false}>
          <button>First</button>
        </Dialog>
      ));
      button("Close Dialog").focus();

      await keyboard("{Tab}");

      expect(document.activeElement).not.toBe(button("First"));
      expect(
        screen.getByTestId("Dialog").contains(document.activeElement),
      ).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "moves Tab from the last tab stop to the first",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <button>First</button>
        </Dialog>
      ));
      button("Close Dialog").focus();

      await keyboard("{Tab}");

      expect(document.activeElement).toBe(button("First"));
    },
  );

  it.skipIf(isJSDOM)(
    "moves Shift+Tab from the first tab stop to the last, and from the dialog itself",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <button>First</button>
        </Dialog>
      ));
      button("First").focus();

      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(button("Close Dialog"));

      const dialog = screen.getByTestId("Dialog");
      dialog.tabIndex = -1;
      dialog.focus();
      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(button("Close Dialog"));
    },
  );

  it.skipIf(isJSDOM)(
    "leaves Tab between tab stops to the browser",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <button>First</button>
          <button>Second</button>
        </Dialog>
      ));
      button("First").focus();

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(button("Second"));
      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(button("First"));
    },
  );

  it.skipIf(isJSDOM)(
    "keeps focus on a dialog with no tab stop, on Tab and Shift+Tab",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <p>Nothing to focus</p>
        </Dialog>
      ));
      button("Close Dialog").remove();
      const dialog = screen.getByTestId("Dialog");
      dialog.tabIndex = -1;
      dialog.focus();

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(dialog);
      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(dialog);
    },
  );

  it.skipIf(isJSDOM)(
    "moves Tab from a tabindex -1 element after the last stop to the first",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <button>First</button>
          <p id="note" tabindex="-1">
            A note after the close button
          </p>
        </Dialog>
      ));
      // After the close button, the last stop.
      const note = screen.getByText("A note after the close button");
      screen.getByTestId("Dialog").append(note);
      note.focus();

      await keyboard("{Tab}");

      expect(document.activeElement).toBe(button("First"));
    },
  );

  it.skipIf(isJSDOM)(
    "moves Tab from any radio of a group that is the last stop to the first",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <button>First</button>
        </Dialog>
      ));
      const dialog = screen.getByTestId("Dialog");
      button("Close Dialog").remove();
      dialog.insertAdjacentHTML(
        "beforeend",
        '<input type="radio" name="size" aria-label="Small">' +
          '<input type="radio" name="size" aria-label="Large">',
      );
      const large = screen.getByRole("radio", { name: "Large" });
      large.focus();

      await keyboard("{Tab}");

      expect(document.activeElement).toBe(button("First"));
    },
  );

  it.skipIf(isJSDOM)(
    "moves Tab from a last stop inside a shadow root to the first",
    async () => {
      await render(() => (
        <Dialog defaultOpen>
          <button>First</button>
        </Dialog>
      ));
      const host = document.createElement("div");
      host.attachShadow({ mode: "open" }).innerHTML =
        "<button>In a shadow root</button>";
      button("Close Dialog").replaceWith(host);
      host.shadowRoot!.querySelector("button")!.focus();

      await keyboard("{Tab}");

      expect(document.activeElement).toBe(button("First"));
    },
  );

  it.skipIf(isJSDOM)(
    "wraps a dialog that is itself inside a shadow root",
    async () => {
      await render(() => <div data-testid="host" />);
      const shadow = screen.getByTestId("host").attachShadow({ mode: "open" });
      const dispose = renderInto(
        () => (
          <Dialog defaultOpen>
            <button>First</button>
          </Dialog>
        ),
        shadow,
      );
      try {
        const inShadow = (name: string) =>
          [...shadow.querySelectorAll("button")].find(
            (b) => b.textContent === name,
          )!;
        inShadow("Close Dialog").focus();

        await keyboard("{Tab}");

        expect(shadow.activeElement).toBe(inShadow("First"));
      } finally {
        dispose();
      }
    },
  );

  it.skipIf(isJSDOM)("counts a tab stop added while open", async () => {
    const [more, setMore] = createSignal(false);
    await render(() => (
      <Dialog defaultOpen>
        <button>First</button>
        {more() && <button>Added</button>}
      </Dialog>
    ));
    setMore(true);
    flush();
    button("Close Dialog").focus();

    await keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(button("Added"));
    button("Close Dialog").focus();
    await keyboard("{Tab}");
    expect(document.activeElement).toBe(button("First"));
  });

  it.skipIf(isJSDOM)("does not wrap a key already handled", async () => {
    await render(() => (
      <Dialog defaultOpen>
        <button>First</button>
        <textarea
          aria-label="Editor"
          onKeyDown={(event) => {
            if (event.key === "Tab") event.preventDefault();
          }}
        />
      </Dialog>
    ));
    // The editor is the last stop but one; make it the last.
    const editor = screen.getByRole("textbox", { name: "Editor" });
    button("Close Dialog").remove();
    editor.focus();

    await keyboard("{Tab}");

    expect(document.activeElement).toBe(editor);
  });

  it.skipIf(isJSDOM)(
    "wraps in the topmost of nested dialogs, and the dialog around it does not take over",
    async () => {
      await render(() => (
        <Dialog label="Outer" defaultOpen>
          <button>Outer first</button>
          <Dialog label="Inner" defaultOpen>
            <button>Inner first</button>
          </Dialog>
        </Dialog>
      ));
      button("Close Inner").focus();

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(button("Inner first"));
      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(button("Close Inner"));
    },
  );

  it("listens only while open, and stops on close and on disposal", async () => {
    const listeners = trackListeners();
    const [open, setOpen] = createSignal(false);
    const { unmount } = await render(() => <Dialog open={open()} />);
    listeners.mark();

    // The test dialog returns focus too; only the wrap's listener counts.
    setOpen(true);
    flush();
    expect(listeners.added()).toContain("keydown");

    setOpen(false);
    flush();
    expect(listeners.added()).not.toContain("keydown");

    setOpen(true);
    flush();
    unmount();
    expect(listeners.added()).not.toContain("keydown");
  });
});
