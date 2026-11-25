import {
  solid1Production,
  type ProductionConstants,
} from "./productionConstants.ts";

/**
 * Other component libraries, for the comparison on the docs site's
 * bundle-size page. Each maps a component of menhir, by the subpath of its
 * entry point, to the module of the library's own version of it, or to the
 * modules it is split into. A component the library does not have is left
 * out.
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
  /**
   * Such as `{ switch: "@radix-ui/react-switch" }`. A component the library
   * splits into several modules of one package maps to all of them, which
   * are measured together, such as Base UI's Radio and RadioGroup.
   */
  components: Record<string, string | string[]>;
};

/**
 * The name of a component's size check, and of what the docs site shows
 * as its module: the module, or its modules joined by " + ".
 */
export const moduleName = (modules: string | string[]): string =>
  typeof modules === "string" ? modules : modules.join(" + ");

/**
 * The package of a component's module, or of its modules, which are of one
 * package: its first module, for the version measured.
 */
export const firstModule = (modules: string | string[]): string =>
  typeof modules === "string" ? modules : modules[0]!;

export const libraries: Library[] = [
  {
    name: "Base UI",
    framework: "React",
    ignore: ["react", "react-dom"],
    components: {
      accordion: "@base-ui/react/accordion",
      "alert-dialog": "@base-ui/react/alert-dialog",
      autocomplete: "@base-ui/react/autocomplete",
      avatar: "@base-ui/react/avatar",
      checkbox: "@base-ui/react/checkbox",
      "checkbox-group": "@base-ui/react/checkbox-group",
      collapsible: "@base-ui/react/collapsible",
      combobox: "@base-ui/react/combobox",
      "context-menu": "@base-ui/react/context-menu",
      dialog: "@base-ui/react/dialog",
      field: "@base-ui/react/field",
      form: "@base-ui/react/form",
      input: "@base-ui/react/input",
      meter: "@base-ui/react/meter",
      menu: "@base-ui/react/menu",
      menubar: "@base-ui/react/menubar",
      // The same module as its Combobox.
      "multi-combobox": "@base-ui/react/combobox",
      "navigation-menu": "@base-ui/react/navigation-menu",
      "number-field": "@base-ui/react/number-field",
      "otp-field": "@base-ui/react/otp-field",
      popover: "@base-ui/react/popover",
      "preview-card": "@base-ui/react/preview-card",
      progress: "@base-ui/react/progress",
      // Its Radio is one radio, and its RadioGroup the group around them.
      radio: ["@base-ui/react/radio-group", "@base-ui/react/radio"],
      "scroll-area": "@base-ui/react/scroll-area",
      select: "@base-ui/react/select",
      separator: "@base-ui/react/separator",
      slider: "@base-ui/react/slider",
      switch: "@base-ui/react/switch",
      tabs: "@base-ui/react/tabs",
      toggle: "@base-ui/react/toggle",
      "toggle-group": "@base-ui/react/toggle-group",
      tooltip: "@base-ui/react/tooltip",
    },
  },
  {
    name: "Radix",
    framework: "React",
    ignore: ["react", "react-dom"],
    components: {
      accordion: "@radix-ui/react-accordion",
      "alert-dialog": "@radix-ui/react-alert-dialog",
      avatar: "@radix-ui/react-avatar",
      checkbox: "@radix-ui/react-checkbox",
      collapsible: "@radix-ui/react-collapsible",
      "context-menu": "@radix-ui/react-context-menu",
      dialog: "@radix-ui/react-dialog",
      form: "@radix-ui/react-form",
      menu: "@radix-ui/react-dropdown-menu",
      menubar: "@radix-ui/react-menubar",
      "navigation-menu": "@radix-ui/react-navigation-menu",
      "otp-field": "@radix-ui/react-one-time-password-field",
      popover: "@radix-ui/react-popover",
      // Its hover card is a preview card: a card shown on a link's hover.
      "preview-card": "@radix-ui/react-hover-card",
      progress: "@radix-ui/react-progress",
      radio: "@radix-ui/react-radio-group",
      "scroll-area": "@radix-ui/react-scroll-area",
      select: "@radix-ui/react-select",
      separator: "@radix-ui/react-separator",
      slider: "@radix-ui/react-slider",
      switch: "@radix-ui/react-switch",
      tabs: "@radix-ui/react-tabs",
      toggle: "@radix-ui/react-toggle",
      "toggle-group": "@radix-ui/react-toggle-group",
      tooltip: "@radix-ui/react-tooltip",
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
      // Its Image is an avatar: a picture with a fallback.
      avatar: "@kobalte/core/image",
      checkbox: "@kobalte/core/checkbox",
      collapsible: "@kobalte/core/collapsible",
      combobox: "@kobalte/core/combobox",
      "context-menu": "@kobalte/core/context-menu",
      dialog: "@kobalte/core/dialog",
      meter: "@kobalte/core/meter",
      menu: "@kobalte/core/dropdown-menu",
      menubar: "@kobalte/core/menubar",
      // The same module as its Combobox.
      "multi-combobox": "@kobalte/core/combobox",
      "navigation-menu": "@kobalte/core/navigation-menu",
      "number-field": "@kobalte/core/number-field",
      popover: "@kobalte/core/popover",
      // Its hover card is a preview card: a card shown on a link's hover.
      "preview-card": "@kobalte/core/hover-card",
      progress: "@kobalte/core/progress",
      radio: "@kobalte/core/radio-group",
      select: "@kobalte/core/select",
      separator: "@kobalte/core/separator",
      slider: "@kobalte/core/slider",
      switch: "@kobalte/core/switch",
      tabs: "@kobalte/core/tabs",
      toggle: "@kobalte/core/toggle-button",
      "toggle-group": "@kobalte/core/toggle-group",
      tooltip: "@kobalte/core/tooltip",
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
      "otp-field": "corvu/otp-field",
      popover: "corvu/popover",
      tooltip: "corvu/tooltip",
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
