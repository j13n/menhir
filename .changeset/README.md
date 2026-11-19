# Changesets

Versions and release notes for `menhir` come from the files in this folder,
written with [Changesets](https://changesets.dev).

A pull request that changes `packages/menhir/src` or
`packages/menhir/package.json` adds a changeset (`changedFilePatterns` in
`config.json`). CI's "Changeset" check fails without one.

```sh
pnpm changeset
```

Pick `menhir`, the bump and write the summary as a line of the release notes.
While `menhir` is 0.x, a breaking change is `minor` and anything else `patch`:
`major` would release 1.0.0. A change users cannot notice, such as a refactor
or a devDependency bump, gets `pnpm changeset --empty`, which releases nothing.

Changes to tests, tooling or the docs site need none. The private workspace
packages (`website`, `test/*`) are never versioned.

## Releasing

`.github/workflows/release.yml` runs on every push to `main`:

- With changesets in this folder, it opens or updates a "Version Packages"
  pull request that bumps the version, writes `packages/menhir/CHANGELOG.md`
  and deletes the changesets.
- Once that pull request is merged, it builds and packs `menhir`, runs the
  package checks, publishes to npm through trusted publishing, and creates
  the git tag and the GitHub release.
