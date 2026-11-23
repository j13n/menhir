// The test list and the cases left out are in ../README.md.
import { Errored, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Field } from "../index.ts";

describeConformance("<Field.Root />", (props) => <Field.Root {...props} />, {
  tagName: "DIV",
});

describe("<Field.Root />", () => {
  const { render } = createRenderer();

  it("renders a <div> with no role", async () => {
    await render(() => <Field.Root data-testid="root" />);

    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("DIV");
    expect(root).not.toHaveAttribute("role");
  });

  it("gives every part data-disabled with disabled, and disables the control, following changes", async () => {
    const [disabled, setDisabled] = createSignal(true);
    await render(() => (
      <Field.Root data-testid="root" disabled={disabled()}>
        <Field.Label data-testid="label">Name</Field.Label>
        <Field.Control data-testid="control" />
        <Field.Description data-testid="description">Text</Field.Description>
      </Field.Root>
    ));
    const parts = ["root", "label", "control", "description"].map((id) =>
      screen.getByTestId(id),
    );

    for (const part of parts) expect(part).toHaveAttribute("data-disabled", "");
    expect(screen.getByRole("textbox")).toBeDisabled();

    setDisabled(false);
    flush();
    for (const part of parts) expect(part).not.toHaveAttribute("data-disabled");
    expect(screen.getByRole("textbox")).toBeEnabled();
  });

  it("gives the control its name, which the Control's own name overrides", async () => {
    await render(() => (
      <>
        <Field.Root name="email">
          <Field.Control aria-label="From the Root" />
        </Field.Root>
        <Field.Root name="email">
          <Field.Control aria-label="Own" name="contact" />
        </Field.Root>
      </>
    ));

    expect(
      screen.getByRole("textbox", { name: "From the Root" }),
    ).toHaveAttribute("name", "email");
    expect(screen.getByRole("textbox", { name: "Own" })).toHaveAttribute(
      "name",
      "contact",
    );
  });

  it.each(["Label", "Control", "Description"] as const)(
    "makes Field.%s throw a descriptive error outside it",
    async (name) => {
      const Part = Field[name];
      await render(() => (
        <Errored fallback={(error) => <p>{String(error())}</p>}>
          <Part />
        </Errored>
      ));

      expect(
        screen.getByText(
          "Error: [menhir] Field parts must be placed within <Field.Root>.",
        ),
      ).toBeInTheDocument();
    },
  );
});
