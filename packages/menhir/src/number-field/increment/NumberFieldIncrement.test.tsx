// The test list and the cases left out are in ../README.md.
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
const increment = () => screen.getByRole("button", { name: "Increase" });
const valueNow = () => spinbutton().getAttribute("aria-valuenow");

describeConformance(
  "<NumberField.Increment />",
  (props) => (
    <NumberField.Root>
      <NumberField.Increment {...props} />
    </NumberField.Root>
  ),
  { tagName: "BUTTON" },
);

function Field(props: NumberFieldRootProps) {
  return (
    <NumberField.Root {...props}>
      <NumberField.Input />
      <NumberField.Increment aria-label="Increase">+</NumberField.Increment>
    </NumberField.Root>
  );
}

/** A primary mouse press on `element`, held until `release()`. */
function pressDown(element: Element, pointerType = "mouse") {
  return fireEvent.pointerDown(element, {
    button: 0,
    pointerId: 1,
    pointerType,
  });
}

describe("<NumberField.Increment />", () => {
  const { render } = createRenderer();
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a button of type button, out of the tab order, controlling the Input", async () => {
    await render(() => <Field />);

    expect(increment().tagName).toBe("BUTTON");
    expect(increment()).toHaveAttribute("type", "button");
    expect(increment()).toHaveAttribute("tabindex", "-1");
    expect(increment()).toHaveAttribute("aria-controls", spinbutton().id);
    expect(spinbutton().id).not.toBe("");
  });

  it("steps the value up by step on a press", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Field defaultValue={5} step={5} onValueChange={onValueChange} />
    ));

    await user.click(increment());
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(10);
    expect(valueNow()).toBe("10");
    expect(spinbutton()).toHaveValue("10");
  });

  it("keeps focus on the Input during a press", async () => {
    const { user } = await render(() => <Field defaultValue={1} />);
    spinbutton().focus();

    await user.click(increment());

    expect(spinbutton()).toHaveFocus();
  });

  it("focuses the Input on a mouse press, and nothing on a touch", async () => {
    await render(() => <Field defaultValue={1} />);

    const touch = pressDown(increment(), "touch");
    fireEvent.pointerUp(increment(), { pointerId: 1 });
    expect(touch).toBe(false);
    expect(document.body).toHaveFocus();

    const mouse = pressDown(increment());
    fireEvent.pointerUp(increment(), { pointerId: 1 });
    expect(mouse).toBe(false);
    expect(spinbutton()).toHaveFocus();
  });

  it("repeats while held, after a delay, and stops on release", async () => {
    vi.useFakeTimers();
    await render(() => <Field defaultValue={0} />);

    pressDown(increment());
    await wait(0);
    expect(valueNow()).toBe("1");

    await wait(399);
    expect(valueNow()).toBe("1");

    await wait(1);
    expect(valueNow()).toBe("2");

    await wait(60 * 3);
    expect(valueNow()).toBe("5");

    fireEvent.pointerUp(increment(), { pointerId: 1 });
    await wait(1000);
    expect(valueNow()).toBe("5");
  });

  it.each(["pointercancel", "lostpointercapture"])(
    "stops repeating on %s",
    async (type) => {
      vi.useFakeTimers();
      await render(() => <Field defaultValue={0} />);

      pressDown(increment());
      await wait(460);
      expect(valueNow()).toBe("3");

      fireEvent(increment(), new Event(type));
      await wait(1000);
      expect(valueNow()).toBe("3");
    },
  );

  it("stops repeating at max", async () => {
    vi.useFakeTimers();
    const onValueChange = vi.fn();
    await render(() => (
      <Field defaultValue={0} max={3} onValueChange={onValueChange} />
    ));

    pressDown(increment());
    await wait(2000);

    expect(valueNow()).toBe("3");
    expect(onValueChange.mock.calls).toEqual([[1], [2], [3]]);
    expect(increment()).toBeDisabled();
  });

  it("steps once on a click from assistive technology, with no pointer press", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Field defaultValue={1} onValueChange={onValueChange} />
    ));

    fireEvent.click(increment(), { detail: 0 });
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("is disabled at max, and enabled again when the value moves away", async () => {
    const [value, setValue] = createSignal<number | null>(10);
    await render(() => <Field value={value()} max={10} />);
    expect(increment()).toBeDisabled();

    setValue(9);
    flush();
    expect(increment()).toBeEnabled();

    setValue(null);
    flush();
    expect(increment()).toBeEnabled();
  });

  it("is disabled while the field is disabled or read-only", async () => {
    const [disabled, setDisabled] = createSignal(true);
    const [readOnly, setReadOnly] = createSignal(false);
    await render(() => (
      <Field defaultValue={1} disabled={disabled()} readOnly={readOnly()} />
    ));
    expect(increment()).toBeDisabled();

    setDisabled(false);
    flush();
    expect(increment()).toBeEnabled();

    setReadOnly(true);
    flush();
    expect(increment()).toBeDisabled();
  });

  it("calls the consumer's onClick and onPointerDown", async () => {
    const onClick = vi.fn();
    const onPointerDown = vi.fn();
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <NumberField.Root defaultValue={1} onValueChange={onValueChange}>
        <NumberField.Increment
          aria-label="Increase"
          onClick={onClick}
          onPointerDown={onPointerDown}
        />
      </NumberField.Root>
    ));

    await user.click(increment());
    await afterFlush();

    expect(onClick).toHaveBeenCalledOnce();
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <NumberField.Root>
        <NumberField.Increment render={(props) => <div {...props} />} />
      </NumberField.Root>
    ));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("NumberField.Increment");
    expect(warn.mock.calls[0]![0]).toContain("<button>");
  });

  it("throws a descriptive error outside <NumberField.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <NumberField.Increment />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] NumberField parts must be placed within <NumberField.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
