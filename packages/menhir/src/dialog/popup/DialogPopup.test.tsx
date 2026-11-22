// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { createSignal, Errored, flush, Show } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import { stubDialog } from "../../../test/dialog/stubDialog.ts";
import {
  centerOf,
  keyboard,
  nextTask,
  press,
  wheel,
} from "../../../test/floating/input.ts";
import { Dialog } from "../index.ts";
import type { DialogRootProps } from "../root/DialogRoot.tsx";
import type { DialogPopupProps } from "./DialogPopup.tsx";

function dialog() {
  return screen.getByRole<HTMLDialogElement>("dialog", { hidden: true });
}
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

/** A point on the backdrop: the top left corner of the viewport. */
const backdrop = { x: 5, y: 5 };

function EditDialog(
  props: DialogRootProps &
    Pick<
      DialogPopupProps,
      "initialFocus" | "returnFocus" | "aria-labelledby" | "aria-describedby"
    > & { children?: JSX.Element },
) {
  return (
    <Dialog.Root
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Trigger>Edit</Dialog.Trigger>
      <Dialog.Popup
        class="popup"
        initialFocus={props.initialFocus}
        returnFocus={props.returnFocus}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
      >
        <Dialog.Title>Edit profile</Dialog.Title>
        {props.children}
        <input aria-label="Name" />
        <Dialog.Close>Done</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function TallPage() {
  return <div style={{ height: "5000px" }}>Page</div>;
}

describeConformance(
  "<Dialog.Popup />",
  (props) => (
    <Dialog.Root>
      <Dialog.Popup {...props} />
    </Dialog.Root>
  ),
  { tagName: "DIALOG" },
);

describe("<Dialog.Popup />", () => {
  const { render } = createRenderer();
  stubDialog();
  let style: HTMLStyleElement | undefined;
  afterEach(async () => {
    vi.restoreAllMocks();
    style?.remove();
    style = undefined;
    if (!isJSDOM) {
      scrollTo(0, 0);
      // Its `scrollend` comes later; the next test's input must not see it.
      await nextTask();
    }
  });
  const addStyles = (css: string) => {
    style = document.head.appendChild(document.createElement("style"));
    style.textContent = css;
  };

  it("renders a <dialog>, closed until opened", async () => {
    const { user } = await render(() => <EditDialog />);

    expect(dialog().tagName).toBe("DIALOG");
    expect(dialog().open).toBe(false);

    await user.click(button("Edit"));
    expect(dialog().open).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "opens modal, in the top layer above an element with a high z-index",
    async () => {
      const { user } = await render(() => (
        <>
          <EditDialog />
          <div
            data-testid="cover"
            style={{ position: "fixed", inset: "0", "z-index": "9999" }}
          />
        </>
      ));

      await user.click(button("Edit"));

      expect(screen.getByRole("dialog")).toBe(dialog());
      expect(dialog().matches(":modal")).toBe(true);
      const { x, y } = centerOf(dialog());
      expect(dialog().contains(document.elementFromPoint(x, y))).toBe(true);
    },
  );

  it.skipIf(isJSDOM)("makes the page outside inert while open", async () => {
    const { user } = await render(() => (
      <>
        <button type="button">Outside</button>
        <EditDialog />
      </>
    ));

    await user.click(button("Edit"));
    button("Outside").focus();

    expect(dialog().contains(document.activeElement)).toBe(true);
  });

  describe("naming", () => {
    it("is named by its Title and described by its Description", async () => {
      await render(() => (
        <EditDialog defaultOpen>
          <Dialog.Description>Shown on your posts.</Dialog.Description>
        </EditDialog>
      ));
      await nextTask();

      expect(dialog()).toHaveAccessibleName("Edit profile");
      expect(dialog()).toHaveAccessibleDescription("Shown on your posts.");
      expect(screen.getByText("Edit profile").tagName).toBe("H2");
      expect(screen.getByText("Shown on your posts.").tagName).toBe("P");
    });

    it("names nothing without a Title or a Description, and takes an aria-label", async () => {
      await render(() => (
        <Dialog.Root defaultOpen>
          <Dialog.Popup aria-label="Settings">Content</Dialog.Popup>
        </Dialog.Root>
      ));
      await nextTask();

      expect(dialog()).not.toHaveAttribute("aria-labelledby");
      expect(dialog()).not.toHaveAttribute("aria-describedby");
      expect(dialog()).toHaveAccessibleName("Settings");
    });

    it("follows a Title and a Description rendered later, or removed", async () => {
      const [shown, setShown] = createSignal(false);
      await render(() => (
        <Dialog.Root defaultOpen>
          <Dialog.Popup aria-label="Fallback">
            <Show when={shown()}>
              <Dialog.Title>Later title</Dialog.Title>
              <Dialog.Description>Later description</Dialog.Description>
            </Show>
          </Dialog.Popup>
        </Dialog.Root>
      ));
      await nextTask();
      expect(dialog()).not.toHaveAttribute("aria-labelledby");

      setShown(true);
      flush();
      await nextTask();
      expect(dialog()).toHaveAccessibleName("Later title");
      expect(dialog()).toHaveAccessibleDescription("Later description");

      setShown(false);
      flush();
      await nextTask();
      expect(dialog()).not.toHaveAttribute("aria-labelledby");
      expect(dialog()).not.toHaveAttribute("aria-describedby");
      expect(dialog()).toHaveAccessibleName("Fallback");
    });

    it("names a Title and a Description by the consumer's ids", async () => {
      await render(() => (
        <Dialog.Root defaultOpen>
          <Dialog.Popup>
            <Dialog.Title id="title">Title</Dialog.Title>
            <Dialog.Description id="description">Text</Dialog.Description>
          </Dialog.Popup>
        </Dialog.Root>
      ));
      await nextTask();

      expect(dialog()).toHaveAttribute("aria-labelledby", "title");
      expect(dialog()).toHaveAttribute("aria-describedby", "description");
    });

    it("lets the consumer's aria-labelledby and aria-describedby win", async () => {
      await render(() => (
        <>
          <span id="name">Other name</span>
          <span id="text">Other text</span>
          <EditDialog
            defaultOpen
            aria-labelledby="name"
            aria-describedby="text"
          >
            <Dialog.Description>Shown on your posts.</Dialog.Description>
          </EditDialog>
        </>
      ));
      await nextTask();

      expect(dialog()).toHaveAccessibleName("Other name");
      expect(dialog()).toHaveAccessibleDescription("Other text");
    });
  });

  describe.skipIf(isJSDOM)("focus", () => {
    it("moves focus to the first focusable element on opening", async () => {
      const { user } = await render(() => <EditDialog />);

      await user.click(button("Edit"));
      await nextTask();

      expect(document.activeElement).toBe(screen.getByLabelText("Name"));
    });

    it("moves focus to the element with autofocus on opening", async () => {
      const { user } = await render(() => (
        <EditDialog>
          <button type="button" autofocus>
            Focused
          </button>
        </EditDialog>
      ));

      await user.click(button("Edit"));
      await nextTask();

      expect(document.activeElement).toBe(button("Focused"));
    });

    it("moves focus to initialFocus, an element or a function of the browser's choice", async () => {
      let target: HTMLButtonElement | undefined;
      const initialFocus = vi.fn(() => target);
      const { user } = await render(() => (
        <EditDialog initialFocus={initialFocus}>
          <button type="button">First</button>
          <button type="button" ref={(el) => (target = el)}>
            Target
          </button>
        </EditDialog>
      ));

      await user.click(button("Edit"));
      await nextTask();

      expect(initialFocus).toHaveBeenCalledWith(button("First"));
      expect(document.activeElement).toBe(button("Target"));
    });

    it("wraps Tab from the last element to the first, and Shift+Tab back", async () => {
      const { user } = await render(() => <EditDialog />);

      await user.click(button("Edit"));
      await nextTask();
      button("Done").focus();

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(screen.getByLabelText("Name"));

      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(button("Done"));
    });

    it("returns focus to the Trigger once closed", async () => {
      const { user } = await render(() => <EditDialog />);

      await user.click(button("Edit"));
      await user.click(button("Done"));
      await nextTask();

      expect(dialog().open).toBe(false);
      expect(document.activeElement).toBe(button("Edit"));
    });

    it("moves focus to returnFocus once closed", async () => {
      let other: HTMLButtonElement | undefined;
      const { user } = await render(() => (
        <>
          <button type="button" ref={(el) => (other = el)}>
            Other
          </button>
          <EditDialog returnFocus={() => other} />
        </>
      ));

      await user.click(button("Edit"));
      await user.click(button("Done"));
      await nextTask();

      expect(document.activeElement).toBe(button("Other"));
    });
  });

  describe.skipIf(isJSDOM)("dismissal", () => {
    it("closes on Escape, reporting escape-key with the key event", async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <EditDialog onOpenChange={onOpenChange} />
      ));

      await user.click(button("Edit"));
      await keyboard("{Escape}");
      await nextTask();

      expect(dialog().open).toBe(false);
      const [open, details] = onOpenChange.mock.calls.at(-1)!;
      expect(open).toBe(false);
      expect(details.reason).toBe("escape-key");
      expect(details.event.key).toBe("Escape");
    });

    it("stays open and modal on Escape while controlled open", async () => {
      const onOpenChange = vi.fn();
      await render(() => <EditDialog open onOpenChange={onOpenChange} />);

      await keyboard("{Escape}");
      await nextTask();

      expect(onOpenChange).toHaveBeenCalledOnce();
      expect(dialog().matches(":modal")).toBe(true);
    });

    it("closes on a press on the backdrop, reporting outside-press, and not on one inside", async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <EditDialog onOpenChange={onOpenChange} />
      ));

      await user.click(button("Edit"));
      await press(centerOf(screen.getByText("Edit profile")));
      await nextTask();
      expect(dialog().open).toBe(true);

      await press(backdrop);
      await nextTask();

      expect(dialog().open).toBe(false);
      expect(onOpenChange.mock.calls.at(-1)![1].reason).toBe("outside-press");
    });

    it("closes from a form with method dialog, reporting close-request", async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <EditDialog onOpenChange={onOpenChange}>
          <form method="dialog">
            <button>Save</button>
          </form>
        </EditDialog>
      ));

      await user.click(button("Edit"));
      await user.click(button("Save"));
      await nextTask();

      expect(dialog().open).toBe(false);
      expect(onOpenChange.mock.calls.at(-1)![1].reason).toBe("close-request");
    });
  });

  it.skipIf(isJSDOM)(
    "keeps the page from scrolling while open, and lets it scroll once closed",
    async () => {
      const { user } = await render(() => (
        <>
          <EditDialog />
          <TallPage />
        </>
      ));

      await user.click(button("Edit"));
      await wheel(backdrop);
      expect(scrollY).toBe(0);

      await user.click(button("Done"));
      await nextTask();
      await wheel(backdrop);
      expect(scrollY).toBeGreaterThan(0);
    },
  );

  it.skipIf(isJSDOM)(
    "stays shown with data-closed while its exit animation runs; focus returns and the page unlocks once it has ended",
    async () => {
      // Long enough never to end during the test.
      addStyles(`
        .popup[data-closed] { animation: fade 10s; }
        @keyframes fade { to { opacity: 0; } }
      `);
      const { user } = await render(() => (
        <>
          <EditDialog />
          <TallPage />
        </>
      ));

      await user.click(button("Edit"));
      await user.click(button("Done"));
      await nextTask();

      expect(dialog().matches(":modal")).toBe(true);
      expect(dialog()).toHaveAttribute("data-closed", "");
      expect(document.activeElement).not.toBe(button("Edit"));
      await wheel(backdrop);
      expect(scrollY).toBe(0);

      for (const animation of dialog().getAnimations()) animation.finish();
      await nextTask();

      expect(dialog().open).toBe(false);
      expect(document.activeElement).toBe(button("Edit"));
      await wheel(backdrop);
      expect(scrollY).toBeGreaterThan(0);
    },
  );

  it("keeps its behaviour when render returns a <dialog>", async () => {
    const { user } = await render(() => (
      <Dialog.Root>
        <Dialog.Trigger>Edit</Dialog.Trigger>
        <Dialog.Popup
          aria-label="Edit"
          render={(props) => <dialog data-custom="" {...props} />}
        />
      </Dialog.Root>
    ));

    await user.click(button("Edit"));

    expect(dialog()).toHaveAttribute("data-custom", "");
    expect(dialog().open).toBe(true);
  });

  it("warns in development when render does not render a <dialog>", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <Dialog.Root>
        <Dialog.Popup render={(props) => <div {...props} />} />
      </Dialog.Root>
    ));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Dialog.Popup's render function rendered a <div>",
      ),
    );
  });

  it("throws a descriptive error outside <Dialog.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Dialog.Popup />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Dialog parts must be placed within <Dialog.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
