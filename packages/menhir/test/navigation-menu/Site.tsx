// The navigation the tests of menhir/navigation-menu render, with queries
// for it. A bar of two Items and a top-level Link, laid out in Chromium as
// an app's CSS would: the Triggers side by side at the top left, each Panel
// placed under its Item with a gap, and a button before and after the
// `<nav>`.
import type { JSX } from "@solidjs/web";

import { screen } from "#test-utils";

import { NavigationMenu } from "../../src/navigation-menu/index.ts";
import type { NavigationMenuRootProps } from "../../src/navigation-menu/root/NavigationMenuRoot.tsx";

const barStyle: JSX.CSSProperties = {
  display: "flex",
  margin: "0",
  padding: "0",
  "list-style": "none",
};
const itemStyle: JSX.CSSProperties = { position: "relative" };
const triggerStyle: JSX.CSSProperties = { width: "100px", height: "30px" };
const panelStyle: JSX.CSSProperties = {
  position: "absolute",
  top: "40px",
  left: "0",
  width: "160px",
  padding: "10px",
  background: "white",
};

export type SiteProps = NavigationMenuRootProps & {
  /** Rendered at the end of the Products Panel. */
  extra?: JSX.Element;
};

export function Site(props: SiteProps) {
  return (
    <>
      <button type="button" style={{ position: "absolute", top: "300px" }}>
        Before
      </button>
      <NavigationMenu.Root
        aria-label="Main"
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        delay={props.delay}
        closeDelay={props.closeDelay}
        timeout={props.timeout}
      >
        <ul style={barStyle}>
          <NavigationMenu.Item value="products" style={itemStyle}>
            <NavigationMenu.Trigger style={triggerStyle}>
              Products
            </NavigationMenu.Trigger>
            <NavigationMenu.Panel style={panelStyle}>
              <p>Every component</p>
              <ul>
                <li>
                  <NavigationMenu.Link href="#switch">
                    Switch
                  </NavigationMenu.Link>
                </li>
                <li>
                  <NavigationMenu.Link href="#tabs">Tabs</NavigationMenu.Link>
                </li>
              </ul>
              {props.extra}
            </NavigationMenu.Panel>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="docs" style={itemStyle}>
            <NavigationMenu.Trigger style={triggerStyle}>
              Docs
            </NavigationMenu.Trigger>
            <NavigationMenu.Panel style={panelStyle}>
              <ul>
                <li>
                  <NavigationMenu.Link href="#guides">
                    Guides
                  </NavigationMenu.Link>
                </li>
              </ul>
            </NavigationMenu.Panel>
          </NavigationMenu.Item>
          <li style={itemStyle}>
            <NavigationMenu.Link
              href="#blog"
              aria-current="page"
              style={{ display: "block", width: "100px", height: "30px" }}
            >
              Blog
            </NavigationMenu.Link>
          </li>
        </ul>
      </NavigationMenu.Root>
      <button
        type="button"
        style={{ position: "absolute", top: "300px", left: "200px" }}
      >
        After
      </button>
    </>
  );
}

/** The Trigger of that name. */
export const trigger = (name: string) => screen.getByRole("button", { name });

/** The Panel that Trigger controls, shown or not. */
export const panel = (name: string) =>
  document.getElementById(trigger(name).getAttribute("aria-controls")!)!;

/** Whether the Panel of that Trigger is shown, by its Trigger and itself. */
export function isOpen(name: string) {
  const expanded = trigger(name).getAttribute("aria-expanded") === "true";
  const shown = !panel(name).hidden;
  if (expanded !== shown)
    throw new Error(`${name}: aria-expanded and hidden disagree`);
  return expanded;
}

/** A link of that name, in a closed Panel too. */
export const link = (name: string) =>
  screen.getByRole("link", { name, hidden: true });

/** The calls of an `onValueChange` mock, as `[value, reason]`. */
export const changes = (onValueChange: { mock: { calls: unknown[][] } }) =>
  onValueChange.mock.calls.map(([value, details]) => [
    value,
    (details as { reason: string }).reason,
  ]);

/** A point in Chromium that no element of the Site covers. */
export const away = { x: 380, y: 220 };
