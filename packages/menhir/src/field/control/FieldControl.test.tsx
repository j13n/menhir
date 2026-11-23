// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Select } from "../../select/index.ts";
import { Switch } from "../../switch/index.ts";
import { Field } from "../index.ts";

describeConformance(
  "<Field.Control />",
  (props) => (
    <Field.Root>
      <Field.Control {...props} />
    </Field.Root>
  ),
  { tagName: "INPUT" },
);

describe("<Field.Control />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders an <input> with a generated id, which differs between two fields", async () => {
    await render(() => (
      <>
        <Field.Root>
          <Field.Label>First</Field.Label>
          <Field.Control />
        </Field.Root>
        <Field.Root>
          <Field.Label>Second</Field.Label>
          <Field.Control />
        </Field.Root>
      </>
    ));
    const first = screen.getByRole("textbox", { name: "First" });
    const second = screen.getByRole("textbox", { name: "Second" });

    expect(first.tagName).toBe("INPUT");
    expect(first.id).not.toBe("");
    expect(second.id).not.toBe("");
    expect(first.id).not.toBe(second.id);
  });

  it("takes the consumer's input attributes", async () => {
    await render(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required placeholder="you@example.com" />
      </Field.Root>
    ));
    const control = screen.getByRole("textbox", { name: "Email" });

    expect(control).toHaveAttribute("type", "email");
    expect(control).toBeRequired();
    expect(control).toHaveAttribute("placeholder", "you@example.com");
  });

  it("renders a <textarea> and a <select> through render, with the field's attributes", async () => {
    await render(() => (
      <>
        <Field.Root name="bio">
          <Field.Label>Bio</Field.Label>
          <Field.Control render={(props) => <textarea {...props} />} />
          <Field.Description>A line or two.</Field.Description>
        </Field.Root>
        <Field.Root name="size" disabled>
          <Field.Label>Size</Field.Label>
          <Field.Control
            render={(props) => (
              <select {...props}>
                <option>Small</option>
                <option>Large</option>
              </select>
            )}
          />
        </Field.Root>
      </>
    ));
    const textarea = screen.getByRole("textbox", { name: "Bio" });
    const select = screen.getByRole("combobox", { name: "Size" });

    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("name", "bio");
    expect(textarea).toHaveAccessibleDescription("A line or two.");
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("name", "size");
    expect(select).toBeDisabled();
    expect(select).toHaveAttribute("data-disabled", "");
  });

  it("joins a Switch through render: the button gets the id and description, the hidden input the name, and the Thumb is rendered inside", async () => {
    const { container } = await render(() => (
      <Field.Root name="alerts">
        <Field.Label>Alerts</Field.Label>
        <Field.Control render={Switch.Root}>
          <Switch.Thumb data-testid="thumb" />
        </Field.Control>
        <Field.Description>Sent by email.</Field.Description>
      </Field.Root>
    ));
    const button = screen.getByRole("switch", { name: "Alerts" });

    expect(button).toHaveAccessibleDescription("Sent by email.");
    expect(button).toContainElement(screen.getByTestId("thumb"));
    expect(container.querySelector("input[type=checkbox]")).toHaveAttribute(
      "name",
      "alerts",
    );
    expect(button).not.toHaveAttribute("name");
  });

  it("joins a Select's Trigger through render, inside Select.Root", async () => {
    await render(() => (
      <Field.Root>
        <Field.Label>Fruit</Field.Label>
        <Select.Root name="fruit">
          <Field.Control render={Select.Trigger}>
            <Select.Value placeholder="Pick one" />
          </Field.Control>
          <Select.Popup>
            <Select.Item value="apple">Apple</Select.Item>
          </Select.Popup>
        </Select.Root>
        <Field.Description>The one you like.</Field.Description>
      </Field.Root>
    ));
    const trigger = screen.getByRole("combobox", { name: "Fruit" });

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAccessibleDescription("The one you like.");
  });

  it("lets the consumer's aria-describedby win, and keeps the Field's when a wrapper passes undefined", async () => {
    await render(() => (
      <>
        <p id="hint">Elsewhere.</p>
        <Field.Root>
          <Field.Label>Own</Field.Label>
          <Field.Control aria-describedby="hint" />
          <Field.Description>Field's.</Field.Description>
        </Field.Root>
        <Field.Root>
          <Field.Label>Wrapped</Field.Label>
          <Field.Control aria-describedby={undefined} />
          <Field.Description>Field's.</Field.Description>
        </Field.Root>
      </>
    ));

    expect(
      screen.getByRole("textbox", { name: "Own" }),
    ).toHaveAccessibleDescription("Elsewhere.");
    expect(
      screen.getByRole("textbox", { name: "Wrapped" }),
    ).toHaveAccessibleDescription("Field's.");
  });
});
