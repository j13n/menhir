// The test list and the cases left out are in ./README.md.
import { describe, expect, it } from "vitest";

import { For, createSignal, flush } from "solid-js";

import { createRenderer, fireEvent, isJSDOM, screen } from "#test-utils";

import { ToggleGroup } from "./index.ts";

function Group(props: {
  orientation?: "horizontal" | "vertical";
  disabled?: string[];
}) {
  return (
    <>
      <button>Before</button>
      <ToggleGroup.Root aria-label="Format" orientation={props.orientation}>
        <For each={["Bold", "Italic", "Underline"]}>
          {(name) => (
            <ToggleGroup.Item
              value={name.toLowerCase()}
              disabled={props.disabled?.includes(name)}
            >
              {name}
            </ToggleGroup.Item>
          )}
        </For>
      </ToggleGroup.Root>
      <button>After</button>
    </>
  );
}

const item = (name: string) => screen.getByRole("button", { name });

describe("<ToggleGroup /> keyboard", () => {
  const { render } = createRenderer();

  it("is one tab stop, on the first item", async () => {
    const { user } = await render(() => <Group />);

    expect(item("Bold")).toHaveAttribute("tabindex", "0");
    expect(item("Italic")).toHaveAttribute("tabindex", "-1");
    expect(item("Underline")).toHaveAttribute("tabindex", "-1");

    await user.click(item("Before"));
    await user.keyboard("[Tab]");
    expect(item("Bold")).toHaveFocus();

    await user.keyboard("[Tab]");
    expect(item("After")).toHaveFocus();
  });

  it("skips a disabled first item when tabbing in", async () => {
    const { user } = await render(() => <Group disabled={["Bold"]} />);

    await user.click(item("Before"));
    await user.keyboard("[Tab]");

    expect(item("Italic")).toHaveFocus();
  });

  it("returns to the item that last had focus", async () => {
    const { user } = await render(() => <Group />);

    await user.click(item("Before"));
    await user.keyboard("[Tab][ArrowRight][Tab]");
    expect(item("After")).toHaveFocus();

    await user.keyboard("{Shift>}[Tab]{/Shift}");
    expect(item("Italic")).toHaveFocus();
    expect(item("Italic")).toHaveAttribute("tabindex", "0");
    expect(item("Bold")).toHaveAttribute("tabindex", "-1");
  });

  it("moves focus with Right and Left in a horizontal group, and wraps", async () => {
    const { user } = await render(() => <Group />);

    await user.click(item("Before"));
    await user.keyboard("[Tab][ArrowRight]");
    expect(item("Italic")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(item("Underline")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(item("Bold")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(item("Underline")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(item("Italic")).toHaveFocus();
  });

  it("moves focus with Down and Up in a vertical group, and wraps", async () => {
    const { user } = await render(() => <Group orientation="vertical" />);

    await user.click(item("Before"));
    await user.keyboard("[Tab][ArrowDown]");
    expect(item("Italic")).toHaveFocus();
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(item("Bold")).toHaveFocus();
    await user.keyboard("[ArrowUp]");
    expect(item("Underline")).toHaveFocus();
  });

  it.each([
    { orientation: "horizontal", keys: ["ArrowDown", "ArrowUp"] },
    { orientation: "vertical", keys: ["ArrowRight", "ArrowLeft"] },
  ] as const)(
    "ignores the other pair of arrows in a $orientation group",
    async ({ orientation, keys }) => {
      const { user } = await render(() => <Group orientation={orientation} />);

      await user.click(item("Before"));
      await user.keyboard("[Tab]");
      for (const key of keys) {
        await user.keyboard(`[${key}]`);
        expect(item("Bold")).toHaveFocus();
      }
    },
  );

  it("focuses the first item with Home and the last with End", async () => {
    const { user } = await render(() => <Group />);

    await user.click(item("Before"));
    await user.keyboard("[Tab][End]");
    expect(item("Underline")).toHaveFocus();
    await user.keyboard("[Home]");
    expect(item("Bold")).toHaveFocus();
  });

  it("skips disabled items", async () => {
    const { user } = await render(() => <Group disabled={["Italic"]} />);

    await user.click(item("Before"));
    await user.keyboard("[Tab][ArrowRight]");
    expect(item("Underline")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(item("Bold")).toHaveFocus();
  });

  it("moves focus without pressing, and presses with Enter and Space", async () => {
    const { user } = await render(() => <Group />);

    await user.click(item("Before"));
    await user.keyboard("[Tab][ArrowRight]");
    expect(item("Bold")).toHaveAttribute("aria-pressed", "false");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "false");

    await user.keyboard("[Enter]");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("[ArrowRight][Space]");
    expect(item("Underline")).toHaveAttribute("aria-pressed", "true");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "false");
  });

  it.each(["ArrowRight", "ArrowLeft", "Home", "End"])(
    "cancels the default action of %s",
    async (key) => {
      await render(() => <Group />);

      const notCanceled = fireEvent.keyDown(item("Bold"), { key });

      expect(notCanceled).toBe(false);
    },
  );

  it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"])(
    "leaves arrow keys, Home and End with %s to the browser",
    async (modifier) => {
      await render(() => <Group />);

      for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
        expect(fireEvent.keyDown(item("Bold"), { key, [modifier]: true })).toBe(
          true,
        );
      }
    },
  );

  it("leaves other keys alone", async () => {
    await render(() => <Group />);

    expect(fireEvent.keyDown(item("Bold"), { key: "a" })).toBe(true);
    expect(fireEvent.keyDown(item("Bold"), { key: "ArrowDown" })).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "moves to the next item with Left in a right-to-left group",
    async () => {
      const { user } = await render(() => (
        <div dir="rtl">
          <Group />
        </div>
      ));

      await user.click(item("Before"));
      await user.keyboard("[Tab][ArrowLeft]");
      expect(item("Italic")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(item("Bold")).toHaveFocus();
    },
  );

  it("moves the tab stop to the first enabled item when its item is disabled", async () => {
    const [disabled, setDisabled] = createSignal<string[]>([]);
    const { user } = await render(() => <Group disabled={disabled()} />);

    await user.click(item("Before"));
    await user.keyboard("[Tab][End][Tab]");
    expect(item("Underline")).toHaveAttribute("tabindex", "0");

    setDisabled(["Underline"]);
    flush();

    expect(item("Bold")).toHaveAttribute("tabindex", "0");
    await user.keyboard("{Shift>}[Tab]{/Shift}");
    expect(item("Bold")).toHaveFocus();
  });

  it("moves the tab stop to the first enabled item when its item is removed", async () => {
    const [names, setNames] = createSignal(["Bold", "Italic", "Underline"]);
    const { user } = await render(() => (
      <>
        <button>Before</button>
        <ToggleGroup.Root aria-label="Format">
          <For each={names()}>
            {(name) => (
              <ToggleGroup.Item value={name.toLowerCase()}>
                {name}
              </ToggleGroup.Item>
            )}
          </For>
        </ToggleGroup.Root>
      </>
    ));

    await user.click(item("Before"));
    await user.keyboard("[Tab][End]");
    setNames(["Bold", "Italic"]);
    flush();

    expect(item("Bold")).toHaveAttribute("tabindex", "0");
    await user.click(item("Before"));
    await user.keyboard("[Tab]");
    expect(item("Bold")).toHaveFocus();
  });

  it("puts an item added later in the order of the document", async () => {
    const [names, setNames] = createSignal(["Bold", "Underline"]);
    const { user } = await render(() => (
      <>
        <button>Before</button>
        <ToggleGroup.Root aria-label="Format">
          <For each={names()}>
            {(name) => (
              <ToggleGroup.Item value={name.toLowerCase()}>
                {name}
              </ToggleGroup.Item>
            )}
          </For>
        </ToggleGroup.Root>
      </>
    ));

    setNames(["Bold", "Italic", "Underline"]);
    flush();
    expect(item("Italic")).toHaveAttribute("tabindex", "-1");

    await user.click(item("Before"));
    await user.keyboard("[Tab][ArrowRight]");
    expect(item("Italic")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(item("Underline")).toHaveFocus();
  });
});
