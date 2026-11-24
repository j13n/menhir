// The test list and the cases left out are in README.md. Fieldset is a
// recipe, not a component: a native <fieldset>, and Field around it for the
// group's description and error. These tests pin what the recipe relies on.
import { For, createMemo, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { Checkbox } from "../checkbox/index.ts";
import { Combobox } from "../combobox/index.ts";
import { Field } from "../field/index.ts";
import { Form } from "../form/index.ts";
import { Input } from "../input/index.ts";
import { Select } from "../select/index.ts";
import { Switch } from "../switch/index.ts";

const group = (name: string) => screen.getByRole("group", { name });

/** One control of each kind, inside a fieldset that `disabled` disables. */
function EveryControl(props: { disabled?: boolean }) {
  return (
    <form data-testid="form">
      <fieldset disabled={props.disabled}>
        <legend>Account</legend>
        <input aria-label="Native input" name="native" value="a" />
        <textarea aria-label="Native textarea" name="notes">
          b
        </textarea>
        <select aria-label="Native select" name="size">
          <option>c</option>
        </select>
        <button type="button">Native button</button>
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control value="d" />
        </Field.Root>
        <label>
          Alerts
          <Switch.Root name="alerts" defaultChecked>
            <Switch.Thumb />
          </Switch.Root>
        </label>
        <label>
          Terms
          <Checkbox.Root name="terms" defaultChecked>
            <Checkbox.Indicator />
          </Checkbox.Root>
        </label>
        <Select.Root name="fruit" defaultValue="apple">
          <Select.Trigger aria-label="Fruit">
            <Select.Value />
          </Select.Trigger>
          <Select.Popup>
            <Select.Item value="apple">Apple</Select.Item>
          </Select.Popup>
        </Select.Root>
        <Input.Root aria-label="Nickname" name="nickname" defaultValue="e" />
        <Combobox.Root>
          <Combobox.Input aria-label="Country" />
          <Combobox.Popup>
            <Combobox.List aria-label="Countries">
              <Combobox.Item value="France">France</Combobox.Item>
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </fieldset>
      <button type="button">After</button>
    </form>
  );
}

const everyControl = () => [
  screen.getByRole("textbox", { name: "Native input" }),
  screen.getByRole("textbox", { name: "Native textarea" }),
  screen.getByRole("combobox", { name: "Native select" }),
  screen.getByRole("button", { name: "Native button" }),
  screen.getByRole("textbox", { name: "Email" }),
  screen.getByRole("switch", { name: "Alerts" }),
  screen.getByRole("checkbox", { name: "Terms" }),
  screen.getByRole("combobox", { name: "Fruit" }),
  screen.getByRole("textbox", { name: "Nickname" }),
  screen.getByRole("combobox", { name: "Country" }),
];

/** A required radio group, as a Field whose Control is the fieldset. */
function Delivery(props: { disabled?: boolean }) {
  return (
    <Field.Root name="delivery" disabled={props.disabled} data-testid="root">
      <Field.Control data-testid="fieldset" render={(p) => <fieldset {...p} />}>
        <legend>Delivery</legend>
        <Field.Description>We ship within two days.</Field.Description>
        <label>
          <input type="radio" name="delivery" value="standard" required />
          Standard
        </label>
        <label>
          <input type="radio" name="delivery" value="express" />
          Express
        </label>
        <Field.Error data-testid="error" />
      </Field.Control>
    </Field.Root>
  );
}

describe("Fieldset", () => {
  const { render } = createRenderer();

  describe("the group's name and description", () => {
    it("is a group named by its legend", async () => {
      await render(() => (
        <fieldset>
          <legend>Shipping address</legend>
          <label>
            Street <input />
          </label>
        </fieldset>
      ));

      expect(group("Shipping address").tagName).toBe("FIELDSET");
    });

    it("is described by the Field's Description when it is the Field's Control", async () => {
      await render(() => <Delivery />);

      const fieldset = group("Delivery");
      expect(fieldset).toBe(screen.getByTestId("fieldset"));
      expect(fieldset).toHaveAccessibleDescription("We ship within two days.");
    });

    it("gets the Field's name, which the form does not submit", async () => {
      await render(() => (
        <form data-testid="form">
          <Delivery />
        </form>
      ));
      screen.getByRole("radio", { name: "Express" }).click();

      expect(group("Delivery")).toHaveAttribute("name", "delivery");
      const data = new FormData(screen.getByTestId<HTMLFormElement>("form"));
      expect([...data]).toEqual([["delivery", "express"]]);
    });
  });

  describe("disabled", () => {
    it("reaches each kind of control", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => <EveryControl disabled={disabled()} />);
      for (const control of everyControl()) expect(control).toBeEnabled();

      setDisabled(true);
      await afterFlush();

      expect(group("Account")).toBeDisabled();
      for (const control of everyControl()) {
        expect(control).toBeDisabled();
        expect(control.matches(":disabled")).toBe(true);
      }
    });

    it("leaves a control in the first legend enabled", async () => {
      await render(() => (
        <fieldset disabled>
          <legend>
            <label>
              Use another address
              <Checkbox.Root>
                <Checkbox.Indicator />
              </Checkbox.Root>
            </label>
          </legend>
          <label>
            Street <input />
          </label>
        </fieldset>
      ));

      expect(
        screen.getByRole("checkbox", { name: "Use another address" }),
      ).toBeEnabled();
      expect(screen.getByRole("textbox", { name: "Street" })).toBeDisabled();
    });

    it("leaves the controls out of the form's data", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => <EveryControl disabled={disabled()} />);
      const form = screen.getByTestId<HTMLFormElement>("form");
      expect([...new FormData(form).keys()]).toEqual([
        "native",
        "notes",
        "size",
        "email",
        "alerts",
        "terms",
        "fruit",
        "nickname",
      ]);

      setDisabled(true);
      await afterFlush();

      expect([...new FormData(form)]).toEqual([]);
    });

    it.skipIf(isJSDOM)(
      "ignores a press on a Switch, a Checkbox and a Select's Trigger",
      async () => {
        const { user } = await render(() => <EveryControl disabled />);
        const alerts = screen.getByRole("switch", { name: "Alerts" });
        const terms = screen.getByRole("checkbox", { name: "Terms" });
        const fruit = screen.getByRole("combobox", { name: "Fruit" });

        // Pointer events checks would refuse the press; the browser's own
        // dispatch is what is under test.
        const press = user.setup({ pointerEventsCheck: 0 });
        await press.click(alerts);
        await press.click(terms);
        await press.click(fruit);
        await afterFlush();

        expect(alerts).toHaveAttribute("aria-checked", "true");
        expect(terms).toHaveAttribute("aria-checked", "true");
        expect(fruit).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("listbox")).toBeNull();
      },
    );

    it.skipIf(isJSDOM)("takes every control out of the tab order", async () => {
      const { user } = await render(() => (
        <>
          <button type="button">Before</button>
          <EveryControl disabled />
        </>
      ));
      screen.getByRole("button", { name: "Before" }).focus();

      await user.tab();

      expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    });

    it("from Field.Root, disables the fieldset and its controls, and marks the Field's parts", async () => {
      const [disabled, setDisabled] = createSignal(true);
      await render(() => <Delivery disabled={disabled()} />);
      const radios = screen.getAllByRole("radio");

      expect(group("Delivery")).toBeDisabled();
      for (const radio of radios) expect(radio).toBeDisabled();
      expect(screen.getByTestId("root")).toHaveAttribute("data-disabled", "");
      expect(group("Delivery")).toHaveAttribute("data-disabled", "");
      expect(screen.getByText("We ship within two days.")).toHaveAttribute(
        "data-disabled",
        "",
      );

      setDisabled(false);
      await afterFlush();

      expect(group("Delivery")).toBeEnabled();
      for (const radio of radios) expect(radio).toBeEnabled();
      expect(group("Delivery")).not.toHaveAttribute("data-disabled");
    });
  });

  describe("the group's error", () => {
    const error = () => screen.queryByTestId("error");

    it("is not shown before the group is touched", async () => {
      await render(() => <Delivery />);
      await afterFlush();

      expect(group("Delivery")).not.toHaveAttribute("aria-invalid");
      expect(group("Delivery")).not.toHaveAttribute("data-invalid");
      expect(error()).toBeNull();
    });

    it("is shown once focus leaves the group, not as it moves between options", async () => {
      const { user } = await render(() => (
        <>
          <Delivery />
          <button type="button">Next</button>
        </>
      ));
      const [standard, express] = screen.getAllByRole("radio");
      const message = (standard as HTMLInputElement).validationMessage;

      standard.focus();
      express.focus();
      await afterFlush();
      expect(group("Delivery")).not.toHaveAttribute("data-touched");

      screen.getByRole("button", { name: "Next" }).focus();
      await afterFlush();

      const fieldset = group("Delivery");
      expect(fieldset).toHaveAttribute("data-touched", "");
      expect(fieldset).toHaveAttribute("data-invalid", "");
      expect(fieldset).toHaveAttribute("aria-invalid", "true");
      expect(error()).toHaveTextContent(message);
      expect(fieldset).toHaveAccessibleDescription(
        `We ship within two days. ${message}`,
      );

      await user.click(express);

      expect(fieldset).not.toHaveAttribute("aria-invalid");
      expect(error()).toBeNull();
      expect(fieldset).toHaveAccessibleDescription("We ship within two days.");
    });

    it("shows an error from outside for a set of checkboxes once a change touched the group", async () => {
      function Topics() {
        const [chosen, setChosen] = createSignal<string[]>(["news"]);
        const toggle = (topic: string, on: boolean) =>
          setChosen((list) =>
            on ? [...list, topic] : list.filter((t) => t !== topic),
          );
        const error = createMemo(() =>
          chosen().length === 0 ? "Choose at least one topic." : undefined,
        );
        return (
          <Field.Root name="topics" error={error()}>
            <Field.Control render={(p) => <fieldset {...p} />}>
              <legend>Topics</legend>
              <For each={["news", "events"]}>
                {(topic) => (
                  <label>
                    <Checkbox.Root
                      name="topics"
                      value={topic}
                      checked={chosen().includes(topic)}
                      onCheckedChange={(on) => toggle(topic, on)}
                    >
                      <Checkbox.Indicator />
                    </Checkbox.Root>
                    {topic}
                  </label>
                )}
              </For>
              <Field.Error data-testid="error" />
            </Field.Control>
          </Field.Root>
        );
      }
      const { user } = await render(() => <Topics />);
      const news = screen.getByRole("checkbox", { name: "news" });
      const events = screen.getByRole("checkbox", { name: "events" });

      await user.click(news);
      await afterFlush();

      expect(group("Topics")).toHaveAttribute("aria-invalid", "true");
      expect(group("Topics")).toHaveAccessibleDescription(
        "Choose at least one topic.",
      );

      await user.click(events);
      await afterFlush();

      expect(group("Topics")).not.toHaveAttribute("aria-invalid");
      expect(error()).toBeNull();
    });

    it("shows a Form's error under the group's name at once, and hides it on the next change", async () => {
      const { user } = await render(() => (
        <Form errors={{ delivery: "Express is sold out." }}>
          <Delivery />
        </Form>
      ));
      await afterFlush();

      expect(group("Delivery")).toHaveAttribute("aria-invalid", "true");
      expect(error()).toHaveTextContent("Express is sold out.");

      await user.click(screen.getByRole("radio", { name: "Standard" }));
      await afterFlush();

      expect(group("Delivery")).not.toHaveAttribute("aria-invalid");
      expect(error()).toBeNull();
    });

    it.skipIf(isJSDOM)(
      "focuses the first radio when the browser blocks a submission, and the group names the error",
      async () => {
        const { user } = await render(() => (
          <form onSubmit={(event) => event.preventDefault()}>
            <Delivery />
            <button type="submit">Order</button>
          </form>
        ));
        const standard = screen.getByRole("radio", { name: "Standard" });

        await user.click(screen.getByRole("button", { name: "Order" }));
        await afterFlush();

        expect(standard).toHaveFocus();
        expect(group("Delivery")).toHaveAccessibleDescription(
          `We ship within two days. ${(standard as HTMLInputElement).validationMessage}`,
        );
      },
    );

    it("is never shown while the group is disabled", async () => {
      const { user } = await render(() => (
        <form onSubmit={(event) => event.preventDefault()}>
          <Delivery disabled />
          <button type="submit">Order</button>
        </form>
      ));

      await user.click(screen.getByRole("button", { name: "Order" }));
      await afterFlush();

      expect(group("Delivery")).toHaveAttribute("data-touched", "");
      expect(group("Delivery")).not.toHaveAttribute("aria-invalid");
      expect(error()).toBeNull();
    });
  });
});
