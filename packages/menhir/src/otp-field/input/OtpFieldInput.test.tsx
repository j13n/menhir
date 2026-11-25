// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { createSignal, flush, Repeat } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { OtpField } from "../index.ts";
import type { OtpFieldRootProps } from "../root/OtpFieldRoot.tsx";

const textbox = () => screen.getByRole<HTMLInputElement>("textbox");
const shown = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>("[data-testid=slot]"),
    (slot) => slot.textContent,
  ).join("");
const selection = () => [textbox().selectionStart, textbox().selectionEnd];

interface User {
  keyboard(text: string): Promise<void>;
  paste(text: string): Promise<void>;
}

/** Types once focused, which puts the caret in the first empty box. */
async function type(user: User, text: string) {
  textbox().focus();
  await user.keyboard(text);
  await afterFlush();
}

/** A field of six boxes, labelled "Code". */
function Code(props: Partial<OtpFieldRootProps>) {
  return (
    <>
      <label for="code">Code</label>
      <OtpField.Root id="code" length={6} {...props}>
        <OtpField.Input />
        <Repeat count={6}>
          {(index) => <OtpField.Slot index={index} data-testid="slot" />}
        </Repeat>
      </OtpField.Root>
    </>
  );
}

describeConformance(
  "<OtpField.Input />",
  (props) => (
    <OtpField.Root length={4}>
      <OtpField.Input {...props} />
    </OtpField.Root>
  ),
  { tagName: "INPUT" },
);

