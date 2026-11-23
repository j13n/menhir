// The test list and the cases left out are in ./README.md. The behaviour
// both ways of holding focus share, run against each.
import { beforeEach, describe, expect, it } from "vitest";

import { createSignal, flush } from "solid-js";

import { createRenderer, fireEvent, isJSDOM } from "#test-utils";

import {
  activeLabel,
  forms,
  item,
  press,
} from "../../../test/floating/list-navigation/helpers.ts";
import type { TestItem } from "../../../test/floating/list-navigation/props.ts";
import {
  centerOf,
  movePointer,
  nextTask,
} from "../../../test/floating/input.ts";
import type { ListNavigation } from "./listNavigation.ts";

// jsdom has no scrolling: the keyboard's scroll into view is a no-op there.
beforeEach(() => {
  Element.prototype.scrollIntoView ??= () => {};
});

describe.each(forms)("list navigation, $form", ({ List }) => {
  const { render } = createRenderer();

  it("moves the active item with Down and Up, and cancels their default action", async () => {
    await render(() => <List />);
    expect(activeLabel()).toBeUndefined();

    expect(await press("ArrowDown")).toBe(false);
    expect(activeLabel()).toBe("Apple");
    expect(await press("ArrowDown")).toBe(false);
    expect(activeLabel()).toBe("Banana");
    expect(await press("ArrowUp")).toBe(false);
    expect(activeLabel()).toBe("Apple");
  });

  it("moves with Right and Left in a horizontal list, and leaves Down and Up alone", async () => {
    await render(() => <List orientation="horizontal" />);

    await press("ArrowRight");
    await press("ArrowRight");
    expect(activeLabel()).toBe("Banana");
    await press("ArrowLeft");
    expect(activeLabel()).toBe("Apple");
    expect(await press("ArrowDown")).toBe(true);
    expect(await press("ArrowUp")).toBe(true);
    expect(activeLabel()).toBe("Apple");
  });

  it("leaves Right and Left alone in a vertical list", async () => {
    await render(() => <List />);

    await press("ArrowDown");
    expect(await press("ArrowRight")).toBe(true);
    expect(await press("ArrowLeft")).toBe(true);
    expect(activeLabel()).toBe("Apple");
  });

  it.skipIf(isJSDOM)(
    "moves to the next item with Left in a right-to-left horizontal list",
    async () => {
      await render(() => (
        <div dir="rtl">
          <List orientation="horizontal" />
        </div>
      ));

      await press("ArrowLeft");
      await press("ArrowLeft");
      expect(activeLabel()).toBe("Banana");
      await press("ArrowRight");
      expect(activeLabel()).toBe("Apple");
    },
  );

  it("calls back with the key that points into the active item, and the one that points out of the list", async () => {
    const calls: string[] = [];
    await render(() => (
      <List
        onArrowIn={(item, event) => calls.push(`in ${item.label} ${event.key}`)}
        onArrowOut={(item, event) =>
          calls.push(`out ${item?.label} ${event.key}`)
        }
      />
    ));

    // Out with no active item.
    expect(await press("ArrowLeft")).toBe(true);
    await press("ArrowDown");
    // The component decides whether to cancel them.
    expect(await press("ArrowRight")).toBe(true);
    expect(await press("ArrowLeft")).toBe(true);
    // Not with a modifier.
    await press("ArrowRight", { altKey: true });
    expect(calls).toEqual([
      "out undefined ArrowLeft",
      "in Apple ArrowRight",
      "out Apple ArrowLeft",
    ]);
  });

  it("does not call back for the key into an item while none is active", async () => {
    const calls: string[] = [];
    await render(() => <List onArrowIn={(item) => calls.push(item.label)} />);

    await press("ArrowRight");
    expect(calls).toEqual([]);
  });

  it("points into an item with Down and out of a horizontal list with Up", async () => {
    const calls: string[] = [];
    await render(() => (
      <List
        orientation="horizontal"
        onArrowIn={(item, event) => calls.push(`in ${item.label} ${event.key}`)}
        onArrowOut={(item, event) =>
          calls.push(`out ${item?.label} ${event.key}`)
        }
      />
    ));

    await press("ArrowRight");
    await press("ArrowDown");
    await press("ArrowUp");
    expect(calls).toEqual(["in Apple ArrowDown", "out Apple ArrowUp"]);
  });

  it.skipIf(isJSDOM)(
    "points into an item with Left and out of the list with Right, right to left",
    async () => {
      const calls: string[] = [];
      await render(() => (
        <div dir="rtl">
          <List
            onArrowIn={(item, event) =>
              calls.push(`in ${item.label} ${event.key}`)
            }
            onArrowOut={(item, event) =>
              calls.push(`out ${item?.label} ${event.key}`)
            }
          />
        </div>
      ));

      await press("ArrowDown");
      await press("ArrowLeft");
      await press("ArrowRight");
      expect(calls).toEqual(["in Apple ArrowLeft", "out Apple ArrowRight"]);
    },
  );

  it("moves to the first item with Home and the last with End", async () => {
    await render(() => <List />);

    expect(await press("End")).toBe(false);
    expect(activeLabel()).toBe("Date");
    expect(await press("Home")).toBe(false);
    expect(activeLabel()).toBe("Apple");
  });

  it("stops at the ends without `wrap`, and still cancels the keys", async () => {
    await render(() => <List />);

    await press("End");
    expect(await press("ArrowDown")).toBe(false);
    expect(activeLabel()).toBe("Date");
    await press("Home");
    expect(await press("ArrowUp")).toBe(false);
    expect(activeLabel()).toBe("Apple");
  });

  it("wraps at the ends with `wrap`", async () => {
    await render(() => <List wrap />);

    await press("End");
    await press("ArrowDown");
    expect(activeLabel()).toBe("Apple");
    await press("ArrowUp");
    expect(activeLabel()).toBe("Date");
  });

  it("moves from no active item to the first with Down, and to the last with Up", async () => {
    await render(() => <List />);

    await press("ArrowUp");
    expect(activeLabel()).toBe("Date");
  });

  it("skips the items it does not reach, with the arrows, Home and End", async () => {
    await render(() => (
      <List
        items={["Apple", "Banana", "Cherry", "Date", "Elderberry"]}
        unreachable={["Apple", "Cherry", "Elderberry"]}
      />
    ));

    await press("ArrowDown");
    expect(activeLabel()).toBe("Banana");
    await press("ArrowDown");
    expect(activeLabel()).toBe("Date");
    await press("Home");
    expect(activeLabel()).toBe("Banana");
    await press("End");
    expect(activeLabel()).toBe("Date");
  });

  it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"])(
    "leaves the keys with %s to the browser",
    async (modifier) => {
      await render(() => <List />);

      for (const key of ["ArrowDown", "ArrowUp", "Home", "End"])
        expect(await press(key, { [modifier]: true })).toBe(true);
      expect(activeLabel()).toBeUndefined();
    },
  );

  it("reports whether it used a key", async () => {
    const used: string[] = [];
    await render(() => (
      <List
        onKeyUsed={(value, event) => {
          // Real input in Chromium presses Shift itself too.
          if (event.key !== "Shift") used.push(`${event.key} ${value}`);
        }}
      />
    ));

    await press("ArrowDown");
    await press("End");
    await press("Enter");
    await press("a");
    // Into an item and out of the list, with no callback for them.
    await press("ArrowRight");
    await press("ArrowLeft");
    await press("ArrowDown", { shiftKey: true });
    expect(used).toEqual([
      "ArrowDown true",
      "End true",
      "Enter false",
      "a false",
      "ArrowRight false",
      "ArrowLeft false",
      "ArrowDown false",
    ]);
  });

  it("lists the items it reaches in document order, with their element", async () => {
    let list!: ListNavigation<TestItem>;
    const [items, setItems] = createSignal(["Apple", "Cherry", "Date"]);
    await render(() => (
      <List
        items={items()}
        unreachable={["Date"]}
        onList={(value) => (list = value)}
      />
    ));

    const labels = () => list.items().map((entry) => entry.label);
    expect(labels()).toEqual(["Apple", "Cherry"]);
    expect(list.items()[0].element).toBe(item("Apple"));

    // Added later, registered last, listed in its place.
    setItems(["Apple", "Banana", "Cherry", "Date"]);
    flush();
    expect(labels()).toEqual(["Apple", "Banana", "Cherry"]);

    setItems(["Banana", "Cherry", "Date"]);
    flush();
    expect(labels()).toEqual(["Banana", "Cherry"]);
  });

  // Typeahead (#98) reads it, else the element's text content.
  it("lists each item with its own `text`, if it has one", async () => {
    let list!: ListNavigation<TestItem>;
    await render(() => (
      <List texts={{ Banana: "Yellow" }} onList={(value) => (list = value)} />
    ));

    expect(list.items().map((entry) => entry.text)).toEqual([
      undefined,
      "Yellow",
      undefined,
      undefined,
    ]);
  });

  it("moves to an item, as the keys do, and to none", async () => {
    let list!: ListNavigation<TestItem>;
    await render(() => (
      <List unreachable={["Date"]} onList={(value) => (list = value)} />
    ));
    const find = (label: string) =>
      list.items().find((entry) => entry.label === label)!;

    list.move(find("Cherry"));
    flush();
    expect(activeLabel()).toBe("Cherry");
    expect(list.active()?.label).toBe("Cherry");
    await press("ArrowUp");
    expect(activeLabel()).toBe("Banana");

    list.move(undefined);
    flush();
    expect(activeLabel()).toBeUndefined();
    expect(list.active()).toBeUndefined();
  });

  it("ignores a move to an item it does not reach", async () => {
    let list!: ListNavigation<TestItem>;
    const registered: TestItem[] = [];
    await render(() => (
      <List
        unreachable={["Date"]}
        onList={(value) => {
          list = value;
          const register = value.register;
          value.register = (entry) => {
            registered.push(entry);
            return register(entry);
          };
        }}
      />
    ));

    list.move(registered.find((entry) => entry.label === "Banana"));
    list.move(registered.find((entry) => entry.label === "Date"));
    flush();
    expect(activeLabel()).toBe("Banana");
  });

  it("leaves no item active once the active item is removed", async () => {
    let list!: ListNavigation<TestItem>;
    const [items, setItems] = createSignal(["Apple", "Banana", "Cherry"]);
    await render(() => (
      <List items={items()} onList={(value) => (list = value)} />
    ));

    await press("ArrowDown");
    await press("ArrowDown");
    setItems(["Apple", "Cherry"]);
    flush();
    expect(list.active()).toBeUndefined();
    expect(activeLabel()).toBeUndefined();
    await press("ArrowDown");
    expect(activeLabel()).toBe("Apple");
  });

  it("leaves no item active once its popup closes, and keeps one moved to while closed", async () => {
    let list!: ListNavigation<TestItem>;
    const [open, setOpen] = createSignal(true);
    await render(() => (
      <List open={open()} onList={(value) => (list = value)} />
    ));

    await press("ArrowDown");
    expect(activeLabel()).toBe("Apple");
    setOpen(false);
    flush();
    expect(activeLabel()).toBeUndefined();

    // As typeahead does on a closed Select, before it opens.
    list.move(list.items()[2]);
    flush();
    expect(activeLabel()).toBe("Cherry");
    setOpen(true);
    flush();
    expect(activeLabel()).toBe("Cherry");
  });

  it("re-runs the reads of the two items that change, of 200", async () => {
    const labels = Array.from({ length: 200 }, (_, index) => `Item ${index}`);
    const reads = new Set<string>();
    await render(() => (
      <List items={labels} onRead={(label) => reads.add(label)} />
    ));

    await press("ArrowDown");
    reads.clear();
    await press("ArrowDown");
    expect([...reads].sort()).toEqual(["Item 0", "Item 1"]);
    reads.clear();
    await press("End");
    expect([...reads].sort()).toEqual(["Item 1", "Item 199"]);
  });

  it("makes the item the pointer moves on active, and not one it does not reach, nor by touch", async () => {
    await render(() => <List unreachable={["Cherry"]} />);

    fireEvent.pointerMove(item("Banana"), { pointerType: "mouse" });
    expect(activeLabel()).toBe("Banana");
    fireEvent.pointerMove(item("Cherry"), { pointerType: "mouse" });
    expect(activeLabel()).toBe("Banana");
    fireEvent.pointerMove(item("Date"), { pointerType: "touch" });
    expect(activeLabel()).toBe("Banana");
    fireEvent.pointerMove(item("Apple"), { pointerType: "pen" });
    expect(activeLabel()).toBe("Apple");
    await press("ArrowDown");
    expect(activeLabel()).toBe("Banana");
  });

  it("uses no key in a list with no item it reaches", async () => {
    await render(() => (
      <List unreachable={["Apple", "Banana", "Cherry", "Date"]} />
    ));

    expect(await press("ArrowDown")).toBe(true);
    expect(await press("End")).toBe(true);
    expect(activeLabel()).toBeUndefined();
  });

  describe("scrolling", () => {
    const fruit = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"];
    // The list is 75px high and each item 30px: Cherry is half in view.
    const scroller = () => item("Apple").parentElement!;
    beforeEach(async () => {
      // Out of the way of the list.
      if (!isJSDOM) await movePointer([{ x: 380, y: 300 }]);
    });

    it.skipIf(isJSDOM)(
      "cancels the keys it uses, so the page does not scroll, at the ends too",
      async () => {
        await render(() => (
          <>
            <List />
            <div style={{ height: "3000px" }} />
          </>
        ));
        let scrolled = false;
        const onScroll = () => (scrolled = true);
        window.addEventListener("scroll", onScroll);

        for (const key of ["ArrowDown", "End", "ArrowDown", "Home", "ArrowUp"])
          await press(key);
        // A scroll by the keyboard is animated: it starts in a later frame.
        await new Promise(requestAnimationFrame);
        await nextTask();
        window.removeEventListener("scroll", onScroll);
        expect(scrolled).toBe(false);
        expect(window.scrollY).toBe(0);
      },
    );

    it.skipIf(isJSDOM)(
      "scrolls the item the keyboard moves to into view at the near edge",
      async () => {
        await render(() => <List items={fruit} scroll />);

        await press("ArrowDown");
        await press("ArrowDown");
        expect(scroller().scrollTop).toBe(0);
        await press("ArrowDown");
        // Cherry's bottom at the list's bottom: 90 - 75.
        expect(scroller().scrollTop).toBe(15);
        // Banana is in view: nothing moves.
        await press("ArrowUp");
        expect(scroller().scrollTop).toBe(15);
        await press("End");
        expect(scroller().scrollTop).toBe(180 - 75);
        await press("Home");
        expect(scroller().scrollTop).toBe(0);
      },
    );

    it.skipIf(isJSDOM)(
      "scrolls an item moved to while its popup is closed into view once it has opened",
      async () => {
        let list!: ListNavigation<TestItem>;
        const [open, setOpen] = createSignal(false);
        await render(() => (
          <List
            items={fruit}
            scroll
            open={open()}
            onList={(value) => (list = value)}
          />
        ));

        list.move(list.items().at(-1));
        setOpen(true);
        flush();
        await nextTask();
        expect(scroller().scrollTop).toBe(180 - 75);
      },
    );

    // As during an exit animation, which keeps the popup shown once closed.
    it.skipIf(isJSDOM)(
      "does not scroll for an item moved to while its popup is closed, even while it is still shown",
      async () => {
        let list!: ListNavigation<TestItem>;
        const [open, setOpen] = createSignal(false);
        await render(() => (
          <List
            items={fruit}
            scroll
            open={open()}
            shown
            onList={(value) => (list = value)}
          />
        ));

        list.move(list.items().at(-1));
        flush();
        await nextTask();
        expect(scroller().scrollTop).toBe(0);
        setOpen(true);
        flush();
        await nextTask();
        expect(scroller().scrollTop).toBe(180 - 75);
      },
    );

    it.skipIf(isJSDOM)(
      "does not scroll for the item the pointer moves on",
      async () => {
        await render(() => <List items={fruit} scroll />);

        await movePointer([{ x: 20, y: centerOf(scroller()).y + 30 }]);
        expect(activeLabel()).toBe("Cherry");
        expect(scroller().scrollTop).toBe(0);
      },
    );

    it.skipIf(isJSDOM)(
      "leaves the active item with the keyboard while the list scrolls under a still pointer",
      async () => {
        await render(() => <List items={fruit} scroll />);

        const point = centerOf(item("Apple"));
        await movePointer([point]);
        expect(activeLabel()).toBe("Apple");
        for (let step = 0; step < 4; step++) await press("ArrowDown");
        expect(scroller().scrollTop).toBe(150 - 75);
        // The pointer, still, is now over Date. Boundary events follow the
        // scroll in a later frame.
        expect(document.elementFromPoint(point.x, point.y)).toBe(item("Date"));
        await nextTask();
        await new Promise(requestAnimationFrame);
        await nextTask();
        expect(activeLabel()).toBe("Elderberry");
      },
    );
  });
});
