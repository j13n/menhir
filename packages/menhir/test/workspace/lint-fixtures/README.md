Imports that the layer rules in PLAN.md section 6 allow and forbid, laid out
like `packages/menhir/src`. `lint.test.ts` runs the workspace's oxlint config
over them and checks which files fail, and by which rule. The main lint skips
this folder, since some files fail on purpose.
