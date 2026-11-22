import {
  solid1Production,
  type ProductionConstants,
} from "./productionConstants.ts";

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
  /**
   * The constants of the framework's production build, which the
   * development-only and server-only code of a Solid library sits behind.
   * The React libraries need none: theirs sits behind
   * `process.env.NODE_ENV`, which Rolldown sets to `"production"` itself.
   */
  production?: ProductionConstants;
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
      "alert-dialog": "@base-ui/react/alert-dialog",
      checkbox: "@base-ui/react/checkbox",
      collapsible: "@base-ui/react/collapsible",
      dialog: "@base-ui/react/dialog",
      meter: "@base-ui/react/meter",
      progress: "@base-ui/react/progress",
      separator: "@base-ui/react/separator",
      switch: "@base-ui/react/switch",
      tabs: "@base-ui/react/tabs",
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
      "alert-dialog": "@radix-ui/react-alert-dialog",
      checkbox: "@radix-ui/react-checkbox",
      collapsible: "@radix-ui/react-collapsible",
      dialog: "@radix-ui/react-dialog",
      progress: "@radix-ui/react-progress",
      separator: "@radix-ui/react-separator",
      switch: "@radix-ui/react-switch",
      tabs: "@radix-ui/react-tabs",
      toggle: "@radix-ui/react-toggle",
      "toggle-group": "@radix-ui/react-toggle-group",
    },
  },
  {
    name: "Kobalte",
    framework: "Solid 1.x",
    ignore: ["solid-js"],
    production: solid1Production,
    components: {
      accordion: "@kobalte/core/accordion",
      "alert-dialog": "@kobalte/core/alert-dialog",
      checkbox: "@kobalte/core/checkbox",
      collapsible: "@kobalte/core/collapsible",
      dialog: "@kobalte/core/dialog",
      meter: "@kobalte/core/meter",
      progress: "@kobalte/core/progress",
      separator: "@kobalte/core/separator",
      switch: "@kobalte/core/switch",
      tabs: "@kobalte/core/tabs",
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
    production: solid1Production,
    components: {
      accordion: "corvu/accordion",
      collapsible: "corvu/disclosure",
      dialog: "corvu/dialog",
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
