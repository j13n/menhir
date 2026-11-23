// The test list and the cases left out are in ../README.md.
import { createMemo, createSignal, flush, Loading } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, fireEvent, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/select/Fruit.tsx";
import {
  active,
  input,
  item,
  popup,
  selected,
  shown,
  trigger,
} from "../../../test/select/queries.ts";
import { Select } from "../index.ts";

describe("<Select.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Select.Root>
        <span>Inside</span>
      </Select.Root>
    ));

    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("is closed by default, with data-closed on the Trigger and the Popup", async () => {
    await render(() => <Fruit />);

    expect(shown()).toBe(false);
    for (const part of [trigger(), popup()]) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }
  });

  it("starts open with defaultOpen, with data-open and the first item active", async () => {
    await render(() => <Fruit defaultOpen />);
    await afterFlush();

    expect(shown()).toBe(true);
    for (const part of [trigger(), popup()]) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
    await vi.waitFor(() => expect(active()).toBe("Apple"));
    expect(item("Apple")).toHaveAttribute("data-active", "");
  });

  it("starts open with the selected item active", async () => {
    await render(() => <Fruit defaultOpen defaultValue="banana" />);

    await vi.waitFor(() => expect(active()).toBe("Banana"));
  });

  it("opens and closes from the Trigger, reporting each with its reason and event", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Fruit onOpenChange={onOpenChange} />);

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });

    await user.click(trigger());
    await afterFlush();
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("only asks when controlled open, and stays open", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Fruit open onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(shown()).toBe(true);
  });

  it("only asks when controlled closed, and stays closed", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Fruit open={false} onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(shown()).toBe(false);
  });

  it("follows a controlled open changed from outside", async () => {
    const [open, setOpen] = createSignal(false);
    await render(() => <Fruit open={open()} />);

    setOpen(true);
    flush();
    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(active()).toBe("Apple"));

    setOpen(false);
    flush();
    expect(shown()).toBe(false);
  });

  it("selects no item by default", async () => {
    await render(() => <Fruit />);

    expect(selected()).toEqual([]);
    expect(item("Apple")).toHaveAttribute("aria-selected", "false");
  });

  it("selects the item of defaultValue", async () => {
    await render(() => <Fruit defaultValue="banana" />);

    expect(selected()).toEqual(["Banana"]);
    expect(input().value).toBe("banana");
  });

  it("uncontrolled: selecting an item calls onValueChange and changes the selection", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit defaultOpen onValueChange={onValueChange} />
    ));
    await afterFlush();

    await user.click(item("Cherry"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(selected()).toEqual(["Cherry"]);
    expect(input().value).toBe("cherry");
    expect(shown()).toBe(false);
  });

  it("controlled: selecting an item only asks, and the selection and the input stay", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit defaultOpen value="apple" onValueChange={onValueChange} />
    ));
    await afterFlush();

    await user.click(item("Cherry"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("cherry");
    expect(selected()).toEqual(["Apple"]);
    expect(input().value).toBe("apple");
  });

  it("follows a controlled value changed from outside, and null selects none", async () => {
    const [value, setValue] = createSignal<string | null>("apple");
    await render(() => <Fruit value={value()} />);
    expect(selected()).toEqual(["Apple"]);

    setValue("cherry");
    flush();
    expect(selected()).toEqual(["Cherry"]);
    expect(input().value).toBe("cherry");

    setValue(null);
    flush();
    expect(selected()).toEqual([]);
    expect(input().value).toBe("");
  });

  it("closes without calling onValueChange when the selected item is selected again", async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const { user } = await render(() => (
      <form onChange={onChange}>
        <Fruit defaultOpen defaultValue="apple" onValueChange={onValueChange} />
      </form>
    ));
    await afterFlush();

    await user.click(item("Apple"));
    await afterFlush();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(shown()).toBe(false);
  });

  it("changes before async work that onValueChange starts settles", async () => {
    const [saved, setSaved] = createSignal<string | null>(null);
    let resolveStatus!: (status: string) => void;
    await render(() => {
      const status = createMemo(() =>
        saved()
          ? new Promise<string>((resolve) => (resolveStatus = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <Fruit defaultOpen onValueChange={setSaved} />
          <output>{status()}</output>
        </Loading>
      );
    });
    await afterFlush();

    fireEvent.click(item("Banana"));
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(selected()).toEqual(["Banana"]);
    expect(input().value).toBe("banana");

    resolveStatus("saved");
    await vi.waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("saved"),
    );
  });
});
