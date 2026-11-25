import { build } from "rolldown";

// The app that is bundled: it imports one entry point and uses all of it. It
// lives in this folder, so a bare specifier resolves as it would in an app
// that depends on menhir.
const appId = `${import.meta.dirname}/app.js`;

// A module of the `floating` layer, compiled (`dist/floating`) or source
// (`dist/source/floating`).
const floatingModule = /\/dist\/(source\/)?floating\//;
const floatingUiImport = /^@floating-ui\//;

/**
 * Bundles an app that imports `specifier` alone and uses all of it, with
 * Rolldown, unminified, and returns its chunks.
 */
export async function bundleApp(
  specifier: string,
  // By default, an app that uses everything the entry point exports.
  code = `import * as entry from ${JSON.stringify(specifier)};\nconsole.log(entry);\n`,
) {
  const { output } = await build({
    input: appId,
    cwd: import.meta.dirname,
    write: false,
    external: [/^solid-js(\/|$)/, /^@solidjs\/web(\/|$)/, floatingUiImport],
    // Rolldown only warns about a package it cannot find and leaves it out,
    // so a missing dependency, or menhir itself, would look like no leak.
    onLog(level, log, handler) {
      if (log.code === "UNRESOLVED_IMPORT") handler("error", log);
      else handler(level, log);
    },
    plugins: [
      {
        name: "app",
        resolveId: (id) => (id === appId ? id : undefined),
        load: (id) => (id === appId ? code : undefined),
      },
    ],
  });
  return output;
}

/**
 * Bundles an app that imports `specifier` alone, with Rolldown, and returns
 * what it includes from the `floating` layer (PLAN.md section 6, rule 4).
 * An empty list means no leak.
 */
export async function findFloatingModules(
  specifier: string,
): Promise<string[]> {
  const output = await bundleApp(specifier);
  return output.flatMap((file) =>
    file.type === "chunk"
      ? [
          ...file.moduleIds.filter((id) => floatingModule.test(id)),
          // External, so it never has to be installed here: an import of it
          // that survives tree-shaking is the leak.
          ...file.imports.filter((id) => floatingUiImport.test(id)),
        ]
      : [],
  );
}
