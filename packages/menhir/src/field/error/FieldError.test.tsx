// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { createRenderer, screen } from "#test-utils";

import { Field } from "../index.ts";

// No describeConformance: it queries the part as soon as it is rendered,
// and an Error is rendered only once the field is touched. The conventions
// it needs are checked below, after touching.

describe("<Field.Error />", () => {
  const { render } = createRenderer();

  // Leaves the control, which touches the field.
  async function leave(user: { tab(): Promise<void> }) {
    await user.tab();
    await user.tab();
  }

  it("renders nothing while the field shows no error", async () => {
    await render(() => (
      <Field.Root>
        <Field.Control />
        <Field.Error data-testid="error">Message</Field.Error>
      </Field.Root>
    ));

    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
  });

  it("renders a <p> the control names after the Description while the field shows an error", async () => {
    const { user } = await render(() => (
      <Field.Root error="Taken.">
        <Field.Label>Name</Field.Label>
        <Field.Control />
        <Field.Description>Shown to others.</Field.Description>
        <Field.Error />
      </Field.Root>
    ));
    const control = screen.getByRole("textbox", { name: "Name" });
    await leave(user);

    const error = screen.getByText("Taken.");
    expect(error.tagName).toBe("P");
    expect(error.id).not.toBe("");
    expect(control).toHaveAccessibleDescription("Shown to others. Taken.");
  });

  it("shows the error from outside without children, else the browser's message", async () => {
    const { user } = await render(() => (
      <>
        <Field.Root error="Taken.">
          <Field.Control required />
          <Field.Error data-testid="outside" />
        </Field.Root>
        <Field.Root>
          <Field.Control required data-testid="browser-control" />
          <Field.Error data-testid="browser" />
        </Field.Root>
      </>
    ));
    await user.tab();
    await user.tab();
    await user.tab();

    expect(screen.getByTestId("outside")).toHaveTextContent("Taken.");
    const control = screen.getByTestId("browser-control") as HTMLInputElement;
    expect(control.validationMessage).not.toBe("");
    expect(screen.getByTestId("browser")).toHaveTextContent(
      control.validationMessage,
    );
  });

  it("renders nothing, and is not named, while it has no message and no children", async () => {
    const { user } = await render(() => (
      <Field.Root invalid>
        <Field.Control />
        <Field.Error data-testid="error" />
      </Field.Root>
    ));
    await leave(user);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByTestId("error")).toBeNull();
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });

  it("shows its children instead of the message", async () => {
    const { user } = await render(() => (
      <Field.Root>
        <Field.Control required />
        <Field.Error>Enter a name.</Field.Error>
      </Field.Root>
    ));
    await leave(user);

    expect(screen.getByText("Enter a name.")).toBeInTheDocument();
  });

  it("with match, shows only while the browser's validity has that flag", async () => {
    const { user } = await render(() => (
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required />
        <Field.Error match="valueMissing">Enter an email.</Field.Error>
        <Field.Error match="typeMismatch">That is not an email.</Field.Error>
      </Field.Root>
    ));
    const control = screen.getByRole("textbox", { name: "Email" });
    await user.click(control);
    await user.tab();

    expect(screen.getByText("Enter an email.")).toBeInTheDocument();
    expect(screen.queryByText("That is not an email.")).toBeNull();
    expect(control).toHaveAccessibleDescription("Enter an email.");

    await user.type(control, "nope");
    expect(screen.queryByText("Enter an email.")).toBeNull();
    expect(screen.getByText("That is not an email.")).toBeInTheDocument();
    expect(control).toHaveAccessibleDescription("That is not an email.");
  });

  it("takes the consumer's id", async () => {
    const { user } = await render(() => (
      <Field.Root error="Taken.">
        <Field.Control />
        <Field.Error id="name-error" />
      </Field.Root>
    ));
    await leave(user);

    expect(screen.getByText("Taken.")).toHaveAttribute("id", "name-error");
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-describedby",
      "name-error",
    );
  });

  it("follows the part conventions once rendered: attributes, class, ref, handlers and render", async () => {
    const ref = vi.fn();
    const onClick = vi.fn();
    const { user } = await render(() => (
      <Field.Root invalid>
        <Field.Control />
        <Field.Error
          data-testid="error"
          title="Error"
          class="error"
          ref={ref}
          onClick={onClick}
          render={(props) => <div {...props} />}
        >
          Message
        </Field.Error>
      </Field.Root>
    ));
    await leave(user);
    const error = screen.getByTestId("error");

    expect(error.tagName).toBe("DIV");
    expect(error).toHaveAttribute("title", "Error");
    expect(error).toHaveClass("error");
    expect(error).toHaveAttribute("data-invalid", "");
    expect(ref).toHaveBeenCalledWith(error);
    await user.click(error);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("throws a descriptive error outside <Field.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Field.Error>Message</Field.Error>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Field parts must be placed within <Field.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
