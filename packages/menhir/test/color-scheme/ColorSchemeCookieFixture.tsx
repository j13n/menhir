// Rendered on the server, with a Cookie header, and hydrated in
// ColorScheme.hydrate.test.tsx.
import {
  createColorScheme,
  nextColorScheme,
} from "../../src/color-scheme/cookie/index.ts";

export default function ColorSchemeCookieFixture() {
  const colorScheme = createColorScheme();
  return (
    <button
      type="button"
      data-scheme={colorScheme.scheme()}
      onClick={() =>
        colorScheme.setScheme(
          nextColorScheme(colorScheme.scheme(), colorScheme.system()),
        )
      }
    >
      {colorScheme.scheme()}
    </button>
  );
}
