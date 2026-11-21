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

import { Collapsible } from "../index.ts";

describeConformance(
  "<Collapsible.Panel />",
  (props) => (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger />
      <Collapsible.Panel {...props} />
    </Collapsible.Root>
  ),
  { tagName: "DIV" },
);

describe("<Collapsible.Panel />", () => {
  const { render } = createRenderer();

  it("is hidden while closed, and keeps its content in the document", async () => {
    await render(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel data-testid="panel">
          <input aria-label="Note" />
        </Collapsible.Panel>
      </Collapsible.Root>
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

  it("gets an id of its own in each collapsible", async () => {
    await render(() => (
      <>
        <Collapsible.Root>
          <Collapsible.Trigger>First</Collapsible.Trigger>
          <Collapsible.Panel>First content</Collapsible.Panel>
        </Collapsible.Root>
        <Collapsible.Root>
          <Collapsible.Trigger>Second</Collapsible.Trigger>
          <Collapsible.Panel>Second content</Collapsible.Panel>
        </Collapsible.Root>
      </>
    ));

    const first = screen.getByText("First content").id;
    const second = screen.getByText("Second content").id;
    expect(first).not.toBe(second);
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute(
      "aria-controls",
      first,
    );
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute(
      "aria-controls",
      second,
    );
  });

  it("keeps its id and hidden when rendered through render", async () => {
    await render(() => (
      <Collapsible.Root>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel render={(props) => <section {...props} />}>
          Content
        </Collapsible.Panel>
      </Collapsible.Root>
    ));

    const panel = screen.getByText("Content");
    expect(panel.tagName).toBe("SECTION");
    expect(panel).toHaveAttribute("hidden");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-controls",
      panel.id,
    );
  });

  it("throws a descriptive error outside <Collapsible.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Collapsible.Panel>Content</Collapsible.Panel>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Collapsible parts must be placed within <Collapsible.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
