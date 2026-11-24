// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import type { JSX } from "@solidjs/web";
import { Errored, createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Radio } from "../index.ts";

const radio = (name: string) => screen.getByRole("radio", { name });

/** An Item's hidden input, by its value. */
const hiddenInput = (value: string) =>
  document.querySelector<HTMLInputElement>(
    `input[type=radio][value="${value}"]`,
  )!;

describeConformance(
  "<Radio.Item />",
  (props) => (
    <Radio.Root>
      <Radio.Item value="a" {...props} />
    </Radio.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Radio.Item />", () => {
  const { render } = createRenderer();

  it("renders a button with role radio, inside the group", async () => {
    await render(() => (
      <Radio.Root>
        <Radio.Item value="a" aria-label="a" />
      </Radio.Root>
    ));

    expect(radio("a").tagName).toBe("BUTTON");
    expect(radio("a")).toHaveAttribute("type", "button");
    expect(screen.getByRole("radiogroup")).toContainElement(radio("a"));
  });

  it("has aria-checked true on the checked radio and false on the others", async () => {
    await render(() => (
      <Radio.Root defaultValue="b">
        <Radio.Item value="a" aria-label="a" />
        <Radio.Item value="b" aria-label="b" />
      </Radio.Root>
    ));

    expect(radio("a")).toHaveAttribute("aria-checked", "false");
    expect(radio("b")).toHaveAttribute("aria-checked", "true");
  });

  describe("hidden input", () => {
    it("is a radio, hidden from assistive technology and the tab order, with the group's name and form and its own value", async () => {
      await render(() => (
        <Radio.Root name="letter" form="elsewhere" defaultValue="a">
          <Radio.Item value="a" aria-label="a" />
          <Radio.Item value="b" aria-label="b" />
        </Radio.Root>
      ));

      const input = hiddenInput("a");
      expect(input).toHaveAttribute("aria-hidden", "true");
      expect(input).toHaveAttribute("tabindex", "-1");
      expect(input.name).toBe("letter");
      expect(input).toHaveAttribute("form", "elsewhere");
      expect(input.checked).toBe(true);
      expect(hiddenInput("b").checked).toBe(false);
      expect(radio("a")).not.toHaveAttribute("name");
      expect(radio("a")).not.toHaveAttribute("value");
    });

    it("fires native input and change events that reach the form", async () => {
      const onInput = vi.fn();
      const onChange = vi.fn();
      await render(() => (
        <form onInput={onInput} onChange={onChange}>
          <Radio.Root name="letter">
            <Radio.Item value="a" aria-label="a" />
          </Radio.Root>
        </form>
      ));

      fireEvent.click(radio("a"));

      expect(onInput).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].target).toBe(hiddenInput("a"));
    });
  });

  it("puts id on the button, and lets the consumer's attributes override its own", async () => {
    await render(() => (
      <Radio.Root>
        <Radio.Item value="a" id="first" aria-label="a" aria-checked="mixed" />
      </Radio.Root>
    ));

    expect(radio("a")).toHaveAttribute("id", "first");
    expect(radio("a")).toHaveAttribute("aria-checked", "mixed");
  });

  describe("labels", () => {
    it("is named and checked by a wrapping label", async () => {
      const { user } = await render(() => (
        <Radio.Root>
          <label data-testid="label">
            <Radio.Item value="a" />
            Apple
          </label>
        </Radio.Root>
      ));

      await user.click(screen.getByTestId("label"));
      expect(radio("Apple")).toHaveAttribute("aria-checked", "true");
    });

    it("is named and checked by a label that points at its id", async () => {
      const { user } = await render(() => (
        <Radio.Root>
          <Radio.Item value="a" id="apple" />
          <label for="apple">Apple</label>
        </Radio.Root>
      ));

      await user.click(screen.getByText("Apple"));
      expect(radio("Apple")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("checking", () => {
    it("checks on click and unchecks the one checked before", async () => {
      await render(() => (
        <Radio.Root defaultValue="a">
          <Radio.Item value="a" aria-label="a" />
          <Radio.Item value="b" aria-label="b" />
        </Radio.Root>
      ));

      fireEvent.click(radio("b"));
      await afterFlush();
      expect(radio("a")).toHaveAttribute("aria-checked", "false");
      expect(radio("b")).toHaveAttribute("aria-checked", "true");
    });

    it("changes nothing on a click on the checked radio", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <Radio.Root defaultValue="a" onValueChange={onValueChange}>
          <Radio.Item value="a" aria-label="a" />
        </Radio.Root>
      ));

      fireEvent.click(radio("a"));
      await afterFlush();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput("a").checked).toBe(true);
    });

    it("checks the focused radio with Space", async () => {
      const { user } = await render(() => (
        <Radio.Root>
          <Radio.Item value="a" aria-label="a" />
        </Radio.Root>
      ));

      await user.keyboard("[Tab]");
      expect(radio("a")).toHaveFocus();
      expect(radio("a")).toHaveAttribute("aria-checked", "false");
      await user.keyboard("[Space]");
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
    });

    it("does not check with Enter, and still calls the consumer's onKeyDown", async () => {
      const onKeyDown = vi.fn();
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Radio.Root onValueChange={onValueChange}>
          <Radio.Item value="a" aria-label="a" onKeyDown={onKeyDown} />
        </Radio.Root>
      ));

      await user.keyboard("[Tab]");
      await user.keyboard("[Enter]");
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(radio("a")).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("click events", () => {
    it("calls the consumer's onClick, and reaches ancestors once per user click", async () => {
      const onClick = vi.fn();
      const onParentClick = vi.fn();
      await render(() => (
        <div onClick={onParentClick}>
          <Radio.Root>
            <Radio.Item value="a" aria-label="a" onClick={onClick} />
          </Radio.Root>
        </div>
      ));

      fireEvent.click(radio("a"));
      await afterFlush();

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onParentClick).toHaveBeenCalledTimes(1);
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("disabled", () => {
    it("disables that radio alone, which keeps the value and is not submitted", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <form data-testid="form">
          <Radio.Root
            name="letter"
            defaultValue="a"
            onValueChange={onValueChange}
          >
            <Radio.Item value="a" aria-label="a" disabled />
            <Radio.Item value="b" aria-label="b" />
          </Radio.Root>
        </form>
      ));

      expect(radio("a")).toBeDisabled();
      expect(hiddenInput("a")).toBeDisabled();
      expect(radio("b")).not.toBeDisabled();
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
      expect(
        new FormData(screen.getByTestId<HTMLFormElement>("form")).get("letter"),
      ).toBeNull();

      await user.keyboard("[Tab]");
      expect(radio("b")).toHaveFocus();
      fireEvent.click(radio("a"));
      await afterFlush();
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("data attributes", () => {
    it("puts data-checked or data-unchecked, and data-disabled, on the radio and its Indicator, and follows them", async () => {
      const [disabled, setDisabled] = createSignal(true);
      await render(() => (
        <Radio.Root defaultValue="a">
          <Radio.Item value="a" aria-label="a" disabled={disabled()}>
            <Radio.Indicator data-testid="indicator-a" />
          </Radio.Item>
          <Radio.Item value="b" aria-label="b">
            <Radio.Indicator data-testid="indicator-b" />
          </Radio.Item>
        </Radio.Root>
      ));

      for (const element of [radio("a"), screen.getByTestId("indicator-a")]) {
        expect(element).toHaveAttribute("data-checked", "");
        expect(element).not.toHaveAttribute("data-unchecked");
        expect(element).toHaveAttribute("data-disabled", "");
      }
      for (const element of [radio("b"), screen.getByTestId("indicator-b")]) {
        expect(element).toHaveAttribute("data-unchecked", "");
        expect(element).not.toHaveAttribute("data-checked");
        expect(element).not.toHaveAttribute("data-disabled");
      }

      setDisabled(false);
      flush();
      fireEvent.click(radio("b"));
      await afterFlush();
      expect(screen.getByTestId("indicator-a")).toHaveAttribute(
        "data-unchecked",
        "",
      );
      expect(screen.getByTestId("indicator-a")).not.toHaveAttribute(
        "data-disabled",
      );
      expect(screen.getByTestId("indicator-b")).toHaveAttribute(
        "data-checked",
        "",
      );
    });
  });

  describe("render", () => {
    function Button(props: JSX.IntrinsicElements["button"]) {
      return <button data-styled="" {...props} />;
    }

    it("keeps the radio's behaviour when rendered with a button component", async () => {
      const { user } = await render(() => (
        <Radio.Root>
          <Radio.Item value="a" aria-label="a" render={Button} />
        </Radio.Root>
      ));

      expect(radio("a")).toHaveAttribute("data-styled", "");
      await user.keyboard("[Tab]");
      await user.keyboard("[Space]");
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
    });

    it("warns in development when render does not render a button", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        await render(() => (
          <Radio.Root>
            <Radio.Item value="a" render={(props) => <div {...props} />} />
          </Radio.Root>
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("Radio.Item");
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });
  });

  it("throws a descriptive error outside <Radio.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Radio.Item value="a" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Radio.Item must be placed within <Radio.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
