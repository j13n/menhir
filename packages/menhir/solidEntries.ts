import { existsSync, readFileSync, renameSync } from "node:fs";

// The last step of `pnpm build`: gives each `solid` entry in dist/source
// the `.jsx` extension that `exports` in package.json names.
//
// A component's entry is a `.ts` file with no JSX, so `tsc` emits it as
// `.js`. A bundler that pre-bundles dependencies takes any entry ending in
// `.js`, follows it into the `.jsx` modules and compiles their JSX for
// React; the components then fail with "React is not defined". Vite does so
// in a server environment whose host turns pre-bundling on, as
// `@cloudflare/vite-plugin` does. It leaves an entry ending in `.jsx` to
// the Solid plugin (PLAN.md section 6, "Build").
const root = new URL("./", import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("package.json", root), "utf8"),
);

for (const [subpath, conditions] of Object.entries<Record<string, string>>(
  manifest.exports,
)) {
  if (typeof conditions !== "object") continue;
  const target = conditions.solid;
  if (!target?.endsWith(".jsx")) {
    throw new Error(`The solid entry of "${subpath}" must end in .jsx`);
  }
  const emitted = new URL(target.replace(/\.jsx$/, ".js"), root);
  if (!existsSync(emitted)) {
    throw new Error(`tsc emitted no ${emitted.pathname} for "${subpath}"`);
  }
  renameSync(emitted, new URL(target, root));
}
