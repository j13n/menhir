// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { Loading, createMemo, createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { ToggleGroup } from "../index.ts";

describeConformance(
  "<ToggleGroup.Root />",
  (props) => (
    <ToggleGroup.Root {...props}>
      <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
    </ToggleGroup.Root>
  ),
  { tagName: "DIV" },
);

const item = (name: string) => screen.getByRole("button", { name });

describe("<ToggleGroup.Root />", () => {
  const { render } = createRenderer();

  it("renders a div with role group", async () => {
    await render(() => (
      <ToggleGroup.Root aria-label="Alignment">
        <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const group = screen.getByRole("group", { name: "Alignment" });
    expect(group.tagName).toBe("DIV");
  });

  it("presses one item at a time by default, and reports each value", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <ToggleGroup.Root aria-label="Alignment" onValueChange={onValueChange}>
        <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const left = screen.getByRole("button", { name: "Left" });
    const right = screen.getByRole("button", { name: "Right" });
    expect(left).toHaveAttribute("aria-pressed", "false");
    expect(right).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(left);
    await afterFlush();
    expect(left).toHaveAttribute("aria-pressed", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["left"]);

    fireEvent.click(right);
    await afterFlush();
    expect(left).toHaveAttribute("aria-pressed", "false");
    expect(right).toHaveAttribute("aria-pressed", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["right"]);

    fireEvent.click(right);
    await afterFlush();
    expect(right).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it.each(["aria-label", "aria-labelledby"])(
    "passes %s through",
    async (name) => {
      await render(() => (
        <ToggleGroup.Root {...{ [name]: "format" }}>
          <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        </ToggleGroup.Root>
      ));

      expect(screen.getByRole("group")).toHaveAttribute(name, "format");
    },
  );

  it("takes the consumer's role, for a group that is the whole toolbar", async () => {
    await render(() => (
      <ToggleGroup.Root role="toolbar" aria-label="Format">
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    expect(screen.getByRole("toolbar", { name: "Format" })).toBeInTheDocument();
  });

  it("tells a vertical toolbar's orientation, which a group does not take", async () => {
    const [role, setRole] = createSignal<"toolbar" | "group">("toolbar");
    await render(() => (
      <ToggleGroup.Root
        role={role()}
        aria-label="Format"
        orientation="vertical"
      >
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    expect(screen.getByRole("toolbar")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );

    setRole("group");
    flush();
    expect(screen.getByRole("group")).not.toHaveAttribute("aria-orientation");
  });

  it("puts its orientation in data attributes, and follows changes", async () => {
    const [orientation, setOrientation] = createSignal<
      "horizontal" | "vertical" | undefined
    >(undefined);
    await render(() => (
      <ToggleGroup.Root aria-label="Format" orientation={orientation()}>
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("data-horizontal", "");
    expect(group).not.toHaveAttribute("data-vertical");

    setOrientation("vertical");
    flush();
    expect(group).toHaveAttribute("data-vertical", "");
    expect(group).not.toHaveAttribute("data-horizontal");
  });

  it("presses items on their own when multiple, and reports each value", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <ToggleGroup.Root
        aria-label="Format"
        multiple
        onValueChange={onValueChange}
      >
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    fireEvent.click(item("Bold"));
    await afterFlush();
    fireEvent.click(item("Italic"));
    await afterFlush();
    expect(item("Bold")).toHaveAttribute("aria-pressed", "true");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);

    fireEvent.click(item("Bold"));
    await afterFlush();
    expect(item("Bold")).toHaveAttribute("aria-pressed", "false");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["italic"]);
  });

  it("keeps every press made in one turn when multiple", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <ToggleGroup.Root
        aria-label="Format"
        multiple
        onValueChange={onValueChange}
      >
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    // Native clicks, with no flush between them.
    item("Bold").click();
    item("Italic").click();
    await afterFlush();

    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
    expect(item("Bold")).toHaveAttribute("aria-pressed", "true");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "true");
  });

  it("presses the items in defaultValue", async () => {
    await render(() => (
      <ToggleGroup.Root
        aria-label="Format"
        multiple
        defaultValue={["bold", "underline"]}
      >
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
        <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    expect(item("Bold")).toHaveAttribute("aria-pressed", "true");
    expect(item("Italic")).toHaveAttribute("aria-pressed", "false");
    expect(item("Underline")).toHaveAttribute("aria-pressed", "true");
  });

  it("stays put when controlled, and asks for the change", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <ToggleGroup.Root
        aria-label="Alignment"
        value={["left"]}
        onValueChange={onValueChange}
      >
        <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    fireEvent.click(item("Right"));
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith(["right"]);
    expect(item("Left")).toHaveAttribute("aria-pressed", "true");
    expect(item("Right")).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(item("Left"));
    await afterFlush();
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(item("Left")).toHaveAttribute("aria-pressed", "true");
  });

  it("follows a controlled value changed from outside", async () => {
    const [value, setValue] = createSignal<string[]>([]);
    await render(() => (
      <ToggleGroup.Root aria-label="Alignment" value={value()}>
        <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    setValue(["right"]);
    flush();
    expect(item("Left")).toHaveAttribute("aria-pressed", "false");
    expect(item("Right")).toHaveAttribute("aria-pressed", "true");

    setValue([]);
    flush();
    expect(item("Right")).toHaveAttribute("aria-pressed", "false");
  });

  it("presses before async work that onValueChange starts settles", async () => {
    const [alignment, setAlignment] = createSignal<string[]>([]);
    let resolvePreview!: (preview: string) => void;
    await render(() => {
      const preview = createMemo(() =>
        alignment().length
          ? new Promise<string>((resolve) => (resolvePreview = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <ToggleGroup.Root
            aria-label="Alignment"
            onValueChange={(value) => setAlignment(value)}
          >
            <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
          </ToggleGroup.Root>
          <output>{preview()}</output>
        </Loading>
      );
    });

    fireEvent.click(item("Left"));
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(item("Left")).toHaveAttribute("aria-pressed", "true");

    resolvePreview("left");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("left");
  });

  it("disables every item, and follows changes", async () => {
    const [disabled, setDisabled] = createSignal(true);
    const onValueChange = vi.fn();
    await render(() => (
      <ToggleGroup.Root
        aria-label="Format"
        disabled={disabled()}
        onValueChange={onValueChange}
      >
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
      </ToggleGroup.Root>
    ));

    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("data-disabled", "");
    for (const name of ["Bold", "Italic"]) {
      expect(item(name)).toBeDisabled();
      expect(item(name)).toHaveAttribute("data-disabled", "");
    }
    fireEvent.click(item("Bold"));
    await afterFlush();
    expect(onValueChange).not.toHaveBeenCalled();

    setDisabled(false);
    flush();
    expect(group).not.toHaveAttribute("data-disabled");
    expect(item("Bold")).not.toBeDisabled();
    expect(item("Bold")).not.toHaveAttribute("data-disabled");
    fireEvent.click(item("Bold"));
    await afterFlush();
    expect(item("Bold")).toHaveAttribute("aria-pressed", "true");
  });
});
