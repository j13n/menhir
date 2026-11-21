// Rendered on the server and hydrated in ColorMode.hydrate.test.tsx.
import {
  createColorMode,
  nextColorMode,
} from "../../src/color-mode/local-storage/index.ts";

export default function ColorModeFixture() {
  const colorMode = createColorMode();
  return (
    <button
      type="button"
      data-mode={colorMode.mode()}
      onClick={() =>
        colorMode.setMode(nextColorMode(colorMode.mode(), colorMode.system()))
      }
    >
      {colorMode.resolved()}
    </button>
  );
}
