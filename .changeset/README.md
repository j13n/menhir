# Changesets

Versions and release notes for `menhir` come from the files in this folder,
written with [Changesets](https://changesets.dev).

A change that users of `menhir` will notice gets a changeset in the same pull
request:

```sh
pnpm changeset
```

Pick `menhir`, the bump (`patch`, `minor` or `major`) and write the summary as
a line of the release notes. Changes to tests, tooling or the docs site need
none. The private workspace packages (`website`, `test/*`) are never versioned.

## Releasing

`.github/workflows/release.yml` runs on every push to `main`:

- With changesets in this folder, it opens or updates a "Version Packages"
  pull request that bumps the version, writes `packages/menhir/CHANGELOG.md`
  and deletes the changesets.
- Once that pull request is merged, it builds and packs `menhir`, runs the
  package checks, publishes to npm through trusted publishing, and creates
  the git tag and the GitHub release.
