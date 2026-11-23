// The test list and the cases left out are in ../README.md.
import { createSignal, Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Editor } from "../../../test/menubar/Editor.tsx";
import { Menubar } from "../index.ts";

const barItem = (name: string) => screen.getByRole("menuitem", { name });
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });
/** The Popup that an item of the bar names in `aria-controls`. */
const menuOf = (name: string) =>
  document.getElementById(barItem(name).getAttribute("aria-controls")!)!;
const shown = (name: string) => menuOf(name).matches(":popover-open");

describe("<Menubar.Menu />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Menubar.Root>
        <Menubar.Menu>
          <span>Inside</span>
        </Menubar.Menu>
      </Menubar.Root>
    ));

    expect(container.firstElementChild!.innerHTML).toBe("<span>Inside</span>");
  });

  it("is closed by default, and starts open with defaultOpen, with focus on its first item", async () => {
    await render(() => <Editor edit={{ defaultOpen: true }} />);
    await afterFlush();

    expect(shown("File")).toBe(false);
    expect(barItem("File")).toHaveAttribute("data-closed", "");
    expect(shown("Edit")).toBe(true);
    expect(barItem("Edit")).toHaveAttribute("data-open", "");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));
  });

  it("opens and closes from its Trigger, reporting each with its reason and event", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <Editor edit={{ onOpenChange }} />);

    await user.click(barItem("Edit"));
    await afterFlush();
    expect(shown("Edit")).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });

    await user.click(barItem("Edit"));
    await afterFlush();
    expect(shown("Edit")).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "trigger-press",
      event: expect.any(MouseEvent),
    });
  });

  it("only asks when controlled", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Editor edit={{ open: false, onOpenChange }} />
    ));

    await user.click(barItem("Edit"));
    await afterFlush();

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    expect(shown("Edit")).toBe(false);
  });

  it("moves focus to the first item of a controlled menu that refused an opening along the bar, once it opens later", async () => {
    const [open, setOpen] = createSignal(false);
    const { user } = await render(() => (
      // Refuses every change asked for.
      <Editor edit={{ open: open(), onOpenChange: () => {} }} />
    ));
    barItem("File").focus();
    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("New")));

    await user.keyboard("{ArrowRight}");
    await afterFlush();
    expect(shown("Edit")).toBe(false);
    expect(document.activeElement).toBe(barItem("Edit"));
    await new Promise((resolve) => setTimeout(resolve));

    setOpen(true);
    await afterFlush();

    expect(shown("Edit")).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Copy")));
  });

  it("throws a descriptive error outside Menubar.Root", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Menubar.Menu />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Menubar parts must be placed within <Menubar.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
