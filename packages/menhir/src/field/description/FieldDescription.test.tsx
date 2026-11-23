// The test list and the cases left out are in ../README.md.
import { Show, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { Field } from "../index.ts";

describeConformance(
  "<Field.Description />",
  (props) => (
    <Field.Root>
      <Field.Description {...props} />
    </Field.Root>
  ),
  { tagName: "P" },
);

describe("<Field.Description />", () => {
  const { render } = createRenderer();

  it("renders a <p> that describes the control", async () => {
    await render(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control />
        <Field.Description>We never share it.</Field.Description>
      </Field.Root>
    ));
    const control = screen.getByRole("textbox", { name: "Email" });
    const description = screen.getByText("We never share it.");

    expect(description.tagName).toBe("P");
    expect(description.id).not.toBe("");
    expect(control).toHaveAttribute("aria-describedby", description.id);
    expect(control).toHaveAccessibleDescription("We never share it.");
  });

  it("is not named by a Field without one, once mounted", async () => {
    await render(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control />
      </Field.Root>
    ));
    await afterFlush();

    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });

  it("is named while rendered in a <Show>, and not once removed", async () => {
    const [shown, setShown] = createSignal(false);
    await render(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control />
        <Show when={shown()}>
          <Field.Description>We never share it.</Field.Description>
        </Show>
      </Field.Root>
    ));
    await afterFlush();
    const control = screen.getByRole("textbox");
    expect(control).not.toHaveAttribute("aria-describedby");

    setShown(true);
    flush();
    await afterFlush();
    expect(control).toHaveAccessibleDescription("We never share it.");

    setShown(false);
    flush();
    await afterFlush();
    expect(control).not.toHaveAttribute("aria-describedby");
  });

  it("takes no id from the consumer", async () => {
    await render(() => (
      <Field.Root>
        <Field.Control />
        {/* @ts-expect-error The Root generates the Description's id. */}
        <Field.Description id="own">Text</Field.Description>
      </Field.Root>
    ));

    const description = screen.getByText("Text");
    expect(description.id).not.toBe("own");
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-describedby",
      description.id,
    );
  });
});
