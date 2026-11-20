# Contributing

How a component is built in Menhir, so that every component is built the same way. The reasoning is in [PLAN.md](PLAN.md); this page is the procedure and links to it. Setup and test commands are in the [README](README.md#development), Solid 2.0 rules in [AGENTS.md](AGENTS.md), and changesets in [.changeset/README.md](.changeset/README.md).

[Switch](packages/menhir/src/switch) is the worked example of everything below.

## What decides how a component behaves

An earlier one wins when two disagree.

1. **Solid 2.0 idioms** decide the API and the internals. They come first: [AGENTS.md](AGENTS.md), `node_modules/solid-js/CHEATSHEET.md`, <https://v2.solidjs.com>.
2. **The [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/)** pattern for the component decides its roles, states and keyboard behaviour.
3. **Size.** A component costs only what it uses. Between two ways of meeting 1 and 2, the smaller one wins, and extra behaviour has to be worth its bytes. The rules are in [PLAN.md section 6](PLAN.md#6-bundle-size-rules).
4. **Other libraries** may be read for ideas, such as browser and assistive-technology fixes the pattern does not spell out. None is a model for Menhir's structure, API or tests, and they are named in one place only: the credit on the docs site's home page ([PLAN.md section 8](PLAN.md#8-sources-and-approach)).

## Steps

1. **Write the test list first**, in the component's `README.md`, before any implementation. Start from what the WAI-ARIA pattern requires and mark those cases. Then add what the pattern does not cover: browser and assistive-technology behaviour, forms, SSR and hydration, and Menhir's own conventions. List the cases left out with a reason for each.
2. **Write the tests** against Menhir's API.
3. **Write the behaviour.** Never translate another library's source line by line: translated code loses reactivity and mistimes effects. When a React or Solid 1.x pattern has no direct equivalent, use the direction chosen in [PLAN.md, "What does not translate directly"](PLAN.md#what-does-not-translate-directly).
4. **Follow the conventions** for parts, props and polymorphism: [PLAN.md, "Polymorphism"](PLAN.md#polymorphism) and ["API conventions"](PLAN.md#api-conventions).
5. **Set the size budget.** Add a budget for the component's entry point in [test/bundle-size](test/bundle-size), and import only the layers it is allowed to. A pull request over budget fails CI.
6. **Check it against the definition of done** below.

## Recording the sources

Each component's `README.md` (`packages/menhir/src/<component>/README.md`) has a "Sources" table: the WAI-ARIA pattern and the date it was read.

## Copyright notices

- Menhir's code and tests are written for Menhir. Reading another project for ideas needs no notice.
- Do not copy code or test bodies from another project. If that is ever unavoidable, the source's licence notice, and any further notice its file carries, goes into [LICENSE](LICENSE) and `packages/menhir/LICENSE` in the same pull request.

Policy: [PLAN.md section 8](PLAN.md#8-sources-and-approach), "Licences".

## Definition of done

A component is done when every line of [PLAN.md section 10](PLAN.md#10-definition-of-done-per-component) holds. That list is the authority; in short:

- [ ] The test suite passes in jsdom and Chromium, and cases left out are listed with a reason
- [ ] Keyboard and screen-reader behaviour matches the WAI-ARIA pattern
- [ ] No Solid dev diagnostics are reported while its tests run
- [ ] Works with SSR and hydration
- [ ] Size budget set and met; only allowed layers imported
- [ ] Docs page with an unstyled example and the measured size
- [ ] WAI-ARIA pattern and the date it was read recorded in the component's README

## Reviewing the WAI-ARIA patterns

At each release, before the "Version Packages" pull request is merged, check the WAI-ARIA pattern of each component Menhir has for changes since the date in its README. Add a changed requirement to that component's test list and fix it, or open an issue if it can wait, then update the date.
