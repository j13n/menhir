// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored, For } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  keyboard,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import { input, item, popup, shown } from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

const fixed = (left: number, top: number, width: number) => ({
  position: "fixed" as const,
  left: `${left}px`,
  top: `${top}px`,
  width: `${width}px`,
  height: "20px",
  margin: "0",
  padding: "0",
  border: "0",
  "box-sizing": "border-box" as const,
});

/**
 * An open Combobox whose Input is 60 by 20, fixed at (200, 200), and a box
 * 120 by 20 at (180, 300), its Popup's anchor when `anchored`.
 */
function Placed(props: {
  style: JSX.CSSProperties;
  anchored?: boolean;
  count?: number;
}) {
  let box!: HTMLDivElement;
  return (
    <>
      <div ref={box} data-testid="box" style={fixed(180, 300, 120)} />
      <Combobox.Root defaultOpen>
        <Combobox.Input aria-label="Fruit" style={fixed(200, 200, 60)} />
        <Combobox.Popup
          style={props.style}
          anchor={props.anchored ? () => box : undefined}
        >
          <Combobox.List aria-label="Fruits">
            <For each={Array.from({ length: props.count ?? 3 }, (_, i) => i)}>
              {(index) => (
                <Combobox.Item
                  value={`item-${index}`}
                  style={{ height: "20px" }}
                >
                  Item {index}
                </Combobox.Item>
              )}
            </For>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </>
  );
}

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

const smallPopup = {
  width: "100px",
  height: "60px",
  padding: "0",
  border: "0",
};

describeConformance(
  "<Combobox.Popup />",
  (props) => (
    <Combobox.Root>
      <Combobox.Popup {...props} />
    </Combobox.Root>
  ),
  { tagName: "DIV" },
);

describe("<Combobox.Popup />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a manual popover with no role, hidden until opened", async () => {
    const { user } = await render(() => <Fruit />);

    expect(popup().tagName).toBe("DIV");
    expect(popup()).toHaveAttribute("popover", "manual");
    expect(popup()).not.toHaveAttribute("role");
    expect(shown()).toBe(false);

    await user.type(input(), "a");
    await afterFlush();

    expect(shown()).toBe(true);
  });

  it("carries data-open or data-closed, data-disabled and data-required", async () => {
    await render(() => <Fruit defaultOpen disabled required />);
    await afterFlush();

    expect(popup()).toHaveAttribute("data-open", "");
    expect(popup()).not.toHaveAttribute("data-closed");
    expect(popup()).toHaveAttribute("data-disabled", "");
    expect(popup()).toHaveAttribute("data-required", "");
  });

  it.skipIf(isJSDOM)(
    "is in the top layer and not modal: a button outside can still be pressed",
    async () => {
      const onClick = vi.fn();
      await render(() => (
        <>
          <Fruit defaultOpen />
          <button type="button" onClick={onClick}>
            Elsewhere
          </button>
        </>
      ));
      await nextTask();

      expect(shown()).toBe(true);
      expect(popup().matches(":modal")).toBe(false);
      await press(centerOf(screen.getByRole("button", { name: "Elsewhere" })));
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  it.skipIf(isJSDOM)(
    "is placed below the Input, aligned to its start",
    async () => {
      await render(() => <Placed style={smallPopup} />);
      await frames();

      expect(popup()).toHaveAttribute("data-side", "bottom");
      expect(popup()).toHaveAttribute("data-align", "start");
      const box = popup().getBoundingClientRect();
      expect([box.left, box.top]).toEqual([200, 220]);
    },
  );

  it.skipIf(isJSDOM)("is placed against its anchor instead", async () => {
    await render(() => <Placed anchored style={smallPopup} />);
    await frames();

    const box = popup().getBoundingClientRect();
    expect([box.left, box.top]).toEqual([180, 320]);
  });

  it.skipIf(isJSDOM)(
    "writes --anchor-width and --available-height",
    async () => {
      await render(() => (
        <Placed
          count={200}
          style={{
            padding: "0",
            border: "0",
            "box-sizing": "border-box",
            width: "var(--anchor-width)",
            "max-height": "var(--available-height)",
            "overflow-y": "auto",
          }}
        />
      ));
      await frames();

      const box = popup().getBoundingClientRect();
      expect(box.width).toBe(60);
      expect(box.top).toBe(220);
      expect(box.bottom).toBe(window.innerHeight - 5);
      expect(popup().scrollHeight).toBeGreaterThan(box.height);
    },
  );

  it.skipIf(isJSDOM)(
    "leaves focus in the input on a press on an item, which it selects",
    async () => {
      const { user } = await render(() => <Fruit />);
      await user.type(input(), "b");
      await nextTask();

      await press(centerOf(item("Blueberry")));
      await afterFlush();

      expect(document.activeElement).toBe(input());
      expect(input()).toHaveValue("Blueberry");
      expect(shown()).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "closes on Escape inside a modal dialog, which stays open",
    async () => {
      let dialog!: HTMLDialogElement;
      const { user } = await render(() => (
        <dialog ref={dialog}>
          <Fruit />
        </dialog>
      ));
      dialog.showModal();
      await user.type(input(), "b");
      await nextTask();
      expect(shown()).toBe(true);

      await keyboard("{Escape}");
      await nextTask();
      expect(shown()).toBe(false);
      expect(dialog.open).toBe(true);

      // Then the text, then nothing is left, and the dialog closes.
      await keyboard("{Escape}");
      await nextTask();
      expect(input()).toHaveValue("");
      expect(dialog.open).toBe(true);
      await keyboard("{Escape}");
      await nextTask();
      expect(dialog.open).toBe(false);
    },
  );

  it("throws a descriptive error outside Combobox.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Combobox.Popup />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>, and Autocomplete parts within <Autocomplete.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
