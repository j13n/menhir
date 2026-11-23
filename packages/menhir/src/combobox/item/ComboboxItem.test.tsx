// The test list and the cases left out are in ../README.md.
import { Errored, For } from "solid-js";
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
  movePointer,
  nextTask,
} from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import {
  active,
  input,
  item,
  items,
  list,
  selected,
  shown,
} from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

describeConformance(
  "<Combobox.Item />",
  (props) => (
    <Combobox.Root>
      <Combobox.List>
        <Combobox.Item value="one" {...props} />
      </Combobox.List>
    </Combobox.Root>
  ),
  { tagName: "DIV" },
);

describeConformance(
  "<Combobox.ItemIndicator />",
  (props) => (
    <Combobox.Root>
      <Combobox.List>
        <Combobox.Item value="one">
          <Combobox.ItemIndicator {...props} />
        </Combobox.Item>
      </Combobox.List>
    </Combobox.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Combobox.Item />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders an option with aria-selected, data-selected or data-unselected, and an id, the consumer's if given", async () => {
    await render(() => (
      <Fruit defaultValue="banana">
        <Combobox.Item value="apple" id="first">
          Apple
        </Combobox.Item>
        <Combobox.Item value="banana">Banana</Combobox.Item>
      </Fruit>
    ));

    expect(item("Apple").tagName).toBe("DIV");
    expect(item("Apple").id).toBe("first");
    expect(item("Apple")).toHaveAttribute("aria-selected", "false");
    expect(item("Apple")).toHaveAttribute("data-unselected", "");
    expect(item("Banana").id).not.toBe("");
    expect(item("Banana")).toHaveAttribute("aria-selected", "true");
    expect(item("Banana")).toHaveAttribute("data-selected", "");
    expect(item("Banana")).not.toHaveAttribute("tabindex");
  });

  it("has data-active on the active item, only while the list is open", async () => {
    const { user } = await render(() => <Fruit />);
    input().focus();

    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(active()).toBe("Apple"));
    expect(item("Apple")).toHaveAttribute("data-active", "");
    await user.keyboard("{ArrowDown}");
    expect(item("Banana")).toHaveAttribute("data-active", "");
    expect(item("Apple")).not.toHaveAttribute("data-active");

    await user.keyboard("{Escape}");
    await afterFlush();
    expect(document.querySelector("[data-active]")).toBeNull();
  });

  it.skipIf(isJSDOM)(
    "makes the item the pointer moves onto active",
    async () => {
      const { user } = await render(() => <Fruit />);
      await user.type(input(), "b");
      await nextTask();

      await movePointer([centerOf(item("Blueberry"))]);

      expect(active()).toBe("Blueberry");
      expect(document.activeElement).toBe(input());
    },
  );

  it.skipIf(isJSDOM)(
    "scrolls the active item into view in a list that scrolls",
    async () => {
      const { user } = await render(() => (
        <Fruit popup={{ style: { height: "60px", "overflow-y": "auto" } }}>
          <For each={Array.from({ length: 30 }, (_, index) => index)}>
            {(index) => (
              <Combobox.Item value={`item-${index}`} style={{ height: "20px" }}>
                Item {index}
              </Combobox.Item>
            )}
          </For>
        </Fruit>
      ));
      input().focus();

      await user.keyboard("{ArrowUp}");
      await nextTask();

      expect(active()).toBe("Item 29");
      const popupBox = list().parentElement!.getBoundingClientRect();
      const itemBox = item("Item 29").getBoundingClientRect();
      expect(itemBox.bottom).toBeLessThanOrEqual(popupBox.bottom + 0.5);
      expect(itemBox.top).toBeGreaterThanOrEqual(popupBox.top - 0.5);
    },
  );

  it("selects the item on a click, sets the text to its label and closes the list", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Fruit onOpenChange={onOpenChange} />);
    await user.type(input(), "ch");
    await afterFlush();

    await user.click(item("Cherry"));
    await afterFlush();

    expect(selected()).toEqual(["Cherry"]);
    expect(input()).toHaveValue("Cherry");
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
  });

  it("takes its label as the text instead of its content, and leaves its aria-hidden content out", async () => {
    const { user } = await render(() => (
      <Fruit defaultOpen>
        <Combobox.Item value="apple" label="Apple">
          🍎 Apple, red
        </Combobox.Item>
        <Combobox.Item value="banana">
          <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
          Banana
        </Combobox.Item>
      </Fruit>
    ));
    await afterFlush();

    await user.click(item("🍎 Apple, red"));
    await afterFlush();
    expect(input()).toHaveValue("Apple");

    input().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await afterFlush();
    expect(input()).toHaveValue("Banana");
  });

  it("keeps a disabled item reachable but does not select it", async () => {
    const { user } = await render(() => (
      <Fruit defaultOpen>
        <Combobox.Item value="apple">Apple</Combobox.Item>
        <Combobox.Item value="banana" disabled>
          Banana
        </Combobox.Item>
      </Fruit>
    ));
    await afterFlush();
    expect(item("Banana")).toHaveAttribute("aria-disabled", "true");
    expect(item("Banana")).toHaveAttribute("data-disabled", "");

    await user.click(item("Banana"));
    await afterFlush();
    expect(selected()).toEqual([]);
    expect(shown()).toBe(true);

    input().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Banana");
    await user.keyboard("{Enter}");
    await afterFlush();
    expect(selected()).toEqual([]);
    expect(input()).toHaveValue("");
  });

  it("leaves the list when the consumer filters it out: the keys skip it, and the active item empties", async () => {
    const { user } = await render(() => <Fruit />);
    input().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Banana");

    await user.type(input(), "berry");
    await afterFlush();

    expect(items()).toEqual(["Blueberry"]);
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Blueberry");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Blueberry");
  });

  it("gives an ItemIndicator its item's data-selected or data-unselected, aria-hidden", async () => {
    await render(() => (
      <Fruit defaultValue="banana">
        <Combobox.Item value="apple">
          <Combobox.ItemIndicator data-testid="apple-mark" />
          Apple
        </Combobox.Item>
        <Combobox.Item value="banana">
          <Combobox.ItemIndicator data-testid="banana-mark" />
          Banana
        </Combobox.Item>
      </Fruit>
    ));

    expect(screen.getByTestId("apple-mark")).toHaveAttribute(
      "data-unselected",
      "",
    );
    expect(screen.getByTestId("banana-mark")).toHaveAttribute(
      "data-selected",
      "",
    );
    expect(screen.getByTestId("banana-mark")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("throws a descriptive error outside Combobox.Root, and an ItemIndicator outside an Item", async () => {
    await render(() => (
      <>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <Combobox.Item value="one" />
        </Errored>
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <Combobox.Root>
            <Combobox.ItemIndicator />
          </Combobox.Root>
        </Errored>
      </>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Error: [menhir] Combobox.ItemIndicator must be placed within <Combobox.Item>.",
      ),
    ).toBeInTheDocument();
  });
});