describe("<OtpField.Input />", () => {
  const { render } = createRenderer();

  it("renders an <input type=text> with the textbox role and autocomplete=one-time-code, invisible over the Root", async () => {
    await render(() => <Code />);

    expect(textbox().tagName).toBe("INPUT");
    expect(textbox()).toHaveAttribute("type", "text");
    expect(textbox()).toHaveAttribute("autocomplete", "one-time-code");
    expect(textbox().style.position).toBe("absolute");
    expect(textbox().style.opacity).toBe("0");
    expect(textbox().style.zIndex).toBe("1");
  });

  it("takes the consumer's autocomplete and style over its own", async () => {
    await render(() => (
      <OtpField.Root length={4}>
        <OtpField.Input autocomplete="off" style={{ opacity: "0.5" }} />
      </OtpField.Root>
    ));

    expect(textbox()).toHaveAttribute("autocomplete", "off");
    expect(textbox().style.opacity).toBe("0.5");
    expect(textbox().style.position).toBe("absolute");
  });

  it("has inputmode numeric for digits and text for a pattern with letters, unless set", async () => {
    const [pattern, setPattern] = createSignal<string>();
    await render(() => <Code pattern={pattern()} />);
    expect(textbox()).toHaveAttribute("inputmode", "numeric");

    setPattern("[0-9A-Z]");
    flush();
    expect(textbox()).toHaveAttribute("inputmode", "text");

    setPattern("[a-f0-9]");
    flush();
    expect(textbox()).toHaveAttribute("inputmode", "text");

    setPattern("\\d");
    flush();
    expect(textbox()).toHaveAttribute("inputmode", "numeric");
  });

  it("takes the consumer's inputmode", async () => {
    await render(() => (
      <OtpField.Root length={6}>
        <OtpField.Input inputmode="text" />
      </OtpField.Root>
    ));

    expect(textbox()).toHaveAttribute("inputmode", "text");
  });

  it("has the code's pattern attribute, which the browser checks", async () => {
    await render(() => <Code pattern="[0-9A-Z]" />);

    expect(textbox()).toHaveAttribute("pattern", "(?:[0-9A-Z]){6}");
    textbox().value = "AB12";
    expect(textbox().validity.patternMismatch).toBe(true);
    textbox().value = "AB12CD";
    expect(textbox().validity.patternMismatch).toBe(false);
  });

  it("is named by a <label for> the Root's id", async () => {
    await render(() => <Code />);

    expect(screen.getByRole("textbox", { name: "Code" })).toBe(textbox());
  });

  it("shows each character typed in its Slot", async () => {
    const { user } = await render(() => <Code />);

    await type(user, "123");

    expect(textbox()).toHaveValue("123");
    expect(shown()).toBe("123");
    expect(selection()).toEqual([3, 3]);
  });

  describe("allowed characters", () => {
    it("declines a typed character the pattern refuses", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Code onValueChange={onValueChange} />
      ));

      await type(user, "1a-2");

      expect(textbox()).toHaveValue("12");
      expect(shown()).toBe("12");
      expect(onValueChange.mock.calls).toEqual([["1"], ["12"]]);
    });

    it("keeps a selected character when a refused one is typed over it", async () => {
      const { user } = await render(() => <Code defaultValue="123" />);
      textbox().focus();
      textbox().setSelectionRange(1, 2);

      await user.keyboard("x");
      await afterFlush();

      expect(textbox()).toHaveValue("123");
      expect(selection()).toEqual([1, 2]);
    });

    it("takes a refused letter in the other case", async () => {
      const { user } = await render(() => <Code pattern="[0-9A-Z]" />);

      await type(user, "ab1C");

      expect(textbox()).toHaveValue("AB1C");
      expect(shown()).toBe("AB1C");
      expect(selection()).toEqual([4, 4]);
    });

    it("takes letters and digits with a pattern of both", async () => {
      const { user } = await render(() => <Code pattern="[0-9A-Za-z]" />);

      await type(user, "aB3-x");

      expect(textbox()).toHaveValue("aB3x");
    });
  });

  it("changes nothing for typing past length", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Code defaultValue="123456" onValueChange={onValueChange} />
    ));
    textbox().focus();
    textbox().setSelectionRange(6, 6);

    await user.keyboard("7");
    await afterFlush();

    expect(textbox()).toHaveValue("123456");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe("paste", () => {
    it("keeps only the characters the pattern takes, so spaces and hyphens go", async () => {
      const { user } = await render(() => <Code />);
      textbox().focus();

      await user.paste("12 3-");
      await afterFlush();

      expect(textbox()).toHaveValue("123");
      expect(shown()).toBe("123");
      expect(selection()).toEqual([3, 3]);
    });

    it("replaces the value with a whole code wherever the caret was, and calls onComplete", async () => {
      const onComplete = vi.fn();
      const { user } = await render(() => (
        <Code defaultValue="12" onComplete={onComplete} />
      ));
      textbox().focus();

      await user.paste("Your code: 987-654");
      await afterFlush();

      expect(textbox()).toHaveValue("987654");
      expect(shown()).toBe("987654");
      expect(onComplete).toHaveBeenCalledExactlyOnceWith("987654");
    });

    it("cuts more than length characters at the caret, not a whole code, to length", async () => {
      const { user } = await render(() => <Code defaultValue="1234" />);
      textbox().focus();

      await user.paste("567");
      await afterFlush();

      expect(textbox()).toHaveValue("123456");
    });
  });

  it("takes a value the browser fills in with an input event, and calls onComplete", async () => {
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    await render(() => (
      <Code onValueChange={onValueChange} onComplete={onComplete} />
    ));

    fireEvent.input(textbox(), { target: { value: "482 913" } });
    await afterFlush();

    expect(textbox()).toHaveValue("482913");
    expect(shown()).toBe("482913");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("482913");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("482913");
  });

  describe("deletion", () => {
    it("Backspace deletes the character before the caret; a second the one before it", async () => {
      const { user } = await render(() => <Code defaultValue="123" />);

      await type(user, "{Backspace}");
      expect(textbox()).toHaveValue("12");
      expect(selection()).toEqual([2, 2]);

      await user.keyboard("{Backspace}");
      await afterFlush();
      expect(textbox()).toHaveValue("1");
      expect(shown()).toBe("1");
    });

    it("Backspace deletes the selected character, and those after it move back; the caret stays", async () => {
      const { user } = await render(() => <Code defaultValue="12345" />);
      textbox().focus();
      textbox().setSelectionRange(2, 3);

      await user.keyboard("{Backspace}");
      await afterFlush();
      expect(textbox()).toHaveValue("1245");
      expect(selection()).toEqual([2, 2]);

      await user.keyboard("{Backspace}");
      await afterFlush();
      expect(textbox()).toHaveValue("145");
      expect(selection()).toEqual([1, 1]);
    });

    it("Delete deletes the character after the caret", async () => {
      const { user } = await render(() => <Code defaultValue="12345" />);
      textbox().focus();
      textbox().setSelectionRange(1, 1);

      await user.keyboard("{Delete}");
      await afterFlush();

      expect(textbox()).toHaveValue("1345");
      expect(selection()).toEqual([1, 1]);
    });
  });

  it("types over the selected character inside the code, and selects the next", async () => {
    const { user } = await render(() => <Code defaultValue="123456" />);
    textbox().focus();
    textbox().setSelectionRange(2, 3);

    await user.keyboard("9");
    await afterFlush();
    expect(textbox()).toHaveValue("129456");
    expect(selection()).toEqual([3, 4]);

    await user.keyboard("8");
    await afterFlush();
    expect(textbox()).toHaveValue("129856");
    expect(selection()).toEqual([4, 5]);
  });

  it("types over the character after a caret the browser placed inside a full code", async () => {
    const { user } = await render(() => <Code defaultValue="123456" />);
    textbox().focus();
    // As Up, or a screen reader, puts it.
    textbox().setSelectionRange(0, 0);

    await user.keyboard("9");
    await afterFlush();

    expect(textbox()).toHaveValue("923456");
    expect(selection()).toEqual([1, 2]);
  });

  it("follows an input method's text without writing the element until it commits", async () => {
    await render(() => <Code pattern="[A-Z]" />);
    const input = textbox();
    input.focus();

    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: "ab" }, isComposing: true });
    await afterFlush();
    expect(shown()).toBe("AB");
    expect(input).toHaveValue("ab");

    fireEvent.compositionEnd(input);
    await afterFlush();
    expect(input).toHaveValue("AB");
    expect(selection()).toEqual([2, 2]);
  });

  it("keeps the typed text when another attribute of the Input changes", async () => {
    const [invalid, setInvalid] = createSignal(false);
    const { user } = await render(() => (
      <Code aria-invalid={invalid() ? "true" : undefined} />
    ));

    await type(user, "12");
    setInvalid(true);
    flush();

    expect(textbox()).toHaveValue("12");
    expect(textbox()).toHaveAttribute("aria-invalid", "true");
  });

  it("runs the consumer's onInput, onKeyDown and onFocus", async () => {
    const onInput = vi.fn();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const { user } = await render(() => (
      <OtpField.Root length={4}>
        <OtpField.Input
          onInput={onInput}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        />
      </OtpField.Root>
    ));

    await type(user, "1");

    expect(onFocus).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onInput).toHaveBeenCalledOnce();
  });
});
