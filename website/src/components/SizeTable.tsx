import { For, Show } from "solid-js";
import type { EntryPointSize } from "virtual:menhir-sizes";

import { formatSize } from "../formatSize";

/** Each entry point's size and budget, from the size-limit report. */
export default function SizeTable(props: { sizes: readonly EntryPointSize[] }) {
  return (
    <Show when={props.sizes.length > 0} fallback={<p>Not measured yet</p>}>
      <table>
        <thead>
          <tr>
            <th scope="col">Entry point</th>
            <th scope="col">Size</th>
            <th scope="col">Budget</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.sizes}>
            {(row) => (
              <tr>
                <th scope="row">
                  <a
                    href={`/docs/components/${row.entryPoint.slice("menhir/".length)}`}
                  >
                    <code>{row.entryPoint}</code>
                  </a>
                </th>
                <td>{formatSize(row.size)}</td>
                <td>{formatSize(row.limit)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </Show>
  );
}
