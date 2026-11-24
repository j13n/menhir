import { For, Show } from "solid-js";
import type { EntryPointSize } from "virtual:menhir-sizes";

import { formatSize } from "../formatSize";
import { entryPointPage } from "../utilities";
import TableScroll from "./TableScroll";

/**
 * Each entry point's size, from the size-limit report. The caption names the
 * table, unless `labelledBy` points at a heading that does, and the page says
 * how the sizes were measured.
 */
export default function SizeTable(props: {
  sizes: readonly EntryPointSize[];
  labelledBy?: string;
}) {
  return (
    <Show when={props.sizes.length > 0} fallback={<p>Not measured yet</p>}>
      <TableScroll>
        <table aria-labelledby={props.labelledBy}>
          <Show when={!props.labelledBy}>
            <caption class="mb-2 caption-top text-left text-sm text-stone-500 dark:text-stone-400">
              Minified and gzipped, Solid left out
            </caption>
          </Show>
          <thead>
            <tr>
              <th scope="col">Entry point</th>
              <th scope="col" class="w-1/4">
                Size
              </th>
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
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </TableScroll>
    </Show>
  );
}
