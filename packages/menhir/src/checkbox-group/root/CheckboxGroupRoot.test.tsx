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

import { CheckboxGroup } from "../index.ts";
import type { CheckboxGroupRootProps } from "./CheckboxGroupRoot.tsx";

const box = (name: string) => screen.getByRole("checkbox", { name });

/** The group's hidden inputs that the form submits, by value. */
const hiddenInput = (value: string) =>
  document.querySelector<HTMLInputElement>(
    `input[type=checkbox][value="${value}"]`,
  )!;

/** The hidden input that holds the group's `required`, after the group. */
const validityInput = () =>
  document.querySelector<HTMLInputElement>("fieldset + input")!;

/** Three boxes, labelled by their value. */
function Boxes() {
  return (
    <>
      <label>
        <CheckboxGroup.Item value="a">
          <CheckboxGroup.Indicator data-testid="indicator-a" />
        </CheckboxGroup.Item>
        a
      </label>
      <label>
        <CheckboxGroup.Item value="b" />b
      </label>
      <label>
        <CheckboxGroup.Item value="c" />c
      </label>
    </>
  );
}

const submitted = (form: HTMLFormElement, name = "letters") =>
  new FormData(form).getAll(name);

describeConformance(
  "<CheckboxGroup.Root />",
  (props) => <CheckboxGroup.Root {...props} />,
  { tagName: "FIELDSET" },
);

