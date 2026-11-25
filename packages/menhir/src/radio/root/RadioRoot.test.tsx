// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Loading, createMemo, createSignal, flush } from "solid-js";

import {
  afterFlush,
  afterReset,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { centerOf, press } from "../../../test/floating/input.ts";

import { Radio } from "../index.ts";
import type { RadioRootProps } from "./RadioRoot.tsx";

const radio = (name: string) => screen.getByRole("radio", { name });

/** An Item's hidden input, by its value. */
const hiddenInput = (value: string) =>
  document.querySelector<HTMLInputElement>(
    `input[type=radio][value="${value}"]`,
  )!;

const submitted = (form: HTMLFormElement, name = "letter") =>
  new FormData(form).getAll(name);

/** Three radios, labelled by their value. */
function Radios() {
  return (
    <>
      <label>
        <Radio.Item value="a">
          <Radio.Indicator data-testid="indicator-a" />
        </Radio.Item>
        a
      </label>
      <label>
        <Radio.Item value="b" />b
      </label>
      <label>
        <Radio.Item value="c" />c
      </label>
    </>
  );
}

describeConformance("<Radio.Root />", (props) => <Radio.Root {...props} />, {
  tagName: "FIELDSET",
});

describe("<Radio.Root />", () => {
  const { render } = createRenderer();

  describe("element", () => {
    it("renders a fieldset with role radiogroup, named by its legend", async () => {
      await render(() => (
        <Radio.Root>
          <legend>Letters</legend>
          <Radios />
        </Radio.Root>
      ));

      const group = screen.getByRole("radiogroup", { name: "Letters" });
      expect(group.tagName).toBe("FIELDSET");
      expect(group).toContainElement(radio("a"));
    });

    it("renders a div with role radiogroup, named by aria-labelledby, through render", async () => {
      await render(() => (
        <>
          <p id="letters">Letters</p>
          <Radio.Root
            render={(props) => <div {...props} />}
            aria-labelledby="letters"
          >
            <Radios />
          </Radio.Root>
        </>
      ));

      const group = screen.getByRole("radiogroup", { name: "Letters" });
      expect(group.tagName).toBe("DIV");
    });
  });

  describe("value", () => {
    it("starts at defaultValue and reports each new value", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <Radio.Root defaultValue="b" onValueChange={onValueChange}>
          <Radios />
        </Radio.Root>
      ));

      expect(radio("a")).toHaveAttribute("aria-checked", "false");
      expect(radio("b")).toHaveAttribute("aria-checked", "true");

      fireEvent.click(radio("a"));
      await afterFlush();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a");
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
      expect(radio("b")).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput("a").checked).toBe(true);
      expect(hiddenInput("b").checked).toBe(false);
    });

    it("checks none without defaultValue", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <Radio.Root onValueChange={onValueChange}>
          <Radios />
        </Radio.Root>
      ));

      for (const name of ["a", "b", "c"]) {
        expect(radio(name)).toHaveAttribute("aria-checked", "false");
      }
      fireEvent.click(radio("c"));
      await afterFlush();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("c");
    });

    it("stays put when controlled, asks with the requested value, and keeps its inputs as the value says", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form>
          <Radio.Root name="letter" value="a" onValueChange={onValueChange}>
            <Radios />
          </Radio.Root>
        </form>
      ));

      fireEvent.click(radio("b"));
      await afterFlush();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("b");
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
      expect(radio("b")).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput("a").checked).toBe(true);
      expect(hiddenInput("b").checked).toBe(false);
    });

    it("checks none while controlled with null", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <Radio.Root value={null} onValueChange={onValueChange}>
          <Radios />
        </Radio.Root>
      ));

      fireEvent.click(radio("b"));
      await afterFlush();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("b");
      expect(radio("b")).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput("b").checked).toBe(false);
    });

    it("follows a controlled value changed from outside", async () => {
      const [value, setValue] = createSignal<string | null>("a");
      await render(() => (
        <Radio.Root value={value()}>
          <Radios />
        </Radio.Root>
      ));

      setValue("c");
      flush();
      expect(radio("a")).toHaveAttribute("aria-checked", "false");
      expect(radio("c")).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput("c").checked).toBe(true);

      setValue(null);
      flush();
      expect(radio("c")).toHaveAttribute("aria-checked", "false");
    });

    it("checks before async work that onValueChange starts settles", async () => {
      const [value, setValue] = createSignal<string | null>(null);
      let resolveStatus!: (status: string) => void;
      await render(() => {
        const status = createMemo(() =>
          value() === null
            ? "none"
            : new Promise<string>((resolve) => (resolveStatus = resolve)),
        );
        return (
          <Loading fallback="loading">
            <Radio.Root onValueChange={setValue}>
              <Radios />
            </Radio.Root>
            <output>{status()}</output>
          </Loading>
        );
      });

      fireEvent.click(radio("a"));
      await afterFlush();

      expect(screen.getByRole("status")).toHaveTextContent("none");
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput("a").checked).toBe(true);

      resolveStatus("some");
      await new Promise((resolve) => setTimeout(resolve));
      flush();
      expect(screen.getByRole("status")).toHaveTextContent("some");
    });

    it("keeps a value with no Item for it, and checks none", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <Radio.Root defaultValue="z" onValueChange={onValueChange}>
          <Radios />
        </Radio.Root>
      ));

      for (const name of ["a", "b", "c"]) {
        expect(radio(name)).toHaveAttribute("aria-checked", "false");
      }
      fireEvent.click(radio("a"));
      await afterFlush();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a");
    });
  });

  describe("form", () => {
    it("submits the checked radio's value under the group's name, and nothing while none is checked", async () => {
      await render(() => (
        <form data-testid="form">
          <Radio.Root name="letter">
            <Radios />
          </Radio.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      expect([...new FormData(form).keys()]).toEqual([]);

      fireEvent.click(radio("b"));
      await afterFlush();
      expect(submitted(form)).toEqual(["b"]);

      fireEvent.click(radio("c"));
      await afterFlush();
      expect(submitted(form)).toEqual(["c"]);
    });

    it("is a radio group in the form's elements, whose value is the checked value", async () => {
      await render(() => (
        <form data-testid="form">
          <Radio.Root name="letter" defaultValue="b">
            <Radios />
          </Radio.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      const group = form.elements.namedItem("letter") as RadioNodeList;
      expect(group).toHaveLength(3);
      expect(group.value).toBe("b");

      fireEvent.click(radio("c"));
      await afterFlush();
      expect(group.value).toBe("c");
    });

    it("submits to the form named by form", async () => {
      await render(() => (
        <>
          <form id="elsewhere" data-testid="form" />
          <Radio.Root name="letter" form="elsewhere" defaultValue="b">
            <Radios />
          </Radio.Root>
        </>
      ));

      expect(submitted(screen.getByTestId("form"))).toEqual(["b"]);
    });

    it("lets the form's change listener and FormData see the new value", async () => {
      let seen: FormDataEntryValue[] | undefined;
      await render(() => (
        <form
          onChange={(event) => {
            seen = submitted(event.currentTarget);
          }}
        >
          <Radio.Root name="letter" defaultValue="a">
            <Radios />
          </Radio.Root>
        </form>
      ));

      fireEvent.click(radio("b"));
      expect(seen).toEqual(["b"]);
    });

    it("goes back to defaultValue on a form reset, and the hidden inputs with it", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <Radio.Root
            name="letter"
            defaultValue="a"
            onValueChange={onValueChange}
          >
            <Radios />
          </Radio.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      fireEvent.click(radio("c"));
      await afterFlush();
      expect(submitted(form)).toEqual(["c"]);
      onValueChange.mockClear();

      form.reset();
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a");
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
      expect(radio("c")).toHaveAttribute("aria-checked", "false");
      expect(submitted(form)).toEqual(["a"]);
    });

    it("goes back to none on a form reset without defaultValue", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <Radio.Root name="letter" onValueChange={onValueChange}>
            <Radios />
          </Radio.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      fireEvent.click(radio("c"));
      await afterFlush();
      onValueChange.mockClear();

      form.reset();
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null);
      expect(radio("c")).toHaveAttribute("aria-checked", "false");
      expect(submitted(form)).toEqual([]);
    });

    it("asks once with defaultValue on a form reset when controlled, and keeps its inputs", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <Radio.Root
            name="letter"
            value="b"
            defaultValue="a"
            onValueChange={onValueChange}
          >
            <Radios />
          </Radio.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      form.reset();
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a");
      expect(radio("b")).toHaveAttribute("aria-checked", "true");
      expect(submitted(form)).toEqual(["b"]);
    });
  });

  // A press of the user's, not a script's: the browser runs microtasks as
  // each listener of `reset` returns, before it resets the controls.
  describe.skipIf(isJSDOM)("form reset by a real press", () => {
    const resetForm = (props: RadioRootProps) => (
      <form data-testid="form">
        <Radio.Root name="letter" {...props}>
          <Radios />
        </Radio.Root>
        <button type="reset">Reset</button>
      </form>
    );
    const pressReset = () =>
      press(centerOf(screen.getByRole("button", { name: "Reset" })));

    it("goes back to defaultValue, and the form submits it", async () => {
      const onValueChange = vi.fn();
      await render(() => resetForm({ defaultValue: "a", onValueChange }));
      fireEvent.click(radio("c"));
      await afterFlush();
      onValueChange.mockClear();

      await pressReset();
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a");
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput("a").checked).toBe(true);
      expect(hiddenInput("c").checked).toBe(false);
      expect(submitted(screen.getByTestId("form"))).toEqual(["a"]);
    });

    it("keeps value when its consumer declines the reset", async () => {
      const onValueChange = vi.fn();
      await render(() =>
        resetForm({ value: "b", defaultValue: "a", onValueChange }),
      );

      await pressReset();
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a");
      expect(radio("b")).toHaveAttribute("aria-checked", "true");
      expect(submitted(screen.getByTestId("form"))).toEqual(["b"]);
    });

    it("asks for nothing for a reset a later listener cancels", async () => {
      const onValueChange = vi.fn();
      await render(() =>
        resetForm({ value: "b", defaultValue: "a", onValueChange }),
      );
      // Added after the Items' own listeners, which are added once they
      // have settled.
      screen
        .getByTestId("form")
        .addEventListener("reset", (event) => event.preventDefault());

      await pressReset();
      await afterReset();

      expect(onValueChange).not.toHaveBeenCalled();
      expect(submitted(screen.getByTestId("form"))).toEqual(["b"]);
    });
  });

  describe("disabled", () => {
    it("disables the fieldset, every radio and its hidden input", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <Radio.Root
            name="letter"
            defaultValue="a"
            disabled
            onValueChange={onValueChange}
            data-testid="root"
          >
            <Radios />
          </Radio.Root>
        </form>
      ));

      const root = screen.getByTestId("root");
      expect(root).toBeDisabled();
      expect(root).toHaveAttribute("data-disabled", "");
      for (const name of ["a", "b", "c"]) {
        expect(radio(name)).toBeDisabled();
        expect(radio(name)).toHaveAttribute("data-disabled", "");
        expect(hiddenInput(name)).toBeDisabled();
      }
      expect(screen.getByTestId("indicator-a")).toHaveAttribute(
        "data-disabled",
        "",
      );

      fireEvent.click(radio("b"));
      await afterFlush();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(submitted(screen.getByTestId("form"))).toEqual([]);
    });

    it("has no disabled attribute when not disabled", async () => {
      await render(() => (
        <Radio.Root data-testid="root">
          <Radios />
        </Radio.Root>
      ));

      expect(screen.getByTestId("root")).not.toHaveAttribute("disabled");
      expect(screen.getByTestId("root")).not.toHaveAttribute("data-disabled");
      expect(radio("a")).not.toBeDisabled();
    });

    it("follows disabled changing while rendered", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => (
        <Radio.Root disabled={disabled()}>
          <Radios />
        </Radio.Root>
      ));

      setDisabled(true);
      flush();
      expect(radio("a")).toBeDisabled();

      setDisabled(false);
      flush();
      fireEvent.click(radio("a"));
      await afterFlush();
      expect(radio("a")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("required", () => {
    it("puts aria-required and data-required on the Root, required on every hidden radio while none is checked, and neither on a radio", async () => {
      await render(() => (
        <Radio.Root name="letter" required data-testid="root">
          <Radios />
        </Radio.Root>
      ));

      const root = screen.getByTestId("root");
      expect(root).toHaveAttribute("aria-required", "true");
      expect(root).toHaveAttribute("data-required", "");
      for (const name of ["a", "b", "c"]) {
        expect(hiddenInput(name)).toBeRequired();
        expect(radio(name)).not.toHaveAttribute("aria-required");
        expect(radio(name)).not.toHaveAttribute("data-required");
      }
    });

    it("has none of them when not required, and is never invalid", async () => {
      await render(() => (
        <Radio.Root name="letter" data-testid="root">
          <Radios />
        </Radio.Root>
      ));

      expect(screen.getByTestId("root")).not.toHaveAttribute("aria-required");
      expect(screen.getByTestId("root")).not.toHaveAttribute("data-required");
      expect(hiddenInput("a")).not.toBeRequired();
      expect(hiddenInput("a").validity.valid).toBe(true);
    });

    it("blocks a submission while none is checked, and lets one through once one is", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      await render(() => (
        <form onSubmit={onSubmit}>
          <Radio.Root name="letter" required>
            <Radios />
          </Radio.Root>
          <button type="submit">Send</button>
        </form>
      ));

      expect(hiddenInput("a").validity.valueMissing).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).not.toHaveBeenCalled();

      fireEvent.click(radio("b"));
      await afterFlush();
      expect(hiddenInput("a").validity.valid).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("blocks a submission with no name on the group, which then submits nothing once checked", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      await render(() => (
        <form onSubmit={onSubmit} data-testid="form">
          <Radio.Root required>
            <Radios />
          </Radio.Root>
          <button type="submit">Send</button>
        </form>
      ));

      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).not.toHaveBeenCalled();

      fireEvent.click(radio("b"));
      await afterFlush();
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect([
        ...new FormData(screen.getByTestId<HTMLFormElement>("form")).keys(),
      ]).toEqual([]);
    });

    it.skipIf(isJSDOM)(
      "gives the browser's message for a missing selection",
      async () => {
        await render(() => (
          <Radio.Root name="letter" required>
            <Radios />
          </Radio.Root>
        ));

        expect(hiddenInput("a").validationMessage).toBe(
          "Please select one of these options.",
        );
      },
    );

    it("blocks again after a form reset to no defaultValue", async () => {
      await render(() => (
        <form data-testid="form">
          <Radio.Root name="letter" required>
            <Radios />
          </Radio.Root>
        </form>
      ));

      fireEvent.click(radio("c"));
      await afterFlush();
      expect(hiddenInput("a").validity.valid).toBe(true);

      screen.getByTestId<HTMLFormElement>("form").reset();
      await afterReset();
      expect(hiddenInput("a").validity.valueMissing).toBe(true);
    });

    it("never blocks a submission while disabled", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      await render(() => (
        <form onSubmit={onSubmit}>
          <Radio.Root name="letter" required disabled>
            <Radios />
          </Radio.Root>
          <button type="submit">Send</button>
        </form>
      ));

      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it.skipIf(isJSDOM)(
      "moves focus to the first enabled radio when the browser blocks the submission",
      async () => {
        const { user } = await render(() => (
          <form>
            <Radio.Root name="letter" required>
              <label>
                <Radio.Item value="a" disabled />a
              </label>
              <label>
                <Radio.Item value="b" />b
              </label>
            </Radio.Root>
            <button type="submit">Send</button>
          </form>
        ));

        await user.click(screen.getByRole("button", { name: "Send" }));
        expect(radio("b")).toHaveFocus();
      },
    );
  });
});
