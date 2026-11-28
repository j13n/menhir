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

import { Accordion } from "../index.ts";

describeConformance(
  "<Accordion.Panel />",
  (props) => (
    <Accordion.Root defaultValue={["shipping"]}>
      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger />
        </Accordion.Header>
        <Accordion.Panel {...props} />
      </Accordion.Item>
    </Accordion.Root>
  ),
  { tagName: "DIV" },
);

describe("<Accordion.Panel />", () => {
  const { render } = createRenderer();

  it("is a region named by its Trigger", async () => {
    await render(() => (
      <Accordion.Root defaultValue={["shipping"]}>
        <Accordion.Item value="shipping">
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Shipping answer</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const region = screen.getByRole("region", { name: "Shipping" });
    expect(region).toHaveTextContent("Shipping answer");
    expect(region).toHaveAttribute(
      "aria-labelledby",
      screen.getByRole("button").id,
    );
  });

  it("is hidden while closed, and keeps its content in the document", async () => {
    await render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel data-testid="panel">
            <input aria-label="Note" />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const panel = screen.getByTestId("panel");
    const input = screen.getByLabelText<HTMLInputElement>("Note");
    expect(panel).toHaveAttribute("hidden");
    expect(input).not.toBeVisible();

    fireEvent.click(screen.getByRole("button"));
    await afterFlush();
    expect(panel).not.toHaveAttribute("hidden");
    fireEvent.input(input, { target: { value: "Kept" } });

    fireEvent.click(screen.getByRole("button"));
    await afterFlush();
    expect(panel).toHaveAttribute("hidden");
    expect(screen.getByLabelText("Note")).toBe(input);
    expect(input.value).toBe("Kept");
  });

  it("leaves hiding to the consumer's CSS with hidden={false}", async () => {
    await render(() => (
      <Accordion.Root>
        <Accordion.Item value="shipping">
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel hidden={false}>Content</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const panel = screen.getByText("Content");
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(panel).not.toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("data-closed");

    fireEvent.click(trigger);
    await afterFlush();
    expect(panel).not.toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("data-open");
    expect(panel).not.toHaveAttribute("data-closed");
  });

  it("gets an id of its own in each item, as its Trigger does", async () => {
    await render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>First answer</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>Second</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Second answer</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const panels = ["First", "Second"].map((name) =>
      screen.getByText(`${name} answer`),
    );
    const triggers = screen.getAllByRole("button");
    const ids = [...panels, ...triggers].map((element) => element.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids).not.toContain("");
    panels.forEach((panel, index) => {
      expect(triggers[index]).toHaveAttribute("aria-controls", panel.id);
      expect(panel).toHaveAttribute("aria-labelledby", triggers[index].id);
    });
  });

  it("keeps its id, hidden and the region when rendered through render", async () => {
    await render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel render={(props) => <section {...props} />}>
            Shipping answer
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const panel = screen.getByText("Shipping answer");
    expect(panel.tagName).toBe("SECTION");
    expect(panel).toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("role", "region");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-controls",
      panel.id,
    );
  });

  it("lets a render function remove the region", async () => {
    await render(() => (
      <Accordion.Root multiple defaultValue={["shipping"]}>
        <Accordion.Item value="shipping">
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel
            render={(props) => (
              <div {...props} role={undefined} aria-labelledby={undefined} />
            )}
          >
            Shipping answer
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const panel = screen.getByText("Shipping answer");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(panel).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-controls",
      panel.id,
    );
  });

  it("throws a descriptive error outside <Accordion.Item>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Accordion.Root>
          <Accordion.Panel>Shipping answer</Accordion.Panel>
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