describe("<CheckboxGroup.Root />", () => {
  const { render } = createRenderer();

  describe("element", () => {
    it("renders a fieldset, a group named by its legend", async () => {
      await render(() => (
        <CheckboxGroup.Root>
          <legend>Letters</legend>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      const group = screen.getByRole("group", { name: "Letters" });
      expect(group.tagName).toBe("FIELDSET");
      expect(group).toContainElement(box("a"));
    });

    it("renders a div with role group, named by aria-labelledby, through render", async () => {
      await render(() => (
        <>
          <p id="letters">Letters</p>
          <CheckboxGroup.Root
            render={(props) => (
              <div {...props} role="group" aria-labelledby="letters" />
            )}
          >
            <Boxes />
          </CheckboxGroup.Root>
        </>
      ));

      const group = screen.getByRole("group", { name: "Letters" });
      expect(group.tagName).toBe("DIV");
      expect(group).toContainElement(box("a"));
    });
  });

  describe("value", () => {
    it("starts at defaultValue and reports each new list, a box checked added at the end", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <CheckboxGroup.Root defaultValue={["b"]} onValueChange={onValueChange}>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      expect(box("a")).toHaveAttribute("aria-checked", "false");
      expect(box("b")).toHaveAttribute("aria-checked", "true");

      fireEvent.click(box("a"));
      await afterFlush();
      expect(onValueChange).toHaveBeenLastCalledWith(["b", "a"]);
      expect(box("a")).toHaveAttribute("aria-checked", "true");

      fireEvent.click(box("b"));
      await afterFlush();
      expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
      expect(box("b")).toHaveAttribute("aria-checked", "false");
    });

    it("starts empty without defaultValue", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <CheckboxGroup.Root onValueChange={onValueChange}>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      for (const name of ["a", "b", "c"]) {
        expect(box(name)).toHaveAttribute("aria-checked", "false");
      }
      fireEvent.click(box("c"));
      await afterFlush();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["c"]);
    });

    it("stays put when controlled, and asks with the requested list", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <CheckboxGroup.Root value={["a"]} onValueChange={onValueChange}>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      fireEvent.click(box("b"));
      await afterFlush();
      expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
      expect(box("b")).toHaveAttribute("aria-checked", "false");
      expect(hiddenInput("b").checked).toBe(false);

      fireEvent.click(box("a"));
      await afterFlush();
      expect(onValueChange).toHaveBeenLastCalledWith([]);
      expect(box("a")).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput("a").checked).toBe(true);
    });

    it("follows a controlled value changed from outside", async () => {
      const [value, setValue] = createSignal(["a"]);
      await render(() => (
        <CheckboxGroup.Root value={value()}>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      setValue(["b", "c"]);
      flush();
      expect(box("a")).toHaveAttribute("aria-checked", "false");
      expect(box("b")).toHaveAttribute("aria-checked", "true");
      expect(box("c")).toHaveAttribute("aria-checked", "true");
    });

    it("builds two changes in one turn on each other", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <CheckboxGroup.Root onValueChange={onValueChange}>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      fireEvent.click(box("a"));
      fireEvent.click(box("b"));
      await afterFlush();

      expect(onValueChange).toHaveBeenLastCalledWith(["a", "b"]);
      expect(box("a")).toHaveAttribute("aria-checked", "true");
      expect(box("b")).toHaveAttribute("aria-checked", "true");
    });

    it("checks before async work that onValueChange starts settles", async () => {
      const [value, setValue] = createSignal<string[]>([]);
      let resolveStatus!: (status: string) => void;
      await render(() => {
        const status = createMemo(() =>
          value().length > 0
            ? new Promise<string>((resolve) => (resolveStatus = resolve))
            : "none",
        );
        return (
          <Loading fallback="loading">
            <CheckboxGroup.Root onValueChange={setValue}>
              <Boxes />
            </CheckboxGroup.Root>
            <output>{status()}</output>
          </Loading>
        );
      });

      fireEvent.click(box("a"));
      await afterFlush();

      expect(screen.getByRole("status")).toHaveTextContent("none");
      expect(box("a")).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput("a").checked).toBe(true);

      resolveStatus("some");
      await new Promise((resolve) => setTimeout(resolve));
      flush();
      expect(screen.getByRole("status")).toHaveTextContent("some");
    });

    it("keeps a value with no Item for it", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <CheckboxGroup.Root defaultValue={["z"]} onValueChange={onValueChange}>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      fireEvent.click(box("a"));
      await afterFlush();
      expect(onValueChange).toHaveBeenLastCalledWith(["z", "a"]);
    });
  });

  describe("form", () => {
    it("submits one entry per checked box under the group's name, in the document's order", async () => {
      await render(() => (
        <form data-testid="form">
          <CheckboxGroup.Root name="letters" defaultValue={["c", "a"]}>
            <Boxes />
          </CheckboxGroup.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      expect(submitted(form)).toEqual(["a", "c"]);

      fireEvent.click(box("a"));
      fireEvent.click(box("c"));
      await afterFlush();
      expect(submitted(form)).toEqual([]);
      // The group's own hidden input submits nothing.
      expect([...new FormData(form).keys()]).toEqual([]);
    });

    it("submits to the form named by form", async () => {
      await render(() => (
        <>
          <form id="elsewhere" data-testid="form" />
          <CheckboxGroup.Root
            name="letters"
            form="elsewhere"
            defaultValue={["b"]}
          >
            <Boxes />
          </CheckboxGroup.Root>
        </>
      ));

      expect(submitted(screen.getByTestId("form"))).toEqual(["b"]);
    });

    it("lets the form's change listener and FormData see the new value", async () => {
      let seen: FormDataEntryValue[] | undefined;
      await render(() => (
        <form
          data-testid="form"
          onChange={(event) => {
            seen = submitted(event.currentTarget);
          }}
        >
          <CheckboxGroup.Root name="letters">
            <Boxes />
          </CheckboxGroup.Root>
        </form>
      ));

      fireEvent.click(box("b"));
      expect(seen).toEqual(["b"]);
    });

    it("goes back to defaultValue on a form reset, and the hidden inputs with it", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <CheckboxGroup.Root
            name="letters"
            defaultValue={["a"]}
            onValueChange={onValueChange}
          >
            <Boxes />
          </CheckboxGroup.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      fireEvent.click(box("a"));
      fireEvent.click(box("b"));
      await afterFlush();
      expect(submitted(form)).toEqual(["b"]);
      onValueChange.mockClear();

      form.reset();
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["a"]);
      expect(box("a")).toHaveAttribute("aria-checked", "true");
      expect(box("b")).toHaveAttribute("aria-checked", "false");
      expect(submitted(form)).toEqual(["a"]);
    });

    it("asks once with defaultValue on a form reset when controlled", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <CheckboxGroup.Root
            name="letters"
            value={["b", "c"]}
            defaultValue={["a"]}
            onValueChange={onValueChange}
          >
            <Boxes />
          </CheckboxGroup.Root>
        </form>
      ));
      const form = screen.getByTestId<HTMLFormElement>("form");

      form.reset();
      await afterReset();

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["a"]);
      expect(box("b")).toHaveAttribute("aria-checked", "true");
      expect(submitted(form)).toEqual(["b", "c"]);
    });

    // A press of the user's, not a script's: the browser runs microtasks
    // as each listener of `reset` returns, before it resets the controls.
    describe.skipIf(isJSDOM)("reset by a real press", () => {
      const resetForm = (props: CheckboxGroupRootProps) => (
        <form data-testid="form">
          <CheckboxGroup.Root name="letters" {...props}>
            <Boxes />
          </CheckboxGroup.Root>
          <button type="reset">Reset</button>
        </form>
      );
      const pressReset = () =>
        press(centerOf(screen.getByRole("button", { name: "Reset" })));

      it("goes back to defaultValue, and the form submits it", async () => {
        await render(() => resetForm({ defaultValue: ["a"] }));
        fireEvent.click(box("a"));
        fireEvent.click(box("b"));
        await afterFlush();

        await pressReset();
        await afterReset();

        expect(box("a")).toHaveAttribute("aria-checked", "true");
        expect(box("b")).toHaveAttribute("aria-checked", "false");
        expect(hiddenInput("a").checked).toBe(true);
        expect(submitted(screen.getByTestId("form"))).toEqual(["a"]);
      });

      it("keeps value when its consumer declines the reset", async () => {
        const onValueChange = vi.fn();
        await render(() =>
          resetForm({ value: ["b"], defaultValue: ["a"], onValueChange }),
        );

        await pressReset();
        await afterReset();

        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["a"]);
        expect(box("b")).toHaveAttribute("aria-checked", "true");
        expect(submitted(screen.getByTestId("form"))).toEqual(["b"]);
      });

      it("asks for nothing for a reset a later listener cancels", async () => {
        const onValueChange = vi.fn();
        await render(() =>
          resetForm({ value: ["b"], defaultValue: ["a"], onValueChange }),
        );
        // Added after the group's own listener, which is added once it has
        // settled.
        screen
          .getByTestId("form")
          .addEventListener("reset", (event) => event.preventDefault());

        await pressReset();
        await afterReset();

        expect(onValueChange).not.toHaveBeenCalled();
        expect(submitted(screen.getByTestId("form"))).toEqual(["b"]);
      });
    });
  });

  describe("disabled", () => {
    it("disables the fieldset, every box and its hidden input", async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <CheckboxGroup.Root
            name="letters"
            defaultValue={["a"]}
            disabled
            onValueChange={onValueChange}
            data-testid="root"
          >
            <Boxes />
          </CheckboxGroup.Root>
        </form>
      ));

      const root = screen.getByTestId("root");
      expect(root).toBeDisabled();
      expect(root).toHaveAttribute("data-disabled", "");
      for (const name of ["a", "b", "c"]) {
        expect(box(name)).toBeDisabled();
        expect(box(name)).toHaveAttribute("data-disabled", "");
        expect(hiddenInput(name)).toBeDisabled();
      }
      expect(screen.getByTestId("indicator-a")).toHaveAttribute(
        "data-disabled",
        "",
      );

      fireEvent.click(box("b"));
      await afterFlush();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(submitted(screen.getByTestId("form"))).toEqual([]);
    });

    it("has no disabled attribute when not disabled", async () => {
      await render(() => (
        <CheckboxGroup.Root data-testid="root">
          <Boxes />
        </CheckboxGroup.Root>
      ));

      expect(screen.getByTestId("root")).not.toHaveAttribute("disabled");
      expect(screen.getByTestId("root")).not.toHaveAttribute("data-disabled");
      expect(box("a")).not.toBeDisabled();
    });

    it("follows disabled changing while rendered", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => (
        <CheckboxGroup.Root disabled={disabled()}>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      setDisabled(true);
      flush();
      expect(box("a")).toBeDisabled();

      setDisabled(false);
      flush();
      fireEvent.click(box("a"));
      await afterFlush();
      expect(box("a")).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("required", () => {
    it("blocks a submission while no box is checked, and lets one through once a box is", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      await render(() => (
        <form onSubmit={onSubmit}>
          <CheckboxGroup.Root name="letters" required data-testid="root">
            <Boxes />
          </CheckboxGroup.Root>
          <button type="submit">Send</button>
        </form>
      ));

      expect(screen.getByTestId("root")).toHaveAttribute("data-required", "");
      expect(validityInput().validity.valueMissing).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).not.toHaveBeenCalled();

      fireEvent.click(box("b"));
      await afterFlush();
      expect(validityInput().validity.valid).toBe(true);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it.skipIf(isJSDOM)(
      "gives the browser's message for a missing selection",
      async () => {
        await render(() => (
          <CheckboxGroup.Root required>
            <Boxes />
          </CheckboxGroup.Root>
        ));

        expect(validityInput().validationMessage).toBe(
          "Please select one of these options.",
        );
      },
    );

    it("validates two required groups of one form each on its own", async () => {
      await render(() => (
        <form>
          <CheckboxGroup.Root required defaultValue={["a"]}>
            <CheckboxGroup.Item value="a" aria-label="First a" />
          </CheckboxGroup.Root>
          <CheckboxGroup.Root required>
            <CheckboxGroup.Item value="a" aria-label="Second a" />
          </CheckboxGroup.Root>
        </form>
      ));

      const [first, second] =
        document.querySelectorAll<HTMLInputElement>("fieldset + input");
      expect(first!.name).not.toBe(second!.name);
      expect(first!.validity.valid).toBe(true);
      expect(second!.validity.valueMissing).toBe(true);
    });

    it("makes no box required", async () => {
      await render(() => (
        <CheckboxGroup.Root name="letters" required>
          <Boxes />
        </CheckboxGroup.Root>
      ));

      expect(box("a")).not.toHaveAttribute("aria-required");
      expect(box("a")).not.toHaveAttribute("data-required");
      expect(hiddenInput("a")).not.toBeRequired();
    });

    it("has no data-required when not required, and is never invalid", async () => {
      await render(() => (
        <CheckboxGroup.Root data-testid="root">
          <Boxes />
        </CheckboxGroup.Root>
      ));

      expect(screen.getByTestId("root")).not.toHaveAttribute("data-required");
      expect(validityInput().validity.valid).toBe(true);
    });

    it.each([
      [[], true],
      [["a"], false],
    ])(
      "blocks again after a reset to defaultValue=%j: %s",
      async (defaultValue, blocks) => {
        await render(() => (
          <form data-testid="form">
            <CheckboxGroup.Root required defaultValue={defaultValue}>
              <Boxes />
            </CheckboxGroup.Root>
          </form>
        ));

        fireEvent.click(box("c"));
        await afterFlush();
        expect(validityInput().validity.valid).toBe(true);

        screen.getByTestId<HTMLFormElement>("form").reset();
        await afterReset();
        expect(validityInput().validity.valueMissing).toBe(blocks);
      },
    );

    it("never blocks a submission while disabled", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      await render(() => (
        <form onSubmit={onSubmit}>
          <CheckboxGroup.Root required disabled>
            <Boxes />
          </CheckboxGroup.Root>
          <button type="submit">Send</button>
        </form>
      ));

      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it.skipIf(isJSDOM)(
      "moves focus to the first enabled box when the browser blocks the submission",
      async () => {
        const { user } = await render(() => (
          <form>
            <CheckboxGroup.Root required>
              <label>
                <CheckboxGroup.Item value="a" disabled />a
              </label>
              <label>
                <CheckboxGroup.Item value="b" />b
              </label>
            </CheckboxGroup.Root>
            <button type="submit">Send</button>
          </form>
        ));

        await user.click(screen.getByRole("button", { name: "Send" }));
        expect(box("b")).toHaveFocus();
      },
    );
  });
});
