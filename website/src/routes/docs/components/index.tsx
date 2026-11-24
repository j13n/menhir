import { For } from "solid-js";
import { componentGroups } from "virtual:component-list";
import { sizes } from "virtual:menhir-sizes";

import { categoryId } from "../../../componentDocs/categories";
import PageHead from "../../../components/PageHead";
import SizeTable from "../../../components/SizeTable";

export default function Components() {
  return (
    <main>
      <PageHead
        title="Components · Menhir for SolidJS"
        description="Every Menhir component for SolidJS, such as Dialog, Menu, Select, Combobox, Tabs and Tooltip: unstyled, accessible, each its own entry point, with its size."
      />
      <h1>Components</h1>
      <p>
        Each component is its own entry point. Its size is what it adds to an
        app that uses every part of it, minified and gzipped, with Solid left
        out.
      </p>
      <For each={componentGroups}>
        {(group) => {
          const id = categoryId(group.category);
          const entryPoints = group.components.map(
            ({ slug }) => `menhir/${slug}`,
          );
          return (
            <section aria-labelledby={id}>
              <h2 id={id}>{group.category}</h2>
              <SizeTable
                labelledBy={id}
                sizes={sizes.filter((row) =>
                  entryPoints.includes(row.entryPoint),
                )}
              />
            </section>
          );
        }}
      </For>
    </main>
  );
}
