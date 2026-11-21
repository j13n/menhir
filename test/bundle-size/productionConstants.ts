import { readFileSync } from "node:fs";

import type { Plugin, RolldownOptions } from "rolldown";
import { parseAst } from "rolldown/parseAst";

/**
 * By module, the exports that are constants in a production build, as
 * JavaScript source: `{ "@solidjs/web": { isDev: "false" } }`.
 */
export type ProductionConstants = Record<string, Record<string, string>>;

/**
 * What Solid 2.0's production build for the browser defines
 * (`@solidjs/web/dist/web.js`).
 */
export const solidProduction: ProductionConstants = {
  "@solidjs/web": { isDev: "false", isServer: "false" },
};

/** What Solid 1.x's production build for the browser defines. */
export const solid1Production: ProductionConstants = {
  "solid-js": { DEV: "undefined" },
  "solid-js/store": { DEV: "undefined" },
  "solid-js/web": { isDev: "false", isServer: "false" },
};

/**
 * A size check's `modifyRolldownConfig` that bundles with the production
 * constants of the framework that is left out.
 */
export const inProduction =
  (constants: ProductionConstants) =>
  (config: RolldownOptions): RolldownOptions => ({
    ...config,
    plugins: [config.plugins, productionConstants(constants)],
  });

const virtualPrefix = "\0production-constants:";

/**
 * A Rolldown plugin for measuring a bundle that leaves a framework out
 * (`external`): it gives the framework's modules the constants of their
 * production build, so that Rolldown drops the code behind them, as it does
 * in an app that bundles the framework in production mode (PLAN.md
 * section 6, rule 2). Every other export of the module stays an import.
 */
export function productionConstants(constants: ProductionConstants): Plugin {
  // By module, the file it resolves to, for its export names.
  const files = new Map<string, string>();

  return {
    name: "production-constants",
    // `external` is asked before any plugin, so a framework that is left out
    // would never reach `resolveId` below.
    options(options) {
      const { external } = options;
      const isExternal =
        typeof external === "function"
          ? external
          : (id: string) =>
              [external ?? []]
                .flat()
                .some((match) =>
                  typeof match === "string" ? match === id : match.test(id),
                );
      return {
        ...options,
        external: (id, importer, isResolved) =>
          !(Object.hasOwn(constants, id) && importer !== virtualPrefix + id) &&
          isExternal(id, importer, isResolved),
      };
    },
    async resolveId(source, importer) {
      if (!Object.hasOwn(constants, source)) return;
      // The module below re-exports the real one, which stays out.
      if (importer === virtualPrefix + source)
        return { id: source, external: true };
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      // Left as an import, its constants would stay in the measured size.
      if (!resolved)
        throw new Error(`Could not resolve "${source}" in ${importer}`);
      files.set(source, resolved.id);
      return virtualPrefix + source;
    },
    load(id) {
      if (!id.startsWith(virtualPrefix)) return;
      const module = id.slice(virtualPrefix.length);
      const names = exportNames(files.get(module)!).filter(
        (name) => !Object.hasOwn(constants[module], name),
      );
      // By name, not `export *`: Rolldown would keep the whole namespace of
      // a module it cannot see into.
      return [
        `export { ${names.join(", ")} } from ${JSON.stringify(module)};`,
        ...Object.entries(constants[module]).map(
          ([name, value]) => `export const ${name} = ${value};`,
        ),
      ].join("\n");
    },
  };
}

/** The names a built module exports. */
function exportNames(file: string): string[] {
  const names: string[] = [];
  for (const node of parseAst(readFileSync(file, "utf8")).body) {
    if (node.type === "ExportAllDeclaration") {
      if (!node.exported)
        throw new Error(
          `${file} has \`export * from ${node.source.raw}\`, whose names are not known`,
        );
      names.push(nameOf(node.exported));
    } else if (node.type === "ExportNamedDeclaration") {
      for (const specifier of node.specifiers)
        names.push(nameOf(specifier.exported));
      const declaration = node.declaration;
      if (declaration?.type === "VariableDeclaration") {
        for (const { id } of declaration.declarations)
          if (id.type === "Identifier") names.push(id.name);
          else throw new Error(`${file} exports a destructuring pattern`);
      } else if (declaration?.id?.type === "Identifier") {
        names.push(declaration.id.name);
      }
    }
  }
  return names.filter((name) => name !== "default");
}

const nameOf = (
  name:
    { type: "Identifier"; name: string } | { type: "Literal"; value: string },
) => (name.type === "Identifier" ? name.name : name.value);
