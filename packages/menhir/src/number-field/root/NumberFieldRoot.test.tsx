// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Show, createSignal, flush, omit } from "solid-js";

import {
  afterFlush,
  afterReset,
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, press } from "../../../test/floating/input.ts";

import { NumberField } from "../index.ts";
import type { NumberFieldRootProps } from "./NumberFieldRoot.tsx";

const spinbutton = () => screen.getByRole<HTMLInputElement>("spinbutton");
const hidden = () =>
  document.querySelector<HTMLInputElement>('input[type="number"]')!;
const button = (name: string) => screen.getByRole("button", { name });
const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => [...new FormData(form())];

describeConformance(
  "<NumberField.Root />",
  (props) => <NumberField.Root {...props} />,
  { tagName: "DIV" },
);

/** Every part, so the tests can check each. */
function Field(props: NumberFieldRootProps) {
  return (
    <NumberField.Root data-testid="root" locale="en-US" {...props}>
      <NumberField.Decrement aria-label="Decrease" />
      <NumberField.Input />
      <NumberField.Increment aria-label="Increase" />
    </NumberField.Root>
  );
}

const parts = () => [
  screen.getByTestId("root"),
  spinbutton(),
  button("Decrease"),
  button("Increase"),
];

/** A field named `quantity` in a form with a submit and a reset button. */
function QuantityForm(
  props: NumberFieldRootProps & {
    onSubmit?: () => void;
    onFormReset?: (event: Event) => void;
  },
) {
  const rootProps = omit(props, "onSubmit", "onFormReset");
  return (
    <form
      data-testid="form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.();
      }}
      onReset={(event) => props.onFormReset?.(event)}
    >
      <Field name="quantity" {...rootProps} />
      <button type="button">Next</button>
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<NumberField.Root />", () => {
  const { render } = createRenderer();

  /** Types `text` over the Input's text, then leaves it, which commits. */
  async function typeAndLeave(
    user: Awaited<ReturnType<typeof render>>["user"],
    text: string,
  ) {
    await user.clear(spinbutton());
    if (text) await user.type(spinbutton(), text);
    await user.click(button("Next"));
    await afterFlush();
  }

  it("renders a div around its parts, then a visually hidden number input, hidden from assistive technology and the tab order", async () => {
    await render(() => <Field />);

    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("DIV");
    expect(root).toContainElement(spinbutton());
    expect(root.nextElementSibling).toBe(hidden());
    expect(hidden()).toHaveAttribute("aria-hidden", "true");
    expect(hidden()).toHaveAttribute("tabindex", "-1");
    expect(hidden().style.position).toBe("absolute");
  });

  describe("uncontrolled", () => {
    it("starts at defaultValue, empty without one, and calls onValueChange with each new value", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <>
          <Field defaultValue={3} onValueChange={onValueChange} />
          <NumberField.Root>
            <NumberField.Input aria-label="Empty" />
          </NumberField.Root>
        </>
      ));
      expect(screen.getByRole("spinbutton", { name: "Empty" })).toHaveValue("");
      const field = screen.getByRole("spinbutton", { name: "" });
      expect(field).toHaveValue("3");

      await user.click(button("Increase"));
      await afterFlush();
      await user.click(button("Increase"));
      await afterFlush();

      expect(field).toHaveValue("5");
      expect(onValueChange.mock.calls).toEqual([[4], [5]]);
    });
  });

  describe("controlled", () => {
    it("shows value, follows the app's changes, and shows null as empty", async () => {
      const [value, setValue] = createSignal<number | null>(3);
      await render(() => <Field value={value()} />);
      expect(spinbutton()).toHaveValue("3");

      setValue(4000);
      flush();
      expect(spinbutton()).toHaveValue("4,000");
      expect(hidden().value).toBe("4000");

      setValue(null);
      flush();
      expect(spinbutton()).toHaveValue("");
      expect(hidden().value).toBe("");
    });

    it("asks with the requested value, and stays put when declined", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field value={3} onValueChange={onValueChange} />
      ));

      await user.click(button("Increase"));
      await afterFlush();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(4);
      expect(spinbutton()).toHaveValue("3");
      expect(spinbutton()).toHaveAttribute("aria-valuenow", "3");
      expect(hidden().value).toBe("3");
    });
  });

  it("changes before async work that onValueChange starts settles", async () => {
    const { user } = await render(() => (
      <Field
        defaultValue={1}
        onValueChange={() => {
          void new Promise(() => {});
        }}
      />
    ));

    await user.click(button("Increase"));
    await afterFlush();

    expect(spinbutton()).toHaveValue("2");
  });

  it("shows an app's value outside min and max as it is", async () => {
    await render(() => <Field value={50} min={0} max={10} />);

    expect(spinbutton()).toHaveValue("50");
    expect(spinbutton()).toHaveAttribute("aria-valuenow", "50");
  });

  it("puts its id, aria-describedby and aria-invalid on the Input, else a generated id", async () => {
    await render(() => (
      <>
        <NumberField.Root
          data-testid="root"
          id="quantity"
          aria-describedby="hint"
          aria-invalid="true"
        >
          <NumberField.Input aria-label="Own" />
        </NumberField.Root>
        <NumberField.Root>
          <NumberField.Input aria-label="Generated" />
        </NumberField.Root>
      </>
    ));
    const own = screen.getByRole("spinbutton", { name: "Own" });

    expect(own).toHaveAttribute("id", "quantity");
    expect(own).toHaveAttribute("aria-describedby", "hint");
    expect(own).toHaveAttribute("aria-invalid", "true");
    const root = screen.getByTestId("root");
    expect(root).not.toHaveAttribute("id");
    expect(root).not.toHaveAttribute("aria-describedby");
    expect(root).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("spinbutton", { name: "Generated" }).id).toMatch(
      /.+/,
    );
  });

  it("disabled: disables the Input, the buttons and the hidden input, with data-disabled on every part, and follows changes", async () => {
    const [disabled, setDisabled] = createSignal(true);
    await render(() => <Field defaultValue={1} disabled={disabled()} />);

    for (const part of parts()) expect(part).toHaveAttribute("data-disabled");
    expect(spinbutton()).toBeDisabled();
    expect(button("Increase")).toBeDisabled();
    expect(button("Decrease")).toBeDisabled();
    expect(hidden()).toBeDisabled();

    setDisabled(false);
    flush();

    for (const part of parts())
      expect(part).not.toHaveAttribute("data-disabled");
    expect(spinbutton()).toBeEnabled();
    expect(hidden()).toBeEnabled();
  });

  it("readOnly: the Input is read-only, and the keys and buttons change nothing, with data-readonly on every part", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Field defaultValue={1} readOnly onValueChange={onValueChange} />
    ));

    for (const part of parts()) expect(part).toHaveAttribute("data-readonly");
    expect(spinbutton()).toHaveAttribute("readonly");
    expect(hidden()).toHaveAttribute("readonly");

    await user.type(spinbutton(), "5{ArrowUp}");
    await user.click(button("Increase"));
    await afterFlush();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(spinbutton()).toHaveValue("1");
  });

  it("required: aria-required on the Input, required on the hidden input, data-required on every part", async () => {
    await render(() => <Field required />);

    expect(spinbutton()).toHaveAttribute("aria-required", "true");
    expect(spinbutton()).not.toHaveAttribute("required");
    expect(hidden()).toBeRequired();
    for (const part of parts()) expect(part).toHaveAttribute("data-required");
  });

  describe("form", () => {
    it("submits the plain number under name, and an empty string while empty", async () => {
      const { user } = await render(() => (
        <QuantityForm
          defaultValue={1234.5}
          format={{ style: "currency", currency: "EUR" }}
          locale="de-DE"
        />
      ));
      expect(submitted()).toEqual([["quantity", "1234.5"]]);

      await typeAndLeave(user, "");

      expect(submitted()).toEqual([["quantity", ""]]);
    });

    it("submits to the form named by form", async () => {
      await render(() => (
        <>
          <form data-testid="form" id="order" />
          <Field name="quantity" form="order" defaultValue={2} />
        </>
      ));

      expect(submitted()).toEqual([["quantity", "2"]]);
    });

    it("fires native input and change events on the hidden input for a user's change, which the form sees with the new number", async () => {
      const seen: [string, string][] = [];
      const { user } = await render(() => <QuantityForm defaultValue={1} />);
      for (const type of ["input", "change"]) {
        form().addEventListener(type, (event) => {
          if (event.target === hidden())
            seen.push([type, new FormData(form()).get("quantity") as string]);
        });
      }

      await user.click(button("Increase"));
      await typeAndLeave(user, "7");

      expect(seen).toEqual([
        ["input", "2"],
        ["change", "2"],
        ["input", "7"],
        ["change", "7"],
      ]);
    });

    it("puts the hidden input back when a controlled field declines a change", async () => {
      const { user } = await render(() => <QuantityForm value={1} />);

      await user.click(button("Increase"));
      await afterFlush();

      expect(submitted()).toEqual([["quantity", "1"]]);
    });

    it("required blocks a submission while empty, and not once a number is typed", async () => {
      const onSubmit = vi.fn();
      const { user } = await render(() => (
        <QuantityForm required onSubmit={onSubmit} />
      ));

      await user.click(button("Send"));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(hidden().validity.valueMissing).toBe(true);

      await typeAndLeave(user, "3");
      await user.click(button("Send"));
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    it("gives the hidden input min, max and step, so the browser reports a value out of range or off the grid", async () => {
      const [value, setValue] = createSignal<number | null>(0);
      await render(() => (
        <QuantityForm value={value()} min={1} max={10} step={2} />
      ));
      expect(hidden()).toHaveAttribute("min", "1");
      expect(hidden()).toHaveAttribute("max", "10");
      expect(hidden()).toHaveAttribute("step", "2");
      expect(hidden().validity.rangeUnderflow).toBe(true);

      setValue(11);
      flush();
      expect(hidden().validity.rangeOverflow).toBe(true);

      setValue(4);
      flush();
      expect(hidden().validity.stepMismatch).toBe(true);

      setValue(5);
      flush();
      expect(hidden().validity.valid).toBe(true);
    });

    it("reports no step mismatch for a typed decimal without step, as a currency takes", async () => {
      const onSubmit = vi.fn();
      const { user } = await render(() => (
        <QuantityForm
          format={{ style: "currency", currency: "EUR" }}
          onSubmit={onSubmit}
        />
      ));
      expect(hidden()).toHaveAttribute("step", "any");

      await typeAndLeave(user, "12.5");
      await user.click(button("Send"));

      expect(hidden().validity.valid).toBe(true);
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    // jsdom does not focus the invalid control.
    it.skipIf(isJSDOM)(
      "moves focus to the Input when the browser blocks the submission",
      async () => {
        const { user } = await render(() => <QuantityForm required />);

        await user.click(button("Send"));

        expect(spinbutton()).toHaveFocus();
      },
    );

    describe("reset", () => {
      it("goes back to defaultValue, the text and the hidden input with it", async () => {
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <QuantityForm defaultValue={1000} onValueChange={onValueChange} />
        ));
        await typeAndLeave(user, "5");
        onValueChange.mockClear();

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1000);
        expect(spinbutton()).toHaveValue("1,000");
        expect(submitted()).toEqual([["quantity", "1000"]]);
      });

      it("calls nothing at its default already, and still shows it", async () => {
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <QuantityForm defaultValue={1000} onValueChange={onValueChange} />
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).not.toHaveBeenCalled();
        expect(spinbutton()).toHaveValue("1,000");
        expect(submitted()).toEqual([["quantity", "1000"]]);
      });

      it("asks a controlled field for defaultValue, null without one; declined, the text keeps the value", async () => {
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <QuantityForm value={5} onValueChange={onValueChange} />
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null);
        expect(spinbutton()).toHaveValue("5");
        expect(submitted()).toEqual([["quantity", "5"]]);
      });

      it("shows a controlled field's default once taken", async () => {
        const [value, setValue] = createSignal<number | null>(5);
        const { user } = await render(() => (
          <QuantityForm
            value={value()}
            defaultValue={2}
            onValueChange={setValue}
          />
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(value()).toBe(2);
        expect(spinbutton()).toHaveValue("2");
      });

      it("calls nothing for a reset the app cancels", async () => {
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <QuantityForm
            defaultValue={1}
            onValueChange={onValueChange}
            onFormReset={(event) => event.preventDefault()}
          />
        ));
        await user.click(button("Increase"));
        await afterFlush();
        onValueChange.mockClear();

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).not.toHaveBeenCalled();
        expect(spinbutton()).toHaveValue("2");
      });

      it("calls nothing once the reset's own handler has removed it", async () => {
        const [shown, setShown] = createSignal(true);
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <form data-testid="form" onReset={() => setShown(false)}>
            <Show when={shown()}>
              <NumberField.Root value={3} onValueChange={onValueChange}>
                <NumberField.Input aria-label="Row" />
              </NumberField.Root>
            </Show>
            <button type="reset">Reset</button>
          </form>
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(screen.queryByRole("spinbutton")).toBeNull();
        expect(onValueChange).not.toHaveBeenCalled();
      });

      // A press of the user's, not a script's: the browser runs microtasks
      // as each listener of `reset` returns, before it resets the controls.
      describe.skipIf(isJSDOM)("by a real press", () => {
        const pressReset = () => press(centerOf(button("Reset")));

        it("goes back to defaultValue, the text and the hidden input with it", async () => {
          const { user } = await render(() => (
            <QuantityForm defaultValue={1000} />
          ));
          await typeAndLeave(user, "5");

          await pressReset();
          await afterReset();

          expect(spinbutton()).toHaveValue("1,000");
          expect(submitted()).toEqual([["quantity", "1000"]]);
        });

        it("keeps value when its consumer declines the reset", async () => {
          await render(() => <QuantityForm value={5} defaultValue={2} />);

          await pressReset();
          await afterReset();

          expect(spinbutton()).toHaveValue("5");
          expect(submitted()).toEqual([["quantity", "5"]]);
        });

        it("calls nothing for a reset a later listener cancels", async () => {
          const onValueChange = vi.fn();
          await render(() => (
            <QuantityForm
              value={5}
              defaultValue={2}
              onValueChange={onValueChange}
            />
          ));
          // Added after the field's own listener, which is added once it
          // has settled.
          form().addEventListener("reset", (event) => event.preventDefault());

          await pressReset();
          await afterReset();

          expect(onValueChange).not.toHaveBeenCalled();
          expect(spinbutton()).toHaveValue("5");
          expect(submitted()).toEqual([["quantity", "5"]]);
        });
      });
    });
  });
});
