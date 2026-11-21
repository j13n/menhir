import { fileURLToPath } from "node:url";

import { build, type Plugin } from "rolldown";
import { beforeAll, describe, expect, it } from "vitest";

import { entryPoints } from "./entryPoints.ts";
import { productionConstants, solidProduction } from "./productionConstants.ts";

// A part with a warning behind `isDev` and a branch behind `isServer` of
// `framework`, which also uses the framework's `template`.
const fixture = `${import.meta.dirname}/fixtures/development-only`;

async function bundle(plugins: Plugin[], { installed = true } = {}) {
  const { output } = await build({
    input: `${fixture}/index.js`,
    write: false,
    // As size-limit leaves a framework out (`ignore`).
    external: /^(framework)($|\/)/,
    resolve: {
      alias: installed ? { framework: `${fixture}/framework.js` } : {},
    },
    output: { minify: true },
    plugins,
  });
  return output[0];
}

describe("productionConstants", () => {
  let chunk: Awaited<ReturnType<typeof bundle>>;

  beforeAll(async () => {
    chunk = await bundle([
      productionConstants({
        framework: { isDev: "false", isServer: "false" },
      }),
    ]);
  });

  it("drops the code behind a constant, and the module only it imports", () => {
    expect(chunk.code).not.toContain("shown in development only");
    expect(chunk.code).not.toContain("[fixture]");
    expect(chunk.code).not.toContain("rendered on the server only");
  });

  it("leaves the rest of the framework out of the bundle", () => {
    expect(chunk.code).toBe(
      'import{template as e}from"framework";function t(){return e(`<div>`)()}export{t as Part};',
    );
  });

  it("is what drops that code: without it the bundle keeps both branches", async () => {
    const development = await bundle([]);
    expect(development.code).toContain("shown in development only");
    expect(development.code).toContain("rendered on the server only");
  });

  it("fails when the framework does not resolve, rather than leaving its constants in", async () => {
    await expect(
      bundle([productionConstants({ framework: { isDev: "false" } })], {
        installed: false,
      }),
    ).rejects.toThrow(/Could not resolve "framework"/);
  });
});

describe("solidProduction", () => {
  // The size budgets rely on this: an entry point that still imported a
  // constant would be measured with its development-only code.
  it.each(entryPoints)(
    "leaves no import of isDev or isServer in an app that uses %s",
    async (entryPoint) => {
      const { output } = await build({
        input: fileURLToPath(import.meta.resolve(entryPoint)),
        write: false,
        external: /^(solid-js|@solidjs\/web)($|\/)/,
        output: { minify: true },
        plugins: [productionConstants(solidProduction)],
      });
      expect(output[0].code).not.toMatch(/\b(isDev|isServer)\b/);
    },
  );
});
