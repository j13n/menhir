// Input in a form, and in a Field. The test list and the cases left out are
// in README.md.
import { describe, expect, it, vi } from "vitest";

import { Show, createSignal, omit } from "solid-js";

import {
  afterFlush,
  afterReset,
  createRenderer,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, press } from "../../test/floating/input.ts";

import { Field } from "../field/index.ts";
import { Input } from "./index.ts";
import type { InputRootProps } from "./root/InputRoot.tsx";

const textbox = () => screen.getByRole<HTMLInputElement>("textbox");
const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => Object.fromEntries(new FormData(form()));
const button = (name: string) => screen.getByRole("button", { name });

/** An Input named `city` in a form with a submit and a reset button. */
function CityForm(
  props: InputRootProps & {
    onSubmit?: () => void;
    onFormReset?: (event: Event) => void;
  },
) {
  const inputProps = omit(props, "onSubmit", "onFormReset");
  return (
    <form
      data-testid="form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.();
      }}
      onReset={(event) => props.onFormReset?.(event)}
    >
      <Input.Root name="city" {...inputProps} />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<Input.Root /> in a form", () => {
  const { render } = createRenderer();

  it("submits its text under its name, uncontrolled", async () => {
    const { user } = await render(() => <CityForm defaultValue="Oslo" />);
    expect(submitted()).toEqual({ city: "Oslo" });

    await user.type(textbox(), "!");

    expect(submitted()).toEqual({ city: "Oslo!" });
  });

  it("submits its text under its name, controlled", async () => {
    const [text, setText] = createSignal("Oslo");
    const { user } = await render(() => (
      <CityForm value={text()} onValueChange={setText} />
    ));
    expect(submitted()).toEqual({ city: "Oslo" });

    await user.type(textbox(), "!");

    expect(submitted()).toEqual({ city: "Oslo!" });
  });

  it("required blocks a submission while empty, and not once any text is typed", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <CityForm required onSubmit={onSubmit} />
    ));

    await user.click(button("Send"));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(textbox(), "B");
    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  describe("reset", () => {
    it("puts an uncontrolled Input back to defaultValue, and calls onValueChange with it and reset", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CityForm defaultValue="Oslo" onValueChange={onValueChange} />
      ));
      await user.type(textbox(), "!");
      onValueChange.mockClear();

      await user.click(button("Reset"));
      await afterReset();

      expect(textbox()).toHaveValue("Oslo");
      expect(onValueChange).toHaveBeenCalledOnce();
      const [value, details] = onValueChange.mock.lastCall!;
      expect(value).toBe("Oslo");
      expect(details.reason).toBe("reset");
      expect(details.event.type).toBe("reset");
    });

    it("calls nothing when the text is its default already", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CityForm defaultValue="Oslo" onValueChange={onValueChange} />
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("asks a controlled Input: taken, the element shows defaultValue", async () => {
      const [text, setText] = createSignal("Oslo");
      const onValueChange = vi.fn(setText);
      const { user } = await render(() => (
        <CityForm
          value={text()}
          defaultValue="Bergen"
          onValueChange={onValueChange}
        />
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).toHaveBeenCalledWith("Bergen", expect.anything());
      expect(text()).toBe("Bergen");
      expect(textbox()).toHaveValue("Bergen");
    });

    it('asks a controlled Input with `""` without a defaultValue', async () => {
      const [text, setText] = createSignal("Oslo");
      const { user } = await render(() => (
        <CityForm value={text()} onValueChange={setText} />
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(text()).toBe("");
      expect(textbox()).toHaveValue("");
    });

    it("keeps a controlled Input's value when its consumer declines the reset", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CityForm
          value="Oslo"
          defaultValue="Bergen"
          onValueChange={onValueChange}
        />
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).toHaveBeenCalledWith("Bergen", expect.anything());
      expect(textbox()).toHaveValue("Oslo");
    });

    it("calls nothing for a reset the app cancels", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <CityForm
          defaultValue="Oslo"
          onValueChange={onValueChange}
          onFormReset={(event) => event.preventDefault()}
        />
      ));
      await user.type(textbox(), "!");
      onValueChange.mockClear();

      await user.click(button("Reset"));
      await afterReset();

      expect(onValueChange).not.toHaveBeenCalled();
      expect(textbox()).toHaveValue("Oslo!");
    });
    it("calls nothing once the reset's own handler has removed it", async () => {
      // As a form whose rows go back to one on a reset.
      const [shown, setShown] = createSignal(true);
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <form data-testid="form" onReset={() => setShown(false)}>
          <Show when={shown()}>
            <Input.Root
              aria-label="Row"
              value="Bergen"
              onValueChange={onValueChange}
            />
          </Show>
          <button type="reset">Reset</button>
        </form>
      ));

      await user.click(button("Reset"));
      await afterReset();

      expect(screen.queryByRole("textbox")).toBeNull();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    // A press of the user's, not a script's: the browser runs microtasks
    // as each listener of `reset` returns, before it resets the controls.
    describe.skipIf(isJSDOM)("by a real press", () => {
      it("takes a reset to defaultValue, which the element then shows", async () => {
        const [text, setText] = createSignal("Oslo");
        await render(() => (
          <CityForm
            value={text()}
            defaultValue="Bergen"
            onValueChange={setText}
          />
        ));

        await press(centerOf(button("Reset")));
        await afterReset();

        expect(text()).toBe("Bergen");
        expect(textbox()).toHaveValue("Bergen");
      });

      it("keeps value when its consumer declines the reset", async () => {
        await render(() => <CityForm value="Oslo" defaultValue="Bergen" />);

        await press(centerOf(button("Reset")));
        await afterReset();

        expect(textbox()).toHaveValue("Oslo");
      });

      it("calls nothing for a reset a later listener cancels", async () => {
        const onValueChange = vi.fn();
        await render(() => (
          <CityForm
            value="Oslo"
            defaultValue="Bergen"
            onValueChange={onValueChange}
          />
        ));
        // Added after the Input's own listener, which is added once it has
        // settled.
        form().addEventListener("reset", (event) => event.preventDefault());

        await press(centerOf(button("Reset")));
        await afterReset();

        expect(onValueChange).not.toHaveBeenCalled();
        expect(textbox()).toHaveValue("Oslo");
      });
    });
  });

  it("calls onValueChange for a value the browser fills in, with an input event", async () => {
    const [text, setText] = createSignal("");
    await render(() => (
      <CityForm
        value={text()}
        onValueChange={setText}
        autocomplete="address-level2"
      />
    ));

    // Autofill sets the value and fires `input`, as an edit does.
    textbox().value = "Tromsø";
    fireEvent.input(textbox());
    await afterFlush();

    expect(text()).toBe("Tromsø");
    expect(submitted()).toEqual({ city: "Tromsø" });
  });
});

