# Styling ships as a skill for coding agents, generated from the website's looks

Menhir stays unstyled, but a developer should be able to give its components a consistent look without writing it from nothing (#124). The package ships a skill for coding agents, `skills/menhir-styling`, rather than styled components or a component registry. A **look** is a complete visual style: a `tokens.css`, a `LOOK.md` with its setup, tokens and recipes, its `LICENSE`, and a worked example per component that uses only those tokens. The agent writes or reuses the look's tokens before any component, styles each component from its worked example or, without one, from the recipes and the nearest example, and checks the result in the browser. The first look is the shadcn look, in Tailwind CSS, for Switch, Dialog, Tabs and Popover.

A look's sources live on the website: `website/src/looks/<look>/` and `website/src/examples/<component>/<look>/`, where the component pages render them beside the Tailwind CSS and CSS examples. `website/styling-skill.ts` copies them into the skill's `looks/` folder, and a test fails while the committed copies differ, so the examples an agent reads are the ones the site renders.

## Considered options

- **A styled package or a copy-paste registry**: a second set of versions to keep in step with `menhir`, and a fixed look per component. PLAN.md's non-goals leave both to others.
- **Looks named by their character** ("neutral", "classic"): avoids naming other libraries, but developers ask for a look by the library they know. The library is the name of the look, not a model for Menhir's components.
- **The skill outside the package** (a separate package, a repository installed with a skills tool, the website): not matched to the installed version.
- **Hand-written examples in the skill**: they go stale without anything failing.
- **Each look in both Tailwind CSS and plain CSS**: twice the examples for each look. Each look is written in its own technology, and the agent translates it, token for token, when the app uses the other.

## Consequences

- `packages/menhir/package.json` publishes `skills` beside `dist`. Bundle sizes are unchanged: no entry point imports the skill.
- A look's tokens apply inside `[data-look="<look>"]` rather than on `:root`, so the site can show a look in one example box, and an app can put the attribute on `<html>` or on one part of a page. Colours use `light-dark()`, so a look follows the CSS `color-scheme`, which the app sets from Menhir's color-scheme utility.
- The skill's folder is `skills/menhir-styling`, where #124 sketched `skills/styling`: the folder is the skill's name, and it has to say whose styling it is once it is copied out of the package into an agent's skills folder, beside other skills.
- The skill's `looks/` folder is committed, and written by a command (`pnpm --filter website skill`) rather than by the website's build: the package can then be published without building the website, and a change to a worked example shows in the pull request's diff. The test that compares the committed copies with the website runs in CI.
- A look has tokens for what it changes. The shadcn look changes colours and radii; its spacing and shadows are Tailwind's own scales, so they are in its recipes, which say which step each part takes, and not in `tokens.css`. A look in plain CSS, such as Bootstrap 5, has no scale to lean on and gets spacing and shadow tokens.
- A worked example takes its colours from tokens, with the exceptions its `LOOK.md` names. The shadcn look has two, as shadcn/ui does: black at 50% behind a dialog, and white text on `destructive`. Tokens for them would make its `tokens.css` differ from the one an app that already uses shadcn/ui has. `website/styling-skill.test.ts` fails for any other colour that is not a token.
- A look that reproduces another library's styles carries that library's licence in its own `LICENSE`, and both LICENSE files point to it (CONTRIBUTING, "Copyright notices").
- Agents don't scan `node_modules` for skills, so Getting Started, the Styling page (`/docs/styling`) and the package README tell developers to point their `AGENTS.md` at the skill or copy it into their agent's skills folder.
