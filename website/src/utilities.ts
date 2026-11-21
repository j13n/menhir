/**
 * menhir's utility entry points: they export functions, not components, and
 * their pages are at `/docs/utilities/<slug>`. Add one here when its page
 * lands in `src/routes/docs/utilities/`.
 */
export const utilities = [
  { slug: "color-scheme", name: "Color Scheme" },
  { slug: "theme", name: "Theme" },
];

/**
 * The slug of the page of `menhir/<slug>`. A utility with one entry point
 * per variant, such as `menhir/color-scheme/cookie`, has one page for all.
 */
const slugOf = (entryPoint: string) => entryPoint.split("/")[1]!;

/** Whether an entry point, such as `menhir/color-scheme/cookie`, is a utility. */
export function isUtility(entryPoint: string) {
  const slug = slugOf(entryPoint);
  return utilities.some((utility) => utility.slug === slug);
}

/** The docs page of an entry point, a component's or a utility's. */
export function entryPointPage(entryPoint: string) {
  const section = isUtility(entryPoint) ? "utilities" : "components";
  return `/docs/${section}/${slugOf(entryPoint)}`;
}
