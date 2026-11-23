// The test list and the cases left out are in ../README.md.
import { Errored, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { isOpen, panel, trigger } from "../../../test/navigation-menu/Site.tsx";
import { NavigationMenu } from "../index.ts";

describeConformance(
  "<NavigationMenu.Item />",
  (props) => (
    <NavigationMenu.Root>
      <ul>
        <NavigationMenu.Item {...props} />
      </ul>
    </NavigationMenu.Root>
  ),
  { tagName: "LI" },
);

describe("<NavigationMenu.Item />", () => {
  const { render } = createRenderer();

  it("renders a list item", async () => {
    await render(() => (
      <NavigationMenu.Root>
        <ul>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          </NavigationMenu.Item>
        </ul>
      </NavigationMenu.Root>
    ));

    expect(screen.getByRole("listitem")).toContainElement(trigger("Products"));
  });

  it("is identified by its value in the Root's, and by a generated one without", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <NavigationMenu.Root onValueChange={onValueChange}>
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Panel>Products links</NavigationMenu.Panel>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
          <NavigationMenu.Panel>Docs links</NavigationMenu.Panel>
        </NavigationMenu.Item>
      </NavigationMenu.Root>
    ));

    fireEvent.click(trigger("Products"));
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith(
      "products",
      expect.anything(),
    );

    fireEvent.click(trigger("Docs"));
    await afterFlush();
    const generated = onValueChange.mock.lastCall![0];
    expect(generated).toEqual(expect.any(String));
    expect(generated).not.toBe("products");
    expect(isOpen("Docs")).toBe(true);
    expect(isOpen("Products")).toBe(false);
  });

  it("puts data-open or data-closed on the Item, Trigger and Panel, following changes", async () => {
    const [value, setValue] = createSignal<string | null>(null);
    await render(() => (
      <NavigationMenu.Root value={value()}>
        <NavigationMenu.Item value="products" data-testid="item">
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Panel>Products links</NavigationMenu.Panel>
        </NavigationMenu.Item>
      </NavigationMenu.Root>
    ));
    const parts = () => [
      screen.getByTestId("item"),
      trigger("Products"),
      panel("Products"),
    ];

    for (const part of parts()) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }

    setValue("products");
    flush();

    for (const part of parts()) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
  });

  it("throws a descriptive error outside NavigationMenu.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <NavigationMenu.Item />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] NavigationMenu.Item must be placed within <NavigationMenu.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
