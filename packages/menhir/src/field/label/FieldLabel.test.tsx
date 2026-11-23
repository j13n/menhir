// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Field } from "../index.ts";

describeConformance(
  "<Field.Label />",
  (props) => (
    <Field.Root>
      <Field.Label {...props} />
    </Field.Root>
  ),
  { tagName: "LABEL" },
);

describe("<Field.Label />", () => {
  const { render } = createRenderer();

  it("renders a <label> whose for is the control's id, so it names the control", async () => {
    await render(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control />
      </Field.Root>
    ));
    const control = screen.getByRole("textbox", { name: "Email" });
    const label = screen.getByText("Email");

    expect(label.tagName).toBe("LABEL");
    expect(control.id).not.toBe("");
    expect(label).toHaveAttribute("for", control.id);
  });

  it("focuses the control when clicked", async () => {
    const { user } = await render(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control />
      </Field.Root>
    ));

    await user.click(screen.getByText("Email"));

    expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus();
  });
});
