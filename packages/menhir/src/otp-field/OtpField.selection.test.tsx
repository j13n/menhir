// The test list and the cases left out are in ./README.md. The boxes show
// the Input's selection and caret, and a press, a key or focus places them.
import { describe, expect, it } from "vitest";

import {
  afterFlush,
  createRenderer,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  keyboard,
  nextTask,
  press,
  tap,
} from "../../test/floating/input.ts";

import { OtpField } from "./index.ts";
import type { OtpFieldRootProps } from "./root/OtpFieldRoot.tsx";

const textbox = () => screen.getByRole<HTMLInputElement>("textbox");
const slots = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-testid=slot]"));
/** Each box's state: `a` active, `c` caret too, `-` neither. */
const boxes = () =>
  slots()
    .map((slot) =>
      slot.hasAttribute("data-caret")
        ? "c"
        : slot.hasAttribute("data-active")
          ? "a"
          : "-",
    )
    .join("");
const selection = () => [textbox().selectionStart, textbox().selectionEnd];

/** Sets the selection, as the browser does, and reports it. */
function setSelection(start: number, end: number) {
  textbox().setSelectionRange(start, end);
  fireEvent.select(textbox());
}

/** Four 40 px boxes, 20 px apart, the second pair after a separator. */
function Code(props: Partial<OtpFieldRootProps>) {
  return (
    <OtpField.Root
      length={4}
      aria-label="Code"
      style={{ display: "flex", gap: "20px", width: "max-content" }}
      {...props}
    >
      <OtpField.Input aria-label="Code" />
      <OtpField.Slot index={0} data-testid="slot" style={box} />
      <OtpField.Slot index={1} data-testid="slot" style={box} />
      <span aria-hidden="true" data-testid="separator" style={box}>
        -
      </span>
      <OtpField.Slot index={2} data-testid="slot" style={box} />
      <OtpField.Slot index={3} data-testid="slot" style={box} />
    </OtpField.Root>
  );
}
const box = { width: "40px", height: "40px" };

