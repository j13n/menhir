import { For, Show } from "solid-js";
import type { EntryPointSize } from "virtual:menhir-sizes";

import { formatSize } from "../formatSize";
import { entryPointPage } from "../utilities";
import TableScroll from "./TableScroll";

/** Each entry point's size and budget, from the size-limit report. */
export default function SizeTable(props: { sizes: readonly EntryPointSize[] }) {
  return (
    <Show when={props.sizes.length > 0} fallback={<p>Not measured yet</p>}>
      <TableScroll>
        <table>
          <caption class="mb-2 caption-top text-left text-sm text-stone-500 dark:text-stone-400">
            Minified and gzipped, Solid left out
          </caption>
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
                    <a href={entryPointPage(row.entryPoint)}>
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
      </TableScroll>
    </Show>
  );
}
