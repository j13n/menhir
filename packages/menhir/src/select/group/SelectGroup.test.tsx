// The test list and the cases left out are in ../README.md.
import { createSignal, Errored, flush, Show } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/select/Fruit.tsx";
import { active, trigger } from "../../../test/select/queries.ts";
import { Select } from "../index.ts";

const group = () => screen.getByRole("group", { hidden: true });

describeConformance(
  "<Select.Group />",
  (props) => (
    <Select.Root>
      <Select.Popup>
        <Select.Group {...props} />
      </Select.Popup>
    </Select.Root>
  ),
  { tagName: "DIV" },
);

describeConformance(
  "<Select.GroupLabel />",
  (props) => (
    <Select.Root>
      <Select.Popup>
        <Select.Group>
          <Select.GroupLabel {...props} />
        </Select.Group>
      </Select.Popup>
    </Select.Root>
  ),
  { tagName: "DIV" },
);

describe("<Select.Group />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a group named by its GroupLabel while one is rendered", async () => {
    const [labelled, setLabelled] = createSignal(true);
    await render(() => (
      <Fruit>
        <Select.Group>
          <Show when={labelled()}>
            <Select.GroupLabel>Citrus</Select.GroupLabel>
          </Show>
          <Select.Item value="lemon">Lemon</Select.Item>
        </Select.Group>
      </Fruit>
    ));
    await afterFlush();

    expect(group().tagName).toBe("DIV");
    const label = screen.getByText("Citrus");
    expect(label.id).not.toBe("");
    expect(group()).toHaveAttribute("aria-labelledby", label.id);

    setLabelled(false);
    flush();
    expect(group()).not.toHaveAttribute("aria-labelledby");
  });

  it("the consumer's aria-labelledby wins, and a GroupLabel takes the consumer's id", async () => {
    await render(() => (
      <Fruit>
        <Select.Group aria-labelledby="own">
          <Select.GroupLabel id="citrus">Citrus</Select.GroupLabel>
          <Select.Item value="lemon">Lemon</Select.Item>
        </Select.Group>
      </Fruit>
    ));
    await afterFlush();

    expect(group()).toHaveAttribute("aria-labelledby", "own");
    expect(screen.getByText("Citrus").id).toBe("citrus");
  });

  it("the keys move through the items of groups in document order", async () => {
    const { user } = await render(() => (
      <Fruit defaultOpen>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Group>
          <Select.GroupLabel>Citrus</Select.GroupLabel>
          <Select.Item value="lemon">Lemon</Select.Item>
          <Select.Item value="lime">Lime</Select.Item>
        </Select.Group>
        <Select.Item value="pear">Pear</Select.Item>
      </Fruit>
    ));
    trigger().focus();
    await vi.waitFor(() => expect(active()).toBe("Apple"));

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Lemon");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Pear");
  });

  it("a GroupLabel throws a descriptive error outside a Group", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Select.GroupLabel>Citrus</Select.GroupLabel>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Select.GroupLabel must be placed within <Select.Group>.",
      ),
    ).toBeInTheDocument();
  });
});
