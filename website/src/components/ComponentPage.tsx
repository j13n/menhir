import { Link } from "@solidjs/meta";
import { Tooltip } from "menhir/tooltip";
import { For, Show } from "solid-js";

import { tryFirstSection } from "../componentDocs/tryFirst";
import type { ComponentDoc } from "../componentDocs/types";
import { markdownPath } from "../componentMarkdown";
import { formatSize } from "../formatSize";
import {
  componentBreadcrumbs,
  componentDescription,
  componentTitle,
} from "../pageHead";
import type { Highlighted } from "../highlight";
import CodeBlock from "./CodeBlock";
import CopyButton from "./CopyButton";
import SiteTooltip from "./SiteTooltip";
import PageHead from "./PageHead";
import ComponentExample, {
  type ComponentExampleProps,
} from "./ComponentExample";
import Section from "./Section";
import TableScroll from "./TableScroll";

export type {
  ComponentDoc,
  KeyboardRow,
  PartApi,
  PropRow,
} from "../componentDocs/types";

export type ComponentPageProps = ComponentDoc & {
  /** Compressed size of the entry point in bytes: the default export of `virtual:menhir-sizes/<slug>`. */
  size?: number;
  /** The live example, styled with Tailwind CSS and with plain CSS, and in each look that has one. */
  example: ComponentExampleProps;
  /** Each further section's code, by the section's id: a `?highlight` import of each file of `src/examples/<slug>/<id>/`, in order. */
  sectionCode?: Record<string, Highlighted | Highlighted[]>;
};

/** The look of the page's links for agents, beside the heading. */
const agentLinkClass =
  "rounded-sm text-stone-500 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-400 dark:hover:text-white";

export default function ComponentPage(props: ComponentPageProps) {
  return (
    <main>
      <PageHead
        title={componentTitle(props.name)}
        description={componentDescription(props)}
        structuredData={componentBreadcrumbs(props.name, props.slug)}
      />
      <Link
        rel="alternate"
        type="text/markdown"
        href={markdownPath(props.slug)}
      />
      <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 class="m-0">{props.name}</h1>
        <div class="flex items-baseline gap-4 text-sm">
          <Tooltip.Root>
            <CopyButton
              getText={() =>
                `Add the Menhir ${props.name} from ${location.origin}${markdownPath(props.slug)}`
              }
              label="Copy prompt"
              class={agentLinkClass}
              render={(p) => <Tooltip.Trigger {...p} />}
            />
            <SiteTooltip>
              A prompt that asks your coding agent to add this component
            </SiteTooltip>
          </Tooltip.Root>
          <Tooltip.Root>
            {/* target opts the link out of the router: it is a file, not a
                page. type, which the Trigger sets to "button", is the
                file's media type on a link. */}
            <Tooltip.Trigger
              render={(p) => (
                <a
                  {...p}
                  type="text/markdown"
                  href={markdownPath(props.slug)}
                  target="_self"
                />
              )}
              class={`no-underline ${agentLinkClass}`}
            >
              View as Markdown
            </Tooltip.Trigger>
            <SiteTooltip>This page as Markdown, for agents</SiteTooltip>
          </Tooltip.Root>
        </div>
      </div>
      <p>{props.description}</p>
      <Show when={props.tryFirst}>
        {(tryFirst) => (
          <p>
            Try first:{" "}
            <a href={`#${tryFirst().section}`}>
              {tryFirstSection(props)?.title}
            </a>
            . {tryFirst().text}
          </p>
        )}
      </Show>
      <dl>
        <dt>Size</dt>
        <dd>
          {props.size === undefined
            ? "Not measured yet"
            : formatSize(props.size)}
        </dd>
      </dl>
      <ComponentExample
        tailwind={props.example.tailwind}
        css={props.example.css}
        looks={props.example.looks}
      />
      <Section id="anatomy" title="Anatomy">
        <CodeBlock code={props.anatomy} />
      </Section>
      <Section id="api" title="API reference">
        <For each={props.api}>
          {(part) => (
            <>
              <h3>{part.part}</h3>
              <p>{part.description}</p>
              <TableScroll>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Prop</th>
                      <th scope="col">Type</th>
                      <th scope="col">Default</th>
                      {/* Keeps descriptions readable on a phone: the table scrolls instead. */}
                      <th scope="col" class="min-w-48">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={part.props}>
                      {(prop) => (
                        <tr>
                          <th scope="row">
                            <code>{prop.name}</code>
                          </th>
                          <td>
                            <code>{prop.type}</code>
                          </td>
                          <td>{prop.default ?? "—"}</td>
                          <td>{prop.description}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </TableScroll>
            </>
          )}
        </For>
      </Section>
      <Section id="keyboard" title="Keyboard">
        <TableScroll>
          <table>
            <thead>
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.keyboard}>
                {(row) => (
                  <tr>
                    <th scope="row">
                      <kbd>{row.keys}</kbd>
                    </th>
                    <td>{row.action}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </TableScroll>
      </Section>
      <For each={props.sections}>
        {(section) => (
          <Section id={section.id} title={section.title}>
            <p>{section.text}</p>
            <For each={[props.sectionCode?.[section.id] ?? []].flat()}>
              {(code) => <CodeBlock code={code} />}
            </For>
          </Section>
        )}
      </For>
    </main>
  );
}
