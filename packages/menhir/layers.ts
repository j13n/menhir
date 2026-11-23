// The popup components of PLAN.md section 6, rule 4: the only components
// that may import the `floating` layer. Every other folder in src is a
// simple component, so a new popup is added here. oxlint.config.ts gives
// these folders the popup layer, and test/bundle-size/floating.test.ts
// checks that no other entry point bundles `floating`.
export const popupComponents = [
  "dialog",
  "alert-dialog",
  "popover",
  "tooltip",
  "preview-card",
  "menu",
  "context-menu",
  "menubar",
  "navigation-menu",
  "select",
  "combobox",
  "autocomplete",
];

// The popup each popup builds on, by folder in src: the one popup it may
// import besides `core` and `floating` (PLAN.md section 6, rule 4; #32).
// oxlint.config.ts allows these imports and no others between popups, so
// an app that uses both pays for the shared parts once.
export const popupBases: Record<string, string> = {
  "alert-dialog": "dialog",
  autocomplete: "combobox",
  "context-menu": "menu",
  menubar: "menu",
};

// The modules of the `floating` layer (PLAN.md section 6), one folder each
// in src/floating, as src/floating/README.md lists them. A popup imports a
// module from its folder directly. test/bundle-size/popupModules.ts names
// the modules each popup must not bundle from this list.
export const floatingModules = [
  "positioning",
  "dismissal",
  "focus",
  "scroll-lock",
  "presence",
  "hover",
  "list-navigation",
  "typeahead",
] as const;
