import type { ComponentDoc } from "./componentDocs/types";
import { siteUrl } from "./site";

/** Search results cut descriptions at about this many characters. */
export const DESCRIPTION_LIMIT = 160;

/** A component page's title: what people search for, then the site. */
export function componentTitle(name: string) {
  return `${name} component for SolidJS · Menhir`;
}

/**
 * A component page's description for search results and link previews: the
 * first sentence of its description, without the WAI-ARIA pattern after the
 * colon when the whole sentence is too long, or its summary.
 */
export function componentDescription(
  doc: Pick<ComponentDoc, "name" | "description" | "summary">,
) {
  const intro = `An unstyled, accessible ${doc.name} for SolidJS:`;
  const sentence = (doc.summary ?? firstSentence(doc.description)).replace(
    /\.$/,
    "",
  );
  const options = [sentence, sentence.replace(/: the WAI-ARIA .*$/, "")];
  const fits = options
    .map((text) => `${intro} ${lowerFirst(text)}.`)
    .find((description) => description.length <= DESCRIPTION_LIMIT);
  if (fits === undefined) {
    throw new Error(
      `${doc.name}'s description is too long for search results, even without its WAI-ARIA pattern. Give its ComponentDoc a summary.`,
    );
  }
  return fits;
}

/** The structured data for a component page's place in the site. */
export function componentBreadcrumbs(name: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Menhir", item: `${siteUrl}/` },
      { name: "Components", item: `${siteUrl}/docs/components` },
      { name, item: `${siteUrl}/docs/components/${slug}` },
    ].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...crumb,
    })),
  };
}

function firstSentence(text: string) {
  return text.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? text;
}

/** "A control" to "a control"; a name such as "WAI-ARIA" stays as it is. */
function lowerFirst(text: string) {
  return /^[A-Z](?![A-Z])/.test(text)
    ? text[0].toLowerCase() + text.slice(1)
    : text;
}
