import { isDev, isServer, template } from "framework";

import { warn } from "./warn.js";

export function Part() {
  if (isDev) warn("shown in development only");
  if (isServer) return "rendered on the server only";
  return template("<div>")();
}
