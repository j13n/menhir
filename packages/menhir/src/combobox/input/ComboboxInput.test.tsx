// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, keyboard, press } from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import {
  active,
  hiddenInput,
  input,
  items,
  list,
  shown,
} from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

describeConformance(
  "<Combobox.Input />",
  (props) => (
    <Combobox.Root>
      <Combobox.Input {...props} />
    </Combobox.Root>
  ),
  { tagName: "INPUT" },
);

/** Whether the last key down that reached the window was cancelled. */
function watchKeys() {
  const keys: { key: string; cancelled: boolean }[] = [];
  const listener = (event: KeyboardEvent) =>
    keys.push({ key: event.key, cancelled: event.defaultPrevented });
  window.addEventListener("keydown", listener);
  return {
    last: () => keys[keys.length - 1],
    stop: () => window.removeEventListener("keydown", listener),
  };
}

describe("<Combobox.Input />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a text input with the combobox role, aria-autocomplete list, aria-controls naming the List and autocomplete off", async () => {
    await render(() => <Fruit />);

    expect(input().tagName).toBe("INPUT");
    expect(input()).toHaveAttribute("type", "text");
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(list().id).not.toBe("");
    expect(input()).toHaveAttribute("aria-controls", list().id);
    expect(input()).toHaveAttribute("autocomplete", "off");
    expect(input()).not.toHaveAttribute("aria-haspopup");
  });

  it("takes the consumer's autocomplete", async () => {
    await render(() => (
      <Combobox.Root>
        <Combobox.Input autocomplete="country-name" />
      </Combobox.Root>
    ));

    expect(input()).toHaveAttribute("autocomplete", "country-name");
  });

  it("has aria-expanded false while closed and true while open", async () => {
    const { user } = await render(() => <Fruit />);
    expect(input()).toHaveAttribute("aria-expanded", "false");

    await user.type(input(), "a");
    await afterFlush();

    expect(input()).toHaveAttribute("aria-expanded", "true");
  });

  it("takes the consumer's id, and a label for it names it", async () => {
    await render(() => <Fruit />);

    expect(input().id).toBe("fruit");
    expect(input()).toHaveAccessibleName("Fruit");
  });

  it("opens the list as the user types, with no item active, and reports the text", async () => {
    const onOpenChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit
        onOpenChange={onOpenChange}
        onInputValueChange={onInputValueChange}
      />
    ));

    await user.type(input(), "b");
    await afterFlush();

    expect(shown()).toBe(true);
    expect(input()).toHaveValue("b");
    expect(items()).toEqual(["Banana", "Blueberry"]);
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true, {
      reason: "input-change",
      event: expect.any(Event),
    });
    expect(onInputValueChange).toHaveBeenCalledWith("b", {
      reason: "input-change",
      event: expect.any(Event),
    });
  });

  it.each([
    ["Down Arrow", "{ArrowDown}", "Apple"],
    ["Up Arrow", "{ArrowUp}", "Cherry"],
  ])("opens on %s on the first or last item", async (_name, keys, label) => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Fruit onOpenChange={onOpenChange} />);
    input().focus();

    await user.keyboard(keys);
    await afterFlush();

    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(active()).toBe(label));
    expect(onOpenChange).toHaveBeenCalledWith(true, {
      reason: "arrow-key",
      event: expect.any(KeyboardEvent),
    });
  });

  it("opens on Alt+Down Arrow with no item active", async () => {
    const { user } = await render(() => <Fruit />);
    input().focus();

    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await afterFlush();

    expect(shown()).toBe(true);
    expect(input()).not.toHaveAttribute("aria-activedescendant");
  });

  it("moves the active item with Down and Up while open, wrapping, and keeps focus", async () => {
    const { user } = await render(() => <Fruit />);
    await user.type(input(), "b");
    await afterFlush();

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Banana");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Blueberry");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Banana");
    await user.keyboard("{ArrowUp}");
    expect(active()).toBe("Blueberry");
    expect(document.activeElement).toBe(input());
  });

  it("leaves Home, End, Left and Right to the text, and typing empties the active item", async () => {
    const keys = watchKeys();
    const { user } = await render(() => <Fruit />);
    await user.type(input(), "b");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Banana");

    for (const key of ["{Home}", "{End}", "{ArrowLeft}", "{ArrowRight}"]) {
      await user.keyboard(key);
      expect(keys.last()!.cancelled).toBe(false);
    }
    expect(active()).toBe("Banana");

    await user.keyboard("l");
    await afterFlush();

    expect(input()).toHaveValue("bl");
    expect(items()).toEqual(["Blueberry"]);
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    keys.stop();
  });

  it("selects the active item on Enter, sets the text to its label, closes and cancels the key", async () => {
    const keys = watchKeys();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    await user.type(input(), "ch");
    await user.keyboard("{ArrowDown}");

    await user.keyboard("{Enter}");
    await afterFlush();

    expect(keys.last()).toEqual({ key: "Enter", cancelled: true });
    expect(shown()).toBe(false);
    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(onInputValueChange).toHaveBeenLastCalledWith("Cherry", {
      reason: "item-press",
      event: expect.any(KeyboardEvent),
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "item-press",
      event: expect.any(KeyboardEvent),
    });
    expect(input()).toHaveValue("Cherry");
    expect(hiddenInput()).toHaveValue("cherry");
    keys.stop();
  });

  it("closes on Enter with no item active, and lets the key through", async () => {
    const keys = watchKeys();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit onOpenChange={onOpenChange} onValueChange={onValueChange} />
    ));
    await user.type(input(), "ch");
    await afterFlush();

    await user.keyboard("{Enter}");
    await afterFlush();

    expect(keys.last()).toEqual({ key: "Enter", cancelled: false });
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "enter-key",
      event: expect.any(KeyboardEvent),
    });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue("ch");
    keys.stop();
  });

  it("selects nothing on a key down while an input method composes", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit onValueChange={onValueChange} />
    ));
    await user.type(input(), "ch");
    await user.keyboard("{ArrowDown}");

    fireEvent.keyDown(input(), { key: "Enter", isComposing: true });
    fireEvent.keyDown(input(), { key: "ArrowDown", isComposing: true });
    await afterFlush();

    expect(shown()).toBe(true);
    expect(active()).toBe("Cherry");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("closes on Alt+Up Arrow", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Fruit onOpenChange={onOpenChange} />);
    await user.type(input(), "b");
    await afterFlush();

    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "arrow-key",
      event: expect.any(KeyboardEvent),
    });
  });

  it("closes the open list on Escape and keeps the text; on a closed list, empties the text and the value", async () => {
    const keys = watchKeys();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit
        defaultValue="banana"
        defaultInputValue="Banana"
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    input().focus();
    await user.keyboard("{ArrowDown}");
    await afterFlush();

    await user.keyboard("{Escape}");
    await afterFlush();

    expect(keys.last()).toEqual({ key: "Escape", cancelled: true });
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "escape-key",
      event: expect.any(KeyboardEvent),
    });
    expect(input()).toHaveValue("Banana");
    expect(onValueChange).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    await afterFlush();

    expect(keys.last()).toEqual({ key: "Escape", cancelled: true });
    expect(input()).toHaveValue("");
    expect(hiddenInput()).toHaveValue("");
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onInputValueChange).toHaveBeenLastCalledWith("", {
      reason: "escape-key",
      event: expect.any(KeyboardEvent),
    });

    // Nothing left to clear: a dialog around it may close.
    await user.keyboard("{Escape}");
    expect(keys.last()).toEqual({ key: "Escape", cancelled: false });
    keys.stop();
  });

  it("closes as focus leaves and puts the text back to the selected item's label", async () => {
    const onOpenChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit
        defaultValue="banana"
        onOpenChange={onOpenChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    await afterFlush();
    expect(input()).toHaveValue("Banana");

    await user.clear(input());
    await user.type(input(), "ch");
    await afterFlush();
    expect(shown()).toBe(true);

    screen.getByRole("button", { name: "After" }).focus();
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "focus-out",
      event: expect.any(FocusEvent),
    });
    expect(input()).toHaveValue("Banana");
    expect(onInputValueChange).toHaveBeenLastCalledWith("Banana", {
      reason: "focus-out",
      event: expect.any(FocusEvent),
    });
    // The list shows every item again.
    expect(items()).toHaveLength(4);
  });

  it("empties a typed text as focus leaves when no item is selected", async () => {
    const { user } = await render(() => <Fruit />);

    await user.type(input(), "ch");
    screen.getByRole("button", { name: "After" }).focus();
    await afterFlush();

    expect(input()).toHaveValue("");
  });

  it("clears the value as focus leaves a text the user emptied", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit defaultValue="banana" onValueChange={onValueChange} />
    ));
    await afterFlush();

    await user.clear(input());
    screen.getByRole("button", { name: "After" }).focus();
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(hiddenInput()).toHaveValue("");
    expect(input()).toHaveValue("");
  });

  it("changes nothing as focus leaves an untouched Combobox", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    await render(() => (
      <Fruit
        defaultValue="banana"
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    await afterFlush();

    input().focus();
    screen.getByRole("button", { name: "After" }).focus();
    await afterFlush();

    expect(input()).toHaveValue("Banana");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onInputValueChange).not.toHaveBeenCalled();
  });

  it("keeps the value as focus leaves an untouched Combobox whose items have not mounted", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <>
        <Combobox.Root defaultValue="banana" onValueChange={onValueChange}>
          <Combobox.Input aria-label="Fruit" />
          <Combobox.Popup>
            <Combobox.List aria-label="Fruits" />
          </Combobox.Popup>
        </Combobox.Root>
        <button type="button">After</button>
      </>
    ));
    expect(input()).toHaveValue("");

    input().focus();
    screen.getByRole("button", { name: "After" }).focus();
    await afterFlush();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(hiddenInput()).toHaveValue("banana");
  });

  it.skipIf(isJSDOM)("closes on Tab and selects nothing", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit onValueChange={onValueChange} />
    ));
    await user.type(input(), "ch");
    await user.keyboard("{ArrowDown}");

    await keyboard("{Tab}");
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
    // The Trigger and Clear are out of the tab order.
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" }),
    );
  });

  it.skipIf(isJSDOM)("closes on a press outside", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Fruit onOpenChange={onOpenChange} />);
    await user.type(input(), "b");
    await afterFlush();
    expect(shown()).toBe(true);

    await press({ x: 2, y: window.innerHeight - 2 });
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "focus-out",
      event: expect.any(FocusEvent),
    });
  });

  it.skipIf(isJSDOM)(
    "keeps the list open and the text as typed while a press moves the caret",
    async () => {
      const { user } = await render(() => <Fruit />);
      await user.type(input(), "b");
      await afterFlush();

      await press(centerOf(input()));
      await afterFlush();

      expect(shown()).toBe(true);
      expect(input()).toHaveValue("b");
    },
  );

  it("is disabled with data-disabled when the Root is, and has aria-required and data-required when required", async () => {
    await render(() => (
      <>
        <Combobox.Root disabled>
          <Combobox.Input aria-label="Disabled" />
        </Combobox.Root>
        <Combobox.Root required>
          <Combobox.Input aria-label="Required" />
        </Combobox.Root>
      </>
    ));
    const disabled = screen.getByRole("combobox", { name: "Disabled" });
    const required = screen.getByRole("combobox", { name: "Required" });

    expect(disabled).toBeDisabled();
    expect(disabled).toHaveAttribute("data-disabled", "");
    expect(disabled).toHaveAttribute("data-closed", "");
    expect(required).toHaveAttribute("aria-required", "true");
    expect(required).toHaveAttribute("data-required", "");
  });

  it("throws a descriptive error outside Combobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Combobox.Input />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
