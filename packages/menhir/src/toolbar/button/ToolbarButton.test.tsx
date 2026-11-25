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

import { Toolbar } from "../index.ts";

describeConformance(
  "<Toolbar.Button />",
  (props) => (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Button {...props} />
    </Toolbar.Root>
  ),
  { tagName: "BUTTON" },
);

const button = (name: string) => screen.getByRole("button", { name });

describe("<Toolbar.Button />", () => {
  const { render } = createRenderer();

  it("renders a button of type button, named by its content", async () => {
    await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button>Bold</Toolbar.Button>
      </Toolbar.Root>
    ));

    expect(button("Bold").tagName).toBe("BUTTON");
    expect(button("Bold")).toHaveAttribute("type", "button");
  });

  it("stays focusable when disabled, with aria-disabled", async () => {
    await render(() => (
      <Toolbar.Root aria-label="Edit">
        <Toolbar.Button disabled>Cut</Toolbar.Button>
      </Toolbar.Root>
    ));

    expect(button("Cut")).toHaveAttribute("aria-disabled", "true");
    expect(button("Cut")).toHaveAttribute("data-disabled", "");
    expect(button("Cut")).not.toBeDisabled();
    button("Cut").focus();
    expect(button("Cut")).toHaveFocus();
  });

  it("calls onClick, but not while disabled", async () => {
    const onCut = vi.fn();
    const onCopy = vi.fn();
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Edit">
        <Toolbar.Button onClick={onCut}>Cut</Toolbar.Button>
        <Toolbar.Button disabled onClick={onCopy}>
          Copy
        </Toolbar.Button>
      </Toolbar.Root>
    ));

    await user.click(button("Cut"));
    expect(onCut).toHaveBeenCalledOnce();

    await user.click(button("Copy"));
    expect(onCopy).not.toHaveBeenCalled();
    // The click's default action, such as submitting a form, is cancelled.
    expect(fireEvent.click(button("Copy"))).toBe(false);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("calls no onClick for Enter or Space while disabled", async () => {
    const onClick = vi.fn();
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Edit">
        <Toolbar.Button disabled onClick={onClick}>
          Copy
        </Toolbar.Button>
      </Toolbar.Root>
    ));

    button("Copy").focus();
    await user.keyboard("[Enter][Space]");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps its behaviour when rendered as a button component", async () => {
    const onClick = vi.fn();
    const Fancy = (props: JSX.HTMLAttributes<HTMLButtonElement>) => (
      <button {...props} class="fancy" />
    );
    const { user } = await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button render={Fancy} onClick={onClick}>
          Bold
        </Toolbar.Button>
        <Toolbar.Button render={Fancy}>Italic</Toolbar.Button>
      </Toolbar.Root>
    ));

    expect(button("Bold")).toHaveClass("fancy");
    expect(button("Bold")).toHaveAttribute("type", "button");
    expect(button("Bold")).toHaveAttribute("tabindex", "0");
    expect(button("Italic")).toHaveAttribute("tabindex", "-1");
    await user.click(button("Bold"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("throws a descriptive error outside <Toolbar.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Toolbar.Button>Bold</Toolbar.Button>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Toolbar parts must be placed within <Toolbar.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
