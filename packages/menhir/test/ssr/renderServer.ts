// Vitest global setup for the `hydrate` project. A test file is compiled for
// the DOM, so it cannot render to a string itself: the server output of the
// same JSX is a different compile against a different build of Solid. This
// starts a Vite SSR server next to the test run and serves each fixture's
// server-rendered HTML over HTTP, which `renderOnServer` in #test-utils reads
// (HTTP so that it also works when the tests run in Chromium).
import { createServer as createHttpServer } from "node:http";
import type { AddressInfo } from "node:net";

import solid from "@solidjs/vite-plugin";
import { createServer } from "vite";
import type { TestProject } from "vitest/node";

export default async function setup(project: TestProject) {
  const vite = await createServer({
    configFile: false,
    root: project.config.root,
    logLevel: "error",
    appType: "custom",
    plugins: [solid({ ssr: true })],
    server: { middlewareMode: true, ws: false, watch: null },
  });

  const http = createHttpServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    try {
      const query = new URL(request.url!, "http://localhost").searchParams;
      const entry = await vite.ssrLoadModule("/test/ssr/serverEntry.ts");
      response.end(
        await entry.render(query.get("fixture")!, {
          cookie: query.get("cookie") ?? undefined,
        }),
      );
    } catch (error) {
      response.statusCode = 500;
      response.end(error instanceof Error ? error.stack : String(error));
    }
  });
  await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve));

  const { port } = http.address() as AddressInfo;
  project.provide("renderServerUrl", `http://127.0.0.1:${port}`);

  return async () => {
    http.close();
    await vite.close();
  };
}
