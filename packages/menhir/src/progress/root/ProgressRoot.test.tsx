// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { createSignal, flush } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Progress } from "../index.ts";

describeConformance(
  "<Progress.Root />",
  (props) => <Progress.Root value={40} aria-label="Upload" {...props} />,
  { tagName: "DIV" },
);

describe("<Progress.Root />", () => {
  const { render } = createRenderer();

  it("renders a div with role progressbar", async () => {
    await render(() => <Progress.Root value={40} aria-label="Upload" />);

    expect(screen.getByRole("progressbar").tagName).toBe("DIV");
  });

  describe("range", () => {
    it("runs from 0 to 100 by default", async () => {
      await render(() => <Progress.Root value={40} aria-label="Upload" />);

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    });

    it("takes min and max", async () => {
      await render(() => (
        <Progress.Root value={40} min={20} max={80} aria-label="Upload" />
      ));

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuemin", "20");
      expect(progressbar).toHaveAttribute("aria-valuemax", "80");
    });

    it("puts the value in aria-valuenow", async () => {
      await render(() => <Progress.Root value={40} aria-label="Upload" />);

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "40",
      );
    });

    it.each([
      [-10, "0"],
      [120, "100"],
    ])("clamps %d to the range", async (value, clamped) => {
      await render(() => <Progress.Root value={value} aria-label="Upload" />);

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        clamped,
      );
    });
  });

  describe("text", () => {
    const valueText = () =>
      screen.getByRole("progressbar").getAttribute("aria-valuetext");

    it("is the percentage of the range by default", async () => {
      await render(() => (
        <Progress.Root value={50} max={200} aria-label="Upload" />
      ));

      expect(valueText()).toBe("25%");
    });

    it("is the percentage of the clamped value", async () => {
      await render(() => <Progress.Root value={120} aria-label="Upload" />);

      expect(valueText()).toBe("100%");
    });

    it("formats the percentage with a percent format's options", async () => {
      await render(() => (
        <Progress.Root
          value={1}
          max={3}
          format={{ style: "percent", maximumFractionDigits: 1 }}
          aria-label="Upload"
        />
      ));

      expect(valueText()).toBe("33.3%");
    });

    it("formats the value itself with another style", async () => {
      await render(() => (
        <Progress.Root
          value={42}
          max={200}
          format={{ style: "unit", unit: "megabyte" }}
          aria-label="Upload"
        />
      ));

      expect(valueText()).toBe("42 MB");
    });

    it("formats in the given locale", async () => {
      await render(() => (
        <Progress.Root
          value={1234.5}
          max={2000}
          format={{ style: "decimal" }}
          locale="de-DE"
          aria-label="Upload"
        />
      ));

      expect(valueText()).toBe("1.234,5");
    });

    it("lets the consumer's aria-valuetext replace its own", async () => {
      await render(() => (
        <Progress.Root
          value={3}
          max={10}
          aria-valuetext="3 of 10 files"
          aria-label="Upload"
        />
      ));

      expect(valueText()).toBe("3 of 10 files");
    });
  });

  it("is indeterminate while the value is null", async () => {
    await render(() => <Progress.Root value={null} aria-label="Upload" />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).not.toHaveAttribute("aria-valuenow");
    expect(progressbar).not.toHaveAttribute("aria-valuetext");
    expect(progressbar.style.getPropertyValue("--progress")).toBe("");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("puts its state in data attributes, exactly one of them", async () => {
    await render(() => (
      <>
        <Progress.Root data-testid="indeterminate" value={null} />
        <Progress.Root data-testid="progressing" value={40} />
        <Progress.Root data-testid="complete" value={100} />
      </>
    ));

    const states = ["indeterminate", "progressing", "complete"];
    for (const state of states) {
      const progressbar = screen.getByTestId(state);
      for (const other of states) {
        if (other === state) {
          expect(progressbar).toHaveAttribute(`data-${other}`, "");
        } else {
          expect(progressbar).not.toHaveAttribute(`data-${other}`);
        }
      }
    }
  });

  it("sets --progress to the percentage of the range", async () => {
    await render(() => (
      <Progress.Root value={50} min={25} max={125} aria-label="Upload" />
    ));

    expect(
      screen.getByRole("progressbar").style.getPropertyValue("--progress"),
    ).toBe("25%");
  });

  it("follows value changing while rendered", async () => {
    const [value, setValue] = createSignal<number | null>(40);
    await render(() => <Progress.Root value={value()} aria-label="Upload" />);

    const progressbar = screen.getByRole("progressbar");
    setValue(100);
    flush();
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    expect(progressbar).toHaveAttribute("aria-valuetext", "100%");
    expect(progressbar.style.getPropertyValue("--progress")).toBe("100%");
    expect(progressbar).toHaveAttribute("data-complete", "");
    expect(progressbar).not.toHaveAttribute("data-progressing");

    setValue(null);
    flush();
    expect(progressbar).not.toHaveAttribute("aria-valuenow");
    expect(progressbar).not.toHaveAttribute("aria-valuetext");
    expect(progressbar.style.getPropertyValue("--progress")).toBe("");
    expect(progressbar).toHaveAttribute("data-indeterminate", "");
    expect(progressbar).not.toHaveAttribute("data-complete");

    setValue(10);
    flush();
    expect(progressbar).toHaveAttribute("aria-valuenow", "10");
    expect(progressbar).toHaveAttribute("aria-valuetext", "10%");
    expect(progressbar.style.getPropertyValue("--progress")).toBe("10%");
    expect(progressbar).toHaveAttribute("data-progressing", "");
    expect(progressbar).not.toHaveAttribute("data-indeterminate");
  });

  describe("names", () => {
    it("is named by aria-label", async () => {
      await render(() => <Progress.Root value={40} aria-label="Upload" />);

      expect(
        screen.getByRole("progressbar", { name: "Upload" }),
      ).toBeInTheDocument();
    });

    it("is named by aria-labelledby, by an element inside it", async () => {
      await render(() => (
        <Progress.Root value={40} aria-labelledby="upload-label">
          <span id="upload-label">Uploading photos</span>
        </Progress.Root>
      ));

      expect(
        screen.getByRole("progressbar", { name: "Uploading photos" }),
      ).toBeInTheDocument();
    });
  });

  it("is not focusable: Tab moves past it", async () => {
    const { user } = await render(() => (
      <>
        <button type="button">Before</button>
        <Progress.Root value={40} aria-label="Upload" />
        <button type="button">After</button>
      </>
    ));

    await user.keyboard("[Tab]");
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
    await user.keyboard("[Tab]");
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("tabindex");
  });
});
