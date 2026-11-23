// The test list and the cases left out are in ./README.md. What the roving
// form adds to ./listNavigation.test.tsx: focus moves to the active item.
import { createSignal, flush } from "solid-js";
import { beforeEach, describe, expect, it } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import {
  centerOf,
  press as pressMouse,
  movePointer,
  nextTask,
} from "../../../test/floating/input.ts";
import {
  item,
  press,
  pressOn,
} from "../../../test/floating/list-navigation/helpers.ts";
import { Menu } from "../../../test/floating/list-navigation/Menu.tsx";
import type { TestItem } from "../../../test/floating/list-navigation/props.ts";
import type { ListNavigation } from "./listNavigation.ts";

describe("createRovingList", () => {
  const { render } = createRenderer();
  beforeEach(async () => {
    // jsdom has no scrolling: the keyboard's scroll into view is a no-op.
    Element.prototype.scrollIntoView ??= () => {};
    // Out of the way of the list.
    if (!isJSDOM) await movePointer([{ x: 380, y: 300 }]);
  });

  it("moves focus to the active item, the only one with `tabindex` 0", async () => {
    await render(() => <Menu />);
    const tabindexes = () =>
      screen
        .getAllByRole("menuitem")
        .map((element) => element.getAttribute("tabindex"));
    expect(tabindexes()).toEqual(["-1", "-1", "-1", "-1"]);

    await press("ArrowDown");
    expect(item("Apple")).toHaveFocus();
    await press("End");
    expect(item("Date")).toHaveFocus();
    expect(tabindexes()).toEqual(["-1", "-1", "-1", "0"]);
  });

  // A submenu sits in its parent item's subtree, so its keys bubble
  // through the parent item.
  it("acts only on keys from its own items, not from a list nested in one", async () => {
    const calls: string[] = [];
    await render(() => (
      <Menu
        onArrowOut={() => calls.push("out of the menu")}
        nested={{
          in: "Banana",
          items: ["Kiwi", "Lemon"],
          onArrowOut: () => calls.push("out of the submenu"),
        }}
      />
    ));

    await pressOn(item("Banana"), "ArrowDown");
    await pressOn(item("Banana"), "ArrowDown");
    expect(item("Banana")).toHaveFocus();
    await pressOn(item("Kiwi"), "ArrowDown");
    expect(item("Kiwi")).toHaveFocus();
    await press("ArrowDown");
    expect(item("Lemon")).toHaveFocus();
    expect(item("Lemon")).toHaveAttribute("data-active");
    expect(item("Banana")).toHaveAttribute("data-active");
    expect(item("Cherry")).not.toHaveAttribute("data-active");

    await press("ArrowLeft");
    expect(calls).toEqual(["out of the submenu"]);
  });

  it.skipIf(isJSDOM)(
    "moves focus to the item the pointer moves on",
    async () => {
      await render(() => <Menu />);

      await movePointer([centerOf(item("Banana"))]);
      expect(item("Banana")).toHaveFocus();
      expect(item("Banana")).toHaveAttribute("tabindex", "0");
      expect(item("Banana")).toHaveAttribute("data-active");
    },
  );

  // Why the active item carries `data-active` in this form too: the
  // browser's heuristic decides, from the input that came before.
  it.skipIf(isJSDOM)(
    "moves focus that matches `:focus-visible` with the pointer after a key, and not after a mouse press",
    async () => {
      await render(() => <Menu />);

      await press("ArrowDown");
      await movePointer([centerOf(item("Banana"))]);
      expect(item("Banana")).toHaveFocus();
      expect(item("Banana").matches(":focus-visible")).toBe(true);

      await pressMouse(
        centerOf(screen.getByRole("button", { name: "Before" })),
      );
      await movePointer([centerOf(item("Cherry"))]);
      expect(item("Cherry")).toHaveFocus();
      expect(item("Cherry").matches(":focus-visible")).toBe(false);
      expect(item("Cherry")).toHaveAttribute("data-active");
    },
  );

  // jsdom cannot focus inside a popover, which it does not show.
  it.skipIf(isJSDOM)(
    "focuses an item moved to while its popup is closed only once it has opened",
    async () => {
      let list!: ListNavigation<TestItem>;
      const [open, setOpen] = createSignal(false);
      await render(() => (
        <Menu open={open()} onList={(value) => (list = value)} />
      ));
      const before = screen.getByRole("button", { name: "Before" });
      before.focus();

      list.move(list.items()[1]);
      flush();
      expect(before).toHaveFocus();

      setOpen(true);
      flush();
      await nextTask();
      expect(item("Banana")).toHaveFocus();
    },
  );

  // As during an exit animation, which keeps the popup shown once closed.
  it.skipIf(isJSDOM)(
    "focuses an item moved to while its popup is closed only once it has opened, even while it is still shown",
    async () => {
      let list!: ListNavigation<TestItem>;
      const [open, setOpen] = createSignal(false);
      await render(() => (
        <Menu open={open()} shown onList={(value) => (list = value)} />
      ));
      const before = screen.getByRole("button", { name: "Before" });
      before.focus();

      list.move(list.items()[1]);
      flush();
      await nextTask();
      expect(before).toHaveFocus();

      setOpen(true);
      flush();
      await nextTask();
      expect(item("Banana")).toHaveFocus();
    },
  );

  // As during an exit animation, which keeps the popup shown once closed.
  it.skipIf(isJSDOM)(
    "ignores the pointer over a closed popup's items, even while it is still shown",
    async () => {
      let list!: ListNavigation<TestItem>;
      await render(() => (
        <Menu open={false} shown onList={(value) => (list = value)} />
      ));
      const before = screen.getByRole("button", { name: "Before" });
      before.focus();

      await movePointer([centerOf(item("Banana"))]);
      flush();
      expect(list.active()).toBeUndefined();
      expect(before).toHaveFocus();
    },
  );

  // jsdom cannot focus inside a popover, which it does not show.
  it.skipIf(isJSDOM)(
    "focuses an item moved to in the same handler that opens its popup, before or after",
    async () => {
      let list!: ListNavigation<TestItem>;
      const [open, setOpen] = createSignal(false);
      await render(() => (
        <Menu open={open()} onList={(value) => (list = value)} />
      ));

      // As a Trigger's ArrowDown opens the menu on its first item.
      setOpen(true);
      list.move(list.items()[0]);
      flush();
      await nextTask();
      expect(item("Apple")).toHaveFocus();

      setOpen(false);
      flush();
      // And ArrowUp on its last.
      list.move(list.items().at(-1));
      setOpen(true);
      flush();
      await nextTask();
      expect(item("Date")).toHaveFocus();
    },
  );
});
