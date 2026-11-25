// One lint config for the workspace, as in the `pnpm create solid@latest`
// template: oxlint running eslint-plugin-solid's v2 rules as a JS plugin
// (PLAN.md section 7). The library also gets the bundle-size rules of PLAN.md
// section 6, which packages/menhir/test/workspace/lint.test.ts checks against
// fixtures.
import { defineConfig } from "oxlint";
import solidV2 from "eslint-plugin-solid/configs/v2";

import {
  popupBases,
  popupComponents as popups,
  simpleBases,
} from "./packages/menhir/layers.ts";

const library = "packages/menhir/src/**";
// Files that break the rules on purpose. Linted only by lint.test.ts.
const fixtures = "packages/menhir/test/workspace/lint-fixtures/**";
const includeFixtures = process.env.MENHIR_LINT_FIXTURES === "1";

const solidPackages = ["solid-js", "@solidjs/web"];

export default defineConfig({
  jsPlugins: ["eslint-plugin-solid", "eslint-plugin-boundaries"],
  ignorePatterns: [
    "**/*.gen.*",
    "dist",
    // Other libraries' components, in React and Solid 1, which the Solid 2
    // rules do not fit. Manual tests, compared on a device.
    "test/manual/*/libraries/**",
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
      {
        type: "popup",
        pattern: `src/{${popups.join(",")}}`,
        capture: ["name"],
      },
      { type: "simple", pattern: "src/*", capture: ["name"] },
    ],
    "boundaries/files": [{ category: "test", pattern: "**/*.test.{ts,tsx}" }],
  },
  rules: solidV2.rules,
  overrides: [
    {
      files: [library, fixtures],
      rules: {
        // `onFormReset` (core/formReset.ts) calls its callbacks from the
        // form's `reset` event and a task after it, never in a tracked
        // scope; named here, the rule does not ask for their reads of props
        // and signals to be tracked.
        "solid/reactivity": [
          "warn",
          { customReactiveFunctions: ["onFormReset"] },
        ],
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
              // A simple component that builds on another imports that one
              // too, as Checkbox Group imports Checkbox's parts (simpleBases).
              ...Object.entries(simpleBases).map(([component, base]) => ({
                from: {
                  element: { type: "simple", captured: { name: component } },
                },
                allow: {
                  to: { element: { type: "simple", captured: { name: base } } },
                },
              })),
              {
                from: { element: { type: "popup" } },
                allow: { to: { element: { types: ["core", "floating"] } } },
              },
              // A popup that builds on another imports that one too, as Alert
              // Dialog imports Dialog's parts (popupBases).
              ...Object.entries(popupBases).map(([popup, base]) => ({
                from: { element: { type: "popup", captured: { name: popup } } },
                allow: {
                  to: { element: { type: "popup", captured: { name: base } } },
                },
              })),
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
