// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";

import {
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Collapsible } from "../index.ts";

describeConformance(
  "<Collapsible.Trigger />",
  (props) => (
    <Collapsible.Root>
      <Collapsible.Trigger {...props} />
      <Collapsible.Panel />
    </Collapsible.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Collapsible.Trigger />", () => {
  const { render } = createRenderer();

  function Details(props: { trigger?: JSX.Element }) {
    return (
      <Collapsible.Root>
        {props.trigger ?? <Collapsible.Trigger>Details</Collapsible.Trigger>}
        <Collapsible.Panel>Content</Collapsible.Panel>
      </Collapsible.Root>
    );
  }

  it("renders a button of type button", async () => {
    await render(() => <Details />);

    const trigger = screen.getByRole("button", { name: "Details" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("type", "button");
  });

  it("passes aria-label through", async () => {
    await render(() => (
      <Details trigger={<Collapsible.Trigger aria-label="Show details" />} />
    ));

    expect(
      screen.getByRole("button", { name: "Show details" }),
    ).toBeInTheDocument();
  });

  it("takes the consumer's id", async () => {
    await render(() => (
      <Details
        trigger={
          <Collapsible.Trigger id="details">Details</Collapsible.Trigger>
        }
      />
    ));

    expect(screen.getByRole("button")).toHaveAttribute("id", "details");
  });

  it("names the Panel in aria-controls", async () => {
    await render(() => <Details />);

    const panelId = screen.getByText("Content").id;
    expect(panelId).not.toBe("");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-controls",
      panelId,
    );
  });

  it.each([{ key: "Enter" }, { key: "Space" }])(
    "focuses with Tab, toggles with $key and keeps focus",
    async ({ key }) => {
      const { user } = await render(() => <Details />);

      const trigger = screen.getByRole("button");
      await user.keyboard("[Tab]");
      expect(trigger).toHaveFocus();

      await user.keyboard(`[${key}]`);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("Content")).toBeVisible();
      expect(trigger).toHaveFocus();

      await user.keyboard(`[${key}]`);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(screen.getByText("Content")).not.toBeVisible();
    },
  );

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form onSubmit={onSubmit}>
        <Details />
      </form>
    ));

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.keyboard("[Enter]");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    await render(() => (
      <Details
        trigger={
          <Collapsible.Trigger onClick={onClick}>Details</Collapsible.Trigger>
        }
      />
    ));

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe("render", () => {
    function Button(props: JSX.IntrinsicElements["button"]) {
      return <button data-styled="" {...props} />;
    }

    it("keeps the Trigger's behaviour when rendered with a button component", async () => {
      const { user } = await render(() => (
        <Details
          trigger={
            <Collapsible.Trigger render={Button}>Details</Collapsible.Trigger>
          }
        />
      ));

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-styled", "");
      await user.keyboard("[Tab]");
      await user.keyboard("[Space]");
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("warns in development when render does not render a button", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        await render(() => (
          <Details
            trigger={
              <Collapsible.Trigger render={(props) => <div {...props} />}>
                Details
              </Collapsible.Trigger>
            }
          />
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("Collapsible.Trigger");
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });

    it("does not warn when render renders a button", async () => {
      const warn = vi.spyOn(console, "warn");
      try {
        await render(() => (
          <Details
            trigger={
              <Collapsible.Trigger render={Button}>Details</Collapsible.Trigger>
            }
          />
        ));

        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });
  });

  it("throws a descriptive error outside <Collapsible.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Collapsible parts must be placed within <Collapsible.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
