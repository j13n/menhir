import type { ComponentDoc, DocSection } from "./types";

/**
 * The section a page links to try first, or `undefined` for a page without
 * one. Throws for a `tryFirst` that names no section of the page, so that
 * a wrong id fails the build instead of rendering a link to nothing.
 */
export function tryFirstSection(
  doc: Pick<ComponentDoc, "name" | "sections" | "tryFirst">,
): DocSection | undefined {
  if (!doc.tryFirst) return undefined;
  const id = doc.tryFirst.section;
  const section = doc.sections?.find((section) => section.id === id);
  if (!section) {
    throw new Error(
      `${doc.name}'s tryFirst names "${id}", which is not one of its sections.`,
    );
  }
  return section;
}
