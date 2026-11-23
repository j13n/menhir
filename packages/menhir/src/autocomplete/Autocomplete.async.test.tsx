// Suggestions from an async computation, as for Combobox
// (../combobox/README.md, "Items that arrive asynchronously"). The test
// list and the cases left out are in README.md.
import { createDeferred, createSignal, For, Loading } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../test/menu/stubMenu.ts";
import { active, input, items } from "../../test/autocomplete/queries.ts";
import { Autocomplete } from "./index.ts";

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
  return { search, answer };
}

function Search(props: { search: (query: string) => Promise<string[]> }) {
  const [query, setQuery] = createSignal("");
  const results = createDeferred(() => props.search(query()));
  return (
    <Autocomplete.Root
      onValueChange={(text, { reason }) =>
        setQuery(reason === "input-change" ? text : "")
      }
    >
      <Autocomplete.Input aria-label="Search" />
      <Autocomplete.Popup>
        <Autocomplete.List aria-label="Suggestions">
          <Loading fallback={<p>Loading suggestions</p>}>
            <For each={results()}>
              {(name) => (
                <Autocomplete.Item value={name}>{name}</Autocomplete.Item>
              )}
            </For>
          </Loading>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Root>
  );
}

describe("<Autocomplete.Root /> with suggestions from an async computation", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("shows each key as it is typed, the fallback until the first answer, and then the keys reach the suggestions", async () => {
    const { search, answer } = createSearch();
    const { user } = await render(() => <Search search={search} />);

    await user.type(input(), "so");
    await afterFlush();

    expect(input()).toHaveValue("so");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Loading suggestions")).toBeInTheDocument();

    await answer([]);
    await answer(["solid", "solstice"]);
    await answer(["solid", "solstice"]);

    expect(screen.queryByText("Loading suggestions")).toBeNull();
    expect(items()).toEqual(["solid", "solstice"]);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("solstice");
    await user.keyboard("{Enter}");
    await afterFlush();
    expect(input()).toHaveValue("solstice");
  });
});
