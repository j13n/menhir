// The test list and the cases left out are in ./README.md.
import { describe, expect, it, vi } from "vitest";

import { For, Show, createSignal, flush } from "solid-js";

import { createRenderer, fireEvent, isJSDOM, screen } from "#test-utils";

import { Separator } from "../separator/index.ts";

import { Toolbar } from "./index.ts";

function Bar(props: {
  orientation?: "horizontal" | "vertical";
  disabled?: string[];
  dir?: "rtl";
}) {
  return (
    <>
      <button>Before</button>
      <Toolbar.Root
        aria-label="Formatting"
        orientation={props.orientation}
        dir={props.dir}
      >
        <For each={["Bold", "Italic", "Underline"]}>
          {(name) => (
            <Toolbar.Button disabled={props.disabled?.includes(name)}>
              {name}
            </Toolbar.Button>
          )}
        </For>
      </Toolbar.Root>
      <button>After</button>
    </>
  );
}

const button = (name: string) => screen.getByRole("button", { name });

describe("<Toolbar /> keyboard", () => {
  const { render } = createRenderer();

  it("is one tab stop, on the first item", async () => {
    const { user } = await render(() => <Bar />);

    expect(button("Bold")).toHaveAttribute("tabindex", "0");
    expect(button("Italic")).toHaveAttribute("tabindex", "-1");
    expect(button("Underline")).toHaveAttribute("tabindex", "-1");

    await user.click(button("Before"));
    await user.keyboard("[Tab]");
    expect(button("Bold")).toHaveFocus();

    await user.keyboard("[Tab]");
    expect(button("After")).toHaveFocus();
  });

  it("skips a disabled first item when tabbing in", async () => {
    const { user } = await render(() => <Bar disabled={["Bold"]} />);

    expect(button("Bold")).toHaveAttribute("tabindex", "-1");
    await user.click(button("Before"));
    await user.keyboard("[Tab]");

    expect(button("Italic")).toHaveFocus();
  });

  it("returns to the item that last had focus", async () => {
    const { user } = await render(() => <Bar />);

    await user.click(button("Before"));
    await user.keyboard("[Tab][ArrowRight][Tab]");
    expect(button("After")).toHaveFocus();

    await user.keyboard("{Shift>}[Tab]{/Shift}");
    expect(button("Italic")).toHaveFocus();
    expect(button("Italic")).toHaveAttribute("tabindex", "0");
    expect(button("Bold")).toHaveAttribute("tabindex", "-1");
  });

  it("moves focus with Right and Left in a horizontal toolbar, and wraps", async () => {
    const { user } = await render(() => <Bar />);

    await user.click(button("Before"));
    await user.keyboard("[Tab][ArrowRight]");
    expect(button("Italic")).toHaveFocus();
    await user.keyboard("[ArrowRight][ArrowRight]");
    expect(button("Bold")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(button("Underline")).toHaveFocus();
  });

  it("moves focus with Down and Up in a vertical toolbar, and wraps", async () => {
    const { user } = await render(() => <Bar orientation="vertical" />);

    await user.click(button("Before"));
    await user.keyboard("[Tab][ArrowDown]");
    expect(button("Italic")).toHaveFocus();
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(button("Bold")).toHaveFocus();
    await user.keyboard("[ArrowUp]");
    expect(button("Underline")).toHaveFocus();
  });

  it("leaves the other pair of arrow keys alone", async () => {
    const { user } = await render(() => <Bar />);

    await user.click(button("Before"));
    await user.keyboard("[Tab][ArrowDown][ArrowUp]");
    expect(button("Bold")).toHaveFocus();
  });

  it("leaves Left and Right alone in a vertical toolbar", async () => {
    const { user } = await render(() => <Bar orientation="vertical" />);

    await user.click(button("Before"));
    await user.keyboard("[Tab][ArrowRight][ArrowLeft]");
    expect(button("Bold")).toHaveFocus();
  });

  it("moves focus to the first and last item with Home and End", async () => {
    const { user } = await render(() => <Bar />);

    await user.click(button("Before"));
    await user.keyboard("[Tab][End]");
    expect(button("Underline")).toHaveFocus();
    await user.keyboard("[Home]");
    expect(button("Bold")).toHaveFocus();
  });

  it("reaches a disabled item with the arrow keys", async () => {
    const { user } = await render(() => <Bar disabled={["Italic"]} />);

    await user.click(button("Before"));
    await user.keyboard("[Tab][ArrowRight]");
    expect(button("Italic")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(button("Underline")).toHaveFocus();
  });

  it("skips an item disabled natively", async () => {
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button>Bold</Toolbar.Button>
        <Toolbar.Button render={(p) => <button {...p} disabled />}>
          Italic
        </Toolbar.Button>
        <Toolbar.Button>Underline</Toolbar.Button>
      </Toolbar.Root>
    ));

    await user.keyboard("[Tab][ArrowRight]");
    expect(button("Underline")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(button("Bold")).toHaveFocus();
  });

  it("cancels the default action of the keys it uses", async () => {
    await render(() => <Bar />);

    for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
      expect(fireEvent.keyDown(button("Bold"), { key })).toBe(false);
    }
    expect(fireEvent.keyDown(button("Bold"), { key: "ArrowDown" })).toBe(true);
  });

  it("leaves the keys to the browser with a modifier held", async () => {
    await render(() => <Bar />);
    button("Bold").focus();

    for (const modifier of ["altKey", "ctrlKey", "metaKey", "shiftKey"]) {
      for (const key of ["ArrowRight", "Home", "End"]) {
        const notCancelled = fireEvent.keyDown(button("Bold"), {
          key,
          [modifier]: true,
        });
        expect(notCancelled).toBe(true);
        expect(button("Bold")).toHaveFocus();
      }
    }
  });

  it("hands an item's onKeyDown the keys it leaves, not those it uses", async () => {
    const onKeyDown = vi.fn();
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button onKeyDown={(event) => onKeyDown(event.key)}>
          Bold
        </Toolbar.Button>
        <Toolbar.Button>Italic</Toolbar.Button>
      </Toolbar.Root>
    ));

    await user.keyboard("[Tab][ArrowDown][ArrowRight]");
    expect(button("Italic")).toHaveFocus();
    expect(onKeyDown.mock.calls).toEqual([["ArrowDown"]]);
  });

  it("leaves keys on an element that is not an item alone", async () => {
    const onKeyDown = vi.fn();
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button>Bold</Toolbar.Button>
        <button onKeyDown={onKeyDown}>Other</button>
        <Toolbar.Button>Italic</Toolbar.Button>
      </Toolbar.Root>
    ));

    button("Other").focus();
    await user.keyboard("[ArrowRight]");
    expect(button("Other")).toHaveFocus();
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it.skipIf(isJSDOM)(
    "moves to the next item with Left, right to left",
    async () => {
      const { user } = await render(() => <Bar dir="rtl" />);

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowLeft]");
      expect(button("Italic")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(button("Bold")).toHaveFocus();
    },
  );

  it("moves the tab stop on when the item that had it is removed", async () => {
    const [shown, setShown] = createSignal(true);
    const { user } = await render(() => (
      <>
        <button>Before</button>
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button disabled>Cut</Toolbar.Button>
          <Toolbar.Button>Bold</Toolbar.Button>
          <Show when={shown()}>
            <Toolbar.Button>Italic</Toolbar.Button>
          </Show>
        </Toolbar.Root>
      </>
    ));

    await user.click(button("Before"));
    await user.keyboard("[Tab][ArrowRight]");
    expect(button("Italic")).toHaveFocus();

    setShown(false);
    flush();
    // The first item that is not disabled, as before any had focus.
    expect(button("Bold")).toHaveAttribute("tabindex", "0");
    expect(button("Cut")).toHaveAttribute("tabindex", "-1");
  });

  it("passes a separator between items", async () => {
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button>Bold</Toolbar.Button>
        <Separator.Root orientation="vertical" />
        <Toolbar.Button>Undo</Toolbar.Button>
      </Toolbar.Root>
    ));

    expect(screen.getByRole("separator")).not.toHaveAttribute("tabindex");
    await user.keyboard("[Tab][ArrowRight]");
    expect(button("Undo")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(button("Bold")).toHaveFocus();
  });

  it("puts an item added later in the order of the document", async () => {
    const [shown, setShown] = createSignal(false);
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button>Bold</Toolbar.Button>
        <Show when={shown()}>
          <Toolbar.Button>Italic</Toolbar.Button>
        </Show>
        <Toolbar.Button>Underline</Toolbar.Button>
      </Toolbar.Root>
    ));

    setShown(true);
    flush();
    expect(button("Italic")).toHaveAttribute("tabindex", "-1");
    await user.keyboard("[Tab][ArrowRight]");
    expect(button("Italic")).toHaveFocus();
  });

  describe("text field", () => {
    function Editor(props: { value?: string }) {
      return (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button>Bold</Toolbar.Button>
          <Toolbar.Input aria-label="Font" value={props.value ?? "Serif"} />
          <Toolbar.Button>Italic</Toolbar.Button>
        </Toolbar.Root>
      );
    }
    const field = () => screen.getByRole("textbox") as HTMLInputElement;

    it("moves the caret with Left and Right, and leaves at either end", async () => {
      const { user } = await render(() => <Editor />);

      await user.keyboard("[Tab][ArrowRight]");
      expect(field()).toHaveFocus();
      field().setSelectionRange(1, 1);

      await user.keyboard("[ArrowLeft]");
      expect(field()).toHaveFocus();
      expect(field().selectionStart).toBe(0);
      await user.keyboard("[ArrowLeft]");
      expect(button("Bold")).toHaveFocus();

      await user.keyboard("[ArrowRight]");
      field().setSelectionRange(4, 4);
      await user.keyboard("[ArrowRight]");
      expect(field()).toHaveFocus();
      expect(field().selectionStart).toBe(5);
      await user.keyboard("[ArrowRight]");
      expect(button("Italic")).toHaveFocus();
    });

    it("starts the caret on the side focus came from", async () => {
      // The text is not a prop: Solid sets a `value` prop again as the tab
      // stop moves, and user-event's interceptor of `value` then moves the
      // caret to the end, where a browser leaves a caret alone for the same
      // value.
      const { user } = await render(() => (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button>Bold</Toolbar.Button>
          <Toolbar.Input aria-label="Font" />
          <Toolbar.Button>Italic</Toolbar.Button>
        </Toolbar.Root>
      ));
      field().value = "Serif";

      await user.keyboard("[Tab][ArrowRight]");
      expect(field()).toHaveFocus();
      expect(field().selectionStart).toBe(0);
      expect(field().selectionEnd).toBe(0);

      await user.keyboard("[End][ArrowRight][ArrowLeft]");
      expect(field()).toHaveFocus();
      expect(field().selectionStart).toBe(5);
      // So the next Left moves the caret, and does not leave.
      await user.keyboard("[ArrowLeft]");
      expect(field()).toHaveFocus();
      expect(field().selectionStart).toBe(4);
    });

    it("keeps Home and End, and the arrow keys while text is selected", async () => {
      const { user } = await render(() => <Editor />);

      await user.keyboard("[Tab][ArrowRight]");
      field().setSelectionRange(2, 2);
      await user.keyboard("[End]");
      expect(field()).toHaveFocus();
      expect(field().selectionStart).toBe(5);
      await user.keyboard("[Home]");
      expect(field()).toHaveFocus();
      expect(field().selectionStart).toBe(0);

      field().setSelectionRange(0, 5);
      await user.keyboard("[ArrowLeft]");
      expect(field()).toHaveFocus();
      field().setSelectionRange(0, 5);
      await user.keyboard("[ArrowRight]");
      expect(field()).toHaveFocus();
    });
  });
});
