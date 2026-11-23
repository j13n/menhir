// The test list and the cases left out are in ../README.md.
import { createSignal, flush, Show } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Edit } from "../../../test/menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";

const group = () => screen.getByRole("group", { hidden: true });

describeConformance(
  "<Menu.Group />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.Group {...props} />
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describeConformance(
  "<Menu.GroupLabel />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel {...props} />
        </Menu.Group>
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describe("<Menu.Group />", () => {
  const { render } = createRenderer();
  stubMenu();

  it("renders a group named by its GroupLabel while one is rendered", async () => {
    const [label, setLabel] = createSignal(true);
    await render(() => (
      <Edit defaultOpen>
        <Menu.Group>
          <Show when={label()}>
            <Menu.GroupLabel>Clipboard</Menu.GroupLabel>
          </Show>
          <Menu.Item>Copy</Menu.Item>
        </Menu.Group>
      </Edit>
    ));

    expect(group().tagName).toBe("DIV");
    expect(group()).toHaveAccessibleName("Clipboard");

    setLabel(false);
    flush();
    expect(group()).not.toHaveAttribute("aria-labelledby");
  });

  it("takes the consumer's aria-labelledby over its GroupLabel's, and a GroupLabel takes the consumer's id", async () => {
    await render(() => (
      <Edit defaultOpen>
        <Menu.Group aria-labelledby="own">
          <Menu.GroupLabel id="label">Clipboard</Menu.GroupLabel>
        </Menu.Group>
        <Menu.Group data-testid="second">
          <Menu.GroupLabel id="second-label">View</Menu.GroupLabel>
        </Menu.Group>
      </Edit>
    ));

    expect(screen.getAllByRole("group", { hidden: true })[0]).toHaveAttribute(
      "aria-labelledby",
      "own",
    );
    expect(screen.getByTestId("second")).toHaveAttribute(
      "aria-labelledby",
      "second-label",
    );
  });
});
