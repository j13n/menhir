// The test list and the cases left out are in ./README.md.
import { describe, expect, it, vi } from "vitest";

import { createSignal, omit, Show, Repeat } from "solid-js";

import {
  afterFlush,
  afterReset,
  createRenderer,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, press } from "../../test/floating/input.ts";

import { OtpField } from "./index.ts";
import type { OtpFieldRootProps } from "./root/OtpFieldRoot.tsx";

const textbox = () => screen.getByRole<HTMLInputElement>("textbox");
const form = () => screen.getByTestId<HTMLFormElement>("form");
const button = (name: string) => screen.getByRole("button", { name });
const submitted = () => [...new FormData(form())];
const shown = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>("[data-testid=slot]"),
    (slot) => slot.textContent,
  ).join("");

/** Four boxes named `code`, labelled "Code". */
function Code(props: Partial<OtpFieldRootProps>) {
  return (
    <OtpField.Root name="code" length={4} {...props}>
      <OtpField.Input aria-label="Code" />
      <Repeat count={4}>
        {(index) => <OtpField.Slot index={index} data-testid="slot" />}
      </Repeat>
    </OtpField.Root>
  );
}

/** The field in a form with a submit and a reset button. */
function CodeForm(
  props: Partial<OtpFieldRootProps> & {
    onSubmit?: () => void;
    onFormReset?: (event: Event) => void;
    buttons?: boolean;
  },
) {
  const rootProps = omit(props, "onSubmit", "onFormReset", "buttons");
  return (
    <form
      data-testid="form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.();
      }}
      onReset={(event) => props.onFormReset?.(event)}
    >
      <Code {...rootProps} />
      <Show when={props.buttons !== false}>
        <button type="submit">Send</button>
        <button type="reset">Reset</button>
      </Show>
    </form>
  );
}

describe("OtpField in a form", () => {
  const { render } = createRenderer();

  /** Types once focused, which puts the caret in the first empty box. */
  async function type(
    user: Awaited<ReturnType<typeof render>>["user"],
    text: string,
  ) {
    textbox().focus();
    await user.keyboard(text);
    await afterFlush();
  }

  it("submits the code under name", async () => {
    const { user } = await render(() => <CodeForm defaultValue="1" />);
    expect(submitted()).toEqual([["code", "1"]]);

    await type(user, "234");

    expect(submitted()).toEqual([["code", "1234"]]);
  });

  it("submits to the form named by form", async () => {
    await render(() => (
      <>
        <form data-testid="form" id="sign-in" />
        <Code form="sign-in" defaultValue="12" />
      </>
    ));

    expect(submitted()).toEqual([["code", "12"]]);
  });

  it("blocks a submission while empty when required, and a code that is not full is a pattern mismatch", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <CodeForm required onSubmit={onSubmit} />
    ));

    await user.click(button("Send"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textbox().validity.valueMissing).toBe(true);

    await type(user, "12");
    await user.click(button("Send"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textbox().validity.patternMismatch).toBe(true);

    await type(user, "34");
    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("submits a form whose only text field it is on Enter", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <CodeForm onSubmit={onSubmit} buttons={false} />
    ));

    await type(user, "1234{Enter}");

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  describe("reset", () => {
    it("goes back to defaultValue, the boxes with it", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CodeForm defaultValue="12" onValueChange={onValueChange} />
      ));
      await type(user, "34");
      onValueChange.mockClear();

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("12");
      expect(textbox()).toHaveValue("12");
      expect(shown()).toBe("12");
      expect(submitted()).toEqual([["code", "12"]]);
    });

    it("calls nothing at its default already", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CodeForm defaultValue="12" onValueChange={onValueChange} />
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).not.toHaveBeenCalled();
      expect(shown()).toBe("12");
    });

    it("asks a controlled field for defaultValue, empty without one; declined, it keeps the value", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CodeForm value="12" onValueChange={onValueChange} />
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("");
      expect(textbox()).toHaveValue("12");
      expect(shown()).toBe("12");
    });

    it("shows a controlled field's default once taken", async () => {
      const [code, setCode] = createSignal("1234");
      const { user } = await render(() => (
        <CodeForm value={code()} defaultValue="9" onValueChange={setCode} />
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(code()).toBe("9");
      expect(textbox()).toHaveValue("9");
      expect(shown()).toBe("9");
    });

    it("calls nothing for a reset the app cancels", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CodeForm
          onValueChange={onValueChange}
          onFormReset={(event) => event.preventDefault()}
        />
      ));
      await type(user, "1");
      onValueChange.mockClear();

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).not.toHaveBeenCalled();
      expect(shown()).toBe("1");
    });

    // A press of the user's, not a script's: the browser runs microtasks as
    // each listener of `reset` returns, before it resets the controls.
    describe.skipIf(isJSDOM)("by a real press", () => {
      const pressReset = () => press(centerOf(button("Reset")));

      it("goes back to defaultValue", async () => {
        const { user } = await render(() => <CodeForm defaultValue="12" />);
        await type(user, "34");

        await pressReset();
        await afterReset();

        expect(textbox()).toHaveValue("12");
        expect(shown()).toBe("12");
        expect(submitted()).toEqual([["code", "12"]]);
      });

      it("keeps value when its consumer declines the reset", async () => {
        await render(() => <CodeForm value="1234" defaultValue="9" />);

        await pressReset();
        await afterReset();

        expect(textbox()).toHaveValue("1234");
        expect(shown()).toBe("1234");
        expect(submitted()).toEqual([["code", "1234"]]);
      });
    });
  });
});
