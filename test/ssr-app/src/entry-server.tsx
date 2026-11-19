import { generateHydrationScript, renderToString } from "@solidjs/web";

import { App } from "./App.tsx";

export function render() {
  return generateHydrationScript() + renderToString(() => <App />);
}
