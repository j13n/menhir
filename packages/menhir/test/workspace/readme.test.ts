// The READMEs list the built components and utilities by name, for readers
// on GitHub and npm. `exports` in package.json is the list that counts, so
// adding an entry point without naming it in both READMEs fails here,
// instead of the lists drifting.
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const workspaceRoot = new URL("../../../../", import.meta.url);
const read = (path: string) =>
  readFileSync(new URL(path, workspaceRoot), "utf8");

const exportPaths = Object.keys(
  JSON.parse(read("packages/menhir/package.json")).exports,
).filter((path) => path !== "./package.json");

// A component has one entry point, such as `./toggle-group`; a utility has
// one per storage, such as `./color-mode/cookie`.
const components = exportPaths
  .filter((path) => path.split("/").length === 2)
  .map((path) => path.slice(2));
const utilities = [
  ...new Set(
    exportPaths
      .filter((path) => path.split("/").length > 2)
      .map((path) => path.split("/")[1]),
  ),
];

/** The names in a line such as "- Components: Switch, Toggle and Meter." */
function listed(readme: string, heading: string): string[] {
  const line = readme.match(new RegExp(`^- ${heading}: (.+?)[.,]?$`, "m"));
  if (!line) throw new Error(`No "- ${heading}:" line`);
  // "color mode and theme, each with ..." names only what comes before it.
  const names = line[1]!.split(/, each /)[0]!;
  return names
    .split(/, | and /)
    .map((name) => name.toLowerCase().replaceAll(" ", "-"));
}

describe.each(["README.md", "packages/menhir/README.md"])("%s", (path) => {
  const readme = read(path);

  it("names every component entry point, and no other", () => {
    expect(listed(readme, "Components").sort()).toEqual(components.sort());
  });

  it("names every utility, and no other", () => {
    expect(listed(readme, "Utilities").sort()).toEqual(utilities.sort());
  });
});
