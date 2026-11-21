// Rendered on the server, with a Cookie header, and hydrated in
// ColorMode.hydrate.test.tsx.
import {
  createColorMode,
  nextColorMode,
} from "../../src/color-mode/cookie/index.ts";

export default function ColorModeCookieFixture() {
  const colorMode = createColorMode();
  return (
    <button
      type="button"
      data-mode={colorMode.mode()}
      onClick={() =>
        colorMode.setMode(nextColorMode(colorMode.mode(), colorMode.system()))
      }
    >
      {colorMode.mode()}
    </button>
  );
}
