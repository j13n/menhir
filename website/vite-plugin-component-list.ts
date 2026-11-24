import type { Plugin } from "vite";

import { componentCategories } from "./src/componentDocs/categories.ts";
import { componentDocs } from "./src/componentDocs/index.ts";
import type { ComponentDoc } from "./src/componentDocs/types.ts";

const moduleId = "virtual:component-list";

/**
 * Serves `virtual:component-list`: each component's slug and name, from
 * `src/componentDocs/index.ts`, as `components`, in alphabetical order, and as
 * `componentGroups`, by category in the order of
 * `src/componentDocs/categories.ts` and alphabetical within each. The docs
 * sidebar, the components overview and the bundle size page list the
 * components from it without bundling every page's text. Read once, when the
 * config loads: restart the dev server after adding a component.
 */
export default function componentList(
  options: { docs?: ComponentDoc[] } = {},
): Plugin {
  const docs = options.docs ?? componentDocs;
  return {
    name: "component-list",
    resolveId(id) {
      if (id === moduleId) return `\0${id}`;
    },
    load(id) {
      if (id !== `\0${moduleId}`) return;
      const components = docs
        .map(({ slug, name }) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return [
        `export const components = ${JSON.stringify(components)};`,
        `export const componentGroups = ${JSON.stringify(groupComponents(docs))};`,
      ].join("\n");
    },
  };
}

/** The components by category, leaving out a category with none. */
export function groupComponents(docs: ComponentDoc[]) {
  return componentCategories
    .map((category) => ({
      category,
      components: docs
        .filter((doc) => doc.category === category)
        .map(({ slug, name }) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.components.length > 0);
}
