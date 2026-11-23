// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { keyboard } from "../../../test/floating/input.ts";

import { Input } from "../index.ts";

const textbox = () => screen.getByRole<HTMLInputElement>("textbox");

describeConformance("<Input.Root />", (props) => <Input.Root {...props} />, {
  tagName: "INPUT",
});

describe("<Input.Root />", () => {
  const { render } = createRenderer();

  it("renders an input with the textbox role, and no attribute of its own", async () => {
    await render(() => <Input.Root />);

    expect(textbox().tagName).toBe("INPUT");
    expect(textbox().getAttributeNames()).toEqual([]);
  });

  describe("uncontrolled", () => {
    it("shows defaultValue; each edit shows and calls onValueChange with the text, input-change and the input event", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Input.Root defaultValue="Os" onValueChange={onValueChange} />
      ));
      expect(textbox()).toHaveValue("Os");

      await user.type(textbox(), "lo");

      expect(textbox()).toHaveValue("Oslo");
      expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([
        "Osl",
        "Oslo",
      ]);
      const [, details] = onValueChange.mock.lastCall!;
      expect(details.reason).toBe("input-change");
      expect(details.event).toBeInstanceOf(Event);
      expect(details.event.type).toBe("input");
    });

    it("stays uncontrolled for a wrapper's value={undefined}, showing defaultValue", async () => {
      function Wrapper(props: { value?: string }) {
        return <Input.Root value={props.value} defaultValue="Oslo" />;
      }
      const { user } = await render(() => <Wrapper />);
      expect(textbox()).toHaveValue("Oslo");

      await user.type(textbox(), "!");

      expect(textbox()).toHaveValue("Oslo!");
    });
  });

  describe("controlled", () => {
    it("shows value, and follows the app's changes", async () => {
      const [text, setText] = createSignal("Oslo");
      await render(() => <Input.Root value={text()} />);
      expect(textbox()).toHaveValue("Oslo");

      setText("Bergen");
      flush();

      expect(textbox()).toHaveValue("Bergen");
    });

    it("shows an accepted edit", async () => {
      const [text, setText] = createSignal("Os");
      const { user } = await render(() => (
        <Input.Root value={text()} onValueChange={setText} />
      ));

      await user.type(textbox(), "lo");

      expect(text()).toBe("Oslo");
      expect(textbox()).toHaveValue("Oslo");
    });

    it("undoes a declined edit: the element shows value", async () => {
      const [text, setText] = createSignal("12");
      const { user } = await render(() => (
        <Input.Root
          value={text()}
          onValueChange={(value) => {
            if (/^\d*$/.test(value)) setText(value);
          }}
        />
      ));

      await user.type(textbox(), "3a4");
      await afterFlush();

      expect(text()).toBe("1234");
      expect(textbox()).toHaveValue("1234");
    });

    it("shows the consumer's text for a changed edit", async () => {
      const [text, setText] = createSignal("");
      const { user } = await render(() => (
        <Input.Root
          value={text()}
          onValueChange={(value) => setText(value.toUpperCase())}
        />
      ));

      await user.type(textbox(), "oslo");
      await afterFlush();

      expect(textbox()).toHaveValue("OSLO");
    });

    // Chromium only, with a real key press: a script's write of the same
    // text keeps the caret in a browser, but user-event's interceptor of
    // `value`, installed on focus, moves its selection to the end on any
    // write, so it is removed here.
    it.skipIf(isJSDOM)(
      "keeps the caret where it was after an accepted edit in the middle of the text",
      async () => {
        const [text, setText] = createSignal("Olo");
        await render(() => (
          <Input.Root value={text()} onValueChange={setText} />
        ));
        const element: HTMLInputElement = textbox();
        element.focus();
        for (const name of ["value", "setSelectionRange"]) {
          delete (element as unknown as Record<string, unknown>)[name];
        }
        element.setSelectionRange(1, 1);

        await keyboard("s");
        await afterFlush();

        expect(element).toHaveValue("Oslo");
        expect(element.selectionStart).toBe(2);
      },
    );

    it("does not undo a declined edit while an input method composes, and undoes it once it commits", async () => {
      const [text] = createSignal("");
      const onValueChange = vi.fn();
      await render(() => (
        <Input.Root value={text()} onValueChange={onValueChange} />
      ));

      fireEvent.compositionStart(textbox());
      textbox().value = "に";
      fireEvent.input(textbox(), { isComposing: true });
      await afterFlush();

      expect(onValueChange).toHaveBeenCalledWith("に", expect.anything());
      expect(textbox()).toHaveValue("に");

      textbox().value = "日";
      fireEvent.input(textbox(), { isComposing: true });
      fireEvent.compositionEnd(textbox());
      await afterFlush();

      expect(textbox()).toHaveValue("");
    });
  });

  it("runs the consumer's onInput and onChange, with their events", async () => {
    const onInput = vi.fn();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Input.Root
        onInput={onInput}
        onChange={onChange}
        onValueChange={onValueChange}
      />
    ));

    await user.type(textbox(), "a");
    await user.tab();

    expect(onInput).toHaveBeenCalledOnce();
    expect(onInput.mock.lastCall![0].type).toBe("input");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.lastCall![0].type).toBe("change");
    expect(onValueChange).toHaveBeenCalledWith("a", expect.anything());
  });

  describe("render", () => {
    it("renders a textarea, uncontrolled", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Input.Root
          render={(p) => <textarea {...p} />}
          defaultValue="Line"
          onValueChange={onValueChange}
        />
      ));
      expect(textbox().tagName).toBe("TEXTAREA");
      expect(textbox()).toHaveValue("Line");

      await user.type(textbox(), "s");

      expect(textbox()).toHaveValue("Lines");
      expect(onValueChange).toHaveBeenCalledWith("Lines", expect.anything());
    });

    it("renders a textarea, controlled, and undoes a declined edit", async () => {
      const [text, setText] = createSignal("short");
      const { user } = await render(() => (
        <Input.Root
          render={(p) => <textarea {...p} />}
          value={text()}
          onValueChange={(value) => {
            if (value.length <= 6) setText(value);
          }}
        />
      ));
      expect(textbox()).toHaveValue("short");

      await user.type(textbox(), "er");
      await afterFlush();

      expect(text()).toBe("shorte");
      expect(textbox()).toHaveValue("shorte");
    });
  });
});
