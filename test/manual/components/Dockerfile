# One image for the four apps: the workspace's lockfile, and only these
# packages' dependencies. Built from the repo root (compose.yaml). The
# sources are mounted over the image's copy, so edits show without a rebuild.
FROM node:26-slim
RUN npm install --global pnpm@12.21.0
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY test/manual/components/libraries/kobalte/package.json test/manual/components/libraries/kobalte/
COPY test/manual/components/libraries/corvu/package.json test/manual/components/libraries/corvu/
COPY test/manual/components/libraries/base-ui/package.json test/manual/components/libraries/base-ui/
COPY test/manual/components/libraries/radix/package.json test/manual/components/libraries/radix/
RUN pnpm install --frozen-lockfile --filter "./test/manual/components/libraries/*"
COPY test/manual/components test/manual/components
