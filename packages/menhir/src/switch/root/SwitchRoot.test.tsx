// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import type { JSX } from "@solidjs/web";
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

import { Switch } from "../index.ts";
import type { SwitchRootProps } from "./SwitchRoot.tsx";

describeConformance("<Switch.Root />", (props) => <Switch.Root {...props} />, {
  tagName: "BUTTON",
});

describe("<Switch.Root />", () => {
  const { render } = createRenderer();

  it("renders a button with role switch", async () => {
    await render(() => <Switch.Root />);

    const switchEl = screen.getByRole("switch");
    expect(switchEl.tagName).toBe("BUTTON");
    expect(switchEl).toHaveAttribute("type", "button");
  });

  it("is off by default", async () => {
    await render(() => <Switch.Root />);

    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("can be on by default", async () => {
    await render(() => <Switch.Root defaultChecked />);

    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("toggles on click and reports each new value", async () => {
    const onCheckedChange = vi.fn();
    await render(() => <Switch.Root onCheckedChange={onCheckedChange} />);

    const switchEl = screen.getByRole("switch");
    expect(onCheckedChange).not.toHaveBeenCalled();

    fireEvent.click(switchEl);
    await afterFlush();
    expect(switchEl).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(switchEl);
    await afterFlush();
    expect(switchEl).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles off when on by default", async () => {
    const onCheckedChange = vi.fn();
    await render(() => (
      <Switch.Root defaultChecked onCheckedChange={onCheckedChange} />
    ));

    const switchEl = screen.getByRole("switch");
    fireEvent.click(switchEl);
    await afterFlush();

    expect(switchEl).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it.each([true, false])(
    "stays put when controlled (checked=%s) and asks for the change",
    async (checked) => {
      const onCheckedChange = vi.fn();
      await render(() => (
        <Switch.Root checked={checked} onCheckedChange={onCheckedChange} />
      ));

      const switchEl = screen.getByRole("switch");
      const input = screen.getByRole<HTMLInputElement>("checkbox", {
        hidden: true,
      });
      fireEvent.click(switchEl);
      await afterFlush();

      expect(onCheckedChange).toHaveBeenCalledWith(!checked);
      expect(switchEl).toHaveAttribute("aria-checked", String(checked));
      expect(input.checked).toBe(checked);
    },
  );

  it("follows a controlled value changed from outside", async () => {
    const [checked, setChecked] = createSignal(false);
    await render(() => <Switch.Root checked={checked()} />);

    const switchEl = screen.getByRole("switch");
    setChecked(true);
    flush();
    expect(switchEl).toHaveAttribute("aria-checked", "true");

    setChecked(false);
    flush();
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  it("turns on before async work that onCheckedChange starts settles", async () => {
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
          <Switch.Root onCheckedChange={(checked) => setOn(checked)} />
          <output>{status()}</output>
        </Loading>
      );
    });

    const switchEl = screen.getByRole("switch");
    const input = screen.getByRole<HTMLInputElement>("checkbox", {
      hidden: true,
    });
    fireEvent.click(switchEl);
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("off");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
    expect(input.checked).toBe(true);

    resolveStatus("on");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("on");
  });

  it.each([{ key: "Enter" }, { key: "Space" }])(
    "focuses with Tab and toggles with $key",
    async ({ key }) => {
      const { user } = await render(() => <Switch.Root />);

      const switchEl = screen.getByRole("switch");
      await user.keyboard("[Tab]");
      expect(switchEl).toHaveFocus();

      await user.keyboard(`[${key}]`);
      expect(switchEl).toHaveAttribute("aria-checked", "true");

      await user.keyboard(`[${key}]`);
      expect(switchEl).toHaveAttribute("aria-checked", "false");
    },
  );

  it("lets the consumer's attributes override its own", async () => {
    await render(() => <Switch.Root role="checkbox" />);

    expect(screen.getByRole("checkbox")).toHaveAttribute("type", "button");
  });

  describe("labels", () => {
    it("is named and toggled by a wrapping label", async () => {
      const { user } = await render(() => (
        <label data-testid="label">
          <Switch.Root />
          Wi-Fi
        </label>
      ));

      const switchEl = screen.getByRole("switch", { name: "Wi-Fi" });
      await user.click(screen.getByTestId("label"));

      expect(switchEl).toHaveAttribute("aria-checked", "true");
    });

    it("is named and toggled by a label that points at its id", async () => {
      const { user } = await render(() => (
        <>
          <label for="wifi">Wi-Fi</label>
          <Switch.Root id="wifi" />
        </>
      ));

      const switchEl = screen.getByRole("switch", { name: "Wi-Fi" });
      expect(switchEl).toHaveAttribute("id", "wifi");
      await user.click(screen.getByText("Wi-Fi"));

      expect(switchEl).toHaveAttribute("aria-checked", "true");
    });

    it.each([
      ["aria-label", "Wi-Fi"],
      ["aria-labelledby", "wifi-label"],
      ["aria-describedby", "wifi-description"],
      ["aria-errormessage", "wifi-error"],
    ])("passes %s through", async (name, value) => {
      await render(() => <Switch.Root {...{ [name]: value }} />);

      expect(screen.getByRole("switch")).toHaveAttribute(name, value);
    });
  });

  describe("disabled", () => {
    it("disables the button and the input natively", async () => {
      await render(() => <Switch.Root disabled />);

      expect(screen.getByRole("switch")).toBeDisabled();
      expect(screen.getByRole("checkbox", { hidden: true })).toBeDisabled();
    });

    it("has no disabled attribute when not disabled", async () => {
      await render(() => <Switch.Root />);

      expect(screen.getByRole("switch")).not.toHaveAttribute("disabled");
      expect(
        screen.getByRole("checkbox", { hidden: true }),
      ).not.toHaveAttribute("disabled");
    });

    it("follows disabled changing while rendered", async () => {
      const [disabled, setDisabled] = createSignal(false);
      await render(() => <Switch.Root disabled={disabled()} />);

      const switchEl = screen.getByRole("switch");
      const input = screen.getByRole("checkbox", { hidden: true });
      setDisabled(true);
      flush();
      expect(switchEl).toBeDisabled();
      expect(input).toBeDisabled();
      fireEvent.click(switchEl);
      await afterFlush();
      expect(switchEl).toHaveAttribute("aria-checked", "false");

      setDisabled(false);
      flush();
      fireEvent.click(switchEl);
      await afterFlush();
      expect(switchEl).toHaveAttribute("aria-checked", "true");
    });

    it("cannot be focused or toggled", async () => {
      const onCheckedChange = vi.fn();
      const { user } = await render(() => (
        <Switch.Root disabled onCheckedChange={onCheckedChange} />
      ));

      const switchEl = screen.getByRole("switch");
      await user.keyboard("[Tab]");
      expect(switchEl).not.toHaveFocus();

      await user.click(switchEl);
      fireEvent.click(switchEl);
      await afterFlush();

      expect(switchEl).toHaveAttribute("aria-checked", "false");
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("readOnly", () => {
    it("sets aria-readonly", async () => {
      await render(() => <Switch.Root readOnly />);

      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-readonly",
        "true",
      );
    });

    it("has no aria-readonly when not read-only", async () => {
      await render(() => <Switch.Root />);

      expect(screen.getByRole("switch")).not.toHaveAttribute("aria-readonly");
    });

    it("can be focused but not toggled by click, key, label or the input", async () => {
      const onCheckedChange = vi.fn();
      const { user } = await render(() => (
        <label data-testid="label">
          <Switch.Root
            readOnly
            defaultChecked
            onCheckedChange={onCheckedChange}
          />
          Wi-Fi
        </label>
      ));

      const switchEl = screen.getByRole("switch");
      await user.keyboard("[Tab]");
      expect(switchEl).toHaveFocus();
      await user.keyboard("[Space]");
      await user.click(switchEl);
      await user.click(screen.getByTestId("label"));
      screen.getByRole("checkbox", { hidden: true }).click();
      await afterFlush();

      expect(switchEl).toHaveAttribute("aria-checked", "true");
      expect(
        screen.getByRole<HTMLInputElement>("checkbox", { hidden: true })
          .checked,
      ).toBe(true);
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("required", () => {
    it("sets aria-required on the button and required on the input", async () => {
      await render(() => <Switch.Root required />);

      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-required",
        "true",
      );
      expect(screen.getByRole("checkbox", { hidden: true })).toBeRequired();
    });

    it("sets neither when not required", async () => {
      await render(() => <Switch.Root />);

      expect(screen.getByRole("switch")).not.toHaveAttribute("aria-required");
      expect(screen.getByRole("checkbox", { hidden: true })).not.toBeRequired();
    });
  });

  it("puts its state in data attributes on the root and the thumb", async () => {
    const [locked, setLocked] = createSignal(true);
    await render(() => (
      <Switch.Root
        defaultChecked
        disabled={locked()}
        readOnly={locked()}
        required={locked()}
      >
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>
    ));

    const switchEl = screen.getByRole("switch");
    const thumb = screen.getByTestId("thumb");
    for (const element of [switchEl, thumb]) {
      expect(element).toHaveAttribute("data-checked", "");
      expect(element).not.toHaveAttribute("data-unchecked");
      expect(element).toHaveAttribute("data-disabled", "");
      expect(element).toHaveAttribute("data-readonly", "");
      expect(element).toHaveAttribute("data-required", "");
    }

    setLocked(false);
    flush();
    fireEvent.click(switchEl);
    await afterFlush();

    for (const element of [switchEl, thumb]) {
      expect(element).toHaveAttribute("data-unchecked", "");
      expect(element).not.toHaveAttribute("data-checked");
      expect(element).not.toHaveAttribute("data-disabled");
      expect(element).not.toHaveAttribute("data-readonly");
      expect(element).not.toHaveAttribute("data-required");
    }
  });

  describe("hidden input", () => {
    it("is a checkbox, hidden from assistive technology and the tab order", async () => {
      await render(() => <Switch.Root />);

      const input = screen.getByRole("checkbox", { hidden: true });
      expect(input).toHaveAttribute("type", "checkbox");
      expect(input).toHaveAttribute("aria-hidden", "true");
      expect(input).toHaveAttribute("tabindex", "-1");
    });

    it("mirrors the state", async () => {
      await render(() => <Switch.Root />);

      const switchEl = screen.getByRole("switch");
      const input = screen.getByRole<HTMLInputElement>("checkbox", {
        hidden: true,
      });
      expect(input.checked).toBe(false);

      fireEvent.click(switchEl);
      await afterFlush();
      expect(input.checked).toBe(true);
    });

    it("takes name and value, which the button does not get", async () => {
      await render(() => <Switch.Root name="wifi" value="1" />);

      const switchEl = screen.getByRole("switch");
      const input = screen.getByRole("checkbox", { hidden: true });
      expect(input).toHaveAttribute("name", "wifi");
      expect(input).toHaveAttribute("value", "1");
      expect(switchEl).not.toHaveAttribute("name");
      expect(switchEl).not.toHaveAttribute("value");
    });

    it("has no value attribute by default, so the browser submits 'on'", async () => {
      await render(() => <Switch.Root />);

      const input = screen.getByRole<HTMLInputElement>("checkbox", {
        hidden: true,
      });
      expect(input).not.toHaveAttribute("value");
      expect(input.value).toBe("on");
    });

    it("toggles the switch when clicked", async () => {
      const onCheckedChange = vi.fn();
      await render(() => <Switch.Root onCheckedChange={onCheckedChange} />);

      screen.getByRole("checkbox", { hidden: true }).click();
      await afterFlush();

      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("ignores a click canceled before the switch handles it", async () => {
      const onCheckedChange = vi.fn();
      await render(() => <Switch.Root onCheckedChange={onCheckedChange} />);

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      event.preventDefault();
      fireEvent(screen.getByRole("checkbox", { hidden: true }), event);
      await afterFlush();

      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });

    it("fires native input and change events that reach the form", async () => {
      const onInput = vi.fn();
      const onChange = vi.fn();
      await render(() => (
        <form onInput={onInput} onChange={onChange}>
          <Switch.Root name="wifi" />
        </form>
      ));

      fireEvent.click(screen.getByRole("switch"));

      expect(onInput).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].target).toBe(
        screen.getByRole("checkbox", { hidden: true }),
      );
    });

    it("has the new value by the time the form's listeners run", async () => {
      const seen: unknown[] = [];
      await render(() => (
        <form
          onChange={(event) =>
            seen.push(
              (event.target as HTMLInputElement).checked,
              new FormData(event.currentTarget).get("wifi"),
            )
          }
        >
          <Switch.Root name="wifi" />
        </form>
      ));

      fireEvent.click(screen.getByRole("switch"));

      expect(seen).toEqual([true, "on"]);
    });
  });

  describe("click events", () => {
    it("calls the consumer's onClick", async () => {
      const onClick = vi.fn();
      await render(() => <Switch.Root onClick={onClick} />);

      fireEvent.click(screen.getByRole("switch"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("reaches ancestors once per user click", async () => {
      const onParentClick = vi.fn();
      await render(() => (
        <div onClick={onParentClick}>
          <Switch.Root />
        </div>
      ));

      fireEvent.click(screen.getByRole("switch"));
      await afterFlush();

      expect(onParentClick).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("still toggles when the consumer stops propagation", async () => {
      const onParentClick = vi.fn();
      await render(() => (
        <div onClick={onParentClick}>
          <Switch.Root onClick={(event) => event.stopPropagation()} />
        </div>
      ));

      fireEvent.click(screen.getByRole("switch"));
      await afterFlush();

      expect(onParentClick).not.toHaveBeenCalled();
      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });
  });

  describe("render and element props", () => {
    function Button(props: JSX.IntrinsicElements["button"]) {
      return <button data-styled="" {...props} />;
    }

    it("keeps the switch's behaviour when rendered with a button component", async () => {
      const { user } = await render(() => <Switch.Root render={Button} />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveAttribute("data-styled", "");
      await user.keyboard("[Tab]");
      await user.keyboard("[Space]");
      expect(switchEl).toHaveAttribute("aria-checked", "true");
    });

    it("warns in development when render does not render a button", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        await render(() => (
          <Switch.Root render={(props) => <div {...props} />} />
        ));

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain("<button>");
      } finally {
        warn.mockRestore();
      }
    });

    it("does not warn when render renders a button", async () => {
      const warn = vi.spyOn(console, "warn");
      try {
        await render(() => <Switch.Root render={Button} />);

        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });

    it("tolerates a ref that clicks before the hidden input exists", async () => {
      await render(() => (
        <Switch.Root
          // Not focus(): user-event patches it, and its patch throws for an
          // element that is not in a document yet.
          ref={(element) => element.click()}
        />
      ));

      expect(screen.getByRole("switch")).toHaveAttribute(
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

    it("submits 'on' while on and nothing while off, as a checkbox does", async () => {
      const { user } = await render(() => (
        <form data-testid="form">
          <Switch.Root name="wifi" />
        </form>
      ));

      const form = screen.getByTestId<HTMLFormElement>("form");
      expect(submitted(form, "wifi")).toEqual([]);

      await user.click(screen.getByRole("switch"));
      expect(submitted(form, "wifi")).toEqual(["on"]);
    });

    it("submits a custom value", async () => {
      await render(() => (
        <form data-testid="form">
          <Switch.Root name="wifi" value="yes" defaultChecked />
        </form>
      ));

      expect(submitted(screen.getByTestId("form"), "wifi")).toEqual(["yes"]);
    });

    it("submits to the form named by `form`", async () => {
      await render(() => (
        <>
          <form id="settings" data-testid="form" />
          <Switch.Root name="wifi" form="settings" defaultChecked />
        </>
      ));

      expect(submitted(screen.getByTestId("form"), "wifi")).toEqual(["on"]);
      expect(screen.getByRole("switch")).not.toHaveAttribute("form");
    });

    it("submits nothing while disabled", async () => {
      await render(() => (
        <form data-testid="form">
          <Switch.Root name="wifi" defaultChecked disabled />
        </form>
      ));

      expect(submitted(screen.getByTestId("form"), "wifi")).toEqual([]);
    });

    it("goes back to defaultChecked when the form is reset", async () => {
      const onCheckedChange = vi.fn();
      const { user } = await render(() => (
        <form data-testid="form">
          <Switch.Root
            name="wifi"
            defaultChecked
            onCheckedChange={onCheckedChange}
          />
        </form>
      ));

      const switchEl = screen.getByRole("switch");
      await user.click(switchEl);
      expect(switchEl).toHaveAttribute("aria-checked", "false");

      screen.getByTestId<HTMLFormElement>("form").reset();
      await afterReset();

      expect(switchEl).toHaveAttribute("aria-checked", "true");
      expect(onCheckedChange).toHaveBeenLastCalledWith(true);
      expect(
        screen.getByRole<HTMLInputElement>("checkbox", { hidden: true })
          .checked,
      ).toBe(true);
    });

    it("asks for defaultChecked when a controlled switch's form is reset", async () => {
      const onCheckedChange = vi.fn();
      await render(() => (
        <form data-testid="form">
          <Switch.Root checked onCheckedChange={onCheckedChange} />
        </form>
      ));

      screen.getByTestId<HTMLFormElement>("form").reset();
      await afterReset();

      expect(onCheckedChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(
        screen.getByRole<HTMLInputElement>("checkbox", { hidden: true })
          .checked,
      ).toBe(true);
    });

    // A press of the user's, not a script's: the browser runs microtasks
    // as each listener of `reset` returns, before it resets the controls.
    describe.skipIf(isJSDOM)("reset by a real press", () => {
      const resetForm = (props: SwitchRootProps) => (
        <form data-testid="form">
          <Switch.Root name="wifi" {...props} />
          <button type="reset">Reset</button>
        </form>
      );
      const hiddenInput = () =>
        screen.getByRole<HTMLInputElement>("checkbox", { hidden: true });
      const pressReset = () =>
        press(centerOf(screen.getByRole("button", { name: "Reset" })));

      it("goes back to defaultChecked, and the form submits it", async () => {
        const { user } = await render(() =>
          resetForm({ defaultChecked: true }),
        );
        await user.click(screen.getByRole("switch"));
        await afterFlush();

        await pressReset();
        await afterReset();

        expect(screen.getByRole("switch")).toHaveAttribute(
          "aria-checked",
          "true",
        );
        expect(hiddenInput().checked).toBe(true);
        expect(submitted(screen.getByTestId("form"), "wifi")).toEqual(["on"]);
      });

      it("keeps checked when its consumer declines the reset", async () => {
        await render(() => resetForm({ checked: true }));

        await pressReset();
        await afterReset();

        expect(screen.getByRole("switch")).toHaveAttribute(
          "aria-checked",
          "true",
        );
        expect(hiddenInput().checked).toBe(true);
      });

      it("asks for nothing for a reset a later listener cancels", async () => {
        const onCheckedChange = vi.fn();
        await render(() => resetForm({ checked: true, onCheckedChange }));
        // Added after the switch's own listener, which is added once it
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

    it("blocks submission while required and off", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      const { user } = await render(() => (
        <form onSubmit={onSubmit}>
          <Switch.Root name="terms" required />
          <button type="submit">Submit</button>
        </form>
      ));

      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).not.toHaveBeenCalled();

      await user.click(screen.getByRole("switch"));
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    // jsdom blocks the submission but does not focus the invalid control.
    it.skipIf(isJSDOM)(
      "moves focus to the switch when the browser blocks the submission",
      async () => {
        const { user } = await render(() => (
          <form>
            <Switch.Root name="terms" required />
            <button type="submit">Submit</button>
          </form>
        ));

        await user.click(screen.getByRole("button", { name: "Submit" }));
        expect(screen.getByRole("switch")).toHaveFocus();
      },
    );
  });
});
