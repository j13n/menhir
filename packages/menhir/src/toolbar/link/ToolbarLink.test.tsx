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
  "<Toolbar.Link />",
  (props) => (
    <Toolbar.Root aria-label="Formatting">
      <Toolbar.Link href="#help" {...props} />
    </Toolbar.Root>
  ),
  { tagName: "A" },
);

const link = (name: string) => screen.getByRole("link", { name });

describe("<Toolbar.Link />", () => {
  const { render } = createRenderer();

  it("renders a link with its href, named by its content", async () => {
    await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Link href="#help">Help</Toolbar.Link>
      </Toolbar.Root>
    ));

    expect(link("Help").tagName).toBe("A");
    expect(link("Help")).toHaveAttribute("href", "#help");
  });

  it("neither navigates nor calls onClick while disabled", async () => {
    const onClick = vi.fn();
    await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Link href="#help" disabled onClick={onClick}>
          Help
        </Toolbar.Link>
      </Toolbar.Root>
    ));

    expect(link("Help")).toHaveAttribute("aria-disabled", "true");
    expect(link("Help")).toHaveAttribute("data-disabled", "");
    // A cancelled click does not follow the link.
    expect(fireEvent.click(link("Help"))).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    // Nor does a middle click open it in a new tab.
    const middle = new MouseEvent("auxclick", {
      bubbles: true,
      cancelable: true,
      button: 1,
    });
    expect(link("Help").dispatchEvent(middle)).toBe(false);
  });

  it("throws a descriptive error outside <Toolbar.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Toolbar.Link href="#help">Help</Toolbar.Link>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Toolbar parts must be placed within <Toolbar.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
