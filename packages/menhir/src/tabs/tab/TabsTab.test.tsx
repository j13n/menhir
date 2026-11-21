// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import type { JSX } from "@solidjs/web";
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
  "<Tabs.Tab />",
  (props) => (
    <Tabs.Root>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab {...props} value="account" />
      </Tabs.List>
      <Tabs.Panel value="account" />
    </Tabs.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Tabs.Tab />", () => {
  const { render } = createRenderer();
  const tab = (name: string) => screen.getByRole("tab", { name });
  const panel = (name: string) => screen.getByText(`${name} panel`);

  // Two tabs and their panels; `account` replaces the Account tab.
  function Settings(props: {
    account?: JSX.Element;
    billingDisabled?: boolean;
  }) {
    return (
      <Tabs.Root>
        <Tabs.List aria-label="Settings">
          {props.account ?? <Tabs.Tab value="account">Account</Tabs.Tab>}
          <Tabs.Tab value="billing" disabled={props.billingDisabled}>
            Billing
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="account">Account panel</Tabs.Panel>
        <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
      </Tabs.Root>
    );
  }

  it("renders a button of type button with role tab, inside the tablist", async () => {
    await render(() => <Settings />);

    const account = tab("Account");
    expect(account.tagName).toBe("BUTTON");
    expect(account).toHaveAttribute("type", "button");
    expect(account.parentElement).toBe(screen.getByRole("tablist"));
  });

  it("passes aria-label through", async () => {
    await render(() => (
      <Settings
        account={<Tabs.Tab value="account" aria-label="Your account" />}
      />
    ));

    expect(tab("Your account")).toBeInTheDocument();
  });

  it("has aria-selected true when selected and false otherwise", async () => {
    await render(() => <Settings />);

    expect(tab("Account")).toHaveAttribute("aria-selected", "true");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "false");
  });

  it("names its panel in aria-controls", async () => {
    await render(() => <Settings />);

    for (const name of ["Account", "Billing"]) {
      const panelId = panel(name).id;
      expect(panelId).not.toBe("");
      expect(tab(name)).toHaveAttribute("aria-controls", panelId);
    }
  });

  it("takes the consumer's id, which its panel names", async () => {
    await render(() => (
      <Settings
        account={
          <Tabs.Tab value="account" id="account-tab">
            Account
          </Tabs.Tab>
        }
      />
    ));

    expect(tab("Account")).toHaveAttribute("id", "account-tab");
    expect(panel("Account")).toHaveAttribute("aria-labelledby", "account-tab");
    expect(panel("Billing")).toHaveAttribute(
      "aria-labelledby",
      tab("Billing").id,
    );
  });

  it("has data-selected or data-unselected, and follows changes", async () => {
    await render(() => <Settings />);

    expect(tab("Account")).toHaveAttribute("data-selected", "");
    expect(tab("Account")).not.toHaveAttribute("data-unselected");
    expect(tab("Billing")).toHaveAttribute("data-unselected", "");

    fireEvent.click(tab("Billing"));
    await afterFlush();

    expect(tab("Billing")).toHaveAttribute("data-selected", "");
    expect(tab("Billing")).not.toHaveAttribute("data-unselected");
    expect(tab("Account")).toHaveAttribute("data-unselected", "");
    expect(tab("Account")).not.toHaveAttribute("data-selected");
  });

  it("stays focusable when disabled, and a click does not select it", async () => {
    await render(() => <Settings billingDisabled />);

    const billing = tab("Billing");
    expect(billing).toHaveAttribute("aria-disabled", "true");
    expect(billing).toHaveAttribute("data-disabled", "");
    expect(billing).not.toBeDisabled();
    expect(tab("Account")).not.toHaveAttribute("aria-disabled");
    expect(tab("Account")).not.toHaveAttribute("data-disabled");

    fireEvent.click(billing);
    await afterFlush();

    expect(billing).toHaveAttribute("aria-selected", "false");
    expect(tab("Account")).toHaveAttribute("aria-selected", "true");
  });

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form onSubmit={onSubmit}>
        <Settings />
      </form>
    ));

    await user.click(tab("Billing"));
    await user.keyboard("[Enter]");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
  });

  it("calls the consumer's onClick, onFocus and onKeyDown with its own", async () => {
    const onClick = vi.fn();
    const onFocus = vi.fn();
    const onKeyDown = vi.fn();
    const { user } = await render(() => (
      <Settings
        account={
          <Tabs.Tab
            value="account"
            onClick={onClick}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
          >
            Account
          </Tabs.Tab>
        }
      />
    ));

    await user.keyboard("[Tab]");
    expect(onFocus).toHaveBeenCalledTimes(1);
    await user.keyboard("[ArrowRight]");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(tab("Billing")).toHaveFocus();
    await user.click(tab("Account"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(tab("Account")).toHaveAttribute("aria-selected", "true");
  });

  describe("render", () => {
    function Button(props: JSX.IntrinsicElements["button"]) {
      return <button data-styled="" {...props} />;
    }

    it("keeps the tab's behaviour when rendered with a button component", async () => {
      const { user } = await render(() => (
        <Settings
          account={
            <Tabs.Tab value="account" render={Button}>
              Account
            </Tabs.Tab>
          }
        />
      ));

      expect(tab("Account")).toHaveAttribute("data-styled", "");
      expect(tab("Account")).toHaveAttribute("aria-selected", "true");
      await user.keyboard("[Tab]");
      expect(tab("Account")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    });

    it("warns in development when render does not render a button", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        await render(() => (
          <Settings
            account={
              <Tabs.Tab value="account" render={(props) => <div {...props} />}>
                Account
              </Tabs.Tab>
            }
          />
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("Tabs.Tab");
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });
  });

  it("throws a descriptive error outside <Tabs.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Tabs.Tab value="account">Account</Tabs.Tab>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Tabs parts must be placed within <Tabs.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
