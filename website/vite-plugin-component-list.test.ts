import { describe, expect, test } from "vitest";

import { tsx } from "./src/highlight.ts";
import type { ComponentDoc } from "./src/componentDocs/types.ts";
import { groupComponents } from "./vite-plugin-component-list.ts";

const doc = (
  name: string,
  category: ComponentDoc["category"],
): ComponentDoc => ({
  slug: name.toLowerCase().replace(/ /g, "-"),
  name,
  category,
  description: "",
  anatomy: tsx``,
  api: [],
  keyboard: [],
});

describe("groupComponents", () => {
  test("groups the components in category order, alphabetically within each, leaving out empty categories", () => {
    expect(
      groupComponents([
        doc("Tooltip", "Overlays"),
        doc("Switch", "Inputs"),
        doc("Dialog", "Overlays"),
        doc("Checkbox", "Inputs"),
      ]),
    ).toEqual([
      {
        category: "Inputs",
        components: [
          { slug: "checkbox", name: "Checkbox" },
          { slug: "switch", name: "Switch" },
        ],
      },
      {
        category: "Overlays",
        components: [
          { slug: "dialog", name: "Dialog" },
          { slug: "tooltip", name: "Tooltip" },
        ],
      },
    ]);
  });
});
