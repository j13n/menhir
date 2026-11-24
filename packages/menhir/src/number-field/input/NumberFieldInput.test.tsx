// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { NumberField } from "../index.ts";
import type { NumberFieldRootProps } from "../root/NumberFieldRoot.tsx";

const spinbutton = () => screen.getByRole<HTMLInputElement>("spinbutton");

describeConformance(
  "<NumberField.Input />",
  (props) => (
    <NumberField.Root>
      <NumberField.Input {...props} />
    </NumberField.Root>
  ),
  { tagName: "INPUT" },
);

/** A Number Field with an Input only, and a button to move focus to. */
function Field(props: NumberFieldRootProps) {
  return (
    <>
      <NumberField.Root {...props}>
        <NumberField.Input />
      </NumberField.Root>
      <button type="button">Next</button>
    </>
  );
}

describe("<NumberField.Input />", () => {
  const { render } = createRenderer();

  /**
   * Types `text` over the Input's text, then moves focus away, which
   * commits it.
   */
  async function typeAndLeave(
    user: Awaited<ReturnType<typeof render>>["user"],
    text: string,
  ) {
    await user.clear(spinbutton());
    if (text) await user.type(spinbutton(), text);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await afterFlush();
  }

  it("renders an input of type text with role spinbutton, inputmode decimal and autocomplete off", async () => {
    await render(() => <Field />);

    expect(spinbutton().tagName).toBe("INPUT");
    expect(spinbutton()).toHaveAttribute("type", "text");
    expect(spinbutton()).toHaveAttribute("inputmode", "decimal");
    expect(spinbutton()).toHaveAttribute("autocomplete", "off");
  });

  it("takes the consumer's inputmode and autocomplete", async () => {
    await render(() => (
      <NumberField.Root>
        <NumberField.Input inputmode="numeric" autocomplete="on" />
      </NumberField.Root>
    ));

    expect(spinbutton()).toHaveAttribute("inputmode", "numeric");
    expect(spinbutton()).toHaveAttribute("autocomplete", "on");
  });

  it("has aria-valuenow, the value, absent while empty", async () => {
    const [value, setValue] = createSignal<number | null>(3.5);
    await render(() => <Field value={value()} />);
    expect(spinbutton()).toHaveAttribute("aria-valuenow", "3.5");

    setValue(null);
    flush();

    expect(spinbutton()).not.toHaveAttribute("aria-valuenow");
    expect(spinbutton()).not.toHaveAttribute("aria-valuetext");
  });

  it("has aria-valuemin and aria-valuemax when min and max are set, and not otherwise", async () => {
    const [min, setMin] = createSignal<number | undefined>(1);
    await render(() => <Field min={min()} max={10} />);
    expect(spinbutton()).toHaveAttribute("aria-valuemin", "1");
    expect(spinbutton()).toHaveAttribute("aria-valuemax", "10");

    setMin(undefined);
    flush();

    expect(spinbutton()).not.toHaveAttribute("aria-valuemin");
  });

  it("has aria-valuetext, the formatted text", async () => {
    await render(() => (
      <Field defaultValue={0.25} format={{ style: "percent" }} locale="en-US" />
    ));

    expect(spinbutton()).toHaveAttribute("aria-valuetext", "25%");
    expect(spinbutton()).toHaveAttribute("aria-valuenow", "0.25");
  });

  it("is named by a label for the Root's id, and by aria-label", async () => {
    await render(() => (
      <>
        <label for="quantity">Quantity</label>
        <NumberField.Root id="quantity">
          <NumberField.Input />
        </NumberField.Root>
        <NumberField.Root>
          <NumberField.Input aria-label="Guests" />
        </NumberField.Root>
      </>
    ));

    expect(
      screen.getByRole("spinbutton", { name: "Quantity" }),
    ).toHaveAttribute("id", "quantity");
    expect(screen.getByRole("spinbutton", { name: "Guests" })).toBeVisible();
  });

  describe("formatting", () => {
    it("groups by default", async () => {
      await render(() => <Field defaultValue={1234.5} locale="en-US" />);

      expect(spinbutton()).toHaveValue("1,234.5");
    });

    it("formats with format's options, in locale's language and digits", async () => {
      await render(() => (
        <>
          <NumberField.Root
            defaultValue={1234.5}
            format={{ style: "currency", currency: "EUR" }}
            locale="de-DE"
          >
            <NumberField.Input aria-label="Price" />
          </NumberField.Root>
          <NumberField.Root defaultValue={1234} locale="ar-EG">
            <NumberField.Input aria-label="Count" />
          </NumberField.Root>
        </>
      ));

      expect(screen.getByRole("spinbutton", { name: "Price" })).toHaveValue(
        "1.234,50\u00a0€",
      );
      expect(screen.getByRole("spinbutton", { name: "Count" })).toHaveValue(
        "١٬٢٣٤",
      );
    });

    it("follows format and locale changing while rendered", async () => {
      const [locale, setLocale] = createSignal("en-US");
      const [format, setFormat] = createSignal<Intl.NumberFormatOptions>({});
      await render(() => (
        <Field defaultValue={1234.5} locale={locale()} format={format()} />
      ));

      setLocale("de-DE");
      flush();
      expect(spinbutton()).toHaveValue("1.234,5");

      setFormat({ minimumFractionDigits: 2 });
      flush();
      expect(spinbutton()).toHaveValue("1.234,50");
    });
  });

  describe("committing", () => {
    it("keeps the text as typed, and the value, until a commit", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field defaultValue={1} onValueChange={onValueChange} />
      ));

      await user.type(spinbutton(), "2.");

      expect(spinbutton()).toHaveValue("12.");
      expect(spinbutton()).toHaveAttribute("aria-valuenow", "1");
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("keeps the typed text when another attribute of the Input changes", async () => {
      const [label, setLabel] = createSignal("Guests");
      const { user } = await render(() => (
        <NumberField.Root defaultValue={1}>
          <NumberField.Input aria-label={label()} />
        </NumberField.Root>
      ));

      await user.type(spinbutton(), "2");
      setLabel("Adults");
      flush();

      expect(spinbutton()).toHaveValue("12");
    });

    it("commits on blur: the typed number is the value, and the text its formatted form", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field locale="en-US" onValueChange={onValueChange} />
      ));

      await typeAndLeave(user, "1234.5");

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1234.5);
      expect(spinbutton()).toHaveValue("1,234.5");
      expect(spinbutton()).toHaveAttribute("aria-valuenow", "1234.5");
    });

    it("commits on Enter, and a form submits the committed number", async () => {
      let submitted: unknown;
      const { user } = await render(() => (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitted = new FormData(event.currentTarget).get("quantity");
          }}
        >
          <NumberField.Root name="quantity" locale="en-US">
            <NumberField.Input />
          </NumberField.Root>
          {/* The hidden number input is a second field, which blocks a
              submission by Enter without a submit button, as in a browser. */}
          <button type="submit">Send</button>
        </form>
      ));

      await user.type(spinbutton(), "1500{Enter}");

      expect(submitted).toBe("1500");
      await afterFlush();
      expect(spinbutton()).toHaveValue("1,500");
    });

    it("commits nothing on Enter while an input method composes", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field onValueChange={onValueChange} />
      ));
      await user.type(spinbutton(), "5");

      fireEvent.keyDown(spinbutton(), { key: "Enter", isComposing: true });
      await afterFlush();

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("sets null for empty text", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field defaultValue={5} onValueChange={onValueChange} />
      ));

      await typeAndLeave(user, "");

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null);
      expect(spinbutton()).toHaveValue("");
      expect(spinbutton()).not.toHaveAttribute("aria-valuenow");
    });

    it("keeps the value for text that is not a number, and shows its text again", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field defaultValue={5} onValueChange={onValueChange} />
      ));

      await typeAndLeave(user, "12abc");

      expect(onValueChange).not.toHaveBeenCalled();
      expect(spinbutton()).toHaveValue("5");
    });

    it("clamps to min and max", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field min={1} max={10} onValueChange={onValueChange} />
      ));

      await typeAndLeave(user, "50");
      expect(spinbutton()).toHaveValue("10");

      await typeAndLeave(user, "-3");
      expect(spinbutton()).toHaveValue("1");
      expect(onValueChange.mock.calls).toEqual([[10], [1]]);
    });

    it("rounds to the digits the format shows", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field
          format={{ maximumFractionDigits: 2 }}
          locale="en-US"
          onValueChange={onValueChange}
        />
      ));

      await typeAndLeave(user, "3.14159");

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(3.14);
      expect(spinbutton()).toHaveValue("3.14");
    });

    it("keeps a number off the step grid", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field step={5} onValueChange={onValueChange} />
      ));

      await typeAndLeave(user, "12");

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(12);
    });

    it("keeps an app's value with more digits than the format shows on a blur with no edit", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field
          defaultValue={1.23456}
          locale="en-US"
          onValueChange={onValueChange}
        />
      ));
      expect(spinbutton()).toHaveValue("1.235");

      await user.click(spinbutton());
      await user.click(screen.getByRole("button", { name: "Next" }));
      await afterFlush();

      expect(onValueChange).not.toHaveBeenCalled();
      expect(spinbutton()).toHaveAttribute("aria-valuenow", "1.23456");
    });

    it("shows the value's text again when a controlled field declines a commit", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Field value={5} locale="en-US" onValueChange={onValueChange} />
      ));

      await typeAndLeave(user, "1000");

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1000);
      expect(spinbutton()).toHaveValue("5");
    });

    it("shows an accepted commit when controlled", async () => {
      const [value, setValue] = createSignal<number | null>(5);
      const { user } = await render(() => (
        <Field value={value()} locale="en-US" onValueChange={setValue} />
      ));

      await typeAndLeave(user, "1000");

      expect(value()).toBe(1000);
      expect(spinbutton()).toHaveValue("1,000");
    });
  });

  describe("parsing", () => {
    it.each([
      ["en-US", "1,234.5", 1234.5],
      ["de-DE", "1.234,5", 1234.5],
      // Grouped with a narrow no-break space, typed as a space.
      ["fr-FR", "1 234,5", 1234.5],
      ["fr-FR", "1\u202f234,5", 1234.5],
      // Grouped with an apostrophe, typed as the keyboard has it.
      ["de-CH", "1'234.5", 1234.5],
      ["de-CH", "1’234.5", 1234.5],
      // Arabic-Indic digits, and ASCII digits.
      ["ar-EG", "١٬٢٣٤٫٥", 1234.5],
      ["ar-EG", "1234", 1234],
      // Grouped in lakhs.
      ["hi-IN", "12,34,567.5", 1234567.5],
    ])("in %s, reads %s as %d", async (locale, text, expected) => {
      const onValueChange = vi.fn();
      await render(() => (
        <Field locale={locale} onValueChange={onValueChange} />
      ));

      // Typed in one edit, since user-event cannot type every character.
      fireEvent.input(spinbutton(), { target: { value: text } });
      fireEvent.blur(spinbutton());
      await afterFlush();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it.each([
      ["en-US", "-12.5"],
      // The locale's own minus sign, U+2212.
      ["sv-SE", "−12,5"],
      ["sv-SE", "-12,5"],
    ])("in %s, reads %s as a negative number", async (locale, text) => {
      const onValueChange = vi.fn();
      await render(() => (
        <Field locale={locale} onValueChange={onValueChange} />
      ));

      fireEvent.input(spinbutton(), { target: { value: text } });
      fireEvent.blur(spinbutton());
      await afterFlush();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(-12.5);
    });

    it.each([
      [{ style: "currency", currency: "EUR" }, "€1,234.50", 1234.5],
      [{ style: "currency", currency: "EUR" }, "1234.5", 1234.5],
      [{ style: "percent" }, "25%", 0.25],
      [{ style: "percent" }, "25", 0.25],
      [{ style: "unit", unit: "kilometer" }, "12 km", 12],
    ] as const)(
      "with format %o, reads %s as %d",
      async (format, text, expected) => {
        const onValueChange = vi.fn();
        await render(() => (
          <Field format={format} locale="en-US" onValueChange={onValueChange} />
        ));

        fireEvent.input(spinbutton(), { target: { value: text } });
        fireEvent.blur(spinbutton());
        await afterFlush();

        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(expected);
      },
    );
  });

  it("runs the consumer's onBlur, onKeyDown and onInput", async () => {
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    const onInput = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <>
        <NumberField.Root onValueChange={onValueChange}>
          <NumberField.Input
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onInput={onInput}
          />
        </NumberField.Root>
        <button type="button">Next</button>
      </>
    ));

    await user.type(spinbutton(), "7");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await afterFlush();

    expect(onKeyDown).toHaveBeenCalled();
    expect(onInput).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(7);
  });
});
