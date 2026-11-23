// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { keyboard } from "../../../test/floating/input.ts";
import {
  isOpen,
  link,
  panel,
  Site,
  trigger,
} from "../../../test/navigation-menu/Site.tsx";
import { NavigationMenu } from "../index.ts";

describeConformance(
  "<NavigationMenu.Trigger />",
  (props) => (
    <NavigationMenu.Root>
      <NavigationMenu.Item>
        <NavigationMenu.Trigger {...props} />
      </NavigationMenu.Item>
    </NavigationMenu.Root>
  ),
  { tagName: "BUTTON" },
);

/** One Item whose Trigger is `trigger`. */
function One(props: { trigger: JSX.Element }) {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.Item>
        {props.trigger}
        <NavigationMenu.Panel>Links</NavigationMenu.Panel>
      </NavigationMenu.Item>
    </NavigationMenu.Root>
  );
}

describe("<NavigationMenu.Trigger />", () => {
  const { render } = createRenderer();

  it("renders a button of type button, named by its content, taking the consumer's id, with no aria-haspopup", async () => {
    await render(() => (
      <One
        trigger={
          <NavigationMenu.Trigger id="products">
            Products
          </NavigationMenu.Trigger>
        }
      />
    ));

    expect(trigger("Products").tagName).toBe("BUTTON");
    expect(trigger("Products")).toHaveAttribute("type", "button");
    expect(trigger("Products")).toHaveAttribute("id", "products");
    expect(trigger("Products")).not.toHaveAttribute("aria-haspopup");
  });

  it("has aria-expanded false while closed and true while open", async () => {
    await render(() => <Site />);
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger("Products"));
    await afterFlush();

    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
  });

  it("names its Panel's id in aria-controls", async () => {
    await render(() => <Site />);

    const id = trigger("Products").getAttribute("aria-controls");
    expect(id).not.toBe("");
    expect(panel("Products").id).toBe(id);
    expect(panel("Products")).toHaveTextContent("Every component");
  });

  it("opens nothing on keyboard focus", async () => {
    await render(() => <Site />);

    trigger("Products").focus();
    await afterFlush();

    expect(isOpen("Products")).toBe(false);
  });

  it.skipIf(isJSDOM)(
    "toggles its Panel on Enter and Space, keeping focus",
    async () => {
      await render(() => <Site />);
      trigger("Products").focus();

      await keyboard("{Enter}");
      await afterFlush();
      expect(isOpen("Products")).toBe(true);
      expect(document.activeElement).toBe(trigger("Products"));

      await keyboard(" ");
      await afterFlush();
      expect(isOpen("Products")).toBe(false);
      expect(document.activeElement).toBe(trigger("Products"));
    },
  );

  it.skipIf(isJSDOM)(
    "is a tab stop, with the links of an open Panel only",
    async () => {
      await render(() => <Site />);
      screen.getByRole("button", { name: "Before" }).focus();

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(trigger("Products"));
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(trigger("Docs"));

      await keyboard("{Shift>}{Tab}{/Shift}");
      await keyboard("{Enter}");
      await afterFlush();
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(link("Switch"));
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(link("Tabs"));
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(trigger("Docs"));
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(link("Blog"));
    },
  );

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    await render(() => (
      <form onSubmit={onSubmit}>
        <Site />
      </form>
    ));

    fireEvent.click(trigger("Products"));
    await afterFlush();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(isOpen("Products")).toBe(true);
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    await render(() => (
      <One
        trigger={
          <NavigationMenu.Trigger onClick={onClick}>
            Products
          </NavigationMenu.Trigger>
        }
      />
    ));

    fireEvent.click(trigger("Products"));
    await afterFlush();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(isOpen("Products")).toBe(true);
  });

  it("keeps its behaviour when render renders a button component", async () => {
    const Button = (props: JSX.HTMLAttributes<HTMLButtonElement>) => (
      <button class="button" {...props} />
    );
    await render(() => (
      <One
        trigger={
          <NavigationMenu.Trigger render={Button}>
            Products
          </NavigationMenu.Trigger>
        }
      />
    ));

    fireEvent.click(trigger("Products"));
    await afterFlush();

    expect(trigger("Products")).toHaveClass("button");
    expect(isOpen("Products")).toBe(true);
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      await render(() => (
        <One
          trigger={
            <NavigationMenu.Trigger render={(props) => <div {...props} />}>
              Products
            </NavigationMenu.Trigger>
          }
        />
      ));

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain("NavigationMenu.Trigger");
      expect(warn.mock.calls[0][0]).toContain("<button>");
    } finally {
      warn.mockRestore();
    }
  });

  it("throws a descriptive error outside NavigationMenu.Item", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <NavigationMenu.Root>
          <NavigationMenu.Trigger />
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
