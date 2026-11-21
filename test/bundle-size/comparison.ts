/**
 * Other component libraries, for the comparison on the docs site's
 * bundle-size page. Each maps a component of menhir, by the subpath of its
 * entry point, to the module of the library's own version of it. A component
 * the library does not have is left out.
 */
export type Library = {
  name: string;
  /** The framework the library is built for, as the page shows it. */
  framework: string;
  /**
   * The framework's packages, left out of the size as Solid is left out of
   * menhir's: an app that uses the library has them already.
   */
  ignore: string[];
  /** Such as `{ switch: "@radix-ui/react-switch" }`. */
  components: Record<string, string>;
};

export const libraries: Library[] = [
  {
    name: "Base UI",
    framework: "React",
    ignore: ["react", "react-dom"],
    components: {
      accordion: "@base-ui/react/accordion",
      checkbox: "@base-ui/react/checkbox",
      collapsible: "@base-ui/react/collapsible",
      meter: "@base-ui/react/meter",
      progress: "@base-ui/react/progress",
      separator: "@base-ui/react/separator",
      switch: "@base-ui/react/switch",
      toggle: "@base-ui/react/toggle",
      "toggle-group": "@base-ui/react/toggle-group",
    },
  },
  {
    name: "Radix",
    framework: "React",
    ignore: ["react", "react-dom"],
    components: {
      accordion: "@radix-ui/react-accordion",
      checkbox: "@radix-ui/react-checkbox",
      collapsible: "@radix-ui/react-collapsible",
      progress: "@radix-ui/react-progress",
      separator: "@radix-ui/react-separator",
      switch: "@radix-ui/react-switch",
      toggle: "@radix-ui/react-toggle",
      "toggle-group": "@radix-ui/react-toggle-group",
    },
  },
  {
    name: "Kobalte",
    framework: "Solid 1.x",
    ignore: ["solid-js"],
    components: {
      accordion: "@kobalte/core/accordion",
      checkbox: "@kobalte/core/checkbox",
      collapsible: "@kobalte/core/collapsible",
      meter: "@kobalte/core/meter",
      progress: "@kobalte/core/progress",
      separator: "@kobalte/core/separator",
      switch: "@kobalte/core/switch",
      toggle: "@kobalte/core/toggle-button",
      "toggle-group": "@kobalte/core/toggle-group",
    },
  },
  {
    // Its package is `corvu`, with one module per component. Its disclosure
    // is menhir's collapsible.
    name: "corvu",
    framework: "Solid 1.x",
    ignore: ["solid-js"],
    components: {
      accordion: "corvu/accordion",
      collapsible: "corvu/disclosure",
    },
  },
];

/** Every component some library is compared on, in menhir's order. */
export const comparedComponents: string[] = [
  ...new Set(libraries.flatMap((library) => Object.keys(library.components))),
].sort();

/**
 * The names of the size checks of comparison.size-limit.js that measure
 * several components imported together: shared code is counted once, as in
 * an app that uses them all.
 */
export const totalChecks = {
  /** Every component of `comparedComponents`, in menhir. */
  menhir: "menhir: all compared components",
  /** The library's components together. */
  library: (library: Library) => `${library.name}: all components`,
  /** The same components in menhir, for the difference. */
  menhirFor: (library: Library) => `menhir: the components of ${library.name}`,
};
