// The test list and the cases left out are in ./README.md. The fixtures
// wire typeahead with list navigation, as Menu and Select will.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRenderer, fireEvent, screen } from "#test-utils";

import {
  activeLabel,
  item,
  press,
} from "../../../test/floating/list-navigation/helpers.ts";
import { Menu } from "../../../test/floating/typeahead/Menu.tsx";
import { Select } from "../../../test/floating/typeahead/Select.tsx";

beforeEach(() => {
  // jsdom has no scrolling: list navigation's scroll into view is a no-op.
  Element.prototype.scrollIntoView ??= () => {};
  // Only the timers typeahead uses, so `getTimerCount` counts its own.
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("createTypeahead", () => {
  const { render } = createRenderer();

  it("moves to the next item that starts with a character, through list navigation's move", async () => {
    await render(() => <Menu />);

    await press("b");
    expect(activeLabel()).toBe("Banana");
    expect(document.activeElement).toBe(item("Banana"));
  });

  it("builds a string of characters typed less than 1 second apart, and starts a new one after 1 second without a key", async () => {
    await render(() => <Menu items={["Apple", "Banana", "Cherry", "Lemon"]} />);

    await press("b");
    vi.advanceTimersByTime(999);
    await press("l");
    // "bl" matches nothing, so Banana stays.
    expect(activeLabel()).toBe("Banana");
    vi.advanceTimersByTime(999);
    await press("a");
    expect(activeLabel()).toBe("Banana");
    vi.advanceTimersByTime(1000);
    await press("l");
    expect(activeLabel()).toBe("Lemon");
  });

  it("cycles through the items that start with the same character repeated", async () => {
    await render(() => <Menu />);

    await press("b");
    await press("b");
    expect(activeLabel()).toBe("Blueberry");
    await press("b");
    expect(activeLabel()).toBe("Banana");
  });

  it("uses a printable character, matched or not, and cancels its default action; Shift gives a capital, which matches", async () => {
    await render(() => <Menu />);

    // The test browser's input, with Shift held, gives the key "b", where a
    // keyboard gives "B": Testing Library's event in both environments.
    expect(fireEvent.keyDown(item("Apple"), { key: "B", shiftKey: true })).toBe(
      false,
    );
    expect(activeLabel()).toBe("Banana");
    vi.advanceTimersByTime(1000);
    expect(await press("z")).toBe(false);
    expect(activeLabel()).toBe("Banana");
  });

  it("leaves named keys, and characters with Control, Alt or Meta, to the list, the item and the browser", async () => {
    const onActivate = vi.fn();
    await render(() => <Menu onActivate={onActivate} />);

    await press("ArrowDown");
    expect(activeLabel()).toBe("Apple");
    await press("Enter");
    expect(onActivate).toHaveBeenCalledWith("Apple");
    for (const modifier of ["ctrlKey", "altKey", "metaKey"] as const) {
      expect(await press("b", { [modifier]: true })).toBe(true);
      expect(activeLabel()).toBe("Apple");
    }
  });

  it("adds Space to a string being typed, uses and cancels it, so the item does not activate; with no string, Space activates", async () => {
    const onActivate = vi.fn();
    await render(() => (
      <Menu items={["New Jersey", "New York"]} onActivate={onActivate} />
    ));

    for (const key of "new") await press(key);
    expect(await press(" ")).toBe(false);
    await press("y");
    expect(activeLabel()).toBe("New York");
    expect(onActivate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(await press(" ")).toBe(false);
    expect(onActivate).toHaveBeenCalledExactlyOnceWith("New York");
  });

  // The test browser's input cannot start a composition, so the key is
  // Testing Library's event in both environments.
  it("ignores a key while an input method is composing, which joins no string", async () => {
    await render(() => <Menu />);

    await press("b");
    expect(
      fireEvent.keyDown(item("Banana"), { key: "l", isComposing: true }),
    ).toBe(true);
    expect(activeLabel()).toBe("Banana");
    // "bl", not "bll", which would match nothing.
    await press("l");
    expect(activeLabel()).toBe("Blueberry");
  });

  it("skips items the keys do not reach", async () => {
    await render(() => <Menu unreachable={["Banana"]} />);

    await press("b");
    expect(activeLabel()).toBe("Blueberry");
    await press("b");
    expect(activeLabel()).toBe("Blueberry");
  });

  it("matches a disabled item the keys reach", async () => {
    await render(() => <Menu disabled={["Banana"]} />);

    await press("b");
    expect(activeLabel()).toBe("Banana");
    expect(item("Banana")).toHaveAttribute("aria-disabled", "true");
  });

  // As list navigation takes the arrow keys from it: the item's own
  // handler hands the key over.
  it("takes a key from a focused item the keys do not reach", async () => {
    await render(() => <Menu unreachable={["Banana"]} />);

    item("Banana").focus();
    await press("c");
    expect(activeLabel()).toBe("Cherry");
    expect(document.activeElement).toBe(item("Cherry"));
  });

  it("matches an item's own text over its content", async () => {
    await render(() => <Menu texts={{ Cherry: "Morello" }} />);

    await press("m");
    expect(activeLabel()).toBe("Cherry");
    vi.advanceTimersByTime(1000);
    await press("c");
    expect(activeLabel()).toBe("Cherry");
    expect(document.activeElement).toBe(item("Cherry"));
  });

  it("moves only the nested list on a key from a list nested in an item", async () => {
    await render(() => (
      <Menu nested={{ in: "Cherry", items: ["Bing", "Rainier"] }} />
    ));

    await press("c");
    item("Bing").focus();
    await press("r");
    expect(document.activeElement).toBe(item("Rainier"));
    expect(item("Cherry")).toHaveAttribute("data-active");
    vi.advanceTimersByTime(1000);
    // The parent list would move to Banana.
    await press("b");
    expect(document.activeElement).toBe(item("Bing"));
    expect(item("Cherry")).toHaveAttribute("data-active");
  });

  it("opens a closed Select on a character, and moves to the first option that matches, without changing the value", async () => {
    await render(() => <Select defaultValue="Cherry" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    trigger.focus();

    expect(await press("b")).toBe(false);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(activeLabel()).toBe("Banana");
    expect(trigger).toHaveAttribute("aria-activedescendant", item("Banana").id);
    expect(trigger).toHaveTextContent("Cherry");
    expect(item("Cherry")).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps the typed string through that opening", async () => {
    await render(() => <Select />);

    await press("b");
    await press("l");
    expect(activeLabel()).toBe("Blueberry");
  });

  it("clears the typed string and its timer when the popup closes", async () => {
    await render(() => <Select />);

    await press("b");
    expect(vi.getTimerCount()).toBe(1);
    await press("Escape");
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(vi.getTimerCount()).toBe(0);
    // "l", not "bl": nothing matches.
    await press("l");
    expect(activeLabel()).toBeUndefined();
  });

  it("clears the timer on disposal", async () => {
    const { unmount } = await render(() => <Menu />);
    await press("b");
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
