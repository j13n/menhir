import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const website = fileURLToPath(new URL(".", import.meta.url));

/**
 * The files a page's content comes from, relative to website/: its route
 * file and, for a component or utility page, its ComponentDoc and examples.
 * Shared files such as the nav bar are left out: a change there is not a
 * change to the page's content.
 */
export function pageSources(
  path: string,
  exists: (file: string) => boolean = (file) => existsSync(join(website, file)),
): string[] {
  const route = path === "/" ? "src/routes/index" : `src/routes${path}`;
  const sources = [`${route}.tsx`, `${route}/index.tsx`];
  const slug = path.match(/^\/docs\/(?:components|utilities)\/([a-z-]+)$/)?.[1];
  if (slug) {
    sources.push(`src/componentDocs/${slug}.ts`, `src/examples/${slug}`);
  }
  return sources.filter(exists);
}

/**
 * When a page's content last changed, as the date of the last commit to its
 * sources, for its `<lastmod>` in the sitemap; undefined for a page whose
 * sources are not committed yet, or outside a git checkout. A shallow clone
 * would date every page at its one commit, so it throws instead.
 */
export function lastModified(path: string): string | undefined {
  const sources = pageSources(path);
  if (sources.length === 0) {
    throw new Error(`No source files found for the page ${path}.`);
  }
  let shallow: string;
  try {
    shallow = git("rev-parse", "--is-shallow-repository");
  } catch {
    return undefined;
  }
  if (shallow === "true") {
    throw new Error(
      "The sitemap dates pages by their last commit, which needs the full git history: check out with fetch-depth: 0.",
    );
  }
  return git("log", "-1", "--format=%cI", "--", ...sources) || undefined;
}

function git(...args: string[]) {
  return execFileSync("git", args, {
    cwd: website,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}