describe("<Input.Root /> in a Field", () => {
  const { render } = createRenderer();

  it("joins through Field.Control's render: labelled, named, described, and its error shows once touched", async () => {
    const [text, setText] = createSignal("");
    const { user } = await render(() => (
      <form data-testid="form">
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control
            type="email"
            required
            render={(p) => (
              <Input.Root {...p} value={text()} onValueChange={setText} />
            )}
          />
          <Field.Description>For receipts.</Field.Description>
          <Field.Error data-testid="error" />
        </Field.Root>
        <button type="button">Next</button>
      </form>
    ));
    const control = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Email",
    });
    expect(control).toHaveAttribute("name", "email");
    expect(control).toHaveAttribute("type", "email");
    expect(control).toHaveAccessibleDescription("For receipts.");

    await user.type(control, "ada");
    await user.click(button("Next"));

    expect(text()).toBe("ada");
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("error")).toHaveTextContent(
      control.validationMessage,
    );

    await user.type(control, "@example.com");

    expect(text()).toBe("ada@example.com");
    expect(control).not.toHaveAttribute("aria-invalid");
    expect(submitted()).toEqual({ email: "ada@example.com" });
  });

  it("renders a textarea in a Field, through both renders", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Field.Root name="note">
        <Field.Label>Note</Field.Label>
        <Field.Control
          render={(p) => (
            <Input.Root
              {...p}
              render={(q) => <textarea {...q} />}
              onValueChange={onValueChange}
            />
          )}
        />
      </Field.Root>
    ));
    const control = screen.getByRole("textbox", { name: "Note" });
    expect(control.tagName).toBe("TEXTAREA");
    expect(control).toHaveAttribute("name", "note");

    await user.type(control, "Hi");

    expect(onValueChange).toHaveBeenLastCalledWith("Hi", expect.anything());
  });

  // A press of the user's: the Field clears touched in a task after the
  // reset, as the Input asks. The re-render it makes must not write the
  // bound text over the reset element (`UNCOMMITTED_INPUT_OVERWRITTEN`,
  // which fails the test).
  it.skipIf(isJSDOM)(
    "keeps its text and clears its Field's touched when its consumer declines a reset by a real press",
    async () => {
      const { user } = await render(() => (
        <form data-testid="form">
          <Field.Root name="email">
            <Field.Label>Email</Field.Label>
            <Field.Control
              type="email"
              render={(p) => <Input.Root {...p} value="nope" defaultValue="" />}
            />
          </Field.Root>
          <button type="submit">Send</button>
          <button type="reset">Reset</button>
        </form>
      ));
      const control = screen.getByRole("textbox", { name: "Email" });
      await user.click(button("Send"));
      expect(control).toHaveAttribute("data-touched", "");

      await press(centerOf(button("Reset")));
      await afterReset();

      expect(control).toHaveValue("nope");
      expect(control).not.toHaveAttribute("data-touched");
      expect(submitted()).toEqual({ email: "nope" });
    },
  );
});
