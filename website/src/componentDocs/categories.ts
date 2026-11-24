/**
 * The groups the components are listed in, in the order the home page, the
 * docs sidebar and the components overview show them. Each component's doc
 * names its own, in `category`.
 */
export const componentCategories = [
  "Inputs",
  "Forms",
  "Pickers",
  "Disclosure",
  "Overlays",
  "Menus & navigation",
  "Display",
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

/** A category's id in a URL fragment, such as "menus-navigation". */
export function categoryId(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
