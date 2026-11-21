// The test list and the cases left out are in ../README.md.
import { describe, expect, it, vi } from "vitest";

import { For, Loading, createMemo, createSignal, flush } from "solid-js";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Accordion } from "../index.ts";

describeConformance(
  "<Accordion.Root />",
  (props) => <Accordion.Root {...props} />,
  { tagName: "DIV" },
);

type RootProps = Parameters<typeof Accordion.Root>[0];

// A Root with three sections.
function Faq(props: RootProps) {
  return (
    <Accordion.Root {...props}>
      <For each={["Shipping", "Returns", "Warranty"]}>
        {(name) => (
          <Accordion.Item value={name.toLowerCase()}>
            <Accordion.Header>
              <Accordion.Trigger>{name}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>{`${name} answer`}</Accordion.Panel>
          </Accordion.Item>
        )}
      </For>
    </Accordion.Root>
  );
}

describe("<Accordion.Root />", () => {
  const { render } = createRenderer();
  const trigger = (name: string) => screen.getByRole("button", { name });
  const panel = (name: string) => screen.getByText(`${name} answer`);

  it("closes every section by default", async () => {
    await render(() => <Faq />);

    for (const name of ["Shipping", "Returns", "Warranty"]) {
      expect(trigger(name)).toHaveAttribute("aria-expanded", "false");
      expect(panel(name)).not.toBeVisible();
    }
  });

  it("opens the items listed in defaultValue", async () => {
    await render(() => (
      <Faq multiple defaultValue={["shipping", "warranty"]} />
    ));

    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "true");
    expect(panel("Shipping")).toBeVisible();
    expect(trigger("Returns")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Warranty")).toHaveAttribute("aria-expanded", "true");
  });

  it("opens one item at a time by default, and reports each new value", async () => {
    const onValueChange = vi.fn();
    await render(() => <Faq onValueChange={onValueChange} />);

    fireEvent.click(trigger("Shipping"));
    await afterFlush();
    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "true");
    expect(panel("Shipping")).toBeVisible();
    expect(onValueChange).toHaveBeenLastCalledWith(["shipping"]);

    fireEvent.click(trigger("Returns"));
    await afterFlush();
    expect(trigger("Returns")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "false");
    expect(panel("Shipping")).not.toBeVisible();
    expect(onValueChange).toHaveBeenLastCalledWith(["returns"]);

    fireEvent.click(trigger("Returns"));
    await afterFlush();
    expect(trigger("Returns")).toHaveAttribute("aria-expanded", "false");
    expect(panel("Returns")).not.toBeVisible();
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("opens and closes items on their own with multiple", async () => {
    const onValueChange = vi.fn();
    await render(() => <Faq multiple onValueChange={onValueChange} />);

    fireEvent.click(trigger("Shipping"));
    await afterFlush();
    fireEvent.click(trigger("Warranty"));
    await afterFlush();
    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Warranty")).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["shipping", "warranty"]);

    fireEvent.click(trigger("Shipping"));
    await afterFlush();
    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("Warranty")).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["warranty"]);
  });

  it("counts two clicks in one turn with multiple", async () => {
    const onValueChange = vi.fn();
    await render(() => <Faq multiple onValueChange={onValueChange} />);

    fireEvent.click(trigger("Shipping"));
    fireEvent.click(trigger("Returns"));
    await afterFlush();

    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Returns")).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange).toHaveBeenLastCalledWith(["shipping", "returns"]);
  });

  it("stays put when controlled and asks for the change", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Faq value={["shipping"]} onValueChange={onValueChange} />
    ));

    fireEvent.click(trigger("Returns"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith(["returns"]);
    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Returns")).toHaveAttribute("aria-expanded", "false");
    expect(panel("Returns")).not.toBeVisible();
  });

  it("follows a controlled value changed from outside", async () => {
    const [value, setValue] = createSignal<string[]>([]);
    await render(() => <Faq value={value()} />);

    setValue(["warranty"]);
    flush();
    expect(trigger("Warranty")).toHaveAttribute("aria-expanded", "true");
    expect(panel("Warranty")).toBeVisible();

    setValue([]);
    flush();
    expect(trigger("Warranty")).toHaveAttribute("aria-expanded", "false");
    expect(panel("Warranty")).not.toBeVisible();
  });

  it("opens before async work that onValueChange starts settles", async () => {
    const [value, setValue] = createSignal<string[]>([]);
    let resolveAnswer!: (answer: string) => void;
    await render(() => {
      const answer = createMemo(() =>
        value().length
          ? new Promise<string>((resolve) => (resolveAnswer = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <Faq onValueChange={(next) => setValue(next)} />
          <output>{answer()}</output>
        </Loading>
      );
    });

    fireEvent.click(trigger("Shipping"));
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "true");
    expect(panel("Shipping")).toBeVisible();

    resolveAnswer("loaded");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });

  it("opens and closes an item without a value", async () => {
    await render(() => (
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Shipping answer</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger>Returns</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Returns answer</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    ));

    fireEvent.click(trigger("Shipping"));
    await afterFlush();
    expect(panel("Shipping")).toBeVisible();
    expect(panel("Returns")).not.toBeVisible();

    fireEvent.click(trigger("Returns"));
    await afterFlush();
    expect(panel("Shipping")).not.toBeVisible();
    expect(panel("Returns")).toBeVisible();

    fireEvent.click(trigger("Returns"));
    await afterFlush();
    expect(panel("Returns")).not.toBeVisible();
  });

  describe("disabled", () => {
    it("disables every Trigger natively, which do not toggle", async () => {
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Faq disabled onValueChange={onValueChange} />
      ));

      for (const name of ["Shipping", "Returns", "Warranty"]) {
        expect(trigger(name)).toBeDisabled();
      }
      await user.keyboard("[Tab]");
      expect(document.body).toHaveFocus();

      fireEvent.click(trigger("Shipping"));
      await afterFlush();
      expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "false");
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("puts data-disabled on every part, and follows changes", async () => {
      const [disabled, setDisabled] = createSignal(true);
      await render(() => (
        <Faq
          data-testid="root"
          defaultValue={["shipping"]}
          disabled={disabled()}
        />
      ));

      const parts = () => [
        screen.getByTestId("root"),
        // The Item, around the Header.
        trigger("Shipping").parentElement!.parentElement!,
        trigger("Shipping").parentElement!,
        trigger("Shipping"),
        panel("Shipping"),
      ];
      for (const part of parts())
        expect(part).toHaveAttribute("data-disabled", "");

      setDisabled(false);
      flush();
      for (const part of parts())
        expect(part).not.toHaveAttribute("data-disabled");
      fireEvent.click(trigger("Shipping"));
      await afterFlush();
      expect(trigger("Shipping")).toHaveAttribute("aria-expanded", "false");
    });
  });
});
