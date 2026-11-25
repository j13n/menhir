// Slider as a Field's Control, through `Field.Control`'s `render`. The test
// list and the cases left out are in README.md.
import { describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM, screen } from "#test-utils";

import { Field } from "../field/index.ts";
import { Form } from "../form/index.ts";
import type { FormErrors } from "../core/formContext.ts";
import { Slider } from "./index.ts";

const slider = () =>
  screen.getByRole<HTMLInputElement>("slider", { name: "Volume" });
const error = () => screen.queryByTestId("error");

/** A volume as the Control of a Field. */
function Volume(props: {
  disabled?: boolean;
  onValueChange?: (value: number) => void;
}) {
  return (
    <Field.Root name="volume" disabled={props.disabled} data-testid="field">
      <Field.Label>Volume</Field.Label>
      <Field.Control
        // The value props are the Slider's, not the Field's.
        render={(p) => (
          <Slider.Root
            {...p}
            defaultValue={40}
            onValueChange={props.onValueChange}
          />
        )}
      >
        <Slider.Track
          data-testid="track"
          style={{ position: "relative", width: "200px", height: "20px" }}
        >
          <Slider.Thumb />
        </Slider.Track>
      </Field.Control>
      <Field.Description>Of the speakers.</Field.Description>
      <Field.Error data-testid="error" />
    </Field.Root>
  );
}

describe("<Slider.Root /> in a Field", () => {
  const { render } = createRenderer();

  it("is labelled by the Label, described by the Description, and submits under the Field's name", async () => {
    await render(() => (
      <form data-testid="form">
        <Volume />
      </form>
    ));

    expect(slider()).toHaveAccessibleDescription("Of the speakers.");
    expect(
      Object.fromEntries(new FormData(screen.getByTestId("form"))),
    ).toEqual({ volume: "40" });
  });

  it("is disabled, input and Track, by the Field's disabled", async () => {
    const onValueChange = vi.fn();
    await render(() => <Volume disabled onValueChange={onValueChange} />);

    expect(slider()).toBeDisabled();
    expect(screen.getByTestId("track")).toHaveAttribute("data-disabled");
    if (!isJSDOM) {
      const { cdp } = await import("vitest/browser");
      const { left, top } = screen.getByTestId("track").getBoundingClientRect();
      for (const type of ["mousePressed", "mouseReleased"]) {
        await cdp().send("Input.dispatchMouseEvent", {
          type,
          x: left + 180,
          y: top + 10,
          button: "left",
          clickCount: 1,
        });
      }
      await afterFlush();
    }
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("shows a Form's error under the Field's name at once, and hides it once the value changes", async () => {
    const errors: FormErrors = { volume: "Too quiet to hear." };
    const { user } = await render(() => (
      <Form errors={errors}>
        <Volume />
      </Form>
    ));
    expect(error()).toHaveTextContent("Too quiet to hear.");
    expect(slider()).toHaveAttribute("aria-invalid", "true");

    slider().focus();
    await user.keyboard("{ArrowRight}");
    await afterFlush();

    expect(error()).toBeNull();
    expect(slider()).not.toHaveAttribute("aria-invalid");
  });
});
