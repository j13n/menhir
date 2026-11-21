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
      checkbox: "@base-ui/react/checkbox",
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
      checkbox: "@radix-ui/react-checkbox",
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
      checkbox: "@kobalte/core/checkbox",
      meter: "@kobalte/core/meter",
      progress: "@kobalte/core/progress",
      separator: "@kobalte/core/separator",
      switch: "@kobalte/core/switch",
      toggle: "@kobalte/core/toggle-button",
      "toggle-group": "@kobalte/core/toggle-group",
    },
  },
  {
    // None of menhir's components yet. Its package is `corvu`, with one
    // module per component, such as `corvu/dialog`.
    name: "corvu",
    framework: "Solid 1.x",
    ignore: ["solid-js"],
    components: {},
  },
];
