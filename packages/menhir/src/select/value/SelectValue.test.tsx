// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/select/Fruit.tsx";
import { item } from "../../../test/select/queries.ts";
import { Select } from "../index.ts";

const value = () => screen.getByTestId("value");

describeConformance(
  "<Select.Value />",
  (props) => (
    <Select.Root>
      <Select.Value {...(props as object)} />
    </Select.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Select.Value />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  const withValue = (children?: (value: string) => string) => (
    <Select.Trigger>
      <Select.Value data-testid="value" placeholder="Pick a fruit">
        {children}
      </Select.Value>
    </Select.Trigger>
  );

  it("renders a span with the placeholder and data-placeholder while no item is selected", async () => {
    await render(() => <Fruit trigger={withValue()} />);

    expect(value().tagName).toBe("SPAN");
    expect(value()).toHaveTextContent("Pick a fruit");
    expect(value()).toHaveAttribute("data-placeholder", "");
  });

  it("shows the selected item's text content, and follows a selection", async () => {
    const { user } = await render(() => (
      <Fruit defaultOpen defaultValue="apple" trigger={withValue()} />
    ));
    await afterFlush();

    expect(value()).toHaveTextContent("Apple");
    expect(value()).not.toHaveAttribute("data-placeholder");

    await user.click(item("Cherry"));
    await afterFlush();
    expect(value()).toHaveTextContent("Cherry");
  });

  it("shows an item's label instead of its content", async () => {
    await render(() => (
      <Fruit defaultValue="nl" trigger={withValue()}>
        <Select.Item value="nl" label="Netherlands">
          🇳🇱 NL
        </Select.Item>
      </Fruit>
    ));
    await afterFlush();

    expect(value()).toHaveTextContent("Netherlands");
  });

  it("leaves an item's aria-hidden content, such as its ItemIndicator, out of the label", async () => {
    await render(() => (
      <Fruit defaultValue="apple" trigger={withValue()}>
        <Select.Item value="apple">
          <Select.ItemIndicator>✓</Select.ItemIndicator>
          Apple <small>(red)</small>
        </Select.Item>
      </Fruit>
    ));
    await afterFlush();

    expect(value().textContent).toBe("Apple (red)");
  });

  it("with a function as children, shows what it returns for the value", async () => {
    const { user } = await render(() => (
      <Fruit
        defaultOpen
        defaultValue="apple"
        trigger={withValue((fruit) => `The ${fruit}`)}
      />
    ));
    await afterFlush();
    expect(value()).toHaveTextContent("The apple");

    await user.click(item("Banana"));
    await afterFlush();
    expect(value()).toHaveTextContent("The banana");
  });

  it("throws a descriptive error outside Select.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Select.Value />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Select parts must be placed within <Select.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
