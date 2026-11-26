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
        title="SolidJS UI components · Menhir"
        description="Menhir's UI components for SolidJS, such as Dialog, Menu, Select, Combobox, Tabs and Tooltip: unstyled, accessible, each its own entry point, with its size."
      />
      <h1>UI components for SolidJS</h1>
      <p>
        Menhir's UI components for SolidJS 2.0 are unstyled and accessible: each
        brings the behaviour, the keyboard support and the roles and states of
        its WAI-ARIA pattern, and leaves the look to your own CSS. They are
        grouped below by what they are for, and each links to its page, with its
        parts, props and a live example.
      </p>
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
