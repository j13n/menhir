// The skills the package ships in `skills/`, for coding agents. An agent
// finds a skill by its folder, and loads it by its frontmatter `name`, so the
// two must agree; and the wiring skill names entry points, which must be
// ones the package has.
import { existsSync, readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const packageRoot = new URL("../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, packageRoot), "utf8");

const exportPaths = Object.keys(JSON.parse(read("package.json")).exports);

const skillFolders = readdirSync(new URL("skills/", packageRoot), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

/** The `name` in a SKILL.md's frontmatter. */
function frontmatterName(skill: string) {
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  return frontmatter.match(/^name: (.+)$/m)?.[1];
}

describe("skills/", () => {
  it.each(skillFolders)("names %s in its SKILL.md's frontmatter", (folder) => {
    const skill = read(`skills/${folder}/SKILL.md`);
    expect(frontmatterName(skill)).toBe(folder);
    expect(skill).toMatch(/^description: .+$/m);
  });
});

describe("skills/menhir/SKILL.md", () => {
  const skill = read("skills/menhir/SKILL.md");

  it("names only entry points the package has", () => {
    const named = [
      ...new Set(
        [...skill.matchAll(/`menhir\/([a-z-]+(?:\/[a-z-]+)*)`/g)].map(
          (match) => `./${match[1]}`,
        ),
      ),
    ];
    expect(named).not.toEqual([]);
    for (const path of named) expect(exportPaths, path).toContain(path);
  });

  it("points to the styling skill as installed, and the file is there", () => {
    const path = "node_modules/menhir/skills/menhir-styling/SKILL.md";
    expect(skill).toContain(path);
    expect(
      existsSync(
        new URL(path.replace("node_modules/menhir/", ""), packageRoot),
      ),
    ).toBe(true);
  });
});
