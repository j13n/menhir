// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import { keyboard } from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import {
  active,
  chip,
  chipLabels,
  input,
  list,
  shown,
  submitted,
} from "../../../test/multi-combobox/queries.ts";
import { Autocomplete } from "../../autocomplete/index.ts";
import { Combobox } from "../../combobox/index.ts";
import { MultiCombobox } from "../index.ts";

describeConformance(
  "<MultiCombobox.Input />",
  (props) => (
    <MultiCombobox.Root>
      <MultiCombobox.Input {...props} />
    </MultiCombobox.Root>
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

describe("<MultiCombobox.Input />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a text input with the combobox role, aria-autocomplete list, aria-controls naming the List and aria-expanded", async () => {
    const { user } = await render(() => <Toppings />);

    expect(input()).toHaveAttribute("type", "text");
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(input()).toHaveAttribute("aria-controls", list().id);
    expect(input()).toHaveAttribute("aria-expanded", "false");

    await user.type(input(), "o");
    await afterFlush();
    expect(input()).toHaveAttribute("aria-expanded", "true");
  });

  it("opens the list as the user types with no item active, and on Down Arrow on the first item", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Toppings onOpenChange={onOpenChange} />
    ));

    await user.type(input(), "o");
    await afterFlush();
    expect(shown()).toBe(true);
    expect(active()).toBeUndefined();
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "input-change",
      event: expect.any(Event),
    });

    await user.keyboard("{Escape}{ArrowDown}");
    await afterFlush();
    expect(active()).toBe("✓Mushrooms");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("✓Olives");
  });

  it("adds the active item on Enter, keeps the list open and the item active, empties the text and cancels the key", async () => {
    const keys = watchKeys();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings onValueChange={onValueChange} />
    ));

    await user.type(input(), "o");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    await user.keyboard("{Enter}");
    await afterFlush();

    expect(keys.last()).toEqual({ key: "Enter", cancelled: true });
    expect(onValueChange).toHaveBeenLastCalledWith(["olives"]);
    expect(chipLabels()).toEqual(["Olives"]);
    expect(input()).toHaveValue("");
    expect(shown()).toBe(true);
    expect(active()).toBe("✓Olives");
    // The chip is added before the input, which keeps focus.
    expect(document.activeElement).toBe(input());

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    await afterFlush();
    expect(chipLabels()).toEqual(["Olives", "Onions"]);
    keys.stop();
  });

  it("takes a selected item out on Enter", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["cheese", "olives"]}
        onValueChange={onValueChange}
      />
    ));

    input().focus();
    await user.keyboard("{ArrowDown}{Enter}");
    await afterFlush();

    expect(onValueChange).toHaveBeenLastCalledWith(["olives"]);
    expect(chipLabels()).toEqual(["Olives"]);
    expect(shown()).toBe(true);
  });

  it("closes on Enter with no item active, and lets the key through", async () => {
    const keys = watchKeys();
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Toppings onOpenChange={onOpenChange} />
    ));

    await user.type(input(), "o");
    await user.keyboard("{Enter}");
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "enter-key",
      event: expect.any(KeyboardEvent),
    });
    expect(keys.last()).toEqual({ key: "Enter", cancelled: false });
    keys.stop();
  });

  it("closes the open list on Escape and keeps the text; on a closed list, empties the text and keeps the values", async () => {
    const keys = watchKeys();
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        defaultValue={["olives"]}
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));

    await user.type(input(), "ch");
    await user.keyboard("{Escape}");
    await afterFlush();
    expect(keys.last()).toEqual({ key: "Escape", cancelled: true });
    expect(shown()).toBe(false);
    expect(input()).toHaveValue("ch");

    await user.keyboard("{Escape}");
    await afterFlush();
    expect(keys.last()).toEqual({ key: "Escape", cancelled: true });
    expect(input()).toHaveValue("");
    expect(onInputValueChange).toHaveBeenLastCalledWith("", {
      reason: "escape-key",
      event: expect.any(KeyboardEvent),
    });
    expect(chipLabels()).toEqual(["Olives"]);

    // Nothing left to empty: a dialog around it may close.
    await user.keyboard("{Escape}");
    expect(keys.last()).toEqual({ key: "Escape", cancelled: false });
    expect(onValueChange).not.toHaveBeenCalled();
    keys.stop();
  });

  it("closes as focus leaves and empties the text", async () => {
    const onOpenChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <Toppings
        onOpenChange={onOpenChange}
        onInputValueChange={onInputValueChange}
      />
    ));

    await user.type(input(), "ch");
    await afterFlush();
    screen.getByRole("button", { name: "After" }).focus();
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "focus-out",
      event: expect.any(FocusEvent),
    });
    expect(input()).toHaveValue("");
    expect(onInputValueChange).toHaveBeenLastCalledWith("", {
      reason: "focus-out",
      event: expect.any(FocusEvent),
    });
  });

  it("focuses the last chip on Backspace in an empty input; with text, Backspace edits it", async () => {
    const keys = watchKeys();
    const { user } = await render(() => (
      <Toppings defaultValue={["olives", "cheese"]} />
    ));

    await user.type(input(), "o");
    await user.keyboard("{Backspace}");
    expect(input()).toHaveValue("");
    expect(document.activeElement).toBe(input());
    expect(keys.last()).toEqual({ key: "Backspace", cancelled: false });

    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(chip("Cheese"));
    expect(keys.last()).toEqual({ key: "Backspace", cancelled: true });
    expect(chipLabels()).toEqual(["Olives", "Cheese"]);
    keys.stop();
  });

  it("leaves Backspace to the text with the caret at the start of a text", async () => {
    const keys = watchKeys();
    const { user } = await render(() => (
      <Toppings defaultValue={["olives", "cheese"]} />
    ));

    await user.type(input(), "on");
    input().setSelectionRange(0, 0);
    await user.keyboard("{Backspace}");

    expect(document.activeElement).toBe(input());
    expect(input()).toHaveValue("on");
    expect(keys.last()).toEqual({ key: "Backspace", cancelled: false });
    keys.stop();
  });

  it("does nothing on Backspace in an empty input with no chips", async () => {
    const keys = watchKeys();
    const { user } = await render(() => <Toppings />);

    input().focus();
    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(input());
    expect(keys.last()).toEqual({ key: "Backspace", cancelled: false });
    keys.stop();
  });

  it.skipIf(isJSDOM)(
    "focuses the last chip on Left with the caret at the start, and keeps the text; elsewhere Left moves the caret",
    async () => {
      const { user } = await render(() => (
        <Toppings defaultValue={["olives", "cheese"]} />
      ));

      await user.type(input(), "on");
      await afterFlush();
      await keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(input());
      expect(input().selectionStart).toBe(1);

      await keyboard("{ArrowLeft}{ArrowLeft}");
      await afterFlush();
      expect(document.activeElement).toBe(chip("Cheese"));
      expect(input()).toHaveValue("on");
    },
  );

  it.skipIf(isJSDOM)(
    "focuses the last chip on Right with the caret at the start, right to left",
    async () => {
      const { user } = await render(() => (
        <div dir="rtl">
          <Toppings defaultValue={["olives", "cheese"]} />
        </div>
      ));

      input().focus();
      await keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(input());
      await keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(chip("Cheese"));
      await user.keyboard("{ArrowLeft}");
      expect(document.activeElement).toBe(input());
    },
  );

  it("is disabled with its hidden inputs when the Root is, and has aria-required when required", async () => {
    await render(() => (
      <>
        <MultiCombobox.Root disabled name="a" defaultValue={["x"]}>
          <MultiCombobox.Input aria-label="Disabled" />
        </MultiCombobox.Root>
        <MultiCombobox.Root required>
          <MultiCombobox.Input aria-label="Required" />
        </MultiCombobox.Root>
      </>
    ));
    const disabled = screen.getByRole("combobox", { name: "Disabled" });
    const required = screen.getByRole("combobox", { name: "Required" });

    expect(disabled).toBeDisabled();
    expect(disabled).toHaveAttribute("data-disabled", "");
    expect(document.querySelector("input[type=hidden]")).toBeDisabled();
    expect(required).toHaveAttribute("aria-required", "true");
    expect(required).toHaveAttribute("data-required", "");
    expect(submitted()).toEqual(["x"]);
  });

  it("drops a name passed to it", async () => {
    await render(() => (
      <MultiCombobox.Root name="toppings">
        <MultiCombobox.Input aria-label="Toppings" {...{ name: "text" }} />
      </MultiCombobox.Root>
    ));

    expect(input()).not.toHaveAttribute("name");
  });

  it("throws a descriptive error outside MultiCombobox.Root, and inside Combobox.Root", async () => {
    await render(() => (
      <>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <MultiCombobox.Input />
        </Errored>
        <Combobox.Root>
          <Errored fallback={(error) => <p>{String(error())}</p>}>
            <MultiCombobox.Input />
          </Errored>
        </Combobox.Root>
        <MultiCombobox.Root>
          <Errored fallback={(error) => <p>{String(error())}</p>}>
            <Autocomplete.Input />
          </Errored>
        </MultiCombobox.Root>
      </>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] MultiCombobox parts must be placed within <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Error: [menhir] MultiCombobox parts must be placed within <MultiCombobox.Root>, not <Combobox.Root>.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Error: [menhir] Autocomplete parts must be placed within <Autocomplete.Root>, not <MultiCombobox.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
