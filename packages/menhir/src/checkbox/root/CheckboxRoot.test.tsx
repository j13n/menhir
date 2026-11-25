// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import type { JSX } from "@solidjs/web";
import { For, Loading, createMemo, createSignal, flush } from "solid-js";

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

import { Checkbox } from "../index.ts";
import type { CheckboxRootProps } from "./CheckboxRoot.tsx";

// The hidden input. Not found by role: it is a checkbox too, and the
// button is the one assistive technology sees.
function hiddenInput() {
  return document.querySelector<HTMLInputElement>("input[type=checkbox]")!;
}

describeConformance(
  "<Checkbox.Root />",
  (props) => <Checkbox.Root {...props} />,
  { tagName: "BUTTON" },
);

describe("<Checkbox.Root />", () => {
  const { render } = createRenderer();

  it("renders a button with role checkbox", async () => {
    await render(() => <Checkbox.Root />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.tagName).toBe("BUTTON");
    expect(checkbox).toHaveAttribute("type", "button");
  });

  it("is unchecked by default", async () => {
    await render(() => <Checkbox.Root />);

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("can be checked by default", async () => {
    await render(() => <Checkbox.Root defaultChecked />);

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("toggles on click and reports each new value", async () => {
    const onCheckedChange = vi.fn();
    await render(() => <Checkbox.Root onCheckedChange={onCheckedChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(onCheckedChange).not.toHaveBeenCalled();

    fireEvent.click(checkbox);
    await afterFlush();
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(checkbox);
    await afterFlush();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles off when checked by default", async () => {
    const onCheckedChange = vi.fn();
    await render(() => (
      <Checkbox.Root defaultChecked onCheckedChange={onCheckedChange} />
    ));

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    await afterFlush();

    expect(checkbox).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it.each([true, false])(
    "stays put when controlled (checked=%s) and asks for the change",
    async (checked) => {
      const onCheckedChange = vi.fn();
      await render(() => (
        <Checkbox.Root checked={checked} onCheckedChange={onCheckedChange} />
      ));

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      await afterFlush();

      expect(onCheckedChange).toHaveBeenCalledWith(!checked);
      expect(checkbox).toHaveAttribute("aria-checked", String(checked));
      expect(hiddenInput().checked).toBe(checked);
    },
  );

  it("follows a controlled value changed from outside", async () => {
    const [checked, setChecked] = createSignal(false);
    await render(() => <Checkbox.Root checked={checked()} />);

    const checkbox = screen.getByRole("checkbox");
    setChecked(true);
    flush();
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    setChecked(false);
    flush();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("checks before async work that onCheckedChange starts settles", async () => {
    const [on, setOn] = createSignal(false);
    let resolveStatus!: (status: string) => void;
    await render(() => {
      const status = createMemo(() =>
        on()
          ? new Promise<string>((resolve) => (resolveStatus = resolve))
          : "off",
      );
      return (
        <Loading fallback="loading">
          <Checkbox.Root onCheckedChange={(checked) => setOn(checked)} />
          <output>{status()}</output>
        </Loading>
      );
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("off");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(hiddenInput().checked).toBe(true);

    resolveStatus("on");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("on");
  });

  describe("indeterminate", () => {
    it.each([true, false])(
      "is mixed whatever checked is (checked=%s)",
      async (checked) => {
        await render(() => <Checkbox.Root checked={checked} indeterminate />);

        expect(screen.getByRole("checkbox")).toHaveAttribute(
          "aria-checked",
          "mixed",
        );
      },
    );

    it("follows indeterminate changing while rendered", async () => {
      const [indeterminate, setIndeterminate] = createSignal(true);
      await render(() => (
        <Checkbox.Root defaultChecked indeterminate={indeterminate()} />
      ));

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "mixed");

      setIndeterminate(false);
      flush();
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it.each([
      [false, true],
      [true, false],
    ])(
      "asks for the opposite of checked when clicked (checked=%s)",
      async (checked, requested) => {
        const onCheckedChange = vi.fn();
        await render(() => (
          <Checkbox.Root
            checked={checked}
            indeterminate
            onCheckedChange={onCheckedChange}
          />
        ));

        fireEvent.click(screen.getByRole("checkbox"));
        await afterFlush();

        expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(requested);
      },
    );

    it("checks every child of a group when its mixed parent is checked, and unchecks them all when it is unchecked", async () => {
      const [options, setOptions] = createSignal([true, false]);
      const { user } = await render(() => {
        const all = () => options().every(Boolean);
        const some = () => options().some(Boolean);
        return (
          <fieldset>
            <legend>Install</legend>
            <label>
              <Checkbox.Root
                checked={all()}
                indeterminate={some() && !all()}
                onCheckedChange={(checked) =>
                  setOptions((current) => current.map(() => checked))
                }
              />
              All
            </label>
            <For each={options()}>
              {(option, index) => (
                <label>
                  <Checkbox.Root
                    checked={option}
                    onCheckedChange={(checked) =>
                      setOptions((current) =>
                        current.map((value, i) =>
                          i === index() ? checked : value,
                        ),
                      )
                    }
                  />
                  {`Option ${index() + 1}`}
                </label>
              )}
            </For>
          </fieldset>
        );
      });

      const parent = screen.getByRole("checkbox", { name: "All" });
      expect(parent).toHaveAttribute("aria-checked", "mixed");

      await user.click(parent);
      expect(parent).toHaveAttribute("aria-checked", "true");
      for (const name of ["Option 1", "Option 2"]) {
        expect(screen.getByRole("checkbox", { name })).toHaveAttribute(
          "aria-checked",
          "true",
        );
      }

      await user.click(parent);
      expect(parent).toHaveAttribute("aria-checked", "false");
      for (const name of ["Option 1", "Option 2"]) {
        expect(screen.getByRole("checkbox", { name })).toHaveAttribute(
          "aria-checked",
          "false",
        );
      }

      await user.click(screen.getByRole("checkbox", { name: "Option 2" }));
      expect(parent).toHaveAttribute("aria-checked", "mixed");
    });
  });

  describe("keyboard", () => {
    it("focuses with Tab and toggles with Space", async () => {
      const { user } = await render(() => <Checkbox.Root />);

      const checkbox = screen.getByRole("checkbox");
      await user.keyboard("[Tab]");
      expect(checkbox).toHaveFocus();

      await user.keyboard("[Space]");
      expect(checkbox).toHaveAttribute("aria-checked", "true");

      await user.keyboard("[Space]");
      expect(checkbox).toHaveAttribute("aria-checked", "false");
    });

    it("does not toggle with Enter, and still calls the consumer's onKeyDown", async () => {
      const onCheckedChange = vi.fn();
      const onKeyDown = vi.fn();
      const { user } = await render(() => (
        <Checkbox.Root
          onCheckedChange={onCheckedChange}
          onKeyDown={onKeyDown}
        />
      ));

      const checkbox = screen.getByRole("checkbox");
      await user.keyboard("[Tab]");
      await user.keyboard("[Enter]");
      await afterFlush();

      expect(checkbox).toHaveAttribute("aria-checked", "false");
      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  it("lets the consumer's attributes override its own", async () => {
    await render(() => <Checkbox.Root role="switch" />);

    expect(screen.getByRole("switch")).toHaveAttribute("type", "button");
  });

  describe("labels", () => {
    it("is named and toggled by a wrapping label", async () => {
      const { user } = await render(() => (
        <label data-testid="label">
          <Checkbox.Root />
          Accept terms
        </label>
      ));

      const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
      await user.click(screen.getByTestId("label"));

      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("is named and toggled by a label that points at its id", async () => {
      const { user } = await render(() => (
        <>
          <label for="terms">Accept terms</label>
          <Checkbox.Root id="terms" />
        </>
      ));

      const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
      expect(checkbox).toHaveAttribute("id", "terms");
      await user.click(screen.getByText("Accept terms"));

      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it.each([
      ["aria-label", "Accept terms"],
      ["aria-labelledby", "terms-label"],
      ["aria-describedby", "terms-description"],
      ["aria-errormessage", "terms-error"],
    ])("passes %s through", async (name, value) => {
      await render(() => <Checkbox.Root {...{ [name]: value }} />);

      expect(screen.getByRole("checkbox")).toHaveAttribute(name, value);
    });
  });

  describe("disabled", () => {
    it("disables the button and the input natively", async () => {
      await render(() => <Checkbox.Root disabled />);

      expect(screen.getByRole("checkbox")).toBeDisabled();
      expect(hiddenInput()).toBeDisabled();
    });

    it("has no disabled attribute when not disabled", async () => {
      await render(() => <Checkbox.Root />);

      expect(screen.getByRole("checkbox")).not.toHaveAttribute("disabled");
      expect(hiddenInput()).not.toHaveAttribute("disabled");
    });

    it("follows disabled changing while rendered", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => <Checkbox.Root disabled={disabled()} />);

      const checkbox = screen.getByRole("checkbox");
      setDisabled(true);
      flush();
      expect(checkbox).toBeDisabled();
      expect(hiddenInput()).toBeDisabled();
      fireEvent.click(checkbox);
      await afterFlush();
      expect(checkbox).toHaveAttribute("aria-checked", "false");

      setDisabled(false);
      flush();
      fireEvent.click(checkbox);
      await afterFlush();
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("cannot be focused or toggled", async () => {
      const onCheckedChange = vi.fn();
      const { user } = await render(() => (
        <Checkbox.Root disabled onCheckedChange={onCheckedChange} />
      ));

      const checkbox = screen.getByRole("checkbox");
      await user.keyboard("[Tab]");
      expect(checkbox).not.toHaveFocus();

      await user.click(checkbox);
      fireEvent.click(checkbox);
      await afterFlush();

      expect(checkbox).toHaveAttribute("aria-checked", "false");
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("readOnly", () => {
    it("sets aria-readonly", async () => {
      await render(() => <Checkbox.Root readOnly />);

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-readonly",
        "true",
      );
    });

    it("has no aria-readonly when not read-only", async () => {
      await render(() => <Checkbox.Root />);

      expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-readonly");
    });

    it("can be focused but not toggled by click, key, label or the input", async () => {
      const onCheckedChange = vi.fn();
      const { user } = await render(() => (
        <label data-testid="label">
          <Checkbox.Root
            readOnly
            defaultChecked
            onCheckedChange={onCheckedChange}
          />
          Accept terms
        </label>
      ));

      const checkbox = screen.getByRole("checkbox");
      await user.keyboard("[Tab]");
      expect(checkbox).toHaveFocus();
      await user.keyboard("[Space]");
      await user.click(checkbox);
      await user.click(screen.getByTestId("label"));
      hiddenInput().click();
      await afterFlush();

      expect(checkbox).toHaveAttribute("aria-checked", "true");
      expect(hiddenInput().checked).toBe(true);
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("required", () => {
    it("sets aria-required on the button and required on the input", async () => {
      await render(() => <Checkbox.Root required />);

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-required",
        "true",
      );
      expect(hiddenInput()).toBeRequired();
    });

    it("sets neither when not required", async () => {
      await render(() => <Checkbox.Root />);

      expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-required");
      expect(hiddenInput()).not.toBeRequired();
    });
  });

  describe("hidden input", () => {
    it("is a checkbox, hidden from assistive technology and the tab order", async () => {
      await render(() => <Checkbox.Root />);

      const input = hiddenInput();
      expect(input).toHaveAttribute("aria-hidden", "true");
      expect(input).toHaveAttribute("tabindex", "-1");
      expect(screen.getAllByRole("checkbox")).toEqual([
        screen.getByRole("checkbox"),
      ]);
      expect(screen.getByRole("checkbox")).not.toBe(input);
    });

    it("mirrors checked", async () => {
      await render(() => <Checkbox.Root />);

      expect(hiddenInput().checked).toBe(false);

      fireEvent.click(screen.getByRole("checkbox"));
      await afterFlush();
      expect(hiddenInput().checked).toBe(true);
    });

    it("takes name and value, which the button does not get", async () => {
      await render(() => <Checkbox.Root name="terms" value="1" />);

      const checkbox = screen.getByRole("checkbox");
      expect(hiddenInput()).toHaveAttribute("name", "terms");
      expect(hiddenInput()).toHaveAttribute("value", "1");
      expect(checkbox).not.toHaveAttribute("name");
      expect(checkbox).not.toHaveAttribute("value");
    });

    it("has no value attribute by default, so the browser submits 'on'", async () => {
      await render(() => <Checkbox.Root />);

      expect(hiddenInput()).not.toHaveAttribute("value");
      expect(hiddenInput().value).toBe("on");
    });

    it("toggles the checkbox when clicked", async () => {
      const onCheckedChange = vi.fn();
      await render(() => <Checkbox.Root onCheckedChange={onCheckedChange} />);

      hiddenInput().click();
      await afterFlush();

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("ignores a click canceled before the checkbox handles it", async () => {
      const onCheckedChange = vi.fn();
      await render(() => <Checkbox.Root onCheckedChange={onCheckedChange} />);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      event.preventDefault();
      fireEvent(hiddenInput(), event);
      await afterFlush();

      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });

    it("fires native input and change events that reach the form", async () => {
      const onInput = vi.fn();
      const onChange = vi.fn();
      await render(() => (
        <form onInput={onInput} onChange={onChange}>
          <Checkbox.Root name="terms" />
        </form>
      ));

      fireEvent.click(screen.getByRole("checkbox"));

      expect(onInput).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].target).toBe(hiddenInput());
    });

    it("has the new value by the time the form's listeners run", async () => {
      const seen: unknown[] = [];
      await render(() => (
        <form
          onChange={(event) =>
            seen.push(
              (event.target as HTMLInputElement).checked,
              new FormData(event.currentTarget).get("terms"),
            )
          }
        >
          <Checkbox.Root name="terms" />
        </form>
      ));

      fireEvent.click(screen.getByRole("checkbox"));

      expect(seen).toEqual([true, "on"]);
    });
  });

  describe("click events", () => {
    it("calls the consumer's onClick", async () => {
      const onClick = vi.fn();
      await render(() => <Checkbox.Root onClick={onClick} />);

      fireEvent.click(screen.getByRole("checkbox"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("reaches ancestors once per user click", async () => {
      const onParentClick = vi.fn();
      await render(() => (
        <div onClick={onParentClick}>
          <Checkbox.Root />
        </div>
      ));

      fireEvent.click(screen.getByRole("checkbox"));
      await afterFlush();

      expect(onParentClick).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("still toggles when the consumer stops propagation", async () => {
      const onParentClick = vi.fn();
      await render(() => (
        <div onClick={onParentClick}>
          <Checkbox.Root onClick={(event) => event.stopPropagation()} />
        </div>
      ));

      fireEvent.click(screen.getByRole("checkbox"));
      await afterFlush();

      expect(onParentClick).not.toHaveBeenCalled();
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("tolerates a ref that clicks before the hidden input exists", async () => {
      await render(() => (
        <Checkbox.Root
          // Not focus(): user-event patches it, and its patch throws for an
          // element that is not in a document yet.
          ref={(element) => element.click()}
        />
      ));

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });
  });

  describe("form", () => {
    // What the form would submit for `name`, read on submit.
    function submitted(form: HTMLFormElement, name: string) {
      return new FormData(form).getAll(name);
    }

    it("submits 'on' while checked and nothing while unchecked, as a native checkbox does", async () => {
      const { user } = await render(() => (
        <form data-testid="form">
          <Checkbox.Root name="terms" />
        </form>
      ));

      const form = screen.getByTestId<HTMLFormElement>("form");
      expect(submitted(form, "terms")).toEqual([]);

      await user.click(screen.getByRole("checkbox"));
      expect(submitted(form, "terms")).toEqual(["on"]);
    });

    it.each([
      [true, ["on"]],
      [false, []],
    ])(
      "submits a mixed checkbox by checked (checked=%s)",
      async (checked, expected) => {
        await render(() => (
          <form data-testid="form">
            <Checkbox.Root name="all" checked={checked} indeterminate />
          </form>
        ));

        expect(submitted(screen.getByTestId("form"), "all")).toEqual(expected);
      },
    );

    it("submits a custom value", async () => {
      await render(() => (
        <form data-testid="form">
          <Checkbox.Root name="terms" value="yes" defaultChecked />
        </form>
      ));

      expect(submitted(screen.getByTestId("form"), "terms")).toEqual(["yes"]);
    });

    it("submits to the form named by `form`", async () => {
      await render(() => (
        <>
          <form id="signup" data-testid="form" />
          <Checkbox.Root name="terms" form="signup" defaultChecked />
        </>
      ));

      expect(submitted(screen.getByTestId("form"), "terms")).toEqual(["on"]);
      expect(screen.getByRole("checkbox")).not.toHaveAttribute("form");
    });

    it("submits nothing while disabled", async () => {
      await render(() => (
        <form data-testid="form">
          <Checkbox.Root name="terms" defaultChecked disabled />
        </form>
      ));

      expect(submitted(screen.getByTestId("form"), "terms")).toEqual([]);
    });

    it("goes back to defaultChecked when the form is reset", async () => {
      const onCheckedChange = vi.fn();
      const { user } = await render(() => (
        <form data-testid="form">
          <Checkbox.Root
            name="terms"
            defaultChecked
            onCheckedChange={onCheckedChange}
          />
        </form>
      ));

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      expect(checkbox).toHaveAttribute("aria-checked", "false");

      screen.getByTestId<HTMLFormElement>("form").reset();
      await afterReset();

      expect(checkbox).toHaveAttribute("aria-checked", "true");
      expect(onCheckedChange).toHaveBeenLastCalledWith(true);
      expect(hiddenInput().checked).toBe(true);
    });

    it("asks for defaultChecked when a controlled checkbox's form is reset", async () => {
      const onCheckedChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <Checkbox.Root checked onCheckedChange={onCheckedChange} />
        </form>
      ));

      screen.getByTestId<HTMLFormElement>("form").reset();
      await afterReset();

      expect(onCheckedChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(hiddenInput().checked).toBe(true);
    });

    // A press of the user's, not a script's: the browser runs microtasks
    // as each listener of `reset` returns, before it resets the controls.
    describe.skipIf(isJSDOM)("reset by a real press", () => {
      const resetForm = (props: CheckboxRootProps) => (
        <form data-testid="form">
          <Checkbox.Root name="terms" {...props} />
          <button type="reset">Reset</button>
        </form>
      );
      const pressReset = () =>
        press(centerOf(screen.getByRole("button", { name: "Reset" })));

      it("goes back to defaultChecked, and the form submits it", async () => {
        const { user } = await render(() =>
          resetForm({ defaultChecked: true }),
        );
        await user.click(screen.getByRole("checkbox"));
        await afterFlush();

        await pressReset();
        await afterReset();

        expect(screen.getByRole("checkbox")).toHaveAttribute(
          "aria-checked",
          "true",
        );
        expect(hiddenInput().checked).toBe(true);
        expect(submitted(screen.getByTestId("form"), "terms")).toEqual(["on"]);
      });

      it("keeps checked when its consumer declines the reset", async () => {
        await render(() => resetForm({ checked: true }));

        await pressReset();
        await afterReset();

        expect(screen.getByRole("checkbox")).toHaveAttribute(
          "aria-checked",
          "true",
        );
        expect(hiddenInput().checked).toBe(true);
      });

      it("asks for nothing for a reset a later listener cancels", async () => {
        const onCheckedChange = vi.fn();
        await render(() => resetForm({ checked: true, onCheckedChange }));
        // Added after the checkbox's own listener, which is added once it
        // has settled.
        screen
          .getByTestId("form")
          .addEventListener("reset", (event) => event.preventDefault());

        await pressReset();
        await afterReset();

        expect(onCheckedChange).not.toHaveBeenCalled();
        expect(hiddenInput().checked).toBe(true);
      });
    });

    it("blocks submission while required and unchecked", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      const { user } = await render(() => (
        <form onSubmit={onSubmit}>
          <Checkbox.Root name="terms" required />
          <button type="submit">Submit</button>
        </form>
      ));

      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).not.toHaveBeenCalled();

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    // jsdom blocks the submission but does not focus the invalid control.
    it.skipIf(isJSDOM)(
      "moves focus to the checkbox when the browser blocks the submission",
      async () => {
        const { user } = await render(() => (
          <form>
            <Checkbox.Root name="terms" required />
            <button type="submit">Submit</button>
          </form>
        ));

        await user.click(screen.getByRole("button", { name: "Submit" }));
        expect(screen.getByRole("checkbox")).toHaveFocus();
      },
    );
  });

  describe("render and element props", () => {
    function Button(props: JSX.IntrinsicElements["button"]) {
      return <button data-styled="" {...props} />;
    }

    it("keeps the checkbox's behaviour when rendered with a button component", async () => {
      const { user } = await render(() => <Checkbox.Root render={Button} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-styled", "");
      await user.keyboard("[Tab]");
      await user.keyboard("[Space]");
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("warns in development when render does not render a button", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        await render(() => (
          <Checkbox.Root render={(props) => <div {...props} />} />
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("Checkbox.Root");
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });

    it("does not warn when render renders a button", async () => {
      const warn = vi.spyOn(console, "warn");
      try {
        await render(() => <Checkbox.Root render={Button} />);

        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe("data attributes", () => {
    // The state attributes of each element, in a fixed order.
    const state = (element: HTMLElement) =>
      ["data-checked", "data-unchecked", "data-indeterminate"].filter((name) =>
        element.hasAttribute(name),
      );

    it("puts exactly one of checked, unchecked and indeterminate on the root and the indicator", async () => {
      const [indeterminate, setIndeterminate] = createSignal(false);
      await render(() => (
        <Checkbox.Root indeterminate={indeterminate()}>
          <Checkbox.Indicator data-testid="indicator" />
        </Checkbox.Root>
      ));

      const checkbox = screen.getByRole("checkbox");
      const elements = [checkbox, screen.getByTestId("indicator")];
      for (const element of elements) {
        expect(state(element)).toEqual(["data-unchecked"]);
        expect(element.getAttribute("data-unchecked")).toBe("");
      }

      fireEvent.click(checkbox);
      await afterFlush();
      for (const element of elements) {
        expect(state(element)).toEqual(["data-checked"]);
        expect(element.getAttribute("data-checked")).toBe("");
      }

      setIndeterminate(true);
      flush();
      for (const element of elements) {
        expect(state(element)).toEqual(["data-indeterminate"]);
        expect(element.getAttribute("data-indeterminate")).toBe("");
      }
    });

    it("puts disabled, readonly and required on the root and the indicator, and follows them", async () => {
      const [locked, setLocked] = createSignal(true);
      await render(() => (
        <Checkbox.Root
          disabled={locked()}
          readOnly={locked()}
          required={locked()}
        >
          <Checkbox.Indicator data-testid="indicator" />
        </Checkbox.Root>
      ));

      const elements = [
        screen.getByRole("checkbox"),
        screen.getByTestId("indicator"),
      ];
      for (const element of elements) {
        expect(element).toHaveAttribute("data-disabled", "");
        expect(element).toHaveAttribute("data-readonly", "");
        expect(element).toHaveAttribute("data-required", "");
      }

      setLocked(false);
      flush();
      for (const element of elements) {
        expect(element).not.toHaveAttribute("data-disabled");
        expect(element).not.toHaveAttribute("data-readonly");
        expect(element).not.toHaveAttribute("data-required");
      }
    });
  });
});
