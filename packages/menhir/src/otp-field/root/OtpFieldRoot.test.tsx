// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { OtpField } from "../index.ts";
import type { OtpFieldRootProps } from "./OtpFieldRoot.tsx";

const textbox = () => screen.getByRole<HTMLInputElement>("textbox");
const slots = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-testid=slot]"));
const shown = () => slots().map((slot) => slot.textContent);
/**
 * Types into the field once focused, which puts the caret in the first
 * empty box. Not `user.type`, whose click lands on the nearest box.
 */
async function type(
  user: { keyboard(text: string): Promise<void> },
  text: string,
) {
  textbox().focus();
  await user.keyboard(text);
}

/** A field of `length` boxes, labelled "Code". */
function Code(props: Partial<OtpFieldRootProps>) {
  return (
    <>
      <label for="code">Code</label>
      <OtpField.Root id="code" length={4} {...props}>
        <OtpField.Input />
        <OtpField.Slot index={0} data-testid="slot" />
        <OtpField.Slot index={1} data-testid="slot" />
        <OtpField.Slot index={2} data-testid="slot" />
        <OtpField.Slot index={3} data-testid="slot" />
      </OtpField.Root>
    </>
  );
}

describeConformance(
  "<OtpField.Root />",
  (props) => (
    <OtpField.Root length={4} {...props}>
      <OtpField.Input />
    </OtpField.Root>
  ),
  { tagName: "DIV" },
);

describe("<OtpField.Root />", () => {
  const { render } = createRenderer();

  it("renders a <div> around its parts, position: relative", async () => {
    await render(() => <Code data-testid="root" />);
    const root = screen.getByTestId("root");

    expect(root.tagName).toBe("DIV");
    expect(root).toContainElement(textbox());
    expect(root.style.position).toBe("relative");
  });

  describe("uncontrolled", () => {
    it("starts at defaultValue, and calls onValueChange with each new value", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Code defaultValue="12" onValueChange={onValueChange} />
      ));
      expect(textbox()).toHaveValue("12");
      expect(shown()).toEqual(["1", "2", "", ""]);

      await type(user, "34");
      await afterFlush();

      expect(onValueChange.mock.calls).toEqual([["123"], ["1234"]]);
      expect(textbox()).toHaveValue("1234");
      expect(shown()).toEqual(["1", "2", "3", "4"]);
    });

    it("starts empty without defaultValue", async () => {
      await render(() => <Code />);

      expect(textbox()).toHaveValue("");
      expect(shown()).toEqual(["", "", "", ""]);
    });
  });

  describe("controlled", () => {
    it("shows value, and follows the app's changes", async () => {
      const [code, setCode] = createSignal("12");
      await render(() => <Code value={code()} />);
      expect(shown()).toEqual(["1", "2", "", ""]);

      setCode("9876");
      flush();

      expect(textbox()).toHaveValue("9876");
      expect(shown()).toEqual(["9", "8", "7", "6"]);
    });

    it("shows an accepted edit, and undoes a declined one", async () => {
      const [code, setCode] = createSignal("1");
      const { user } = await render(() => (
        <Code
          value={code()}
          onValueChange={(value) => {
            // Takes no 5.
            if (!value.includes("5")) setCode(value);
          }}
        />
      ));

      await type(user, "253");
      await afterFlush();

      expect(code()).toBe("123");
      expect(textbox()).toHaveValue("123");
      expect(shown()).toEqual(["1", "2", "3", ""]);
    });

    it("shows the consumer's text for a changed edit", async () => {
      const [code, setCode] = createSignal("");
      const { user } = await render(() => (
        <Code
          pattern="[a-z]"
          value={code()}
          onValueChange={(value) => setCode(value.replace("b", "x"))}
        />
      ));

      await type(user, "ab");
      await afterFlush();

      expect(textbox()).toHaveValue("ax");
      expect(shown()).toEqual(["a", "x", "", ""]);
    });
  });

  it("changes before async work that onValueChange starts settles", async () => {
    const { user } = await render(() => (
      <Code onValueChange={() => new Promise(() => {})} />
    ));

    await type(user, "1");
    await afterFlush();

    expect(shown()).toEqual(["1", "", "", ""]);
  });

  it("puts id, aria-describedby and aria-invalid on the Input", async () => {
    await render(() => (
      <>
        <p id="hint">From the message</p>
        <Code aria-describedby="hint" aria-invalid="true" data-testid="root" />
      </>
    ));

    expect(screen.getByRole("textbox", { name: "Code" })).toBe(textbox());
    expect(textbox()).toHaveAccessibleDescription("From the message");
    expect(textbox()).toHaveAttribute("aria-invalid", "true");
    const root = screen.getByTestId("root");
    expect(root).not.toHaveAttribute("id");
    expect(root).not.toHaveAttribute("aria-describedby");
    expect(root).not.toHaveAttribute("aria-invalid");
  });

  it("disabled: disables the Input, with data-disabled on every part; follows changes", async () => {
    const [disabled, setDisabled] = createSignal(true);
    await render(() => <Code disabled={disabled()} data-testid="root" />);

    expect(textbox()).toBeDisabled();
    for (const part of [screen.getByTestId("root"), textbox(), ...slots()]) {
      expect(part).toHaveAttribute("data-disabled", "");
    }

    setDisabled(false);
    flush();

    expect(textbox()).toBeEnabled();
    expect(slots()[0]).not.toHaveAttribute("data-disabled");
  });

  it("readOnly: the Input is read-only, with data-readonly on every part", async () => {
    const { user } = await render(() => (
      <Code readOnly defaultValue="12" data-testid="root" />
    ));

    expect(textbox()).toHaveAttribute("readonly");
    for (const part of [screen.getByTestId("root"), textbox(), ...slots()]) {
      expect(part).toHaveAttribute("data-readonly", "");
    }
    await type(user, "3");
    expect(textbox()).toHaveValue("12");
  });

  it("required: the Input is required, with data-required on every part", async () => {
    await render(() => <Code required data-testid="root" />);

    expect(textbox()).toBeRequired();
    for (const part of [screen.getByTestId("root"), textbox(), ...slots()]) {
      expect(part).toHaveAttribute("data-required", "");
    }
  });

  describe("onComplete", () => {
    it("is called once a user's edit fills the last box, with the code, after onValueChange", async () => {
      const calls: string[] = [];
      const { user } = await render(() => (
        <Code
          onValueChange={(value) => calls.push(`change ${value}`)}
          onComplete={(value) => calls.push(`complete ${value}`)}
        />
      ));

      await type(user, "1234");
      await afterFlush();

      expect(calls).toEqual([
        "change 1",
        "change 12",
        "change 123",
        "change 1234",
        "complete 1234",
      ]);
    });

    it("is not called for an app's value", async () => {
      const onComplete = vi.fn();
      const [code, setCode] = createSignal("");
      await render(() => <Code value={code()} onComplete={onComplete} />);

      setCode("1234");
      flush();
      await afterFlush();

      expect(onComplete).not.toHaveBeenCalled();
    });

    it("is not called when a controlled field declines the edit", async () => {
      const onComplete = vi.fn();
      const { user } = await render(() => (
        <Code value="123" onComplete={onComplete} />
      ));

      await type(user, "4");
      await afterFlush();

      expect(textbox()).toHaveValue("123");
      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
