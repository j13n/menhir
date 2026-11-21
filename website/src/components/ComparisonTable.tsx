import { For, Show } from "solid-js";
import type { EntryPointSize } from "virtual:menhir-sizes";
import type { ComparedLibrary } from "virtual:size-comparison";

import { formatSize } from "../formatSize";
import { isUtility } from "../utilities";
import TableScroll from "./TableScroll";

/**
 * Each component's size in menhir beside its size in other libraries, each
 * with its difference from menhir's, then the module and version measured in
 * each library. Utilities, such as `menhir/color-mode`, are left out.
 */
export default function ComparisonTable(props: {
  sizes: readonly EntryPointSize[];
  libraries: readonly ComparedLibrary[];
  /** Display names by slug; a component without one shows its slug. */
  components: readonly { slug: string; name: string }[];
}) {
  const rows = () => props.sizes.filter((row) => !isUtility(row.entryPoint));
  const slug = (row: EntryPointSize) => row.entryPoint.slice("menhir/".length);
  const name = (row: EntryPointSize) =>
    props.components.find((component) => component.slug === slug(row))?.name ??
    slug(row);

  return (
    <Show
      when={rows().length > 0 && props.libraries.length > 0}
      fallback={<p>Not measured yet</p>}
    >
      <TableScroll>
        <table>
          <caption class="mb-2 caption-top text-left text-sm text-stone-500 dark:text-stone-400">
            Minified and gzipped, each library's framework left out
          </caption>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Menhir</th>
              <For each={props.libraries}>
                {(library) => (
                  <th scope="col">
                    {library.name}
                    <span class="block text-xs font-normal text-stone-500 dark:text-stone-400">
                      {library.framework}
                    </span>
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={rows()}>
              {(row) => (
                <tr>
                  <th scope="row">
                    <a href={`/docs/components/${slug(row)}`}>{name(row)}</a>
                  </th>
                  <td>{formatSize(row.size)}</td>
                  <For each={props.libraries}>
                    {(library) => (
                      <td>
                        <Show
                          when={library.components[slug(row)]}
                          fallback={
                            <>
                              <span aria-hidden="true">—</span>
                              <span class="sr-only">None</span>
                            </>
                          }
                        >
                          {(component) => (
                            <>
                              {formatSize(component().size)}
                              <SizeDifference
                                size={component().size}
                                base={row.size}
                              />
                            </>
                          )}
                        </Show>
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </TableScroll>
      <ul
        aria-label="Modules measured"
        class="my-3 list-disc space-y-1 pl-6 text-sm"
      >
        <For each={props.libraries}>
          {(library) => (
            <li>
              {library.name}:{" "}
              <Show
                when={Object.keys(library.components).length > 0}
                fallback="none of these components yet"
              >
                <For each={Object.values(library.components)}>
                  {(component, i) => (
                    <>
                      {i() > 0 && ", "}
                      <code>{component.module}</code> {component.version}
                    </>
                  )}
                </For>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}

/**
 * How much larger or smaller `size` is than menhir's `base`, as a percentage
 * of `base`: a triangle up for larger, down for smaller. Screen readers get
 * the difference in words instead of the triangle.
 */
function SizeDifference(props: { size: number; base: number }) {
  const percent = () =>
    Math.round(((props.size - props.base) / props.base) * 100);

  return (
    <span
      class={[
        "ml-1.5 text-xs whitespace-nowrap",
        percent() > 0
          ? "text-rose-700 dark:text-rose-400"
          : percent() < 0
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-stone-500 dark:text-stone-400",
      ]}
    >
      <span aria-hidden="true">
        <Show when={percent() !== 0}>
          <svg
            viewBox="0 0 10 10"
            class="mr-0.5 inline-block size-2 fill-current align-baseline"
          >
            <path d={percent() > 0 ? "M5 1 9 9H1Z" : "M1 1H9L5 9Z"} />
          </svg>
        </Show>
        {Math.abs(percent())}%
      </span>
      <span class="sr-only">
        {percent() > 0
          ? `, ${percent()}% larger than Menhir`
          : percent() < 0
            ? `, ${-percent()}% smaller than Menhir`
            : ", the same size as Menhir"}
      </span>
    </span>
  );
}
