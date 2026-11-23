// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  changes,
  isOpen,
  link,
  Site,
  trigger,
} from "../../../test/navigation-menu/Site.tsx";
import { NavigationMenu } from "../index.ts";

describeConformance(
  "<NavigationMenu.Link />",
  (props) => (
    <NavigationMenu.Root>
      <NavigationMenu.Link href="#conformance" {...props} />
    </NavigationMenu.Root>
  ),
  { tagName: "A" },
);

describe("<NavigationMenu.Link />", () => {
  const { render } = createRenderer();
  afterEach(() => {
    // The links go to hashes of the test page.
    history.replaceState(null, "", location.pathname + location.search);
  });

  it("renders a link with the consumer's href and aria-current", async () => {
    await render(() => <Site />);

    expect(link("Blog").tagName).toBe("A");
    expect(link("Blog")).toHaveAttribute("href", "#blog");
    expect(link("Blog")).toHaveAttribute("aria-current", "page");
    expect(link("Switch")).not.toHaveAttribute("aria-current");
  });

  it("closes the open Panel when pressed, reporting link-press, and is followed", async () => {
    const onValueChange = vi.fn();
    await render(() => <Site onValueChange={onValueChange} />);
    fireEvent.click(trigger("Products"));
    await afterFlush();
    onValueChange.mockClear();

    // Not cancelled, so the browser follows it.
    const followed = fireEvent.click(link("Tabs"));
    await afterFlush();

    expect(isOpen("Products")).toBe(false);
    expect(followed).toBe(true);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null, {
      reason: "link-press",
      event: expect.objectContaining({ type: "click" }),
    });
  });

  it.skipIf(isJSDOM)(
    "closes the open Panel on Enter, reporting link-press",
    async () => {
      const onValueChange = vi.fn();
      await render(() => <Site onValueChange={onValueChange} />);
      trigger("Products").focus();
      await keyboard("{Enter}");
      await afterFlush();
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(link("Switch"));

      await keyboard("{Enter}");
      await afterFlush();

      expect(isOpen("Products")).toBe(false);
      expect(location.hash).toBe("#switch");
      expect(changes(onValueChange).at(-1)).toEqual([null, "link-press"]);
    },
  );

  it("beside the Triggers, closes the open Panel", async () => {
    await render(() => <Site />);
    fireEvent.click(trigger("Docs"));
    await afterFlush();

    fireEvent.click(link("Blog"));
    await afterFlush();

    expect(isOpen("Docs")).toBe(false);
  });

  it("keeps its behaviour when render renders a router's link component", async () => {
    const navigate = vi.fn();
    // A router's link: it spreads the props and handles the click itself.
    const RouterLink = (props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        {...props}
        onClick={(event) => {
          (props.onClick as (event: MouseEvent) => void)?.(event);
          event.preventDefault();
          navigate(props.href);
        }}
      />
    );
    await render(() => (
      <NavigationMenu.Root defaultValue="products">
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Panel>
            <NavigationMenu.Link
              render={(props) => <RouterLink {...props} href="/switch" />}
            >
              Switch
            </NavigationMenu.Link>
          </NavigationMenu.Panel>
        </NavigationMenu.Item>
      </NavigationMenu.Root>
    ));

    fireEvent.click(link("Switch"));
    await afterFlush();

    expect(navigate).toHaveBeenCalledWith("/switch");
    expect(isOpen("Products")).toBe(false);
  });

  it("throws a descriptive error outside NavigationMenu.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <NavigationMenu.Link />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] NavigationMenu.Link must be placed within <NavigationMenu.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
