import { Link } from "@solidjs/meta";
import { For } from "solid-js";

import type { ComponentDoc } from "../componentDocs/types";
import { markdownPath } from "../componentMarkdown";
import { formatSize } from "../formatSize";
import ComponentExample, {
  type ComponentExampleProps,
} from "./ComponentExample";
import Section from "./Section";

export type {
  ComponentDoc,
  KeyboardRow,
  PartApi,
  PropRow,
} from "../componentDocs/types";

export type ComponentPageProps = ComponentDoc & {
  /** Compressed size of the entry point in bytes: the default export of `virtual:menhir-sizes/<slug>`. */
  size?: number;
  /** The live example, styled with Tailwind CSS and with plain CSS. */
  example: ComponentExampleProps;
};

export default function ComponentPage(props: ComponentPageProps) {
  return (
    <main>
      <Link
        rel="alternate"
        type="text/markdown"
        href={markdownPath(props.slug)}
      />
      <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 class="m-0">{props.name}</h1>
        {/* target opts the link out of the router: it is a file, not a page. */}
        <a
          href={markdownPath(props.slug)}
          target="_self"
          title="This page as Markdown, for agents"
          class="text-sm text-stone-500 no-underline hover:text-stone-950 dark:text-stone-400 dark:hover:text-white"
        >
          View as Markdown
        </a>
      </div>
      <p>{props.description}</p>
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
      />
      <Section id="anatomy" title="Anatomy">
        <pre>
          <code>{props.anatomy}</code>
        </pre>
      </Section>
      <Section id="api" title="API reference">
        <For each={props.api}>
          {(part) => (
            <>
              <h3>{part.part}</h3>
              <p>{part.description}</p>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Prop</th>
                    <th scope="col">Type</th>
                    <th scope="col">Default</th>
                    <th scope="col">Description</th>
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
            </>
          )}
        </For>
      </Section>
      <Section id="keyboard" title="Keyboard">
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
      </Section>
    </main>
  );
}
