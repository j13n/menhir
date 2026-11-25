// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Show, createSignal, flush, omit } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { Slider } from "../index.ts";
import type { SliderRootProps } from "./SliderRoot.tsx";

const slider = () => screen.getByRole<HTMLInputElement>("slider");
const root = () => screen.getByTestId("root");
const button = (name: string) => screen.getByRole("button", { name });
const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => [...new FormData(form())];

describeConformance("<Slider.Root />", (props) => <Slider.Root {...props} />, {
  tagName: "DIV",
});

/** Every part, so the tests can check each. */
function Volume(props: SliderRootProps) {
  return (
    <Slider.Root data-testid="root" {...props}>
      <Slider.Value data-testid="value" />
      <Slider.Track data-testid="track">
        <Slider.Thumb data-testid="thumb" aria-label="Volume" />
      </Slider.Track>
    </Slider.Root>
  );
}

const parts = () =>
  ["root", "value", "track", "thumb"].map((id) => screen.getByTestId(id));

/**
 * Resolves once the slider has handled a form reset: in a task after the
 * reset, since the browser resets the controls after the event, and then
 * once its state has flushed.
 */
async function afterReset() {
  await new Promise((resolve) => setTimeout(resolve));
  await afterFlush();
}

/** A slider named `volume` in a form with a reset button. */
function VolumeForm(
  props: SliderRootProps & { onFormReset?: (event: Event) => void },
) {
  const rootProps = omit(props, "onFormReset");
  return (
    <form data-testid="form" onReset={(event) => props.onFormReset?.(event)}>
      <Volume name="volume" {...rootProps} />
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<Slider.Root />", () => {
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

  it("renders a div around its parts, with --slider the value's percentage of the range", async () => {
    const [value, setValue] = createSignal(1950);
    await render(() => <Volume value={value()} min={1900} max={2100} />);

    expect(root().tagName).toBe("DIV");
    expect(root()).toContainElement(slider());
    expect(root().style.getPropertyValue("--slider")).toBe("25%");

    setValue(2100);
    flush();
    expect(root().style.getPropertyValue("--slider")).toBe("100%");

    // An app's value outside the range sits at its end.
    setValue(3000);
    flush();
    expect(root().style.getPropertyValue("--slider")).toBe("100%");
  });

  describe("uncontrolled", () => {
    it("starts at defaultValue, and calls onValueChange with each new value", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Volume defaultValue={30} onValueChange={onValueChange} />
      ));
      expect(slider().value).toBe("30");

      await press(user, "{ArrowRight}{ArrowRight}");

      expect(slider().value).toBe("32");
      expect(screen.getByTestId("value")).toHaveTextContent("32");
      expect(onValueChange.mock.calls).toEqual([[31], [32]]);
    });

    it("starts at the midpoint of min and max on the grid without defaultValue, as a range input does", async () => {
      await render(() => (
        <>
          <Slider.Root>
            <Slider.Thumb aria-label="Default" />
          </Slider.Root>
          <Slider.Root min={0} max={10} step={4}>
            <Slider.Thumb aria-label="Stepped" />
          </Slider.Root>
        </>
      ));
      const named = (name: string) =>
        screen.getByRole<HTMLInputElement>("slider", { name });

      expect(named("Default").value).toBe("50");
      expect(named("Stepped").value).toBe("4");
    });
  });

  describe("controlled", () => {
    it("shows value and follows the app's changes", async () => {
      const [value, setValue] = createSignal(10);
      await render(() => <Volume value={value()} />);
      expect(slider().value).toBe("10");

      setValue(70);
      flush();

      expect(slider().value).toBe("70");
      expect(slider()).toHaveAttribute("aria-valuetext", "70");
    });

    it("asks with the requested value, and stays put when declined", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Volume value={10} onValueChange={onValueChange} />
      ));

      await press(user, "{ArrowRight}");

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(11);
      expect(slider().value).toBe("10");
      expect(root().style.getPropertyValue("--slider")).toBe("10%");
    });
  });

  it("changes before async work that onValueChange starts settles", async () => {
    const { user } = await render(() => (
      <Volume
        defaultValue={10}
        onValueChange={() => {
          void new Promise(() => {});
        }}
      />
    ));

    await press(user, "{ArrowRight}");

    expect(slider().value).toBe("11");
  });

  it("calls onValueCommit with the value once a key is released, and not for a key that changed nothing", async () => {
    const onValueCommit = vi.fn();
    const { user } = await render(() => (
      <Volume defaultValue={99} onValueCommit={onValueCommit} />
    ));

    await press(user, "{ArrowRight}");
    expect(onValueCommit.mock.calls).toEqual([[100]]);

    await press(user, "{ArrowRight}{End}");
    expect(onValueCommit.mock.calls).toEqual([[100]]);
  });

  it("puts its id, aria-describedby and aria-invalid on the input, not on its own element", async () => {
    await render(() => (
      <Volume id="volume" aria-describedby="hint" aria-invalid="true" />
    ));

    expect(slider()).toHaveAttribute("id", "volume");
    expect(slider()).toHaveAttribute("aria-describedby", "hint");
    expect(slider()).toHaveAttribute("aria-invalid", "true");
    expect(root()).not.toHaveAttribute("id");
    expect(root()).not.toHaveAttribute("aria-describedby");
    expect(root()).not.toHaveAttribute("aria-invalid");
  });

  it("disabled: disables the input, with data-disabled on every part, and follows changes", async () => {
    const [disabled, setDisabled] = createSignal(true);
    await render(() => <Volume disabled={disabled()} />);

    for (const part of parts()) expect(part).toHaveAttribute("data-disabled");
    expect(slider()).toBeDisabled();

    setDisabled(false);
    flush();

    for (const part of parts())
      expect(part).not.toHaveAttribute("data-disabled");
    expect(slider()).toBeEnabled();
  });

  it("orientation: data-horizontal by default, data-vertical and aria-orientation on the input when vertical, on every part", async () => {
    const [orientation, setOrientation] = createSignal<
      "horizontal" | "vertical" | undefined
    >();
    await render(() => <Volume orientation={orientation()} />);

    for (const part of parts()) {
      expect(part).toHaveAttribute("data-horizontal");
      expect(part).not.toHaveAttribute("data-vertical");
    }
    expect(slider()).not.toHaveAttribute("aria-orientation");

    setOrientation("vertical");
    flush();

    for (const part of parts()) {
      expect(part).toHaveAttribute("data-vertical");
      expect(part).not.toHaveAttribute("data-horizontal");
    }
    expect(slider()).toHaveAttribute("aria-orientation", "vertical");
  });

  describe("form", () => {
    it("submits the value under name, and to the form named by form", async () => {
      await render(() => (
        <>
          <VolumeForm defaultValue={30} />
          <form id="other" data-testid="other" />
          <Slider.Root name="balance" form="other" defaultValue={-2} min={-5}>
            <Slider.Thumb aria-label="Balance" />
          </Slider.Root>
        </>
      ));

      expect(submitted()).toEqual([["volume", "30"]]);
      expect([...new FormData(screen.getByTestId("other"))]).toEqual([
        ["balance", "-2"],
      ]);
    });

    it("fires native input on the input for a change, and change once committed, which the form sees with the new value", async () => {
      const seen: [string, string][] = [];
      const { user } = await render(() => <VolumeForm defaultValue={30} />);
      for (const type of ["input", "change"]) {
        form().addEventListener(type, (event) => {
          if (event.target === slider())
            seen.push([type, new FormData(form()).get("volume") as string]);
        });
      }

      await press(user, "{ArrowRight>2}");
      await press(user, "{/ArrowRight}");

      expect(seen).toEqual([
        ["input", "31"],
        ["input", "32"],
        ["change", "32"],
      ]);
    });

    it("puts the input back when a controlled slider declines a change", async () => {
      const { user } = await render(() => <VolumeForm value={30} />);

      await press(user, "{ArrowRight}");

      expect(submitted()).toEqual([["volume", "30"]]);
    });

    describe("reset", () => {
      it("goes back to defaultValue, and calls onValueChange and onValueCommit", async () => {
        const onValueChange = vi.fn();
        const onValueCommit = vi.fn();
        const { user } = await render(() => (
          <VolumeForm
            defaultValue={30}
            onValueChange={onValueChange}
            onValueCommit={onValueCommit}
          />
        ));
        await press(user, "{End}");
        onValueChange.mockClear();
        onValueCommit.mockClear();

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(30);
        expect(onValueCommit).toHaveBeenCalledExactlyOnceWith(30);
        expect(submitted()).toEqual([["volume", "30"]]);
        expect(root().style.getPropertyValue("--slider")).toBe("30%");
      });

      it("goes back to the midpoint without defaultValue", async () => {
        const { user } = await render(() => <VolumeForm />);
        await press(user, "{Home}");

        await user.click(button("Reset"));
        await afterReset();

        expect(submitted()).toEqual([["volume", "50"]]);
      });

      it("calls nothing at its default already, and still holds it", async () => {
        const onValueChange = vi.fn();
        const onValueCommit = vi.fn();
        const { user } = await render(() => (
          <VolumeForm
            defaultValue={30}
            onValueChange={onValueChange}
            onValueCommit={onValueCommit}
          />
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).not.toHaveBeenCalled();
        expect(onValueCommit).not.toHaveBeenCalled();
        expect(submitted()).toEqual([["volume", "30"]]);
      });

      it("asks a controlled slider for defaultValue; declined, the input keeps the value and nothing is committed", async () => {
        const onValueChange = vi.fn();
        const onValueCommit = vi.fn();
        const { user } = await render(() => (
          <VolumeForm
            value={80}
            defaultValue={20}
            onValueChange={onValueChange}
            onValueCommit={onValueCommit}
          />
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(20);
        expect(onValueCommit).not.toHaveBeenCalled();
        expect(submitted()).toEqual([["volume", "80"]]);
      });

      it("commits a controlled slider's default once taken", async () => {
        const [value, setValue] = createSignal(80);
        const onValueCommit = vi.fn();
        const { user } = await render(() => (
          <VolumeForm
            value={value()}
            defaultValue={20}
            onValueChange={setValue}
            onValueCommit={onValueCommit}
          />
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueCommit).toHaveBeenCalledExactlyOnceWith(20);
        expect(submitted()).toEqual([["volume", "20"]]);
      });

      it("calls nothing for a reset the app cancels", async () => {
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <VolumeForm
            defaultValue={30}
            onValueChange={onValueChange}
            onFormReset={(event) => event.preventDefault()}
          />
        ));
        await press(user, "{ArrowRight}");
        onValueChange.mockClear();

        await user.click(button("Reset"));
        await afterReset();

        expect(onValueChange).not.toHaveBeenCalled();
        expect(submitted()).toEqual([["volume", "31"]]);
      });

      it("calls nothing once the reset's own handler has removed it", async () => {
        const [shown, setShown] = createSignal(true);
        const onValueChange = vi.fn();
        const { user } = await render(() => (
          <form data-testid="form" onReset={() => setShown(false)}>
            <Show when={shown()}>
              <Slider.Root value={3} onValueChange={onValueChange}>
                <Slider.Thumb aria-label="Row" />
              </Slider.Root>
            </Show>
            <button type="reset">Reset</button>
          </form>
        ));

        await user.click(button("Reset"));
        await afterReset();

        expect(screen.queryByRole("slider")).toBeNull();
        expect(onValueChange).not.toHaveBeenCalled();
      });
    });
  });
});
