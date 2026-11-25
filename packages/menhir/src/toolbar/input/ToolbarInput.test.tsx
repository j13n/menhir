// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Errored } from "solid-js";

import {
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Toolbar } from "../index.ts";

describeConformance(
  "<Toolbar.Input />",
  (props) => (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Input aria-label="Size" {...props} />
    </Toolbar.Root>
  ),
  { tagName: "INPUT" },
);

const textbox = (name: string) => screen.getByRole("textbox", { name });

describe("<Toolbar.Input />", () => {
  const { render } = createRenderer();

  it("renders an input, named by aria-label", async () => {
    await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Input aria-label="Size" />
      </Toolbar.Root>
    ));

    expect(textbox("Size").tagName).toBe("INPUT");
  });

  it("is read-only and focusable while disabled, and cancels Enter", async () => {
    const onKeyDown = vi.fn();
    await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Input aria-label="Size" disabled onKeyDown={onKeyDown} />
      </Toolbar.Root>
    ));

    expect(textbox("Size")).toHaveAttribute("aria-disabled", "true");
    expect(textbox("Size")).toHaveAttribute("readonly");
    expect(textbox("Size")).not.toBeDisabled();
    textbox("Size").focus();
    expect(textbox("Size")).toHaveFocus();
    // Enter would submit the input's form.
    expect(fireEvent.keyDown(textbox("Size"), { key: "Enter" })).toBe(false);
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it("keeps the consumer's readonly", async () => {
    await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Input aria-label="Size" readonly />
      </Toolbar.Root>
    ));

    expect(textbox("Size")).toHaveAttribute("readonly");
    expect(textbox("Size")).not.toHaveAttribute("aria-disabled");
  });

  it("throws a descriptive error outside <Toolbar.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Toolbar.Input aria-label="Size" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Toolbar parts must be placed within <Toolbar.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
