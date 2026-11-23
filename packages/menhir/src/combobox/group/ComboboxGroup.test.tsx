// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/combobox/Fruit.tsx";
import { active, input } from "../../../test/combobox/queries.ts";
import { Combobox } from "../index.ts";

describeConformance(
  "<Combobox.Group />",
  (props) => (
    <Combobox.Root>
      <Combobox.Group {...props} />
    </Combobox.Root>
  ),
  { tagName: "DIV" },
);

describeConformance(
  "<Combobox.GroupLabel />",
  (props) => (
    <Combobox.Root>
      <Combobox.Group>
        <Combobox.GroupLabel {...props} />
      </Combobox.Group>
    </Combobox.Root>
  ),
  { tagName: "DIV" },
);

describe("<Combobox.Group />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders a group named by its GroupLabel; the consumer's aria-labelledby wins", async () => {
    await render(() => (
      <Fruit>
        <Combobox.Group>
          <Combobox.GroupLabel id="citrus">Citrus</Combobox.GroupLabel>
          <Combobox.Item value="lemon">Lemon</Combobox.Item>
        </Combobox.Group>
        <Combobox.Group aria-labelledby="own">
          <Combobox.GroupLabel>Berries</Combobox.GroupLabel>
        </Combobox.Group>
        <span id="own">Own</span>
      </Fruit>
    ));
    const [citrus, berries] = screen.getAllByRole("group", { hidden: true });

    expect(citrus).toHaveAttribute("aria-labelledby", "citrus");
    expect(citrus).toHaveAccessibleName("Citrus");
    expect(berries).toHaveAttribute("aria-labelledby", "own");
  });

  it("moves through the items of groups in document order", async () => {
    const { user } = await render(() => (
      <Fruit>
        <Combobox.Item value="apple">Apple</Combobox.Item>
        <Combobox.Group>
          <Combobox.GroupLabel>Citrus</Combobox.GroupLabel>
          <Combobox.Item value="lemon">Lemon</Combobox.Item>
          <Combobox.Item value="lime">Lime</Combobox.Item>
        </Combobox.Group>
      </Fruit>
    ));
    input().focus();

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Lemon");
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Lime");
  });

  it("throws a descriptive error for a GroupLabel outside a Group", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Combobox.Root>
          <Combobox.GroupLabel />
        </Combobox.Root>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Combobox.GroupLabel must be placed within <Combobox.Group>.",
      ),
    ).toBeInTheDocument();
  });
});
