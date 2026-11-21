// Rendered on the server and hydrated in ColorScheme.hydrate.test.tsx.
import {
  createColorScheme,
  nextColorScheme,
} from "../../src/color-scheme/local-storage/index.ts";

export default function ColorSchemeFixture() {
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
      {colorScheme.resolved()}
    </button>
  );
}
