import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import Section from "./Section";

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export type PartApi = {
  part: string;
  description: string;
  props: PropRow[];
};

export type KeyboardRow = {
  keys: string;
  action: string;
};

export type ComponentPageProps = {
  /** Display name, such as "Switch". */
  name: string;
  description: string;
  /** The Base UI release and the folder under `packages/react/src` it was ported from. */
  upstream: { version: string; folder: string };
  /** Compressed size of the entry point in bytes, as the size-limit output (#9) reports it. */
  size?: number;
  /** Renders the live example. It is shown without the site's styles. */
  example: () => JSX.Element;
  anatomy: string;
  api: PartApi[];
  keyboard: KeyboardRow[];
};

export default function ComponentPage(props: ComponentPageProps) {
  return (
    <main>
      <h1>{props.name}</h1>
      <p>{props.description}</p>
      <dl>
        <dt>Size</dt>
        <dd>
          {props.size === undefined
            ? "Not measured yet"
            : formatKilobytes(props.size)}
        </dd>
        <dt>Ported from</dt>
        <dd>
          <a
            href={`https://github.com/mui/base-ui/tree/v${props.upstream.version}/packages/react/src/${props.upstream.folder}`}
          >
            Base UI {props.upstream.version}
          </a>
        </dd>
      </dl>
      <Section id="example" title="Example">
        <div class="unstyled-example">{props.example()}</div>
      </Section>
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

function formatKilobytes(bytes: number) {
  return `${(bytes / 1000).toFixed(1)} kB`;
}
