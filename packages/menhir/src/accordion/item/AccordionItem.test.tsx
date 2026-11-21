// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Errored } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Accordion } from "../index.ts";

describeConformance(
  "<Accordion.Item />",
  (props) => (
    <Accordion.Root>
      <Accordion.Item {...props} />
    </Accordion.Root>
  ),
  { tagName: "DIV" },
);

describe("<Accordion.Item />", () => {
  const { render } = createRenderer();
  const trigger = (name: string) => screen.getByRole("button", { name });

  function Section(props: { name: string; disabled?: boolean }) {
    return (
      <Accordion.Item
        data-testid={`${props.name} item`}
        value={props.name.toLowerCase()}
        disabled={props.disabled}
      >
        <Accordion.Header data-testid={`${props.name} header`}>
          <Accordion.Trigger>{props.name}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>{`${props.name} answer`}</Accordion.Panel>
      </Accordion.Item>
    );
  }

  // Every part of a section, Item first.
  const parts = (name: string) => [
    screen.getByTestId(`${name} item`),
    screen.getByTestId(`${name} header`),
    trigger(name),
    screen.getByText(`${name} answer`),
  ];

  it("is identified in the Root's value by its value", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Accordion.Root defaultValue={["returns"]} onValueChange={onValueChange}>
        <Section name="Shipping" />
        <Section name="Returns" />
      </Accordion.Root>
    ));

    expect(trigger("Returns")).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger("Shipping"));
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith(["shipping"]);
  });

  it("disables only its own Trigger", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Accordion.Root onValueChange={onValueChange}>
        <Section name="Shipping" disabled />
        <Section name="Returns" />
      </Accordion.Root>
    ));

    expect(trigger("Shipping")).toBeDisabled();
    expect(trigger("Returns")).not.toBeDisabled();
    for (const part of parts("Shipping")) {
      expect(part).toHaveAttribute("data-disabled", "");
    }
    for (const part of parts("Returns")) {
      expect(part).not.toHaveAttribute("data-disabled");
    }

    fireEvent.click(trigger("Shipping"));
    await afterFlush();
    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.click(trigger("Returns"));
    await afterFlush();
    expect(trigger("Returns")).toHaveAttribute("aria-expanded", "true");
  });

  it("puts its open state in data attributes on every part", async () => {
    await render(() => (
      <Accordion.Root>
        <Section name="Shipping" />
      </Accordion.Root>
    ));

    for (const part of parts("Shipping")) {
      expect(part).toHaveAttribute("data-closed", "");
      expect(part).not.toHaveAttribute("data-open");
    }

    fireEvent.click(trigger("Shipping"));
    await afterFlush();

    for (const part of parts("Shipping")) {
      expect(part).toHaveAttribute("data-open", "");
      expect(part).not.toHaveAttribute("data-closed");
    }
  });

  it("throws a descriptive error outside <Accordion.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Accordion.Item />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Accordion.Item must be placed within <Accordion.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
