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

import {
  centerOf,
  keyboard,
  movePointer,
  nextTask,
} from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/select/Fruit.tsx";
import {
  active,
  item,
  popup,
  selected,
  shown,
  trigger,
} from "../../../test/select/queries.ts";
import { Select } from "../index.ts";

/** Thirty items, "Item 0" to "Item 29". */
const thirty = () =>
  Array.from({ length: 30 }, (_, index) => (
    <Select.Item value={`item-${index}`} style={{ height: "20px" }}>
      Item {index}
    </Select.Item>
  ));

describeConformance(
  "<Select.Item />",
  (props) => (
    <Select.Root>
      <Select.Popup>
        <Select.Item value="one" {...props} />
      </Select.Popup>
    </Select.Root>
  ),
  { tagName: "DIV" },
);

describeConformance(
  "<Select.ItemIndicator />",
  (props) => (
    <Select.Root>
      <Select.Popup>
        <Select.Item value="one">
          <Select.ItemIndicator {...props} />
        </Select.Item>
      </Select.Popup>
    </Select.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Select.Item />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  /** Renders an open Fruit select with focus on its Trigger. */
  async function renderOpen(ui: () => ReturnType<typeof Fruit>) {
    const view = await render(ui);
    trigger().focus();
    await afterFlush();
    await vi.waitFor(() => expect(active()).toBeDefined());
    return view;
  }

  it("renders an option with aria-selected, data-selected or data-unselected, and an id, the consumer's if given", async () => {
    await render(() => (
      <Fruit defaultValue="banana">
        <Select.Item value="apple" id="first">
          Apple
        </Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
      </Fruit>
    ));

    expect(item("Apple").tagName).toBe("DIV");
    expect(item("Apple").id).toBe("first");
    expect(item("Apple")).toHaveAttribute("aria-selected", "false");
    expect(item("Apple")).toHaveAttribute("data-unselected", "");
    expect(item("Apple")).not.toHaveAttribute("data-selected");
    expect(item("Banana").id).not.toBe("");
    expect(item("Banana")).toHaveAttribute("aria-selected", "true");
    expect(item("Banana")).toHaveAttribute("data-selected", "");
    expect(item("Banana")).not.toHaveAttribute("data-unselected");
    // Items take no focus: the Trigger keeps it.
    expect(item("Banana")).not.toHaveAttribute("tabindex");
  });

  it("moves the active item with Down and Up without wrapping, and to the first and last with Home and End", async () => {
    const { user } = await renderOpen(() => <Fruit defaultOpen />);
    expect(active()).toBe("Apple");

    await user.keyboard("{ArrowUp}");
    expect(active()).toBe("Apple");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Banana");
    expect(item("Banana")).toHaveAttribute("data-active", "");
    expect(item("Apple")).not.toHaveAttribute("data-active");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Cherry");
    await user.keyboard("{Home}");
    expect(active()).toBe("Apple");
    await user.keyboard("{End}");
    expect(active()).toBe("Cherry");
    expect(selected()).toEqual([]);
  });

  it("moves ten items with PageDown and PageUp, stopping at the ends", async () => {
    const { user } = await renderOpen(() => (
      <Fruit defaultOpen>{thirty()}</Fruit>
    ));
    expect(active()).toBe("Item 0");

    await user.keyboard("{PageDown}");
    expect(active()).toBe("Item 10");
    await user.keyboard("{PageDown}{PageDown}");
    expect(active()).toBe("Item 29");
    await user.keyboard("{PageUp}");
    expect(active()).toBe("Item 19");
    await user.keyboard("{PageUp}{PageUp}");
    expect(active()).toBe("Item 0");
  });

  it("moves to the next item that starts with a typed character, matching label over content", async () => {
    const { user } = await renderOpen(() => (
      <Fruit defaultOpen>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana" label="Banana">
          🍌 Banana
        </Select.Item>
        <Select.Item value="blueberry">Blueberry</Select.Item>
      </Fruit>
    ));

    // "🍌 Banana" does not start with "b", its label does.
    await user.keyboard("b");
    expect(active()).toBe("🍌 Banana");
    await user.keyboard("b");
    expect(active()).toBe("Blueberry");
  });

  it("matches a typed character against an item's text without its ItemIndicator", async () => {
    const { user } = await renderOpen(() => (
      <Fruit defaultOpen>
        <Select.Item value="apple">
          <Select.ItemIndicator>✓</Select.ItemIndicator>
          Apple
        </Select.Item>
        <Select.Item value="banana">
          <Select.ItemIndicator>✓</Select.ItemIndicator>
          Banana
        </Select.Item>
      </Fruit>
    ));

    await user.keyboard("b");

    expect(active()).toBe("✓Banana");
  });

  it.skipIf(isJSDOM)(
    "makes the item the pointer moves onto active",
    async () => {
      await render(() => <Fruit defaultOpen />);
      await nextTask();

      await movePointer([centerOf(item("Cherry"))]);
      await afterFlush();

      expect(active()).toBe("Cherry");
      expect(item("Cherry")).toHaveAttribute("data-active", "");
    },
  );

  it.skipIf(isJSDOM)(
    "scrolls the active item into view in a list that scrolls",
    async () => {
      await render(() => (
        <Fruit
          defaultValue="item-25"
          popup={{ style: { height: "100px", "overflow-y": "auto" } }}
        >
          {thirty()}
        </Fruit>
      ));
      trigger().focus();
      const visible = (name: string) => {
        const list = popup().getBoundingClientRect();
        const box = item(name).getBoundingClientRect();
        return box.top >= list.top && box.bottom <= list.bottom;
      };

      // Opens on the selected item, far down the list.
      await keyboard("{Enter}");
      await nextTask();
      expect(active()).toBe("Item 25");
      expect(visible("Item 25")).toBe(true);

      await keyboard("{Home}");
      await nextTask();
      expect(visible("Item 0")).toBe(true);
    },
  );

  it("selects the item on a click and closes the list, reporting item-press", async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await renderOpen(() => (
      <Fruit
        defaultOpen
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
      >
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana" onClick={onClick}>
          Banana
        </Select.Item>
      </Fruit>
    ));

    await user.click(item("Banana"));
    await afterFlush();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(selected()).toEqual(["Banana"]);
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
    ["Alt+Up Arrow", "{Alt>}{ArrowUp}{/Alt}"],
  ])(
    "selects the active item on %s and closes the list",
    async (_name, keys) => {
      const onOpenChange = vi.fn();
      const onValueChange = vi.fn();
      const { user } = await renderOpen(() => (
        <Fruit
          defaultOpen
          onOpenChange={onOpenChange}
          onValueChange={onValueChange}
        />
      ));
      await user.keyboard("{ArrowDown}");

      await user.keyboard(keys);
      await afterFlush();

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith("banana");
      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false, {
        reason: "item-press",
        event: expect.any(KeyboardEvent),
      });
    },
  );

  it("joins Space to a string being typed, and selects nothing", async () => {
    const onValueChange = vi.fn();
    const { user } = await renderOpen(() => (
      <Fruit defaultOpen onValueChange={onValueChange}>
        <Select.Item value="new">New</Select.Item>
        <Select.Item value="new-york">New York</Select.Item>
        <Select.Item value="new-zealand">New Zealand</Select.Item>
      </Fruit>
    ));

    await user.keyboard("new z");
    await afterFlush();

    expect(active()).toBe("New Zealand");
    expect(shown()).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("selects the active item on Tab and closes the list, reporting focus-out", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await renderOpen(() => (
      <Fruit
        defaultOpen
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
      />
    ));
    await user.keyboard("{End}");

    await user.keyboard("{Tab}");
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "focus-out",
      event: expect.any(KeyboardEvent),
    });
  });

  it("disabled: has aria-disabled and data-disabled, is reached by the keys, and is not selected", async () => {
    const onValueChange = vi.fn();
    const { user } = await renderOpen(() => (
      <Fruit defaultOpen onValueChange={onValueChange}>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana" disabled>
          Banana
        </Select.Item>
      </Fruit>
    ));
    expect(item("Banana")).toHaveAttribute("aria-disabled", "true");
    expect(item("Banana")).toHaveAttribute("data-disabled", "");
    expect(item("Apple")).not.toHaveAttribute("aria-disabled");

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Banana");
    await user.keyboard("{Enter}");
    await user.click(item("Banana"));
    await afterFlush();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(shown()).toBe(true);

    // Tab leaves all the same, and selects nothing.
    await user.keyboard("{Tab}");
    await afterFlush();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(shown()).toBe(false);
  });

  it("its ItemIndicator carries data-selected or data-unselected and is aria-hidden", async () => {
    await render(() => (
      <Fruit defaultValue="apple">
        <Select.Item value="apple">
          <Select.ItemIndicator data-testid="apple" />
          Apple
        </Select.Item>
        <Select.Item value="banana">
          <Select.ItemIndicator data-testid="banana" />
          Banana
        </Select.Item>
      </Fruit>
    ));

    const apple = screen.getByTestId("apple");
    expect(apple.tagName).toBe("SPAN");
    expect(apple).toHaveAttribute("aria-hidden", "true");
    expect(apple).toHaveAttribute("data-selected", "");
    expect(apple).not.toHaveAttribute("data-unselected");
    expect(screen.getByTestId("banana")).toHaveAttribute("data-unselected", "");
    expect(screen.getByTestId("banana")).not.toHaveAttribute("data-selected");
  });

  it("throws a descriptive error outside Select.Root, and its ItemIndicator outside an Item", async () => {
    await render(() => (
      <>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <Select.Item value="apple">Apple</Select.Item>
        </Errored>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <Select.ItemIndicator />
        </Errored>
      </>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Select parts must be placed within <Select.Root>.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Error: [menhir] Select.ItemIndicator must be placed within <Select.Item>.",
      ),
    ).toBeInTheDocument();
  });
});
