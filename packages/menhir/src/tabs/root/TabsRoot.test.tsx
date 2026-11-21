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

import { Tabs } from "../index.ts";

describeConformance("<Tabs.Root />", (props) => <Tabs.Root {...props} />, {
  tagName: "DIV",
});

type RootProps = Parameters<typeof Tabs.Root>[0];

// A Root with three tabs and their panels.
function Settings(props: RootProps & { disabled?: string[] }) {
  const names = ["Account", "Billing", "Security"];
  return (
    <Tabs.Root {...props}>
      <Tabs.List aria-label="Settings">
        <For each={names}>
          {(name) => (
            <Tabs.Tab
              value={name.toLowerCase()}
              disabled={props.disabled?.includes(name)}
            >
              {name}
            </Tabs.Tab>
          )}
        </For>
      </Tabs.List>
      <For each={names}>
        {(name) => (
          <Tabs.Panel value={name.toLowerCase()}>{`${name} panel`}</Tabs.Panel>
        )}
      </For>
    </Tabs.Root>
  );
}

describe("<Tabs.Root />", () => {
  const { render } = createRenderer();
  const tab = (name: string) => screen.getByRole("tab", { name });
  const panel = (name: string) => screen.getByText(`${name} panel`);

  it("selects the first enabled tab when nothing is passed", async () => {
    await render(() => <Settings disabled={["Account"]} />);

    expect(tab("Account")).toHaveAttribute("aria-selected", "false");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    expect(tab("Security")).toHaveAttribute("aria-selected", "false");
    expect(panel("Account")).not.toBeVisible();
    expect(panel("Billing")).toBeVisible();
    expect(panel("Security")).not.toBeVisible();
  });

  it("selects the tab named by defaultValue", async () => {
    await render(() => <Settings defaultValue="security" />);

    expect(tab("Account")).toHaveAttribute("aria-selected", "false");
    expect(tab("Security")).toHaveAttribute("aria-selected", "true");
    expect(panel("Account")).not.toBeVisible();
    expect(panel("Security")).toBeVisible();
  });

  it("selects a tab on click, and reports each new value", async () => {
    const onValueChange = vi.fn();
    await render(() => <Settings onValueChange={onValueChange} />);

    fireEvent.click(tab("Billing"));
    await afterFlush();
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    expect(tab("Account")).toHaveAttribute("aria-selected", "false");
    expect(panel("Billing")).toBeVisible();
    expect(panel("Account")).not.toBeVisible();
    expect(onValueChange).toHaveBeenLastCalledWith("billing");

    fireEvent.click(tab("Security"));
    await afterFlush();
    expect(tab("Security")).toHaveAttribute("aria-selected", "true");
    expect(panel("Billing")).not.toBeVisible();
    expect(onValueChange).toHaveBeenLastCalledWith("security");
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it("does not report the tab selected by default when it is selected again", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Settings onValueChange={onValueChange} />
    ));

    await user.click(tab("Account"));
    await user.keyboard("[Tab]{Shift>}[Tab]{/Shift}");
    await afterFlush();

    expect(tab("Account")).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("stays put when controlled, and asks with the requested value", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Settings value="account" onValueChange={onValueChange} />
    ));

    fireEvent.click(tab("Billing"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("billing");
    expect(tab("Account")).toHaveAttribute("aria-selected", "true");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "false");
    expect(panel("Account")).toBeVisible();
  });

  it("follows a controlled value changed from outside", async () => {
    const [value, setValue] = createSignal<string | null>("account");
    await render(() => <Settings value={value()} />);

    setValue("security");
    flush();

    expect(tab("Security")).toHaveAttribute("aria-selected", "true");
    expect(tab("Account")).toHaveAttribute("aria-selected", "false");
    expect(panel("Security")).toBeVisible();
    expect(panel("Account")).not.toBeVisible();
  });

  it("selects no tab with a controlled null", async () => {
    await render(() => <Settings value={null} />);

    for (const name of ["Account", "Billing", "Security"]) {
      expect(tab(name)).toHaveAttribute("aria-selected", "false");
      expect(panel(name)).not.toBeVisible();
    }
  });

  it("selects before async work that onValueChange starts settles", async () => {
    const [value, setValue] = createSignal<string>();
    let resolveContent!: (content: string) => void;
    await render(() => {
      const content = createMemo(() =>
        value()
          ? new Promise<string>((resolve) => (resolveContent = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <Settings onValueChange={(next) => setValue(next)} />
          <output>{content()}</output>
        </Loading>
      );
    });

    fireEvent.click(tab("Billing"));
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    expect(panel("Billing")).toBeVisible();

    resolveContent("loaded");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });

  it("has data-horizontal by default, data-vertical when vertical, and follows changes", async () => {
    const [orientation, setOrientation] = createSignal<
      "horizontal" | "vertical"
    >();
    await render(() => (
      <Settings data-testid="root" orientation={orientation()} />
    ));
    const root = screen.getByTestId("root");

    expect(root).toHaveAttribute("data-horizontal", "");
    expect(root).not.toHaveAttribute("data-vertical");

    setOrientation("vertical");
    flush();

    expect(root).toHaveAttribute("data-vertical", "");
    expect(root).not.toHaveAttribute("data-horizontal");
  });
});
