// Items from an async computation (README, "Items that arrive
// asynchronously"). The test list and the cases left out are in README.md.
import {
  createDeferred,
  createSignal,
  For,
  isPending,
  Loading,
} from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../test/menu/stubMenu.ts";
import { active, input, items } from "../../test/combobox/queries.ts";
import { Combobox } from "./index.ts";

/** A search whose answers the test gives, one per query, in order. */
function createSearch() {
  const pending: { query: string; resolve: (names: string[]) => void }[] = [];
  const search = (query: string) =>
    new Promise<string[]>((resolve) => pending.push({ query, resolve }));
  const answer = async (names: string[]) => {
    pending.shift()!.resolve(names);
    // The answer lands, then the flush it causes.
    await Promise.resolve();
    await afterFlush();
  };
  return { search, answer, queries: () => pending.map((p) => p.query) };
}

function Countries(props: { search: (query: string) => Promise<string[]> }) {
  const [query, setQuery] = createSignal("");
  // After its first answer, a new query keeps the last items shown.
  const results = createDeferred(() => props.search(query()));
  return (
    <Combobox.Root
      onInputValueChange={(text, { reason }) =>
        setQuery(reason === "input-change" ? text : "")
      }
    >
      <Combobox.Input aria-label="Country" />
      <Combobox.Popup>
        <Combobox.List aria-label="Countries">
          <Loading>
            <For each={results()}>
              {(name) => <Combobox.Item value={name}>{name}</Combobox.Item>}
            </For>
          </Loading>
        </Combobox.List>
        <Loading fallback={<p>Loading countries</p>}>
          <Combobox.Status data-testid="status">
            {(count) =>
              isPending(() => results()) ? "Searching" : `${count} results`
            }
          </Combobox.Status>
        </Loading>
      </Combobox.Popup>
    </Combobox.Root>
  );
}

describe("<Combobox.Root /> with items from an async computation", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("shows the fallback until the first answer, then the keys reach its items", async () => {
    const { search, answer } = createSearch();
    const { user } = await render(() => <Countries search={search} />);
    input().focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await afterFlush();

    // Opening is not held until the answer lands.
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Loading countries")).toBeInTheDocument();
    expect(items()).toEqual([]);

    await answer(["Nepal", "Norway"]);

    expect(screen.queryByText("Loading countries")).toBeNull();
    expect(items()).toEqual(["Nepal", "Norway"]);
    expect(screen.getByTestId("status")).toHaveTextContent("2 results");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Norway");
  });

  it("keeps the text current while a new query's answer is in flight, and counts the new items once it lands", async () => {
    const { search, answer, queries } = createSearch();
    const { user } = await render(() => <Countries search={search} />);
    await answer(["Nepal", "Norway", "Peru"]);

    await user.type(input(), "n");
    await afterFlush();

    // The input shows the key at once, the last items stay, and the
    // Status says a search is in flight.
    expect(queries()).toEqual(["n"]);
    expect(input()).toHaveValue("n");
    expect(items()).toEqual(["Nepal", "Norway", "Peru"]);
    expect(screen.getByTestId("status")).toHaveTextContent("Searching");

    await user.type(input(), "o");
    await afterFlush();
    expect(input()).toHaveValue("no");

    await answer(["Nepal", "Norway"]);
    await answer(["Norway"]);

    expect(items()).toEqual(["Norway"]);
    expect(screen.getByTestId("status")).toHaveTextContent("1 results");
    await user.keyboard("{ArrowDown}{Enter}");
    await afterFlush();
    expect(input()).toHaveValue("Norway");
  });
});
