import PageHead from "../../components/PageHead";
import Section from "../../components/Section";
import { siteUrl } from "../../site";

// Full addresses, so a snippet still works pasted into an agent. The pages
// are prerendered, with no window to read the address from.
const origin = siteUrl;

const prompt = `Read ${origin}/llms.txt, then the Markdown of each Menhir component you use, before writing code with it.`;

const instructions = `## Menhir

This project uses Menhir, unstyled UI primitives for SolidJS 2.0. Before
using a Menhir component, read its docs:

- Index of every component: ${origin}/llms.txt
- One component: ${origin}/docs/components/<name>.md

Import each component from its own entry point, such as \`menhir/switch\`,
and style its parts through their data attributes, such as \`data-checked\`.`;

const copy = `curl -o menhir-switch.md ${origin}/docs/components/switch.md`;

export default function LlmsTxt() {
  return (
    <main>
      <PageHead
        title="llms.txt · Menhir for SolidJS"
        description="Menhir's docs as Markdown for coding agents such as Claude Code, Codex and Cursor: an llms.txt index and a Markdown version of every component page."
      />
      <h1>llms.txt</h1>
      <p>
        Every page an agent needs is also served as Markdown, so an agent such
        as Claude Code, Codex or Cursor can read Menhir's docs without parsing
        the site.
      </p>
      <Section id="files" title="What is there">
        <ul class="my-3 list-disc space-y-2 pl-6">
          <li>
            {/* target opts the links out of the router: they are files. */}
            <a href="/llms.txt" target="_self">
              /llms.txt
            </a>{" "}
            is the index (<a href="https://llmstxt.org">llmstxt.org</a>): what
            Menhir is, how to install it, and a link to each component's
            Markdown.
          </li>
          <li>
            <a href="/docs/components/switch.md" target="_self">
              /docs/components/switch.md
            </a>
            , and <code>/docs/components/&lt;name&gt;.md</code> for each
            component, is its page as Markdown: anatomy, the example with
            Tailwind CSS and with plain CSS, props and keyboard behaviour. Each
            component page links its own beside its title.
          </li>
        </ul>
      </Section>
      <Section id="prompt" title="Point an agent at it">
        <p>
          Give the agent the index's address in your request. It follows the
          links to the components it needs:
        </p>
        {/* A sentence, not code: it wraps instead of scrolling. */}
        <pre class="whitespace-pre-wrap">
          <code>{prompt}</code>
        </pre>
      </Section>
      <Section id="instructions" title="Add it to your project's instructions">
        <p>
          So that every session knows where the docs are, add this to the file
          your agent reads at the start, such as <code>AGENTS.md</code> or{" "}
          <code>CLAUDE.md</code>:
        </p>
        <pre>
          <code>{instructions}</code>
        </pre>
      </Section>
      <Section id="copy" title="Keep a copy">
        <p>
          For an agent without web access, save a component's Markdown in your
          project and point it at the file:
        </p>
        <pre>
          <code>{copy}</code>
        </pre>
        <p>
          A saved copy does not follow new releases; fetch it again when you
          update <code>menhir</code>.
        </p>
      </Section>
    </main>
  );
}
