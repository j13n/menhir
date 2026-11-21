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

import { Accordion } from "../index.ts";

describeConformance(
  "<Accordion.Trigger />",
  (props) => (
    <Accordion.Root>
      <Accordion.Item>
        <Accordion.Header>
          <Accordion.Trigger {...props} />
        </Accordion.Header>
        <Accordion.Panel />
      </Accordion.Item>
    </Accordion.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Accordion.Trigger />", () => {
  const { render } = createRenderer();

  // One section; `trigger` replaces its Trigger.
  function Shipping(props: { trigger?: JSX.Element; disabled?: boolean }) {
    return (
      <Accordion.Item disabled={props.disabled}>
        <Accordion.Header>
          {props.trigger ?? <Accordion.Trigger>Shipping</Accordion.Trigger>}
        </Accordion.Header>
        <Accordion.Panel>Shipping answer</Accordion.Panel>
      </Accordion.Item>
    );
  }

  it("renders a button of type button", async () => {
    await render(() => (
      <Accordion.Root>
        <Shipping />
      </Accordion.Root>
    ));

    const trigger = screen.getByRole("button", { name: "Shipping" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("type", "button");
  });

  it("passes aria-label through", async () => {
    await render(() => (
      <Accordion.Root>
        <Shipping trigger={<Accordion.Trigger aria-label="Shipping times" />} />
      </Accordion.Root>
    ));

    expect(
      screen.getByRole("button", { name: "Shipping times" }),
    ).toBeInTheDocument();
  });

  it("names its Panel in aria-controls", async () => {
    await render(() => (
      <Accordion.Root>
        <Shipping />
      </Accordion.Root>
    ));

    const panelId = screen.getByText("Shipping answer").id;
    expect(panelId).not.toBe("");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-controls",
      panelId,
    );
  });

  it("takes the consumer's id, which its Panel names", async () => {
    await render(() => (
      <Accordion.Root>
        <Shipping
          trigger={
            <Accordion.Trigger id="shipping">Shipping</Accordion.Trigger>
          }
        />
      </Accordion.Root>
    ));

    expect(screen.getByRole("button")).toHaveAttribute("id", "shipping");
    expect(screen.getByText("Shipping answer")).toHaveAttribute(
      "aria-labelledby",
      "shipping",
    );
  });

  it("is one tab stop per section, and Tab skips a disabled one", async () => {
    const { user } = await render(() => (
      <Accordion.Root>
        <Shipping />
        <Shipping disabled />
        <Shipping />
      </Accordion.Root>
    ));

    const [first, disabled, last] = screen.getAllByRole("button");
    await user.keyboard("[Tab]");
    expect(first).toHaveFocus();
    await user.keyboard("[Tab]");
    expect(disabled).not.toHaveFocus();
    expect(last).toHaveFocus();
    await user.keyboard("{Shift>}[Tab]{/Shift}");
    expect(first).toHaveFocus();
  });

  it.each([{ key: "Enter" }, { key: "Space" }])(
    "toggles its Panel with $key and keeps focus",
    async ({ key }) => {
      const { user } = await render(() => (
        <Accordion.Root>
          <Shipping />
        </Accordion.Root>
      ));

      const trigger = screen.getByRole("button");
      await user.keyboard("[Tab]");

      await user.keyboard(`[${key}]`);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("Shipping answer")).toBeVisible();
      expect(trigger).toHaveFocus();

      await user.keyboard(`[${key}]`);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(screen.getByText("Shipping answer")).not.toBeVisible();
    },
  );

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form onSubmit={onSubmit}>
        <Accordion.Root>
          <Shipping />
        </Accordion.Root>
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
      <Accordion.Root>
        <Shipping
          trigger={
            <Accordion.Trigger onClick={onClick}>Shipping</Accordion.Trigger>
          }
        />
      </Accordion.Root>
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
        <Accordion.Root>
          <Shipping
            trigger={
              <Accordion.Trigger render={Button}>Shipping</Accordion.Trigger>
            }
          />
        </Accordion.Root>
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
          <Accordion.Root>
            <Shipping
              trigger={
                <Accordion.Trigger render={(props) => <div {...props} />}>
                  Shipping
                </Accordion.Trigger>
              }
            />
          </Accordion.Root>
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("Accordion.Trigger");
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });
  });

  it("throws a descriptive error outside <Accordion.Item>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Accordion.Root>
          <Accordion.Trigger>Shipping</Accordion.Trigger>
        </Accordion.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Accordion parts must be placed within <Accordion.Item>.",
      ),
    ).toBeInTheDocument();
  });
});
