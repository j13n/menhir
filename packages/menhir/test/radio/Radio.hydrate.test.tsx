import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  renderOnServer,
  screen,
} from "#test-utils";

import RadioFixture from "./RadioFixture.tsx";

const radio = (name: string) => screen.getByRole("radio", { name });
const submitted = () =>
  new FormData(screen.getByTestId<HTMLFormElement>("form")).getAll("letter");

describe("<Radio.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("is named, and carries its state and its tab stop, in the server HTML", async () => {
    const container = await renderOnServer("/test/radio/RadioFixture.tsx");

    const group = screen.getByRole("radiogroup", { name: "Letters" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(radio("a")).toHaveAttribute("aria-checked", "false");
    expect(radio("b")).toHaveAttribute("aria-checked", "true");
    expect(radio("a")).toHaveAttribute("tabindex", "-1");
    expect(radio("b")).toHaveAttribute("tabindex", "0");
    expect(radio("c")).toHaveAttribute("tabindex", "-1");
    expect(radio("b").querySelector("span")).toHaveAttribute(
      "data-checked",
      "",
    );
    expect(submitted()).toEqual(["b"]);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("gives the first enabled radio the tab stop while none is checked", async () => {
    const container = await renderOnServer("/test/radio/RadioEmptyFixture.tsx");

    expect(radio("a")).toHaveAttribute("tabindex", "-1");
    expect(radio("b")).toHaveAttribute("tabindex", "0");
    expect(radio("c")).toHaveAttribute("tabindex", "-1");
    container.remove();
  });

  it("adopts the server's elements, and changes the value afterwards", async () => {
    const container = await renderOnServer("/test/radio/RadioFixture.tsx");
    const serverRadio = container.querySelector("[role=radio]");
    const serverInput = container.querySelector("input[name=letter]");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <RadioFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(document.querySelector("[role=radio]")).toBe(serverRadio);
    expect(document.querySelector("input[name=letter]")).toBe(serverInput);

    await user.click(radio("a"));
    await afterFlush();
    expect(submitted()).toEqual(["a"]);
    expect(radio("a")).toHaveAttribute("tabindex", "0");

    await user.keyboard("[ArrowDown]");
    await afterFlush();
    expect(radio("b")).toHaveFocus();
    expect(submitted()).toEqual(["b"]);
  });
});
