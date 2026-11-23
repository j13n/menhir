// The test list and the cases left out are in ../README.md.
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { City } from "../../../test/autocomplete/City.tsx";
import {
  active,
  input,
  item,
  popup,
  shown,
} from "../../../test/autocomplete/queries.ts";
import { Autocomplete } from "../index.ts";

const trigger = () => screen.getByRole("button", { name: "Show cities" });

describe("<Autocomplete.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Autocomplete.Root>
        <span data-testid="child" />
      </Autocomplete.Root>
    ));

    expect(container.firstElementChild).toBe(screen.getByTestId("child"));
  });

  it("is closed by default, with data-closed", async () => {
    await render(() => <City />);

    expect(shown()).toBe(false);
    expect(input()).toHaveAttribute("data-closed", "");
    expect(popup()).toHaveAttribute("data-closed", "");
  });

  it("starts open with defaultOpen, with data-open and no item active", async () => {
    await render(() => <City defaultOpen />);
    await afterFlush();

    expect(shown()).toBe(true);
    expect(input()).toHaveAttribute("data-open", "");
    expect(popup()).toHaveAttribute("data-open", "");
    expect(active()).toBeUndefined();
    expect(document.querySelector("[data-active]")).toBeNull();
  });

  it("opens and closes on the Trigger when uncontrolled, reporting each change", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <City onOpenChange={onOpenChange} />);

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
  });

  it("only asks when open is controlled", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <City open={false} onOpenChange={onOpenChange} />
    ));

    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(shown()).toBe(false);
  });

  it("has no text by default, and defaultValue as the text at first", async () => {
    await render(() => (
      <>
        <City defaultValue="Tromsø" />
        <Autocomplete.Root>
          <Autocomplete.Input aria-label="Empty" />
        </Autocomplete.Root>
      </>
    ));

    expect(screen.getByRole("combobox", { name: "City" })).toHaveValue(
      "Tromsø",
    );
    expect(screen.getByRole("combobox", { name: "Empty" })).toHaveValue("");
  });

  it("reports the text as the user types and as an item is accepted, when uncontrolled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => <City onValueChange={onValueChange} />);

    await user.type(input(), "o");
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith("o", {
      reason: "input-change",
      event: expect.any(Event),
    });
    expect(input()).toHaveValue("o");

    await user.click(item("Oslo"));
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith("Oslo", {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
    expect(input()).toHaveValue("Oslo");
  });

  it("only asks when the value is controlled, keeps the controlled text, and follows it", async () => {
    const onValueChange = vi.fn();
    const [text, setText] = createSignal("Os");
    const { user } = await render(() => (
      <City value={text()} onValueChange={onValueChange} />
    ));

    await user.click(trigger());
    await user.click(item("Bergen"));
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith("Bergen", {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
    expect(input()).toHaveValue("Os");

    await user.type(input(), "x");
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith("Osx", {
      reason: "input-change",
      event: expect.any(Event),
    });
    expect(input()).toHaveValue("Os");

    setText("Bodø");
    flush();
    expect(input()).toHaveValue("Bodø");
  });

  it("changes before async work that onValueChange starts settles", async () => {
    const { user } = await render(() => (
      <City onValueChange={() => new Promise(() => {})} />
    ));

    await user.type(input(), "b");
    await afterFlush();
    expect(input()).toHaveValue("b");
    expect(shown()).toBe(true);

    await user.click(item("Bergen"));
    await afterFlush();
    expect(input()).toHaveValue("Bergen");
    expect(shown()).toBe(false);
  });
});
