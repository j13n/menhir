// The test list and the cases left out are in ../README.md.
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  keyboard,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/select/Fruit.tsx";
import {
  active,
  popup,
  selected,
  shown,
  trigger,
} from "../../../test/select/queries.ts";
import { Select } from "../index.ts";

describeConformance(
  "<Select.Trigger />",
  (props) => (
    <Select.Root>
      <Select.Trigger {...props} />
    </Select.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Select.Trigger />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a button of type button with the combobox role, aria-haspopup listbox, popovertarget and aria-controls naming the Popup", async () => {
    await render(() => <Fruit />);

    expect(trigger().tagName).toBe("BUTTON");
    expect(trigger()).toHaveAttribute("type", "button");
    expect(trigger()).toHaveAttribute("aria-haspopup", "listbox");
    expect(popup().id).not.toBe("");
    expect(trigger()).toHaveAttribute("popovertarget", popup().id);
    expect(trigger()).toHaveAttribute("aria-controls", popup().id);
  });

  it("has aria-expanded false while closed and true while open", async () => {
    const { user } = await render(() => <Fruit />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger());
    await afterFlush();

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("takes the consumer's id, and a label for it names it", async () => {
    await render(() => <Fruit />);

    expect(trigger().id).toBe("fruit");
    expect(trigger()).toHaveAccessibleName("Fruit");
    expect(popup()).toHaveAttribute("aria-labelledby", "fruit");
  });

  it("is named by a label around it", async () => {
    await render(() => (
      <label>
        Colour
        <Select.Root>
          <Select.Trigger />
        </Select.Root>
      </label>
    ));

    expect(trigger()).toHaveAccessibleName("Colour");
    // A generated id, which labels the Popup.
    expect(trigger().id).not.toBe("");
  });

  it("names the active item in aria-activedescendant while open, and none while closed", async () => {
    const { user } = await render(() => <Fruit />);
    expect(trigger()).not.toHaveAttribute("aria-activedescendant");

    await user.click(trigger());
    await vi.waitFor(() => expect(active()).toBe("Apple"));

    await user.click(trigger());
    await afterFlush();
    expect(trigger()).not.toHaveAttribute("aria-activedescendant");
  });

  it("names the active item as the list opens, with no value relayed through an effect", async () => {
    await render(() => <Fruit defaultValue="banana" />);

    // With attribution, which follows each re-run to its cause: Solid then
    // reports a value an effect relays once it has repeated
    // (EFFECT_RELAY_TEAR), where the Trigger would run twice per opening.
    const { artifact } = await captureArtifact(
      async () => {
        for (let opening = 0; opening < 3; opening++) {
          fireEvent.click(trigger());
          await afterFlush();
          expect(trigger()).toHaveAttribute("aria-expanded", "true");
          expect(active()).toBe("Banana");

          fireEvent.click(trigger());
          await afterFlush();
          expect(trigger()).not.toHaveAttribute("aria-activedescendant");
        }
      },
      { attribution: true },
    );

    expectNoDiagnostics(artifact);
  });

  it("names no item while a controlled Select refuses to open", async () => {
    const { user } = await render(() => <Fruit open={false} />);
    trigger().focus();

    await user.keyboard("c");
    await afterFlush();

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).not.toHaveAttribute("aria-activedescendant");
    expect(document.querySelector("[data-active]")).toBeNull();
  });

  it("keeps focus while the list is open and the keys move", async () => {
    const { user } = await render(() => <Fruit />);
    trigger().focus();

    await user.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(active()).toBe("Apple"));
    await user.keyboard("{ArrowDown}");

    expect(active()).toBe("Banana");
    expect(document.activeElement).toBe(trigger());
  });

  it.each([
    ["Down Arrow", "{ArrowDown}"],
    ["Alt+Down Arrow", "{Alt>}{ArrowDown}{/Alt}"],
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])(
    "opens on %s on the selected item, and changes no value",
    async (_name, keys) => {
      const onOpenChange = vi.fn();
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Fruit
          defaultValue="banana"
          onOpenChange={onOpenChange}
          onValueChange={onValueChange}
        />
      ));
      trigger().focus();

      await user.keyboard(keys);
      await afterFlush();

      expect(shown()).toBe(true);
      await vi.waitFor(() => expect(active()).toBe("Banana"));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true, {
        reason: "trigger-press",
        event: expect.any(KeyboardEvent),
      });
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  it("opens on the first item when none is selected", async () => {
    const { user } = await render(() => <Fruit />);
    trigger().focus();

    await user.keyboard("{Enter}");

    await vi.waitFor(() => expect(active()).toBe("Apple"));
  });

  it.each([
    ["Up Arrow", "{ArrowUp}", "Apple"],
    ["Home", "{Home}", "Apple"],
    ["End", "{End}", "Cherry"],
  ])("opens on %s on the first or last item", async (_name, keys, label) => {
    const { user } = await render(() => <Fruit defaultValue="banana" />);
    trigger().focus();

    await user.keyboard(keys);
    await afterFlush();

    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(active()).toBe(label));
    expect(selected()).toEqual(["Banana"]);
  });

  it("opens on a printable character on the first item that matches, and changes no value", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Fruit defaultValue="apple" onValueChange={onValueChange} />
    ));
    trigger().focus();

    await user.keyboard("c");
    await afterFlush();

    expect(shown()).toBe(true);
    await vi.waitFor(() => expect(active()).toBe("Cherry"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(selected()).toEqual(["Apple"]);
  });

  it.skipIf(isJSDOM)(
    "opens once and selects once on real Enter and Space",
    async () => {
      const onOpenChange = vi.fn();
      const onValueChange = vi.fn();
      await render(() => (
        <Fruit onOpenChange={onOpenChange} onValueChange={onValueChange} />
      ));
      trigger().focus();

      for (const [key, value] of [
        ["{Enter}", "banana"],
        [" ", "cherry"],
      ] as const) {
        onOpenChange.mockClear();
        await keyboard(key);
        await nextTask();
        expect(shown()).toBe(true);
        expect(onOpenChange).toHaveBeenCalledTimes(1);

        await keyboard("{ArrowDown}");
        await keyboard(key);
        await nextTask();
        expect(shown()).toBe(false);
        expect(onOpenChange).toHaveBeenCalledTimes(2);
        expect(onValueChange).toHaveBeenLastCalledWith(value);
        expect(document.activeElement).toBe(trigger());
      }
      expect(onValueChange).toHaveBeenCalledTimes(2);
    },
  );

  it.skipIf(isJSDOM)(
    "closes on a press while open, and does not open again",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Fruit onOpenChange={onOpenChange} />);

      await press(centerOf(trigger()));
      await nextTask();
      expect(shown()).toBe(true);

      await press(centerOf(trigger()));
      await nextTask();
      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "trigger-press",
        event: expect.any(MouseEvent),
      });
    },
  );

  it("disabled on the Root: the button is disabled, with data-disabled, and opens nothing", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <Fruit disabled onOpenChange={onOpenChange} />
    ));

    expect(trigger()).toBeDisabled();
    expect(trigger()).toHaveAttribute("data-disabled", "");
    await user.click(trigger());
    await afterFlush();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(shown()).toBe(false);
  });

  it("required on the Root: aria-required and data-required; absent when not set", async () => {
    await render(() => (
      <>
        <Fruit required />
        <Select.Root>
          <Select.Trigger data-testid="plain" />
        </Select.Root>
      </>
    ));

    expect(screen.getByLabelText("Fruit")).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByLabelText("Fruit")).toHaveAttribute("data-required", "");
    const plain = screen.getByTestId("plain");
    expect(plain).not.toHaveAttribute("aria-required");
    expect(plain).not.toHaveAttribute("data-required");
    expect(plain).not.toHaveAttribute("data-disabled");
    expect(plain).not.toBeDisabled();
  });

  it("calls the consumer's onClick once per click", async () => {
    const onClick = vi.fn();
    const { user } = await render(() => (
      <Fruit
        trigger={<Select.Trigger onClick={onClick}>Fruit</Select.Trigger>}
      />
    ));

    await user.click(trigger());

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("warns in development when render does not render a button", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(() => (
      <Select.Root>
        <Select.Trigger render={(props) => <span {...props} />} />
      </Select.Root>
    ));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Select.Trigger's render function rendered a <span>",
      ),
    );
  });

  it("throws a descriptive error outside Select.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Select.Trigger />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Select parts must be placed within <Select.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
