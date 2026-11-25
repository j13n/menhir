// The form's view of a Multi Combobox: a hidden input per value, and a
// hidden radio for `required`. The test list and the cases left out are in
// ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  afterReset,
  createRenderer,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, press } from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Toppings } from "../../../test/multi-combobox/Toppings.tsx";
import type { ToppingsProps } from "../../../test/multi-combobox/Toppings.tsx";
import {
  chip,
  chipLabels,
  input,
  item,
} from "../../../test/multi-combobox/queries.ts";
import type { FormErrors } from "../../core/formContext.ts";
import { Field } from "../../field/index.ts";
import { Form } from "../../form/index.ts";
import { MultiCombobox } from "../index.ts";

const form = () => screen.getByTestId<HTMLFormElement>("form");
const entries = () => new FormData(form()).getAll("toppings");
const button = (name: string) => screen.getByRole("button", { name });
/** The hidden radio that holds `required`. */
const validityInput = () =>
  document.querySelector<HTMLInputElement>("input[type=radio]")!;

/** A Toppings multi combobox in a form with a submit and a reset button. */
function ToppingsForm(props: ToppingsProps & { onSubmit?: () => void }) {
  return (
    <form
      data-testid="form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.();
      }}
    >
      <Toppings name="toppings" {...props} />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<MultiCombobox.Root /> in a form", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a hidden input per value under name, in order, and submits each, not the text", async () => {
    const { user } = await render(() => (
      <ToppingsForm defaultValue={["olives", "cheese"]} />
    ));
    expect(entries()).toEqual(["olives", "cheese"]);

    await user.type(input(), "mush");
    expect(entries()).toEqual(["olives", "cheese"]);
    expect([...new FormData(form()).keys()]).toEqual(["toppings", "toppings"]);
  });

  it("submits nothing for no values", async () => {
    await render(() => <ToppingsForm />);
    expect([...new FormData(form()).keys()]).toEqual([]);
  });

  it("submits nothing while disabled", async () => {
    await render(() => <ToppingsForm defaultValue={["olives"]} disabled />);

    expect([...new FormData(form()).keys()]).toEqual([]);
  });

  it("puts form on the hidden inputs and the radio", async () => {
    await render(() => (
      <>
        <form id="order" />
        <MultiCombobox.Root name="toppings" form="order" defaultValue={["x"]}>
          <MultiCombobox.Input aria-label="Toppings" />
        </MultiCombobox.Root>
      </>
    ));

    expect(document.querySelector("input[type=hidden]")).toHaveAttribute(
      "form",
      "order",
    );
    expect(validityInput()).toHaveAttribute("form", "order");
    expect(validityInput()).toHaveAttribute("name", "toppings");
    expect(validityInput()).toHaveAttribute("aria-hidden", "true");
    expect(validityInput()).toHaveAttribute("tabindex", "-1");
  });

  it("fires input and change that reach the form, whose FormData is current, on selecting and removing", async () => {
    const seen: string[] = [];
    const record = (event: Event) => {
      // The Input's own typing is no change of the values.
      if (event.target === input()) return;
      seen.push(`${event.type}:${entries().join(",")}`);
    };
    const { user } = await render(() => (
      <ToppingsForm defaultValue={["olives"]} defaultOpen />
    ));
    form().addEventListener("input", record);
    form().addEventListener("change", record);
    await afterFlush();

    await user.click(item("Cheese"));
    await afterFlush();
    expect(seen).toEqual(["input:olives,cheese", "change:olives,cheese"]);

    await user.click(button("Remove Olives"));
    await afterFlush();
    expect(seen.slice(2)).toEqual(["input:cheese", "change:cheese"]);
  });

  it("fires nothing for a change a controlled consumer declines", async () => {
    const onChange = vi.fn();
    const { user } = await render(() => (
      <ToppingsForm value={["olives"]} defaultOpen />
    ));
    form().addEventListener("change", onChange);
    await afterFlush();

    await user.click(item("Cheese"));
    await afterFlush();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("required blocks submission while no value is selected, even with text, and not once one is", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <ToppingsForm required onSubmit={onSubmit} />
    ));

    await user.type(input(), "Olives");
    await afterFlush();
    expect(form().checkValidity()).toBe(false);
    expect(validityInput().validity.valueMissing).toBe(true);
    await user.click(button("Send"));
    expect(onSubmit).not.toHaveBeenCalled();

    input().focus();
    await user.keyboard("{ArrowDown}{Enter}");
    await afterFlush();
    expect(form().checkValidity()).toBe(true);
    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    // The radio submits nothing. Focus leaving emptied the text, so the
    // first item was Cheese.
    expect(entries()).toEqual(["cheese"]);
  });

  // jsdom does not focus the invalid control.
  it.skipIf(isJSDOM)(
    "moves focus to the Input when the browser blocks the submission",
    async () => {
      const { user } = await render(() => <ToppingsForm required />);

      await user.click(button("Send"));

      expect(document.activeElement).toBe(input());
    },
  );

  it("a form reset puts back defaultValue and defaultInputValue", async () => {
    const onValueChange = vi.fn();
    const onInputValueChange = vi.fn();
    const { user } = await render(() => (
      <ToppingsForm
        defaultValue={["olives"]}
        defaultInputValue="o"
        onValueChange={onValueChange}
        onInputValueChange={onInputValueChange}
      />
    ));
    await user.click(item("Onions"));
    await user.click(button("Remove Olives"));
    await afterFlush();
    expect(chipLabels()).toEqual(["Onions"]);
    expect(input()).toHaveValue("");

    await user.click(button("Reset"));
    await afterReset();

    expect(onValueChange).toHaveBeenLastCalledWith(["olives"]);
    expect(onInputValueChange).toHaveBeenLastCalledWith("o", {
      reason: "reset",
      event: expect.any(Event),
    });
    expect(chipLabels()).toEqual(["Olives"]);
    expect(input()).toHaveValue("o");
    expect(entries()).toEqual(["olives"]);
  });

  it("a form reset only asks when controlled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <ToppingsForm
        value={["cheese"]}
        defaultValue={["olives"]}
        onValueChange={onValueChange}
      />
    ));
    await afterFlush();

    await user.click(button("Reset"));
    await afterReset();

    expect(onValueChange).toHaveBeenCalledWith(["olives"]);
    expect(chipLabels()).toEqual(["Cheese"]);
    expect(entries()).toEqual(["cheese"]);
  });

  // A press of the user's, not a script's: the browser runs microtasks as
  // each listener of `reset` returns, before it resets the controls.
  it.skipIf(isJSDOM)(
    "a form reset by a real press puts back defaultValue, which the form submits",
    async () => {
      const { user } = await render(() => (
        <ToppingsForm defaultValue={["olives"]} defaultInputValue="" />
      ));
      await user.type(input(), "ch");
      await user.keyboard("{ArrowDown}{Enter}");
      await afterFlush();
      expect(entries()).toEqual(["olives", "cheese"]);

      await press(centerOf(button("Reset")));
      await afterReset();

      expect(chipLabels()).toEqual(["Olives"]);
      expect(input()).toHaveValue("");
      expect(entries()).toEqual(["olives"]);
    },
  );
});

