// The test list and the cases left out are in ../README.md. Decrement
// shares its code with Increment (`stepButton.tsx`), whose suite covers the
// press, the focus and press and hold; this one covers what differs.
import { afterEach, describe, expect, it, vi } from "vitest";

import { Errored, createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { wait } from "../../../test/floating/hover/helpers.ts";

import { NumberField } from "../index.ts";
import type { NumberFieldRootProps } from "../root/NumberFieldRoot.tsx";

const spinbutton = () => screen.getByRole<HTMLInputElement>("spinbutton");
const decrement = () => screen.getByRole("button", { name: "Decrease" });
const valueNow = () => spinbutton().getAttribute("aria-valuenow");

describeConformance(
  "<NumberField.Decrement />",
  (props) => (
    <NumberField.Root>
      <NumberField.Decrement {...props} />
    </NumberField.Root>
  ),
  { tagName: "BUTTON" },
);

function Field(props: NumberFieldRootProps) {
  return (
    <NumberField.Root {...props}>
      <NumberField.Decrement aria-label="Decrease">−</NumberField.Decrement>
      <NumberField.Input />
    </NumberField.Root>
  );
}

describe("<NumberField.Decrement />", () => {
  const { render } = createRenderer();
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a button of type button, out of the tab order, controlling the Input rendered after it", async () => {
    await render(() => <Field />);

    expect(decrement()).toHaveAttribute("type", "button");
    expect(decrement()).toHaveAttribute("tabindex", "-1");
    expect(decrement()).toHaveAttribute("aria-controls", spinbutton().id);
  });

  it("steps the value down by step on a press", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Field defaultValue={10} step={5} onValueChange={onValueChange} />
    ));

    await user.click(decrement());
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(5);
    expect(spinbutton()).toHaveValue("5");
  });

  it("repeats while held, and stops at min", async () => {
    vi.useFakeTimers();
    await render(() => <Field defaultValue={3} min={0} />);

    fireEvent.pointerDown(decrement(), {
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
    });
    await wait(2000);

    expect(valueNow()).toBe("0");
    expect(decrement()).toBeDisabled();
  });

  it("is disabled at min, and enabled again when the value moves away", async () => {
    const [value, setValue] = createSignal<number | null>(0);
    await render(() => <Field value={value()} min={0} />);
    expect(decrement()).toBeDisabled();

    setValue(1);
    flush();

    expect(decrement()).toBeEnabled();
  });

  it("is disabled while the field is disabled or read-only", async () => {
    await render(() => (
      <>
        <NumberField.Root disabled>
          <NumberField.Decrement aria-label="Disabled" />
        </NumberField.Root>
        <NumberField.Root readOnly>
          <NumberField.Decrement aria-label="Read-only" />
        </NumberField.Root>
      </>
    ));

    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Read-only" })).toBeDisabled();
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <NumberField.Root>
        <NumberField.Decrement render={(props) => <span {...props} />} />
      </NumberField.Root>
    ));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("NumberField.Decrement");
  });

  it("throws a descriptive error outside <NumberField.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <NumberField.Decrement />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] NumberField parts must be placed within <NumberField.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
