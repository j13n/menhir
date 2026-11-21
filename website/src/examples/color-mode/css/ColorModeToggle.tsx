import { createColorMode, nextColorMode } from "menhir/color-mode";

import ColorModeIcon from "../ColorModeIcon";
import "./color-mode-toggle.css";

/**
 * One button that cycles through the modes. Its name says the current mode
 * and what a click does; the icon shows the current mode.
 */
export default function ColorModeToggle() {
  const colorMode = createColorMode();
  const next = () => nextColorMode(colorMode.mode(), colorMode.system());

  return (
    <button
      type="button"
      aria-label={`Color mode: ${colorMode.mode()}. Switch to ${next()}.`}
      title={`Color mode: ${colorMode.mode()}`}
      class="color-mode-toggle"
      onClick={() => colorMode.setMode(next())}
    >
      <ColorModeIcon mode={colorMode.mode()} />
    </button>
  );
}
