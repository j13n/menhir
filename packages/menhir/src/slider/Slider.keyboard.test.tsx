// The keys on the Thumb's input, as the WAI-ARIA slider pattern names them.
// The test list and the cases left out are in README.md.
import { describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, fireEvent, screen } from "#test-utils";

import { Slider } from "./index.ts";
import type { SliderRootProps } from "./root/SliderRoot.tsx";

const slider = () => screen.getByRole<HTMLInputElement>("slider");
const value = () => slider().value;

function Volume(props: SliderRootProps) {
  return (
    <Slider.Root {...props}>
      <Slider.Track>
        <Slider.Thumb aria-label="Volume" />
      </Slider.Track>
    </Slider.Root>
  );
}

describe("<Slider.Thumb /> keys", () => {
  const { render } = createRenderer();

  /** Focuses the input and presses `keys`, then lets the value settle. */
  async function press(
    user: Awaited<ReturnType<typeof render>>["user"],
    keys: string,
  ) {
    slider().focus();
    await user.keyboard(keys);
    await afterFlush();
  }

  it("Right and Up increase by step, Left and Down decrease", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Volume defaultValue={10} step={2} onValueChange={onValueChange} />
    ));

    await press(user, "{ArrowRight}");
    expect(value()).toBe("12");
    await press(user, "{ArrowUp}");
    expect(value()).toBe("14");
    await press(user, "{ArrowLeft}");
    expect(value()).toBe("12");
    await press(user, "{ArrowDown}");
    expect(value()).toBe("10");
    expect(onValueChange.mock.calls).toEqual([[12], [14], [12], [10]]);
  });

  it("Page Up and Page Down change by largeStep, ten steps by default", async () => {
    const { user } = await render(() => (
      <>
        <Slider.Root defaultValue={50} step={2}>
          <Slider.Thumb aria-label="Default" />
        </Slider.Root>
        <Slider.Root defaultValue={50} largeStep={25}>
          <Slider.Thumb aria-label="Large" />
        </Slider.Root>
      </>
    ));
    const named = (name: string) =>
      screen.getByRole<HTMLInputElement>("slider", { name });

    named("Default").focus();
    await user.keyboard("{PageUp}");
    await afterFlush();
    expect(named("Default").value).toBe("70");
    await user.keyboard("{PageDown}{PageDown}");
    await afterFlush();
    expect(named("Default").value).toBe("30");

    named("Large").focus();
    await user.keyboard("{PageDown}");
    await afterFlush();
    expect(named("Large").value).toBe("25");
  });

  it("Home sets min, and End the last value on the grid at or under max", async () => {
    const { user } = await render(() => (
      <Volume defaultValue={4} min={1} max={11} step={3} />
    ));

    await press(user, "{End}");
    expect(value()).toBe("10");
    await press(user, "{Home}");
    expect(value()).toBe("1");
  });

  it("clamps at min and max, and changes nothing there", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Volume defaultValue={95} step={10} onValueChange={onValueChange} />
    ));

    await press(user, "{ArrowRight}");
    expect(value()).toBe("100");
    await press(user, "{ArrowRight}{End}{PageUp}");
    expect(onValueChange.mock.calls).toEqual([[100]]);
  });

  it("swaps Left and Right right to left, and not Up and Down", async () => {
    const { user } = await render(() => (
      <div dir="rtl">
        <Volume defaultValue={50} />
      </div>
    ));

    await press(user, "{ArrowLeft}");
    expect(value()).toBe("51");
    await press(user, "{ArrowRight}{ArrowRight}");
    expect(value()).toBe("49");
    await press(user, "{ArrowUp}");
    expect(value()).toBe("50");
  });

  it("steps from an app's value off the grid to the grid that way", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Volume value={15} step={10} onValueChange={onValueChange} />
    ));

    await press(user, "{ArrowRight}");
    await press(user, "{ArrowLeft}");

    expect(onValueChange.mock.calls).toEqual([[20], [10]]);
  });

  it("steps a decimal step with no floating-point error", async () => {
    const { user } = await render(() => (
      <Volume defaultValue={0} max={1} step={0.1} />
    ));

    await press(user, "{ArrowRight}{ArrowRight}{ArrowRight}");

    expect(value()).toBe("0.3");
  });

  it("leaves a key with Ctrl, Alt or Meta held to the browser, and cancels every key it handles", async () => {
    await render(() => <Volume defaultValue={50} />);

    for (const modifier of ["ctrlKey", "altKey", "metaKey"]) {
      const event = new KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
        cancelable: true,
        [modifier]: true,
      });
      slider().dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    for (const key of [
      "ArrowRight",
      "ArrowUp",
      "ArrowLeft",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
    ]) {
      expect(fireEvent.keyDown(slider(), { key })).toBe(false);
    }
    expect(fireEvent.keyDown(slider(), { key: "a" })).toBe(true);
    await afterFlush();
    expect(value()).toBe("100");
  });

  it("ignores the keys while disabled, since the input cannot be focused", async () => {
    await render(() => <Volume defaultValue={50} disabled />);

    slider().focus();

    expect(slider()).toBeDisabled();
    expect(slider()).not.toHaveFocus();
  });

  it("commits once when a held key is released, and when focus leaves before the release", async () => {
    const onValueCommit = vi.fn();
    const { user } = await render(() => (
      <Volume defaultValue={50} onValueCommit={onValueCommit} />
    ));

    await press(user, "{ArrowRight>3}");
    expect(onValueCommit).not.toHaveBeenCalled();
    await press(user, "{/ArrowRight}");
    expect(onValueCommit.mock.calls).toEqual([[53]]);

    await press(user, "{ArrowLeft>}");
    slider().blur();
    await afterFlush();
    expect(onValueCommit.mock.calls).toEqual([[53], [52]]);
  });
});
