// Registers @testing-library/jest-dom's matchers (toHaveTextContent etc.)
// with vitest's expect, including their types.
import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia, which menhir/color-mode reads once the page
// settles (the toggle in NavBar). This one reports a light system. A test of
// the system preference replaces it with its own. Node-environment tests,
// such as the Vite plugins', have no window.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList;
}
