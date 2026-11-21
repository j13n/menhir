// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { Errored } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Accordion } from "../index.ts";

describeConformance(
  "<Accordion.Header />",
  (props) => (
    <Accordion.Root>
      <Accordion.Item>
        <Accordion.Header {...props} />
      </Accordion.Item>
    </Accordion.Root>
  ),
  { tagName: "H3" },
);

describe("<Accordion.Header />", () => {
  const { render } = createRenderer();

  it("is a heading of level 3 that holds the Trigger", async () => {
    await render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Shipping answer</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    const heading = screen.getByRole("heading", { level: 3, name: "Shipping" });
    expect(heading.children).toHaveLength(1);
    expect(heading.firstElementChild).toBe(screen.getByRole("button"));
  });

  it("takes the level of the heading its render function renders", async () => {
    await render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header render={(props) => <h2 {...props} />}>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Shipping answer</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    expect(
      screen.getByRole("heading", { level: 2, name: "Shipping" }),
    ).toHaveAttribute("data-closed", "");
  });

  it("throws a descriptive error outside <Accordion.Item>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Accordion.Root>
          <Accordion.Header />
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
