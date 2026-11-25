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
  "multi-combobox",
  // No popup of its own to open, but its Region is in the top layer and a
  // closed toast waits for its exit with `floating/presence` (#207).
  "toast",
];

// The popup each popup builds on, by folder in src: the one popup it may
// import besides `core` and `floating` (PLAN.md section 6, rule 4; #32).
// oxlint.config.ts allows these imports and no others between popups, so
// an app that uses both pays for the shared parts once.
export const popupBases = {
  "alert-dialog": "dialog",
  autocomplete: "combobox",
  "context-menu": "menu",
  menubar: "menu",
  "multi-combobox": "combobox",
} as const satisfies Record<string, string>;

// What an app that already has a popup's base pays for the popup, in bytes
// gzipped: the two imported together may cost at most this much more than
// the base alone. test/bundle-size/pairSize.test.ts checks every pair of
// `popupBases`, so a popup that copied its base's code instead of importing
// it fails there. Each margin is the measured difference plus about 20%,
// rounded up to 50 B; PLAN.md section 6, "Enforcement", records the
// differences (#138). A pair without a margin fails typecheck.
export const popupBaseMargins: Record<keyof typeof popupBases, number> = {
  // 36 B measured, and gzip moves a difference that small by tens of bytes
  // when either popup changes, so the margin is larger than 20%.
  "alert-dialog": 100,
  autocomplete: 300,
  "context-menu": 350,
  menubar: 700,
  // 1,191 B measured on 2026-11-25: its Root, Chips, Value, Chip,
  // ChipRemove, Input and Item, and the List and Popup that wrap
  // Combobox's (#206).
  "multi-combobox": 1450,
};

// Popups that build on no popup but share most of their code with one
// through `floating`, by folder in src: Preview Card opens on hover and
// focus as Tooltip does, and building on Tooltip saved an app with both
// 31 B while costing an app with Preview Card alone 86 B (#205). They are
// measured as a pair all the same, so that an app with both pays for the
// shared code once: test/bundle-size/pairSize.test.ts holds each to its
// margin over the other alone, kept as `popupBaseMargins` are.
export const floatingNeighbours = {
  "preview-card": "tooltip",
} as const satisfies Record<string, string>;

// 507 B measured on 2026-11-25 (#205).
export const floatingNeighbourMargins: Record<
  keyof typeof floatingNeighbours,
  number
> = {
  "preview-card": 650,
};

// The simple component each simple component builds on, by folder in src:
// the one simple component it may import besides `core` (PLAN.md section 6,
// rule 4). Checkbox Group renders Checkbox's Root and re-exports its
// Indicator (#146). oxlint.config.ts allows these imports and no others
// between simple components, and the base reads nothing of the component
// built on it, so an app with the base alone bundles none of it.
export const simpleBases = {
  "checkbox-group": "checkbox",
} as const satisfies Record<string, string>;

// The same margins as `popupBaseMargins`, for the pairs of `simpleBases`.
export const simpleBaseMargins: Record<keyof typeof simpleBases, number> = {
  "checkbox-group": 850,
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
