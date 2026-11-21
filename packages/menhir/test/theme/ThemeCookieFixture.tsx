// Rendered on the server, with a Cookie header, and hydrated in
// Theme.hydrate.test.tsx.
import { createTheme } from "../../src/theme/cookie/index.ts";

const themes = ["paper", "nord", "dracula"] as const;

export default function ThemeCookieFixture() {
  const theme = createTheme({ themes, defaultTheme: "paper" });
  return (
    <button
      type="button"
      data-theme-name={theme.theme()}
      onClick={() => theme.setTheme("dracula")}
    >
      {theme.theme()}
    </button>
  );
}
