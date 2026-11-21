import { For } from "solid-js";

import TableScroll from "./TableScroll";

/** One row of a utility's API reference: a function, option or field. */
export type ApiRow = { name: string; type: string; description: string };

/** A utility page's table of functions, options or state fields. */
export default function ApiTable(props: { head: string; rows: ApiRow[] }) {
  return (
    <TableScroll>
      <table>
        <thead>
          <tr>
            <th scope="col">{props.head}</th>
            <th scope="col">Type</th>
            <th scope="col" class="min-w-48">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(row) => (
              <tr>
                <th scope="row">
                  <code>{row.name}</code>
                </th>
                <td>
                  <code>{row.type}</code>
                </td>
                <td>{row.description}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </TableScroll>
  );
}
