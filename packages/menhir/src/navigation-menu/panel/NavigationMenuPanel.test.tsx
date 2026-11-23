// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  isOpen,
  link,
  panel,
  Site,
  trigger,
} from "../../../test/navigation-menu/Site.tsx";
import { NavigationMenu } from "../index.ts";

describeConformance(
  "<NavigationMenu.Panel />",
  (props) => (
    <NavigationMenu.Root>
      <NavigationMenu.Item>
        <NavigationMenu.Panel {...props} />
      </NavigationMenu.Item>
    </NavigationMenu.Root>
  ),
  { tagName: "DIV" },
);

describe("<NavigationMenu.Panel />", () => {
  const { render } = createRenderer();

  it("is a div with the generated id, hidden while closed, its links in the document either way", async () => {
    await render(() => <Site />);

    expect(panel("Products").tagName).toBe("DIV");
    expect(panel("Products")).toHaveAttribute("hidden");
    expect(panel("Products")).not.toBeVisible();
    expect(link("Switch")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Switch" })).toBeNull();

    fireEvent.click(trigger("Products"));
    await afterFlush();

    expect(panel("Products")).not.toHaveAttribute("hidden");
    expect(panel("Products")).toBeVisible();
    expect(screen.getByRole("link", { name: "Switch" })).toBe(link("Switch"));
  });

  it("gives every Item's Panel an id of its own", async () => {
    await render(() => <Site />);

    expect(panel("Products").id).not.toBe(panel("Docs").id);
  });

  it("takes no id from the consumer", async () => {
    await render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Panel {...{ id: "mine" }}>Links</NavigationMenu.Panel>
        </NavigationMenu.Item>
      </NavigationMenu.Root>
    ));

    expect(panel("Products")).not.toBeNull();
    expect(panel("Products").id).not.toBe("mine");
  });

  it.skipIf(isJSDOM)(
    "is in the page's flow, where the consumer's CSS places it, not in the top layer",
    async () => {
      await render(() => <Site />);
      fireEvent.click(trigger("Products"));
      await afterFlush();

      expect(panel("Products")).not.toHaveAttribute("popover");
      const item = trigger("Products").parentElement!.getBoundingClientRect();
      const box = panel("Products").getBoundingClientRect();
      // `top: 40px` under the Item, as Site's CSS says.
      expect(box.top - item.top).toBe(40);
      expect(box.left).toBe(item.left);
      expect(isOpen("Products")).toBe(true);
    },
  );

  it("keeps the id and hidden through a render function", async () => {
    await render(() => (
      <NavigationMenu.Root>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Panel render={(props) => <section {...props} />}>
            Links
          </NavigationMenu.Panel>
        </NavigationMenu.Item>
      </NavigationMenu.Root>
    ));

    expect(panel("Products").tagName).toBe("SECTION");
    expect(panel("Products")).toHaveAttribute("hidden");
    fireEvent.click(trigger("Products"));
    await afterFlush();
    expect(panel("Products")).not.toHaveAttribute("hidden");
  });

  it("throws a descriptive error outside NavigationMenu.Item", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <NavigationMenu.Root>
          <NavigationMenu.Panel />
        </NavigationMenu.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] NavigationMenu.Trigger and NavigationMenu.Panel must be placed within <NavigationMenu.Item>.",
      ),
    ).toBeInTheDocument();
  });
});
