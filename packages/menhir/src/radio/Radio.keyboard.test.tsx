// The test list and the cases left out are in ./README.md.
import { describe, expect, it, vi } from "vitest";

import { For, createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { Radio } from "./index.ts";

function Group(props: {
  defaultValue?: string;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  disabled?: string[];
}) {
  return (
    <>
      <button>Before</button>
      <Radio.Root
        name="fruit"
        defaultValue={props.defaultValue}
        value={props.value}
        onValueChange={props.onValueChange}
      >
        <legend>Fruit</legend>
        <For each={["Apple", "Banana", "Cherry"]}>
          {(name) => (
            <label>
              <Radio.Item
                value={name.toLowerCase()}
                disabled={props.disabled?.includes(name)}
              />
              {name}
            </label>
          )}
        </For>
      </Radio.Root>
      <button>After</button>
    </>
  );
}

const radio = (name: string) => screen.getByRole("radio", { name });
const button = (name: string) => screen.getByRole("button", { name });

/** The checked radio's name, by `aria-checked`. */
const checked = () =>
  screen
    .queryAllByRole("radio")
    .filter((element) => element.getAttribute("aria-checked") === "true")
    .map((element) => element.parentElement!.textContent);

describe("<Radio /> keyboard", () => {
  const { render } = createRenderer();

  describe("tab stop", () => {
    it("is on the checked radio", async () => {
      await render(() => <Group defaultValue="banana" />);

      expect(radio("Apple")).toHaveAttribute("tabindex", "-1");
      expect(radio("Banana")).toHaveAttribute("tabindex", "0");
      expect(radio("Cherry")).toHaveAttribute("tabindex", "-1");
    });

    it("is on the first radio while none is checked", async () => {
      await render(() => <Group />);

      expect(radio("Apple")).toHaveAttribute("tabindex", "0");
      expect(radio("Banana")).toHaveAttribute("tabindex", "-1");
    });

    it("is on the first enabled radio while the checked one is disabled", async () => {
      await render(() => (
        <Group defaultValue="cherry" disabled={["Apple", "Cherry"]} />
      ));

      expect(radio("Banana")).toHaveAttribute("tabindex", "0");
      expect(radio("Cherry")).toHaveAttribute("tabindex", "-1");
    });

    it("is on the first enabled radio while none is checked and the first is disabled", async () => {
      await render(() => <Group disabled={["Apple"]} />);

      expect(radio("Banana")).toHaveAttribute("tabindex", "0");
    });

    it("lets Tab into the group onto the checked radio, and out of it", async () => {
      const { user } = await render(() => <Group defaultValue="banana" />);

      await user.click(button("Before"));
      await user.keyboard("[Tab]");
      expect(radio("Banana")).toHaveFocus();

      await user.keyboard("[Tab]");
      expect(button("After")).toHaveFocus();
    });

    it("lets Shift+Tab into the group onto the checked radio", async () => {
      const { user } = await render(() => <Group defaultValue="banana" />);

      await user.click(button("After"));
      await user.keyboard("{Shift>}[Tab]{/Shift}");
      expect(radio("Banana")).toHaveFocus();
    });

    it("does not check a radio focused by Tab", async () => {
      const { user } = await render(() => <Group />);

      await user.click(button("Before"));
      await user.keyboard("[Tab]");
      await afterFlush();
      expect(radio("Apple")).toHaveFocus();
      expect(checked()).toEqual([]);
    });

    it("follows the checked radio as the arrow keys move it", async () => {
      const { user } = await render(() => <Group defaultValue="apple" />);

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowDown]");
      await afterFlush();
      await user.keyboard("[Tab]");
      await user.keyboard("{Shift>}[Tab]{/Shift}");
      expect(radio("Banana")).toHaveFocus();
      expect(radio("Banana")).toHaveAttribute("tabindex", "0");
      expect(radio("Apple")).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("arrow keys", () => {
    it.each(["ArrowRight", "ArrowDown"])(
      "%s moves focus to the next radio and checks it",
      async (key) => {
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <Group defaultValue="apple" onValueChange={onValueChange} />
        ));

        await user.click(button("Before"));
        await user.keyboard(`[Tab][${key}]`);
        await afterFlush();

        expect(radio("Banana")).toHaveFocus();
        expect(checked()).toEqual(["Banana"]);
        expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
      },
    );

    it.each(["ArrowLeft", "ArrowUp"])(
      "%s moves focus to the previous radio and checks it",
      async (key) => {
        const { user } = await render(() => <Group defaultValue="cherry" />);

        await user.click(button("Before"));
        await user.keyboard(`[Tab][${key}]`);
        await afterFlush();

        expect(radio("Banana")).toHaveFocus();
        expect(checked()).toEqual(["Banana"]);
      },
    );

    it.each([
      ["ArrowRight", "cherry", "Apple"],
      ["ArrowDown", "cherry", "Apple"],
      ["ArrowLeft", "apple", "Cherry"],
      ["ArrowUp", "apple", "Cherry"],
    ])("%s from %s wraps to %s", async (key, from, to) => {
      const { user } = await render(() => <Group defaultValue={from} />);

      await user.click(button("Before"));
      await user.keyboard(`[Tab][${key}]`);
      await afterFlush();

      expect(radio(to)).toHaveFocus();
      expect(checked()).toEqual([to]);
    });

    it("moves from the first radio while none is checked", async () => {
      const { user } = await render(() => <Group />);

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowDown]");
      await afterFlush();

      expect(radio("Banana")).toHaveFocus();
      expect(checked()).toEqual(["Banana"]);
    });

    it("skips disabled radios", async () => {
      const { user } = await render(() => (
        <Group defaultValue="apple" disabled={["Banana"]} />
      ));

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowDown]");
      await afterFlush();
      expect(radio("Cherry")).toHaveFocus();
      expect(checked()).toEqual(["Cherry"]);

      await user.keyboard("[ArrowUp]");
      await afterFlush();
      expect(radio("Apple")).toHaveFocus();
    });

    it.skipIf(isJSDOM)(
      "mirrors Left and Right in a right-to-left group, and not Up and Down",
      async () => {
        const { user } = await render(() => (
          <div dir="rtl">
            <Group defaultValue="apple" />
          </div>
        ));

        await user.click(button("Before"));
        await user.keyboard("[Tab][ArrowLeft]");
        await afterFlush();
        expect(radio("Banana")).toHaveFocus();
        expect(checked()).toEqual(["Banana"]);

        await user.keyboard("[ArrowRight]");
        await afterFlush();
        expect(radio("Apple")).toHaveFocus();

        await user.keyboard("[ArrowDown]");
        await afterFlush();
        expect(radio("Banana")).toHaveFocus();
      },
    );

    it("leaves Home, End, other keys and arrow keys with a modifier alone", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <Group defaultValue="banana" onValueChange={onValueChange} />
      ));

      for (const init of [
        { key: "Home" },
        { key: "End" },
        { key: "a" },
        { key: "ArrowDown", altKey: true },
        { key: "ArrowRight", shiftKey: true },
      ]) {
        expect(fireEvent.keyDown(radio("Banana"), init)).toBe(true);
      }
      await afterFlush();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(checked()).toEqual(["Banana"]);
    });

    it("moves focus and asks when controlled; declined, the radio checked before keeps the value and its input", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Group value="apple" onValueChange={onValueChange} />
      ));

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowDown]");
      await afterFlush();

      expect(radio("Banana")).toHaveFocus();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
      expect(checked()).toEqual(["Apple"]);
      const inputs =
        document.querySelectorAll<HTMLInputElement>("input[type=radio]");
      expect([...inputs].map((input) => input.checked)).toEqual([
        true,
        false,
        false,
      ]);
    });

    it("puts a radio added later in the order of the document", async () => {
      const [names, setNames] = createSignal(["Apple", "Cherry"]);
      const { user } = await render(() => (
        <>
          <button>Before</button>
          <Radio.Root>
            <For each={names()}>
              {(name) => (
                <label>
                  <Radio.Item value={name.toLowerCase()} />
                  {name}
                </label>
              )}
            </For>
          </Radio.Root>
        </>
      ));

      setNames(["Apple", "Banana", "Cherry"]);
      flush();
      expect(radio("Banana")).toHaveAttribute("tabindex", "-1");

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowDown]");
      expect(radio("Banana")).toHaveFocus();
      await user.keyboard("[ArrowDown]");
      expect(radio("Cherry")).toHaveFocus();
    });
  });
});
