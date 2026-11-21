/**
 * A source file and its highlighted HTML, from vite-plugin-highlight.ts:
 * `import example from "./Example.tsx?highlight"`.
 */
declare module "*?highlight" {
  const highlighted: import("./highlight").Highlighted;
  export default highlighted;
}

/** The highlighting colours, light and dark, from vite-plugin-highlight.ts. */
declare module "virtual:highlight-theme.css" {}