/** A required Toppings multi combobox whose Input is a Field's Control. */
function ToppingsField(props: { defaultValue?: string[]; message?: string }) {
  return (
    <Field.Root name="toppings" data-testid="root">
      <Field.Label>Toppings</Field.Label>
      <MultiCombobox.Root
        name="toppings"
        required
        defaultValue={props.defaultValue}
      >
        <MultiCombobox.Chips data-testid="chips">
          <MultiCombobox.Value>
            {(value) => (
              <MultiCombobox.Chip value={value}>
                {value}
                <MultiCombobox.ChipRemove aria-label={`Remove ${value}`} />
              </MultiCombobox.Chip>
            )}
          </MultiCombobox.Value>
          <Field.Control render={MultiCombobox.Input} />
        </MultiCombobox.Chips>
        <MultiCombobox.Popup>
          <MultiCombobox.List aria-label="Toppings">
            <MultiCombobox.Item value="cheese">Cheese</MultiCombobox.Item>
            <MultiCombobox.Item value="olives">Olives</MultiCombobox.Item>
          </MultiCombobox.List>
        </MultiCombobox.Popup>
      </MultiCombobox.Root>
      <Field.Error data-testid="error">{props.message}</Field.Error>
    </Field.Root>
  );
}

describe("<MultiCombobox.Input /> in a Field", () => {
  const { render } = createRenderer();
  stubMenu();

  it("is named by the Field's label, and its text is not submitted under the Field's name", async () => {
    const { user } = await render(() => (
      <form data-testid="form">
        <ToppingsField defaultValue={["olives"]} />
      </form>
    ));

    expect(screen.getByRole("combobox", { name: "Toppings" })).toBe(input());
    await user.type(input(), "ch");
    expect(input()).not.toHaveAttribute("name");
    expect(entries()).toEqual(["olives"]);
  });

  it("shows the error once a submission is blocked, and hides it once a value is selected", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <form
        data-testid="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <ToppingsField message="Select a topping." />
        <button type="submit">Send</button>
      </form>
    ));
    expect(screen.queryByTestId("error")).toBeNull();

    await user.click(button("Send"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId("error")).toHaveTextContent("Select a topping.");
    expect(input()).toHaveAttribute("aria-invalid", "true");
    expect(input()).toHaveAccessibleDescription("Select a topping.");

    input().focus();
    await user.keyboard("{ArrowDown}{Enter}");
    await afterFlush();
    expect(screen.queryByTestId("error")).toBeNull();
    expect(input()).not.toHaveAttribute("aria-invalid");
  });

  it("hides a Form's error under its name once a value is selected or removed", async () => {
    const errors: FormErrors = { toppings: "Olives are sold out." };
    const { user } = await render(() => (
      <Form errors={errors}>
        <ToppingsField defaultValue={["olives"]} />
      </Form>
    ));
    expect(screen.getByTestId("error")).toHaveTextContent(
      "Olives are sold out.",
    );

    chip("olives").focus();
    await user.keyboard("{Backspace}");
    await afterFlush();
    expect(screen.getByTestId("error")).not.toHaveTextContent(
      "Olives are sold out.",
    );
  });
});
