// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { Errored, createSignal, flush } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Tabs } from "../index.ts";

describeConformance(
  "<Tabs.List />",
  (props) => (
    <Tabs.Root>
      <Tabs.List {...props} />
    </Tabs.Root>
  ),
  { tagName: "DIV" },
);

describe("<Tabs.List />", () => {
  const { render } = createRenderer();

  it("renders a div with role tablist", async () => {
    await render(() => (
      <Tabs.Root>
        <Tabs.List aria-label="Settings" />
      </Tabs.Root>
    ));

    expect(screen.getByRole("tablist").tagName).toBe("DIV");
  });

  it("passes aria-label and aria-labelledby through", async () => {
    await render(() => (
      <>
        <h2 id="heading">Profile</h2>
        <Tabs.Root>
          <Tabs.List aria-label="Settings" />
        </Tabs.Root>
        <Tabs.Root>
          <Tabs.List aria-labelledby="heading" />
        </Tabs.Root>
      </>
    ));

    expect(
      screen.getByRole("tablist", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tablist", { name: "Profile" }),
    ).toBeInTheDocument();
  });

  it("has aria-orientation only when vertical, and data-horizontal or data-vertical", async () => {
    const [orientation, setOrientation] = createSignal<
      "horizontal" | "vertical"
    >();
    await render(() => (
      <Tabs.Root orientation={orientation()}>
        <Tabs.List aria-label="Settings" />
      </Tabs.Root>
    ));
    const list = screen.getByRole("tablist");

    expect(list).not.toHaveAttribute("aria-orientation");
    expect(list).toHaveAttribute("data-horizontal", "");
    expect(list).not.toHaveAttribute("data-vertical");

    setOrientation("vertical");
    flush();

    expect(list).toHaveAttribute("aria-orientation", "vertical");
    expect(list).toHaveAttribute("data-vertical", "");
    expect(list).not.toHaveAttribute("data-horizontal");
  });

  it("throws a descriptive error outside <Tabs.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Tabs.List aria-label="Settings" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Tabs parts must be placed within <Tabs.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
