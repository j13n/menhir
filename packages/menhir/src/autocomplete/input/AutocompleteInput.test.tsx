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
import { City } from "../../../test/autocomplete/City.tsx";
import {
  active,
  input,
  items,
  list,
  shown,
} from "../../../test/autocomplete/queries.ts";
import { Autocomplete } from "../index.ts";

describeConformance(
  "<Autocomplete.Input />",
  (props) => (
    <Autocomplete.Root>
      <Autocomplete.Input {...props} />
    </Autocomplete.Root>
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

const after = () => screen.getByRole("button", { name: "After" });

describe("<Autocomplete.Input />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a text input with the combobox role, aria-autocomplete list, aria-controls naming the List and autocomplete off, and no hidden input", async () => {
    await render(() => <City />);

    expect(input().tagName).toBe("INPUT");
    expect(input()).toHaveAttribute("type", "text");
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(list().id).not.toBe("");
    expect(input()).toHaveAttribute("aria-controls", list().id);
    expect(input()).toHaveAttribute("autocomplete", "off");
    expect(input().nextElementSibling?.tagName).not.toBe("INPUT");
  });

  it("takes the consumer's autocomplete", async () => {
    await render(() => (
      <Autocomplete.Root>
        <Autocomplete.Input autocomplete="address-level2" />
      </Autocomplete.Root>
    ));

    expect(input()).toHaveAttribute("autocomplete", "address-level2");
  });

  it("has aria-expanded false while closed and true while open", async () => {
    const { user } = await render(() => <City />);
    expect(input()).toHaveAttribute("aria-expanded", "false");

    await user.type(input(), "o");
    await afterFlush();

    expect(input()).toHaveAttribute("aria-expanded", "true");
  });

  it("takes the consumer's id, and a label for it names it", async () => {
    await render(() => <City />);

    expect(input().id).toBe("city");
    expect(input()).toHaveAccessibleName("City");
  });

  it("opens the list as the user types, with no item active", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <City onOpenChange={onOpenChange} />);

    await user.type(input(), "b");
    await afterFlush();

    expect(shown()).toBe(true);
    expect(items()).toEqual(["Bergen", "Bodø"]);
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    expect(onOpenChange).toHaveBeenCalledWith(true, {
      reason: "input-change",
      event: expect.any(Event),
    });
  });

  it("opens on Down Arrow on the first item and on Up Arrow on the last, and moves, wrapping", async () => {
    const { user } = await render(() => <City />);
    input().focus();

    await user.keyboard("{ArrowDown}");
    await afterFlush();
    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(active()).toBe("Bergen"));
    await user.keyboard("{ArrowUp}");
    expect(active()).toBe("Trondheim");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Bergen");
    expect(document.activeElement).toBe(input());

    await user.keyboard("{Escape}");
    await afterFlush();
    await user.keyboard("{ArrowUp}");
    await afterFlush();
    await vi.waitFor(() => expect(active()).toBe("Trondheim"));
  });

  it("accepts the active item on Enter: the text becomes its value, the list closes and the key is cancelled", async () => {
    const keys = watchKeys();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <City onOpenChange={onOpenChange} onValueChange={onValueChange} />
    ));
    await user.type(input(), "tr");
    await user.keyboard("{ArrowDown}");

    await user.keyboard("{Enter}");
    await afterFlush();

    expect(keys.last()).toEqual({ key: "Enter", cancelled: true });
    expect(shown()).toBe(false);
    expect(input()).toHaveValue("Trondheim");
    expect(onValueChange).toHaveBeenLastCalledWith("Trondheim", {
      reason: "item-press",
      event: expect.any(KeyboardEvent),
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "item-press",
      event: expect.any(KeyboardEvent),
    });
    keys.stop();
  });

  it("closes on Enter with no item active, keeps the text and lets the key through", async () => {
    const keys = watchKeys();
    const onOpenChange = vi.fn();
    const { user } = await render(() => <City onOpenChange={onOpenChange} />);
    await user.type(input(), "Tromsø");
    await afterFlush();

    await user.keyboard("{Enter}");
    await afterFlush();

    expect(keys.last()).toEqual({ key: "Enter", cancelled: false });
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "enter-key",
      event: expect.any(KeyboardEvent),
    });
    expect(input()).toHaveValue("Tromsø");
    keys.stop();
  });

  it("closes the open list on Escape and keeps the text; on a closed list, empties the text", async () => {
    const keys = watchKeys();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <City onOpenChange={onOpenChange} onValueChange={onValueChange} />
    ));
    await user.type(input(), "os");
    await afterFlush();

    await user.keyboard("{Escape}");
    await afterFlush();
    expect(keys.last()).toEqual({ key: "Escape", cancelled: true });
    expect(shown()).toBe(false);
    expect(input()).toHaveValue("os");
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "escape-key",
      event: expect.any(KeyboardEvent),
    });

    await user.keyboard("{Escape}");
    await afterFlush();
    expect(keys.last()).toEqual({ key: "Escape", cancelled: true });
    expect(input()).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith("", {
      reason: "escape-key",
      event: expect.any(KeyboardEvent),
    });

    // Nothing left to clear: a dialog around it may close.
    await user.keyboard("{Escape}");
    expect(keys.last()).toEqual({ key: "Escape", cancelled: false });
    keys.stop();
  });

  it("closes as focus leaves and keeps a typed text that matches no item", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <City onOpenChange={onOpenChange} onValueChange={onValueChange} />
    ));
    await user.type(input(), "Tromsø");
    await afterFlush();
    expect(shown()).toBe(true);
    onValueChange.mockClear();

    after().focus();
    await afterFlush();

    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "focus-out",
      event: expect.any(FocusEvent),
    });
    expect(input()).toHaveValue("Tromsø");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.skipIf(isJSDOM)("closes on Tab and keeps the text", async () => {
    const { user } = await render(() => <City />);
    await user.type(input(), "tr");
    await user.keyboard("{ArrowDown}");

    await keyboard("{Tab}");
    await afterFlush();

    expect(shown()).toBe(false);
    expect(input()).toHaveValue("tr");
    // The Trigger and Clear are out of the tab order.
    expect(document.activeElement).toBe(after());
  });

  it("is disabled with data-disabled when the Root is", async () => {
    await render(() => (
      <Autocomplete.Root disabled>
        <Autocomplete.Input aria-label="Disabled" />
      </Autocomplete.Root>
    ));

    expect(input()).toBeDisabled();
    expect(input()).toHaveAttribute("data-disabled", "");
    expect(input()).toHaveAttribute("data-closed", "");
  });

  it("throws a descriptive error outside Autocomplete.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Autocomplete.Input />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Autocomplete parts must be placed within <Autocomplete.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
