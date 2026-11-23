import { describe, expect, test } from "vitest";

import { componentMarkdown, llmsTxt } from "./componentMarkdown";
import type { ComponentDoc } from "./componentDocs/types";

import { tsx } from "./highlight";
const doc: ComponentDoc = {
  slug: "switch",
  name: "Switch",
  description: "A control that turns a setting on or off.",
  anatomy: tsx`<Switch.Root>
  <Switch.Thumb />
</Switch.Root>`,
  api: [
    {
      part: "Root",
      description: "The switch itself.",
      props: [
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          description: "Called with the new value.",
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "How big it is.",
        },
      ],
    },
  ],
  keyboard: [{ keys: "Space", action: "Turns the switch on or off." }],
};

const example = {
  tailwind: [
    { name: "SwitchExample.tsx", code: '<Switch.Root class="h-6" />\n' },
  ],
  css: [
    { name: "SwitchExample.tsx", code: '<Switch.Root class="switch" />\n' },
    { name: "switch.css", code: ".switch {\n  height: 1.5rem;\n}\n" },
  ],
};

describe("componentMarkdown", () => {
  test("starts with the name, the description, the entry point and the size", () => {
    const markdown = componentMarkdown(doc, { size: 1914, example });
    expect(markdown).toMatch(
      /^# Switch\n\nA control that turns a setting on or off.\n\n/,
    );
    expect(markdown).toContain("- Entry point: `menhir/switch`\n");
    expect(markdown).toContain(
      "- Size: 1.9 kB, minified and gzipped, Solid left out\n",
    );
  });

  test("tells an agent how to add the component, before the install command", () => {
    const markdown = componentMarkdown(doc, { size: 1914, example });
    expect(markdown).toContain(
      "- Size: 1.9 kB, minified and gzipped, Solid left out\n\n> To add Switch to a project, install the packages below with the project's package manager, then copy the example that matches how the project is styled, Tailwind CSS or plain CSS, and adapt its markup and class names to the project.\n\n## Install\n",
    );
  });

  test("says when the size has not been measured yet", () => {
    expect(componentMarkdown(doc, { example })).toContain(
      "- Size: not measured yet\n",
    );
  });

  test("says how to install Menhir and its peer dependencies", () => {
    const markdown = componentMarkdown(doc, { example });
    expect(markdown).toContain(
      "## Install\n\n```sh\npnpm add menhir solid-js @solidjs/web\n```\n",
    );
  });

  test("shows the anatomy as TSX", () => {
    expect(componentMarkdown(doc, { example })).toContain(
      "## Anatomy\n\n```tsx\n<Switch.Root>\n  <Switch.Thumb />\n</Switch.Root>\n```\n",
    );
  });

  test("shows the example with Tailwind CSS, then with CSS, each file fenced in its language", () => {
    const markdown = componentMarkdown(doc, { example });
    expect(markdown).toContain(
      [
        "## Example",
        "",
        "### Tailwind CSS",
        "",
        "`SwitchExample.tsx`:",
        "",
        "```tsx",
        '<Switch.Root class="h-6" />',
        "```",
        "",
        "### CSS",
        "",
        "`SwitchExample.tsx`:",
        "",
        "```tsx",
        '<Switch.Root class="switch" />',
        "```",
        "",
        "`switch.css`:",
        "",
        "```css",
        ".switch {",
        "  height: 1.5rem;",
        "}",
        "```",
      ].join("\n"),
    );
  });

  test("lists each part's props in a table, with pipes escaped", () => {
    expect(componentMarkdown(doc, { example })).toContain(
      [
        "## API reference",
        "",
        "### Root",
        "",
        "The switch itself.",
        "",
        "| Prop | Type | Default | Description |",
        "| --- | --- | --- | --- |",
        "| `onCheckedChange` | `(checked: boolean) => void` | — | Called with the new value. |",
        '| `size` | `"sm" \\| "md"` | `"md"` | How big it is. |',
      ].join("\n"),
    );
  });

  test("lists keyboard interactions and ends with one newline", () => {
    const markdown = componentMarkdown(doc, { example });
    expect(markdown).toMatch(
      /## Keyboard\n\n\| Keys \| Action \|\n\| --- \| --- \|\n\| `Space` \| Turns the switch on or off. \|\n$/,
    );
  });

  test("ends with the page's further sections, each with its files", () => {
    const markdown = componentMarkdown(
      {
        ...doc,
        sections: [
          { id: "in-a-form", title: "In a form", text: "Give it a name." },
        ],
      },
      {
        example,
        sections: {
          "in-a-form": [
            { name: "InAForm.tsx", code: '<Switch.Root name="wifi" />\n' },
          ],
        },
      },
    );
    expect(markdown).toMatch(
      /\| `Space` \| Turns the switch on or off. \|\n\n## In a form\n\nGive it a name.\n\n`InAForm.tsx`:\n\n```tsx\n<Switch.Root name="wifi" \/>\n```\n$/,
    );
  });
});

describe("llmsTxt", () => {
  const toggle: ComponentDoc = {
    ...doc,
    slug: "toggle",
    name: "Toggle",
    description: "A button that stays pressed. It renders a native button.",
  };

  test("names the project, sums it up, and says how to install it", () => {
    expect(llmsTxt([doc])).toMatch(
      /^# Menhir\n\n> Unstyled, accessible UI primitives for SolidJS 2\.0\..*\n\n.*`pnpm add menhir solid-js @solidjs\/web`/s,
    );
  });

  test("links each component's Markdown with the first sentence of its description", () => {
    expect(llmsTxt([doc, toggle])).toContain(
      [
        "## Components",
        "",
        "- [Switch](/docs/components/switch.md): A control that turns a setting on or off.",
        "- [Toggle](/docs/components/toggle.md): A button that stays pressed.",
      ].join("\n"),
    );
  });

  test("links the utilities' pages", () => {
    expect(llmsTxt([doc])).toContain(
      "## Utilities\n\n- [Color Scheme](/docs/utilities/color-scheme): ",
    );
  });

  test("links the docs pages and ends with one newline", () => {
    expect(llmsTxt([doc])).toMatch(
      /## Docs\n\n- \[Getting started\]\(\/docs\/getting-started\): .+\n- \[Styling\]\(\/docs\/styling\): .+\n- \[Solid 2\.0\]\(\/docs\/solid-2\): .+\n- \[Forms without a library\]\(\/docs\/forms\): .+\n- \[Bundle size\]\(\/docs\/bundle-size\): .+\n$/,
    );
  });
});
