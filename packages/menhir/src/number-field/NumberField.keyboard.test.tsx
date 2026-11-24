// The keys on the Input, as the WAI-ARIA spinbutton pattern names them. The
// test list and the cases left out are in README.md.
import { describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, fireEvent, screen } from "#test-utils";

import { NumberField } from "./index.ts";
import type { NumberFieldRootProps } from "./root/NumberFieldRoot.tsx";

const spinbutton = () => screen.getByRole<HTMLInputElement>("spinbutton");
const valueNow = () => spinbutton().getAttribute("aria-valuenow");

function Field(props: NumberFieldRootProps) {
  return (
    <NumberField.Root locale="en-US" {...props}>
      <NumberField.Input />
    </NumberField.Root>
  );
}

describe("<NumberField.Input /> keys", () => {
  const { render } = createRenderer();

  /** Focuses the Input and presses `keys`, then lets the value settle. */
  async function press(
    user: Awaited<ReturnType<typeof render>>["user"],
    keys: string,
  ) {
    spinbutton().focus();
    await user.keyboard(keys);
    await afterFlush();
  }

  it("Up increases by step, and Down decreases by step", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Field defaultValue={10} step={2} onValueChange={onValueChange} />
    ));

    await press(user, "{ArrowUp}");
    expect(valueNow()).toBe("12");
    expect(spinbutton()).toHaveValue("12");

    await press(user, "{ArrowDown}{ArrowDown}");
    expect(valueNow()).toBe("8");
    expect(onValueChange.mock.calls).toEqual([[12], [10], [8]]);
  });

  it("Page Up and Page Down change by largeStep, ten steps by default", async () => {
    const { user } = await render(() => (
      <>
        <Field defaultValue={0} step={2} />
      </>
    ));

    await press(user, "{PageUp}");
    expect(valueNow()).toBe("20");

    await press(user, "{PageDown}{PageDown}");
    expect(valueNow()).toBe("-20");
  });

  it("Page Up and Page Down change by largeStep when set", async () => {
    const { user } = await render(() => (
      <Field defaultValue={0} largeStep={5} />
    ));

    await press(user, "{PageUp}");

    expect(valueNow()).toBe("5");
  });

  it("Home sets min, and End sets max", async () => {
    const { user } = await render(() => (
      <Field defaultValue={5} min={1} max={10} />
    ));

    await press(user, "{End}");
    expect(valueNow()).toBe("10");

    await press(user, "{Home}");
    expect(valueNow()).toBe("1");
  });

  it("Home and End change nothing and are not canceled without min or max, so the caret moves", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Field defaultValue={5} onValueChange={onValueChange} />
    ));

    const home = fireEvent.keyDown(spinbutton(), { key: "Home" });
    const end = fireEvent.keyDown(spinbutton(), { key: "End" });
    await afterFlush();

    expect(home).toBe(true);
    expect(end).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Up and Down clamp to min and max", async () => {
    const { user } = await render(() => (
      <Field defaultValue={9} min={0} max={10} step={3} />
    ));

    await press(user, "{ArrowUp}");
    expect(valueNow()).toBe("10");

    await press(user, "{PageDown}");
    expect(valueNow()).toBe("0");
  });

  it("lands on the step grid that way from a value off it", async () => {
    const { user } = await render(() => <Field defaultValue={1.5} />);

    await press(user, "{ArrowUp}");
    expect(valueNow()).toBe("2");

    await press(user, "{ArrowDown}");
    expect(valueNow()).toBe("1");
  });

  it("starts the grid at min", async () => {
    const { user } = await render(() => (
      <Field defaultValue={3} min={1} step={5} />
    ));

    await press(user, "{ArrowUp}");

    expect(valueNow()).toBe("6");
  });

  it("steps by a decimal step with no floating-point error", async () => {
    const { user } = await render(() => <Field defaultValue={0} step={0.1} />);

    await press(user, "{ArrowUp}{ArrowUp}{ArrowUp}");

    expect(valueNow()).toBe("0.3");
    expect(spinbutton()).toHaveValue("0.3");
  });

  it("Up from empty is step and Down is -step; with min above 0, min", async () => {
    const { user } = await render(() => (
      <>
        <NumberField.Root step={2}>
          <NumberField.Input aria-label="Up" />
        </NumberField.Root>
        <NumberField.Root step={2}>
          <NumberField.Input aria-label="Down" />
        </NumberField.Root>
        <NumberField.Root min={5}>
          <NumberField.Input aria-label="Min" />
        </NumberField.Root>
      </>
    ));
    const named = (name: string) => screen.getByRole("spinbutton", { name });

    named("Up").focus();
    await user.keyboard("{ArrowUp}");
    named("Down").focus();
    await user.keyboard("{ArrowDown}");
    named("Min").focus();
    await user.keyboard("{ArrowDown}");
    await afterFlush();

    expect(named("Up")).toHaveAttribute("aria-valuenow", "2");
    expect(named("Down")).toHaveAttribute("aria-valuenow", "-2");
    expect(named("Min")).toHaveAttribute("aria-valuenow", "5");
  });

  it("steps from typed text that is not committed", async () => {
    const { user } = await render(() => <Field defaultValue={1} />);

    await user.clear(spinbutton());
    await user.type(spinbutton(), "40{ArrowUp}");
    await afterFlush();

    expect(valueNow()).toBe("41");
    expect(spinbutton()).toHaveValue("41");
  });

  it("leaves a key with a modifier, and Shift with an arrow, to the browser", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Field defaultValue={5} onValueChange={onValueChange} />
    ));

    for (const init of [
      { key: "ArrowUp", ctrlKey: true },
      { key: "ArrowUp", altKey: true },
      { key: "ArrowDown", metaKey: true },
      { key: "ArrowDown", shiftKey: true },
      { key: "PageUp", ctrlKey: true },
    ]) {
      expect(fireEvent.keyDown(spinbutton(), init)).toBe(true);
    }
    await afterFlush();

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps focus on the Input", async () => {
    const { user } = await render(() => <Field defaultValue={5} />);

    await press(user, "{ArrowUp}{PageUp}{ArrowDown}");

    expect(spinbutton()).toHaveFocus();
  });

  it("ignores the keys when disabled or read-only", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Field defaultValue={5} min={0} readOnly onValueChange={onValueChange} />
    ));

    await press(user, "{ArrowUp}{PageDown}{Home}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(valueNow()).toBe("5");
  });
});
