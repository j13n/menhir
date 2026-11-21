// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { createSignal, flush } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Meter } from "../index.ts";

describeConformance(
  "<Meter.Root />",
  (props) => <Meter.Root value={40} aria-label="Battery" {...props} />,
  { tagName: "DIV" },
);

describe("<Meter.Root />", () => {
  const { render } = createRenderer();

  it("renders a div with role meter", async () => {
    await render(() => <Meter.Root value={40} aria-label="Battery" />);

    expect(screen.getByRole("meter").tagName).toBe("DIV");
  });

  describe("range", () => {
    it("runs from 0 to 100 by default", async () => {
      await render(() => <Meter.Root value={40} aria-label="Battery" />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemin", "0");
      expect(meter).toHaveAttribute("aria-valuemax", "100");
    });

    it("takes min and max", async () => {
      await render(() => (
        <Meter.Root value={40} min={20} max={80} aria-label="Battery" />
      ));

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuemin", "20");
      expect(meter).toHaveAttribute("aria-valuemax", "80");
    });

    it("puts the value in aria-valuenow", async () => {
      await render(() => <Meter.Root value={40} aria-label="Battery" />);

      expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "40");
    });

    it("takes a decimal value", async () => {
      await render(() => <Meter.Root value={33.3} aria-label="Battery" />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuenow", "33.3");
      expect(meter.style.getPropertyValue("--meter")).toBe("33.3%");
    });

    it.each([
      [-10, "0", "0%"],
      [120, "100", "100%"],
    ])("clamps %d to the range", async (value, clamped, percentage) => {
      await render(() => <Meter.Root value={value} aria-label="Battery" />);

      const meter = screen.getByRole("meter");
      expect(meter).toHaveAttribute("aria-valuenow", clamped);
      expect(meter).toHaveAttribute("aria-valuetext", percentage);
      expect(meter.style.getPropertyValue("--meter")).toBe(percentage);
    });
  });

  describe("text", () => {
    const valueText = () =>
      screen.getByRole("meter").getAttribute("aria-valuetext");

    it("is the percentage of the range by default", async () => {
      await render(() => (
        <Meter.Root value={50} max={200} aria-label="Battery" />
      ));

      expect(valueText()).toBe("25%");
    });

    it("formats the percentage with a percent format's options", async () => {
      await render(() => (
        <Meter.Root
          value={1}
          max={3}
          format={{ style: "percent", maximumFractionDigits: 1 }}
          aria-label="Battery"
        />
      ));

      expect(valueText()).toBe("33.3%");
    });

    it("formats the value itself with another style", async () => {
      await render(() => (
        <Meter.Root
          value={120}
          max={500}
          format={{ style: "unit", unit: "gigabyte" }}
          aria-label="Storage"
        />
      ));

      expect(valueText()).toBe("120 GB");
    });

    it("formats in the given locale", async () => {
      await render(() => (
        <Meter.Root
          value={1234.5}
          max={2000}
          format={{ style: "decimal" }}
          locale="de-DE"
          aria-label="Storage"
        />
      ));

      expect(valueText()).toBe("1.234,5");
    });

    it("lets the consumer's aria-valuetext replace its own", async () => {
      await render(() => (
        <Meter.Root
          value={50}
          aria-valuetext="50% (6 hours) remaining"
          aria-label="Battery"
        />
      ));

      expect(valueText()).toBe("50% (6 hours) remaining");
    });
  });

  it("sets --meter to the percentage of the range", async () => {
    await render(() => (
      <Meter.Root value={50} min={25} max={125} aria-label="Battery" />
    ));

    expect(screen.getByRole("meter").style.getPropertyValue("--meter")).toBe(
      "25%",
    );
  });

  it("follows value, min and max changing while rendered", async () => {
    const [value, setValue] = createSignal(40);
    const [max, setMax] = createSignal(100);
    const [min, setMin] = createSignal(0);
    await render(() => (
      <Meter.Root
        value={value()}
        min={min()}
        max={max()}
        aria-label="Battery"
      />
    ));

    const meter = screen.getByRole("meter");
    setValue(60);
    flush();
    expect(meter).toHaveAttribute("aria-valuenow", "60");
    expect(meter).toHaveAttribute("aria-valuetext", "60%");
    expect(meter.style.getPropertyValue("--meter")).toBe("60%");

    setMax(200);
    flush();
    expect(meter).toHaveAttribute("aria-valuemax", "200");
    expect(meter).toHaveAttribute("aria-valuetext", "30%");
    expect(meter.style.getPropertyValue("--meter")).toBe("30%");

    setMin(100);
    flush();
    expect(meter).toHaveAttribute("aria-valuemin", "100");
    // 60 is now below the range, so it is clamped to its start.
    expect(meter).toHaveAttribute("aria-valuenow", "100");
    expect(meter).toHaveAttribute("aria-valuetext", "0%");
    expect(meter.style.getPropertyValue("--meter")).toBe("0%");
  });

  describe("names", () => {
    it("is named by aria-label", async () => {
      await render(() => <Meter.Root value={40} aria-label="Battery" />);

      expect(
        screen.getByRole("meter", { name: "Battery" }),
      ).toBeInTheDocument();
    });

    it("is named by aria-labelledby, by an element inside it", async () => {
      await render(() => (
        <Meter.Root value={40} aria-labelledby="battery-label">
          <span id="battery-label">Battery level</span>
        </Meter.Root>
      ));

      expect(
        screen.getByRole("meter", { name: "Battery level" }),
      ).toBeInTheDocument();
    });
  });

  it("is not focusable: Tab moves past it", async () => {
    const { user } = await render(() => (
      <>
        <button type="button">Before</button>
        <Meter.Root value={40} aria-label="Battery" />
        <button type="button">After</button>
      </>
    ));

    await user.keyboard("[Tab]");
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
    await user.keyboard("[Tab]");
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(screen.getByRole("meter")).not.toHaveAttribute("tabindex");
  });
});
