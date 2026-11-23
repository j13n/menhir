// The test list and the cases left out are in ./README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { isJSDOM } from "#test-utils";

import { findMatch } from "./match.ts";

/** Items whose elements have these labels as their text content. */
function itemsOf(...labels: string[]) {
  return labels.map((label) => {
    const element = document.createElement("div");
    element.textContent = label;
    return { element };
  });
}

/** The label of a matched item, if any. */
const labelOf = (item: { element: Element } | undefined) =>
  item?.element.textContent;

describe("findMatch", () => {
  afterEach(() => vi.restoreAllMocks());

  it("matches the next item that starts with one character, after the active item, wrapping to the first", () => {
    const items = itemsOf("Apple", "Banana", "Blueberry", "Cherry", "Bean");
    expect(labelOf(findMatch(items, items[1], "b"))).toBe("Blueberry");
    expect(labelOf(findMatch(items, items[2], "b"))).toBe("Bean");
    expect(labelOf(findMatch(items, items[4], "b"))).toBe("Banana");
    expect(labelOf(findMatch(items, items[3], "a"))).toBe("Apple");
  });

  it("matches the first item that starts with one character, with no active item", () => {
    const items = itemsOf("Apple", "Banana", "Blueberry");
    expect(labelOf(findMatch(items, undefined, "b"))).toBe("Banana");
    expect(labelOf(findMatch(items, undefined, "a"))).toBe("Apple");
  });

  it("matches a string of different characters from the active item on, so the active item stays while it matches", () => {
    const items = itemsOf("Apple", "Banana", "Blueberry", "Bean", "Bandana");
    expect(labelOf(findMatch(items, items[1], "ba"))).toBe("Banana");
    expect(labelOf(findMatch(items, items[1], "ban"))).toBe("Banana");
    expect(labelOf(findMatch(items, items[1], "band"))).toBe("Bandana");
    expect(labelOf(findMatch(items, items[1], "bl"))).toBe("Blueberry");
    expect(labelOf(findMatch(items, items[2], "ba"))).toBe("Bandana");
    expect(labelOf(findMatch(items, items[4], "bl"))).toBe("Blueberry");
    expect(labelOf(findMatch(items, undefined, "be"))).toBe("Bean");
    expect(labelOf(findMatch(items, undefined, "ap"))).toBe("Apple");
  });

  // Rather than matching an item that starts with the repeated string.
  it("cycles through the items that start with the same character repeated", () => {
    const items = itemsOf("Apple", "Aardvark", "Avocado", "Banana");
    expect(labelOf(findMatch(items, items[0], "aa"))).toBe("Aardvark");
    expect(labelOf(findMatch(items, items[1], "aaa"))).toBe("Avocado");
    expect(labelOf(findMatch(items, items[2], "aaaa"))).toBe("Apple");
  });

  it("gives undefined when no item matches", () => {
    const items = itemsOf("Apple", "Banana");
    expect(findMatch(items, items[0], "c")).toBeUndefined();
    expect(findMatch(items, items[1], "bx")).toBeUndefined();
    expect(findMatch([], undefined, "a")).toBeUndefined();
  });

  it("ignores case and accents", () => {
    const items = itemsOf("apple", "Éclair", "crème brûlée", "Ölfrucht");
    expect(labelOf(findMatch(items, undefined, "A"))).toBe("apple");
    expect(labelOf(findMatch(items, undefined, "ec"))).toBe("Éclair");
    expect(labelOf(findMatch(items, undefined, "É"))).toBe("Éclair");
    expect(labelOf(findMatch(items, undefined, "CREME BRU"))).toBe(
      "crème brûlée",
    );
    expect(labelOf(findMatch(items, undefined, "o"))).toBe("Ölfrucht");
  });

  it("matches an item's own text over its content, and ignores leading white space", () => {
    const [flag, apple] = itemsOf("🇫🇷", "\n   Apple ");
    const items = [{ ...flag!, text: "France" }, apple!];
    expect(findMatch(items, undefined, "f")).toBe(items[0]);
    expect(findMatch(items, undefined, "🇫")).toBeUndefined();
    expect(findMatch(items, undefined, "ap")).toBe(apple);
  });

  it("reads the element's text content when matching", () => {
    const items = itemsOf("Apple", "Banana");
    expect(findMatch(items, undefined, "c")).toBeUndefined();
    items[1]!.element.textContent = "Cherry";
    expect(findMatch(items, undefined, "c")).toBe(items[1]);
  });

  // Module state is shared between requests on the server, and nothing may
  // run at import time (PLAN.md section 6, rule 2). A fresh copy of the
  // module needs `vi.resetModules`, which browser mode does not have.
  it.skipIf(!isJSDOM)(
    "creates the collator on first use, once, and not at import time",
    async () => {
      const Collator = vi.spyOn(Intl, "Collator");
      vi.resetModules();
      const fresh = await import("./match.ts");
      expect(Collator).not.toHaveBeenCalled();

      const items = itemsOf("Apple", "Banana");
      expect(fresh.findMatch(items, undefined, "b")).toBe(items[1]);
      expect(fresh.findMatch(items, undefined, "a")).toBe(items[0]);
      expect(Collator).toHaveBeenCalledOnce();
    },
  );
});
