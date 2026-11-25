// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Errored, createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Slider } from "../index.ts";

const slider = () => screen.getByRole<HTMLInputElement>("slider");

describeConformance(
  "<Slider.Thumb />",
  (props) => (
    <Slider.Root>
      <Slider.Track>
        <Slider.Thumb aria-label="Volume" {...props} />
      </Slider.Track>
    </Slider.Root>
  ),
  { tagName: "DIV" },
);

describe("<Slider.Thumb />", () => {
  const { render } = createRenderer();

  it("renders a div with a visually hidden range input inside, before its children", async () => {
    await render(() => (
      <Slider.Root>
        <Slider.Track>
          <Slider.Thumb data-testid="thumb" aria-label="Volume">
            <span data-testid="grip" />
          </Slider.Thumb>
        </Slider.Track>
      </Slider.Root>
    ));

    const thumb = screen.getByTestId("thumb");
    expect(thumb.tagName).toBe("DIV");
    expect(thumb.firstElementChild).toBe(slider());
    expect(slider()).toHaveAttribute("type", "range");
    expect(slider().nextElementSibling).toBe(screen.getByTestId("grip"));
    expect(slider().style.position).toBe("absolute");
    expect(slider().style.clipPath).toBe("inset(50%)");
  });

  it("gives the input the Root's value, min, max and step, defaults 0, 100 and 1, and writes no aria-valuemin or aria-valuemax", async () => {
    await render(() => (
      <>
        <Slider.Root defaultValue={1969} min={1900} max={2025} step={1}>
          <Slider.Thumb aria-label="Year" />
        </Slider.Root>
        <Slider.Root>
          <Slider.Thumb aria-label="Volume" />
        </Slider.Root>
      </>
    ));
    const year = screen.getByRole<HTMLInputElement>("slider", { name: "Year" });
    const volume = screen.getByRole<HTMLInputElement>("slider", {
      name: "Volume",
    });

    expect(year.value).toBe("1969");
    expect(year).toHaveAttribute("min", "1900");
    expect(year).toHaveAttribute("max", "2025");
    expect(year).toHaveAttribute("step", "1");
    expect(year).not.toHaveAttribute("aria-valuemin");
    expect(year).not.toHaveAttribute("aria-valuemax");
    expect(year).not.toHaveAttribute("aria-valuenow");
    expect(volume.value).toBe("50");
    expect(volume.min).toBe("");
    expect(volume.max).toBe("");
  });

  it("gives aria-valuetext the value in format and locale, the value itself by default, and follows changes", async () => {
    const [value, setValue] = createSignal(1969);
    await render(() => (
      <>
        <Slider.Root value={value()} min={1900} max={3000} locale="en-US">
          <Slider.Thumb aria-label="Plain" />
        </Slider.Root>
        <Slider.Root
          value={value()}
          min={1900}
          max={3000}
          format={{ useGrouping: false }}
        >
          <Slider.Thumb aria-label="Year" />
        </Slider.Root>
        <Slider.Root
          defaultValue={0.25}
          max={1}
          step={0.05}
          format={{ style: "percent" }}
          locale="de-DE"
        >
          <Slider.Thumb aria-label="Opacity" />
        </Slider.Root>
      </>
    ));
    const named = (name: string) => screen.getByRole("slider", { name });

    expect(named("Plain")).toHaveAttribute("aria-valuetext", "1,969");
    expect(named("Year")).toHaveAttribute("aria-valuetext", "1969");
    expect(named("Opacity")).toHaveAttribute("aria-valuetext", "25 %");

    setValue(2001);
    flush();
    expect(named("Plain")).toHaveAttribute("aria-valuetext", "2,001");
  });

  it("gives aria-valuetext the text a format function returns", async () => {
    const months = ["January", "February", "March"];
    await render(() => (
      <Slider.Root defaultValue={1} max={2} format={(value) => months[value]!}>
        <Slider.Thumb aria-label="Month" />
      </Slider.Root>
    ));

    expect(slider()).toHaveAttribute("aria-valuetext", "February");
  });

  it("is named by a label for the Root's id, by its aria-label and by its aria-labelledby", async () => {
    await render(() => (
      <>
        <label for="volume">Volume</label>
        <Slider.Root id="volume">
          <Slider.Thumb />
        </Slider.Root>
        <Slider.Root>
          <Slider.Thumb aria-label="Balance" />
        </Slider.Root>
        <span id="bass">Bass</span>
        <Slider.Root>
          <Slider.Thumb aria-labelledby="bass" data-testid="bass" />
        </Slider.Root>
      </>
    ));

    expect(screen.getByRole("slider", { name: "Volume" })).toHaveAttribute(
      "id",
      "volume",
    );
    expect(screen.getByRole("slider", { name: "Balance" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Bass" })).toBeTruthy();
    expect(screen.getByTestId("bass")).not.toHaveAttribute("aria-labelledby");
  });

  it("puts its aria-describedby on the input", async () => {
    await render(() => (
      <>
        <Slider.Root>
          <Slider.Thumb
            aria-label="Volume"
            aria-describedby="hint"
            data-testid="thumb"
          />
        </Slider.Root>
        <p id="hint">Loud</p>
      </>
    ));

    expect(slider()).toHaveAccessibleDescription("Loud");
    expect(screen.getByTestId("thumb")).not.toHaveAttribute("aria-describedby");
  });

  it("runs the consumer's onKeyDown, for a key from its input", async () => {
    const onKeyDown = vi.fn();
    await render(() => (
      <Slider.Root defaultValue={50}>
        <Slider.Thumb aria-label="Volume" onKeyDown={onKeyDown} />
      </Slider.Root>
    ));

    fireEvent.keyDown(slider(), { key: "ArrowRight" });
    await afterFlush();

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(slider().value).toBe("51");
  });

  it("takes a change the input makes itself, as assistive technology makes one, and commits it on the input's change", async () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    await render(() => (
      <Slider.Root
        defaultValue={50}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        data-testid="root"
      >
        <Slider.Thumb aria-label="Volume" />
      </Slider.Root>
    ));

    slider().value = "60";
    fireEvent.input(slider());
    await afterFlush();
    expect(onValueChange.mock.calls).toEqual([[60]]);
    expect(onValueCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId("root").style.getPropertyValue("--slider")).toBe(
      "60%",
    );

    fireEvent.change(slider());
    await afterFlush();
    expect(onValueCommit.mock.calls).toEqual([[60]]);
  });

  it("throws a descriptive error outside <Slider.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Slider.Thumb />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Slider parts must be placed within <Slider.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
