import type { CodeFile, ComponentDoc } from "./componentDocs/types";
import { formatSize } from "./formatSize";

/** Where a component page's Markdown version is served, for agents to read. */
export const markdownPath = (slug: string) => `/docs/components/${slug}.md`;

export type MarkdownExtras = {
  /** Compressed size of the entry point in bytes; undefined until measured. */
  size?: number;
  /** The example's source files, styled with Tailwind CSS and with plain CSS. */
  example: { tailwind: CodeFile[]; css: CodeFile[] };
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
    "## Install",
    fence("sh", "pnpm add menhir solid-js @solidjs/web"),
    "## Anatomy",
    fence("tsx", doc.anatomy),
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
  ];
  return `${blocks.join("\n\n")}\n`;
}

/**
 * The site's index for agents, served at `/llms.txt` (https://llmstxt.org):
 * what Menhir is, how to install it, and a link to each component's Markdown
 * with the first sentence of its description.
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
    "## Docs",
    [
      "- [Getting started](/docs/getting-started): installing Menhir and using a first component.",
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
