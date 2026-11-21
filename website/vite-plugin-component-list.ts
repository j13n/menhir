import type { Plugin } from "vite";

import { componentDocs } from "./src/componentDocs/index.ts";
import type { ComponentDoc } from "./src/componentDocs/types.ts";

const moduleId = "virtual:component-list";

/**
 * Serves `virtual:component-list`: each component's slug and name, from
 * `src/componentDocs/index.ts`, in alphabetical order. The docs sidebar lists
 * the component pages from it without bundling every page's text. Read once,
 * when the config loads: restart the dev server after adding a component.
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
      const list = docs
        .map(({ slug, name }) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return `export const components = ${JSON.stringify(list)};`;
    },
  };
}
