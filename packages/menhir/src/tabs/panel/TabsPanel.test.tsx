// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { Errored } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Tabs } from "../index.ts";

describeConformance(
  "<Tabs.Panel />",
  (props) => (
    <Tabs.Root>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account">Account</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel {...props} value="account" />
    </Tabs.Root>
  ),
  { tagName: "DIV" },
);

describe("<Tabs.Panel />", () => {
  const { render } = createRenderer();
  const tab = (name: string) => screen.getByRole("tab", { name });
  const panel = (name: string) => screen.getByText(`${name} panel`);

  // Two tabs and their panels.
  function Settings(props: { tabindex?: number }) {
    return (
      <Tabs.Root>
        <Tabs.List aria-label="Settings">
          <Tabs.Tab value="account">Account</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="account" tabindex={props.tabindex}>
          Account panel
        </Tabs.Panel>
        <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
      </Tabs.Root>
    );
  }

  it("renders a div with role tabpanel, named by its tab", async () => {
    await render(() => <Settings />);

    const accountPanel = screen.getByRole("tabpanel", { name: "Account" });
    expect(accountPanel.tagName).toBe("DIV");
    expect(accountPanel).toHaveAttribute("aria-labelledby", tab("Account").id);
  });

  it("is a tab stop, which the consumer can remove", async () => {
    await render(() => <Settings tabindex={undefined} />);

    expect(panel("Account")).not.toHaveAttribute("tabindex");
    expect(panel("Billing")).toHaveAttribute("tabindex", "0");
  });

  it("is hidden unless its tab is selected, and keeps its content", async () => {
    await render(() => <Settings />);

    expect(panel("Account")).not.toHaveAttribute("hidden");
    expect(panel("Billing")).toHaveAttribute("hidden");

    fireEvent.click(tab("Billing"));
    await afterFlush();

    expect(panel("Account")).toHaveAttribute("hidden");
    expect(panel("Account")).toBeInTheDocument();
    expect(panel("Billing")).not.toHaveAttribute("hidden");
  });

  it("has data-selected or data-unselected", async () => {
    await render(() => <Settings />);

    expect(panel("Account")).toHaveAttribute("data-selected", "");
    expect(panel("Account")).not.toHaveAttribute("data-unselected");
    expect(panel("Billing")).toHaveAttribute("data-unselected", "");
    expect(panel("Billing")).not.toHaveAttribute("data-selected");
  });

  it("gives every tab and panel an id of its own, in every Root", async () => {
    await render(() => (
      <>
        <Settings />
        <Settings />
      </>
    ));

    const ids = [
      ...screen.getAllByRole("tab"),
      ...screen.getAllByRole("tabpanel", { hidden: true }),
    ].map((element) => element.id);
    expect(ids).toHaveLength(8);
    expect(ids.every((id) => id !== "")).toBe(true);
    expect(new Set(ids).size).toBe(8);
  });

  it("keeps the generated id, the role and hidden with render", async () => {
    await render(() => (
      <Tabs.Root>
        <Tabs.List aria-label="Settings">
          <Tabs.Tab value="account">Account</Tabs.Tab>
          <Tabs.Tab value="billing">Billing</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="billing" render={(props) => <section {...props} />}>
          Billing panel
        </Tabs.Panel>
      </Tabs.Root>
    ));

    const billing = panel("Billing");
    expect(billing.tagName).toBe("SECTION");
    expect(billing).toHaveAttribute("role", "tabpanel");
    expect(billing).toHaveAttribute("hidden");
    expect(billing.id).not.toBe("");
    expect(tab("Billing")).toHaveAttribute("aria-controls", billing.id);
  });

  it("throws a descriptive error outside <Tabs.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Tabs.Panel value="account">Account panel</Tabs.Panel>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Tabs parts must be placed within <Tabs.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
