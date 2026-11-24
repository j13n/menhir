import { afterEach, describe, expect, it, vi } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import CheckboxGroupFixture from "./CheckboxGroupFixture.tsx";

const box = (name: string) => screen.getByRole("checkbox", { name });
const submitted = () =>
  new FormData(screen.getByTestId<HTMLFormElement>("form")).getAll("letters");

describe("<CheckboxGroup.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("is named, and carries its state, in the server HTML", async () => {
    const container = await renderOnServer(
      "/test/checkbox-group/CheckboxGroupFixture.tsx",
    );

    const group = screen.getByRole("group", { name: "Letters" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).toHaveAttribute("data-required", "");
    expect(box("a")).toHaveAttribute("aria-checked", "false");
    expect(box("b")).toHaveAttribute("aria-checked", "true");
    expect(box("All")).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByTestId("parent-indicator")).toHaveAttribute(
      "data-indeterminate",
      "",
    );
    expect(submitted()).toEqual(["b"]);
    expect(container.querySelector("fieldset + input")).not.toHaveAttribute(
      "required",
    );
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements, and changes the list afterwards", async () => {
    const container = await renderOnServer(
      "/test/checkbox-group/CheckboxGroupFixture.tsx",
    );
    const serverBox = container.querySelector("[role=checkbox]");
    const serverInput = container.querySelector("input[name=letters]");

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <CheckboxGroupFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(document.querySelector("[role=checkbox]")).toBe(serverBox);
    expect(document.querySelector("input[name=letters]")).toBe(serverInput);

    await user.click(box("a"));
    expect(submitted()).toEqual(["a", "b"]);

    await user.click(box("All"));
    expect(box("All")).toHaveAttribute("aria-checked", "true");
    expect(submitted()).toEqual(["a", "b", "c"]);

    await user.click(box("All"));
    expect(submitted()).toEqual([]);
    expect(
      document.querySelector<HTMLInputElement>("fieldset + input")!.validity
        .valueMissing,
    ).toBe(true);
  });
});
