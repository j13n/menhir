// One lint config for the workspace, as in the `pnpm create solid@latest`
// template: oxlint running eslint-plugin-solid's v2 rules as a JS plugin
// (PLAN.md section 7). The library also gets the bundle-size rules of PLAN.md
// section 6, which packages/menhir/test/workspace/lint.test.ts checks against
// fixtures.
import { defineConfig } from "oxlint";
import solidV2 from "eslint-plugin-solid/configs/v2";

const library = "packages/menhir/src/**";
// Files that break the rules on purpose. Linted only by lint.test.ts.
const fixtures = "packages/menhir/test/workspace/lint-fixtures/**";
const includeFixtures = process.env.MENHIR_LINT_FIXTURES === "1";

// The popup components, which may import the `floating` layer. Every other
// folder in src is a simple component, so a new popup is added here.
const popups = [
  "dialog",
  "alert-dialog",
  "popover",
  "tooltip",
  "preview-card",
  "menu",
  "context-menu",
  "menubar",
  "navigation-menu",
  "select",
  "combobox",
  "autocomplete",
];

const solidPackages = ["solid-js", "@solidjs/web"];

export default defineConfig({
  jsPlugins: ["eslint-plugin-solid", "eslint-plugin-boundaries"],
  ignorePatterns: [
    "**/*.gen.*",
    "dist",
    ...(includeFixtures ? [] : [fixtures]),
  ],
  settings: {
    ...solidV2.settings,
    // The layers of PLAN.md section 6, one folder each in src. A pattern
    // matches the end of a folder's path, so the fixtures get the same types.
    // The first match wins.
    "boundaries/elements": [
      { type: "core", pattern: "src/core" },
      { type: "floating", pattern: "src/floating" },
      { type: "popup", pattern: `src/{${popups.join(",")}}` },
      { type: "simple", pattern: "src/*" },
    ],
    "boundaries/files": [{ category: "test", pattern: "**/*.test.{ts,tsx}" }],
  },
  rules: solidV2.rules,
  overrides: [
    {
      files: [library, fixtures],
      rules: {
        // A file outside the layer folders, such as a root barrel `src/index.ts`
        // (section 6, rule 1).
        "boundaries/no-unknown-files": "error",
        // The layer table (rule 4) and the one dependency (rule 5). A policy
        // allows an import; anything no policy allows is an error. Imports
        // within a component or layer are not checked.
        "boundaries/dependencies": [
          "error",
          {
            default: "disallow",
            // Also check packages, and local files outside the layers.
            checkAllOrigins: true,
            checkUnknownLocals: true,
            policies: [
              // Any module may import solid-js and @solidjs/web.
              {
                allow: {
                  to: { module: { origin: "external", source: solidPackages } },
                },
              },
              {
                from: { element: { type: "floating" } },
                allow: [
                  { to: { element: { type: "core" } } },
                  {
                    to: {
                      module: {
                        origin: "external",
                        source: "@floating-ui/dom",
                      },
                    },
                  },
                ],
              },
              {
                from: { element: { type: "simple" } },
                allow: { to: { element: { type: "core" } } },
              },
              {
                from: { element: { type: "popup" } },
                allow: { to: { element: { types: ["core", "floating"] } } },
              },
              // Tests are not shipped, so they import what they need.
              {
                from: { file: { categories: "test" } },
                allow: [
                  { to: { element: { type: "*" } } },
                  { to: { module: { origin: "*" } } },
                ],
              },
            ],
          },
        ],
        // Compound components are namespace re-exports, so that a bundler can
        // drop the parts an app does not use (rule 3).
        "no-restricted-properties": [
          "error",
          {
            object: "Object",
            property: "assign",
            message:
              'Compound components are namespace re-exports (`export * as X from "./index.parts.ts"`), not Object.assign. Use `merge` for props.',
          },
        ],
      },
    },
  ],
});
