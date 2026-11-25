# The wiring skill is hand-written, and states only what holds for every component

Each component's Markdown page tells an agent how to add that component, but what holds for every component, such as the entry points, the state props, `render` and Field, is on no single page (#71). The package ships a second skill for coding agents, `skills/menhir`, beside the styling skill (`docs/adr/0007-styling-skill.md`), for wiring components into an app. It is written by hand, where the styling skill's looks are generated from the website. It holds rules, not examples: only rules that hold for every component, with each component's parts, props and keyboard behaviour left to its page, which it sends the agent to. A new component then needs no change to it, and nothing in it copies a page that could go stale.

## Considered options

- **Generated from `componentDocs`**, as `llms.txt` is: what a generator could copy from the docs is each component's details, which the pages already carry. The shared rules are written nowhere else to generate them from.
- **The rules repeated on every component's Markdown page**: one paragraph made thirty times longer, read again with every page. Each page points to the skill instead.
- **Served from the website**: not matched to the installed version, the reason 0007 keeps the styling skill in the package.

## Consequences

- 0007 turned down hand-written examples because they go stale without anything failing. The wiring skill has no examples to go stale. What it can get wrong is a rule: `packages/menhir/test/workspace/skills.test.ts` fails when an entry point it names is not in `exports`, or a skill's frontmatter `name` differs from its folder. A change to a convention every component shares has no test, so CONTRIBUTING ("The wiring skill") asks for the skill to change in the same pull request.
- A rule that holds for most components but not all goes in as a pointer to the page, such as "as its page's 'In a Field' section shows", not as the rule: Select, Combobox and Autocomplete have no such section.
- The component pages and `llms.txt` name the skill by its installed path, `node_modules/menhir/skills/menhir/SKILL.md`, rather than a URL.
