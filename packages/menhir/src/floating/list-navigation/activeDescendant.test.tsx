// The test list and the cases left out are in ./README.md. What the
// `aria-activedescendant` form adds to ./listNavigation.test.tsx: focus
// stays in the input, which names the active item.
import { createSignal, flush } from "solid-js";
import { beforeEach, describe, expect, it } from "vitest";

import { createRenderer, fireEvent, screen } from "#test-utils";

import { Combobox } from "../../../test/floating/list-navigation/Combobox.tsx";
import { item, press } from "../../../test/floating/list-navigation/helpers.ts";

const input = () => screen.getByRole("combobox");

describe("createActiveDescendantList", () => {
  const { render } = createRenderer();
  beforeEach(() => {
    // jsdom has no scrolling: the keyboard's scroll into view is a no-op.
    Element.prototype.scrollIntoView ??= () => {};
  });

  it("keeps focus in the input while the keys and the pointer move the active item", async () => {
    await render(() => <Combobox />);
    input().focus();

    await press("ArrowDown");
    await press("ArrowDown");
    expect(item("Banana")).toHaveAttribute("data-active");
    fireEvent.pointerMove(item("Date"), { pointerType: "mouse" });
    expect(item("Date")).toHaveAttribute("data-active");
    expect(input()).toHaveFocus();
  });

  it("names the active item in `aria-activedescendant`, and none while none is active", async () => {
    const [open, setOpen] = createSignal(true);
    await render(() => <Combobox open={open()} />);
    expect(input()).not.toHaveAttribute("aria-activedescendant");

    await press("ArrowDown");
    expect(input()).toHaveAttribute("aria-activedescendant", item("Apple").id);
    await press("End");
    expect(input()).toHaveAttribute("aria-activedescendant", item("Date").id);

    setOpen(false);
    flush();
    expect(input()).not.toHaveAttribute("aria-activedescendant");
  });

  it("names an item by the consumer's `id`, else a generated one, and follows a change of `id`", async () => {
    const [ids, setIds] = createSignal<Record<string, string | undefined>>({
      Banana: "banana",
    });
    await render(() => <Combobox ids={ids()} />);
    expect(item("Banana").id).toBe("banana");
    expect(item("Apple").id).not.toBe("");
    expect(item("Apple").id).not.toBe(item("Cherry").id);

    await press("ArrowDown");
    await press("ArrowDown");
    expect(input()).toHaveAttribute("aria-activedescendant", "banana");

    setIds({ Banana: "yellow" });
    flush();
    expect(input()).toHaveAttribute("aria-activedescendant", "yellow");
  });
});
