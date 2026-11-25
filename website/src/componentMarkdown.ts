import type { CodeFile, ComponentDoc } from "./componentDocs/types";
import { formatSize } from "./formatSize";
import { codeOf } from "./highlight";

/** Where a component page's Markdown version is served, for agents to read. */
export const markdownPath = (slug: string) => `/docs/components/${slug}.md`;

/** The package's skills for coding agents, where an installed package puts them. */
const wiringSkill = "node_modules/menhir/skills/menhir/SKILL.md";
const stylingSkill = "node_modules/menhir/skills/menhir-styling/SKILL.md";

export type MarkdownExtras = {
  /** Compressed size of the entry point in bytes; undefined until measured. */
  size?: number;
  /** The example's source files, styled with Tailwind CSS and with plain CSS. */
  example: { tailwind: CodeFile[]; css: CodeFile[] };
  /** Each further section's source files, by the section's id. */
  sections?: Record<string, CodeFile[]>;
};

/**
 * A component page as Markdown, for agents: everything the page says, in the
 * page's order, with the example's code in place of the live example.
 */
export function componentMarkdown(
  doc: ComponentDoc,
  extras: MarkdownExtras,
): string {
  const size =
    extras.size === undefined
      ? "not measured yet"
      : `${formatSize(extras.size)}, minified and gzipped, Solid left out`;

  const blocks = [
    `# ${doc.name}`,
    doc.description,
    [`- Entry point: \`menhir/${doc.slug}\``, `- Size: ${size}`].join("\n"),
    `> To add ${doc.name} to a project, install the packages below with the project's package manager, then copy the example that matches how the project is styled, Tailwind CSS or plain CSS, and adapt its markup and class names to the project.\n>\n> What every Menhir component shares, such as controlled state and forms, is in the skill that comes with the package: follow \`${wiringSkill}\` once it is installed.`,
    "## Install",
    fence("sh", "pnpm add menhir solid-js @solidjs/web"),
    "## Anatomy",
    fence("tsx", codeOf(doc.anatomy)),
    "## Example",
    "### Tailwind CSS",
    ...extras.example.tailwind.flatMap(codeFile),
    "### CSS",
    ...extras.example.css.flatMap(codeFile),
    "## API reference",
    ...doc.api.flatMap((part) => [
      `### ${part.part}`,
      part.description,
      table(
        ["Prop", "Type", "Default", "Description"],
        part.props.map((prop) => [
          code(prop.name),
          code(prop.type),
          prop.default === undefined ? "—" : code(prop.default),
          prop.description,
        ]),
      ),
    ]),
    "## Keyboard",
    table(
      ["Keys", "Action"],
      doc.keyboard.map((row) => [code(row.keys), row.action]),
    ),
    ...(doc.sections ?? []).flatMap((section) => [
      `## ${section.title}`,
      section.text,
      ...(extras.sections?.[section.id] ?? []).flatMap(codeFile),
    ]),
  ];
  return `${blocks.join("\n\n")}\n`;
}

/**
 * The site's index for agents, served at `/llms.txt` (https://llmstxt.org):
 * what Menhir is, how to install it, a link to each component's Markdown
 * with the first sentence of its description, and the utilities' pages.
 */
export function llmsTxt(docs: ComponentDoc[]): string {
  const blocks = [
    "# Menhir",
    "> Unstyled, accessible UI primitives for SolidJS 2.0. Each component is its own entry point, `menhir/<name>`, so an app ships only what it imports.",
    "Install with `pnpm add menhir solid-js @solidjs/web`. Nothing is styled: every part exposes its state as data attributes, such as `data-checked`, for your CSS to select. Each component's page below has its anatomy, an example styled with Tailwind CSS and with plain CSS, its props and its keyboard behaviour.",
    "## Components",
    docs
      .map(
        (doc) =>
          `- [${doc.name}](${markdownPath(doc.slug)}): ${firstSentence(doc.description)}`,
      )
      .join("\n"),
    "## Utilities",
    "- [Color Scheme](/docs/utilities/color-scheme): `menhir/color-scheme/local-storage` and `menhir/color-scheme/cookie` keep the reader's light, dark or system choice, saved and applied to `<html>`, with a head script that applies it before the first paint.",
    "- [Theme](/docs/utilities/theme): `menhir/theme/local-storage` and `menhir/theme/cookie` keep the reader's choice out of the app's themes, saved and applied to `<html>`, with a head script that applies it before the first paint.",
    "## Skills",
    [
      `- \`${wiringSkill}\`: what every component shares when you wire it into an app: entry points and parts, controlled and uncontrolled state, forms and Field. It comes with the package, so it matches the installed version.`,
      `- \`${stylingSkill}\`: styling components in one consistent look, such as the shadcn look.`,
    ].join("\n"),
    "## Docs",
    [
      "- [Getting started](/docs/getting-started): installing Menhir, using a first component, and giving a coding agent the skills.",
      "- [Styling](/docs/styling): styling a component through its data attributes, and the styling skill in `node_modules/menhir/skills/menhir-styling`, which styles components in one look, such as the shadcn look.",
      "- [Solid 2.0](/docs/solid-2): how the components follow Solid 2.0's idioms: props, the `render` prop, controlled state, async data under `<Loading>`, server rendering and popups in the top layer.",
      "- [Forms without a library](/docs/forms): building forms with Field and Form and no form-state library: a store with nested and array values, a schema run on submit with `issuesToErrors`, errors once touched, a pending submit button, reset, and the uncontrolled form with the router's form action.",
      "- [Bundle size](/docs/bundle-size): each entry point's size, how it compares with other libraries, and how they are measured.",
    ].join("\n"),
  ];
  return `${blocks.join("\n\n")}\n`;
}

function firstSentence(text: string) {
  const end = text.indexOf(". ");
  return end === -1 ? text : text.slice(0, end + 1);
}

function codeFile(file: CodeFile) {
  const extension = file.name.slice(file.name.lastIndexOf(".") + 1);
  return [`${code(file.name)}:`, fence(extension, file.code)];
}

function fence(language: string, source: string) {
  return `\`\`\`${language}\n${source.trimEnd()}\n\`\`\``;
}

function code(text: string) {
  return `\`${text}\``;
}

function table(head: string[], rows: string[][]) {
  const row = (cells: string[]) =>
    `| ${cells.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`;
  return [row(head), row(head.map(() => "---")), ...rows.map(row)].join("\n");
}
