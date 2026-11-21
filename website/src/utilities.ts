/**
 * menhir's utility entry points: they export functions, not components, and
 * their pages are at `/docs/utilities/<slug>`. Add one here when its page
 * lands in `src/routes/docs/utilities/`.
 */
export const utilities = [{ slug: "color-mode", name: "Color Mode" }];

/** The slug of `menhir/<slug>`. */
const slugOf = (entryPoint: string) => entryPoint.slice("menhir/".length);

/** Whether an entry point, such as `menhir/color-mode`, is a utility. */
export function isUtility(entryPoint: string) {
  const slug = slugOf(entryPoint);
  return utilities.some((utility) => utility.slug === slug);
}

/** The docs page of an entry point, a component's or a utility's. */
export function entryPointPage(entryPoint: string) {
  const section = isUtility(entryPoint) ? "utilities" : "components";
  return `/docs/${section}/${slugOf(entryPoint)}`;
}
