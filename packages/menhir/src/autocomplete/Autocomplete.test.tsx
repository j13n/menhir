// Combobox's parts inside an Autocomplete (README, "Decisions"). They are
// tested in ../combobox; these check that they work with an Autocomplete's
// Root. The test list and the cases left out are in README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../test/menu/stubMenu.ts";
import { City } from "../../test/autocomplete/City.tsx";
import { active, input, item } from "../../test/autocomplete/queries.ts";
import { Combobox } from "../combobox/index.ts";
import { Autocomplete } from "./index.ts";

/** Renders its children in an error boundary that shows what they throw. */
function Caught(props: { children: JSX.Element }) {
  return (
    <Errored fallback={(error) => <p>{String(error())}</p>}>
      {props.children}
    </Errored>
  );
}

describe("Combobox's parts in <Autocomplete.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("empties the text on Clear, reporting clear-press, and focuses the input", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <City defaultValue="Oslo" onValueChange={onValueChange} />
    ));

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await afterFlush();

    expect(input()).toHaveValue("");
    expect(onValueChange).toHaveBeenCalledWith("", {
      reason: "clear-press",
      event: expect.any(MouseEvent),
    });
    expect(document.activeElement).toBe(input());
  });

  it("counts the suggestions in the Status while the list is open", async () => {
    const { user } = await render(() => <City />);
    expect(screen.getByTestId("status")).toBeEmptyDOMElement();

    await user.type(input(), "b");
    await afterFlush();

    expect(screen.getByTestId("status")).toHaveTextContent("2 cities");
  });

  it("reaches the items of a Group, named by its GroupLabel, in document order", async () => {
    const { user } = await render(() => (
      <City>
        <Autocomplete.Item value="Oslo">Oslo</Autocomplete.Item>
        <Autocomplete.Group>
          <Autocomplete.GroupLabel>West</Autocomplete.GroupLabel>
          <Autocomplete.Item value="Bergen">Bergen</Autocomplete.Item>
        </Autocomplete.Group>
      </City>
    ));
    input().focus();

    await user.keyboard("{ArrowDown}");
    await afterFlush();
    await vi.waitFor(() => expect(active()).toBe("Oslo"));
    await user.keyboard("{ArrowDown}");

    expect(active()).toBe("Bergen");
    expect(
      screen.getByRole("group", { name: "West", hidden: true }),
    ).toContainElement(item("Bergen"));
  });
});

describe("a part inside the other Root", () => {
  const { render } = createRenderer();
  stubMenu();

  it("throws for Combobox's own Input and Item inside Autocomplete.Root", async () => {
    await render(() => (
      <>
        <Caught>
          <Autocomplete.Root>
            <Combobox.Input />
          </Autocomplete.Root>
        </Caught>
        <Caught>
          <Autocomplete.Root>
            <Combobox.Item value="oslo" />
          </Autocomplete.Root>
        </Caught>
      </>
    ));

    expect(
      screen.getAllByText(
        "Error: [menhir] Combobox parts must be placed within <Combobox.Root>, not <Autocomplete.Root>.",
      ),
    ).toHaveLength(2);
  });

  it("throws for Autocomplete's own Input and Item inside Combobox.Root", async () => {
    await render(() => (
      <>
        <Caught>
          <Combobox.Root>
            <Autocomplete.Input />
          </Combobox.Root>
        </Caught>
        <Caught>
          <Combobox.Root>
            <Autocomplete.Item value="Oslo" />
          </Combobox.Root>
        </Caught>
      </>
    ));

    expect(
      screen.getAllByText(
        "Error: [menhir] Autocomplete parts must be placed within <Autocomplete.Root>, not <Combobox.Root>.",
      ),
    ).toHaveLength(2);
  });
});