describe("OtpField selection", () => {
  const { render } = createRenderer();

  it("shows no active box while the Input does not have focus", async () => {
    await render(() => <Code defaultValue="12" />);

    expect(boxes()).toBe("----");
  });

  it("puts the caret in the first empty box on focus", async () => {
    await render(() => <Code defaultValue="12" />);

    textbox().focus();
    await afterFlush();

    expect(selection()).toEqual([2, 2]);
    expect(boxes()).toBe("--c-");
  });

  it("selects the last character of a full code on focus", async () => {
    await render(() => <Code defaultValue="1234" />);

    textbox().focus();
    await afterFlush();

    expect(selection()).toEqual([3, 4]);
    expect(boxes()).toBe("---a");
  });

  it("makes each box of a selection of several characters active, with no caret", async () => {
    await render(() => <Code defaultValue="1234" />);
    textbox().focus();

    setSelection(1, 3);

    expect(boxes()).toBe("-aa-");
  });

  it("makes the last box active, with no caret, after the last character of a full code", async () => {
    await render(() => <Code defaultValue="1234" />);
    textbox().focus();

    setSelection(4, 4);

    expect(boxes()).toBe("---a");
  });

  it("shows the caret before a character, after a deletion inside the code", async () => {
    await render(() => <Code defaultValue="1234" />);
    textbox().focus();

    setSelection(1, 1);

    expect(boxes()).toBe("-c--");
  });

  it("selects the box before and after with Left and Right, the first with Home and the first empty one with End", async () => {
    const { user } = await render(() => <Code defaultValue="123" />);
    textbox().focus();
    await afterFlush();
    expect(selection()).toEqual([3, 3]);

    await user.keyboard("{ArrowLeft}");
    expect(selection()).toEqual([2, 3]);
    expect(boxes()).toBe("--a-");

    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(selection()).toEqual([0, 1]);

    await user.keyboard("{ArrowRight}");
    expect(selection()).toEqual([1, 2]);

    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    expect(selection()).toEqual([3, 3]);
    expect(boxes()).toBe("---c");

    await user.keyboard("{Home}");
    expect(selection()).toEqual([0, 1]);

    await user.keyboard("{End}");
    expect(selection()).toEqual([3, 3]);
  });

  it("selects the next box with Right from a caret before a character", async () => {
    const { user } = await render(() => <Code defaultValue="123" />);
    textbox().focus();
    setSelection(1, 1);

    await user.keyboard("{ArrowRight}");

    expect(selection()).toEqual([2, 3]);
  });

  it("selects the last character with End in a full code", async () => {
    const { user } = await render(() => <Code defaultValue="1234" />);
    textbox().focus();
    setSelection(0, 1);

    await user.keyboard("{End}");

    expect(selection()).toEqual([3, 4]);
  });

  // jsdom has no `direction` from `dir`.
  it.skipIf(isJSDOM)("swaps Left and Right right to left", async () => {
    const { user } = await render(() => <Code defaultValue="123" dir="rtl" />);
    textbox().focus();
    setSelection(1, 2);

    await user.keyboard("{ArrowLeft}");
    expect(selection()).toEqual([2, 3]);

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(selection()).toEqual([0, 1]);
  });

  it.skipIf(isJSDOM)(
    "leaves Shift with an arrow to the browser, and the boxes follow the selection it makes",
    async () => {
      await render(() => <Code defaultValue="1234" />);
      textbox().focus();
      setSelection(1, 2);

      await keyboard("{Shift>}{ArrowRight}{/Shift}");
      await nextTask();

      expect(selection()).toEqual([1, 3]);
      expect(boxes()).toBe("-aa-");
    },
  );

  it.skipIf(isJSDOM)(
    "focuses the Input and selects the character of a filled box pressed",
    async () => {
      await render(() => <Code defaultValue="123" />);

      await press(centerOf(slots()[1]!));
      await afterFlush();

      expect(document.activeElement).toBe(textbox());
      expect(selection()).toEqual([1, 2]);
      expect(boxes()).toBe("-a--");
    },
  );

  it.skipIf(isJSDOM)(
    "puts the caret in the first empty box for an empty box pressed",
    async () => {
      await render(() => <Code defaultValue="1" />);

      await press(centerOf(slots()[3]!));
      await afterFlush();

      expect(selection()).toEqual([1, 1]);
      expect(boxes()).toBe("-c--");
    },
  );

  it.skipIf(isJSDOM)(
    "takes a press between two boxes, or on a separator, to the nearest box",
    async () => {
      await render(() => <Code defaultValue="1234" />);
      const first = slots()[0]!.getBoundingClientRect();

      // In the gap, nearer the first box than the second.
      await press({ x: first.right + 5, y: first.top + 20 });
      await afterFlush();
      expect(selection()).toEqual([0, 1]);

      // The separator is as far from the second box as from the third.
      const separator = screen.getByTestId("separator").getBoundingClientRect();
      await press({ x: separator.right + 2, y: separator.top + 20 });
      await afterFlush();
      expect(selection()).toEqual([2, 3]);
    },
  );

  it.skipIf(isJSDOM)(
    "leaves a touch to the browser, which focuses the field, and selects the box on the click",
    async () => {
      await render(() => <Code defaultValue="123" />);

      await tap(centerOf(slots()[0]!));
      await nextTask();
      await afterFlush();

      expect(document.activeElement).toBe(textbox());
      expect(selection()).toEqual([0, 1]);
    },
  );

  it("shows no active box once the Input loses focus", async () => {
    await render(() => <Code defaultValue="12" />);
    textbox().focus();
    await afterFlush();
    expect(boxes()).toBe("--c-");

    textbox().blur();
    await afterFlush();

    expect(boxes()).toBe("----");
  });
});
