import {
  createColorScheme,
  nextColorScheme,
} from "menhir/color-scheme/local-storage";

import ColorSchemeIcon from "../ColorSchemeIcon";
import "./color-scheme-toggle.css";

/**
 * One button that cycles through the schemes. Its name says the current scheme
 * and what a click does; the icon shows the current scheme.
 */
export default function ColorSchemeToggle() {
  const colorScheme = createColorScheme();
  const next = () =>
    nextColorScheme(colorScheme.scheme(), colorScheme.system());

  return (
    <button
      type="button"
      aria-label={`Color scheme: ${colorScheme.scheme()}. Switch to ${next()}.`}
      title={`Color scheme: ${colorScheme.scheme()}`}
      class="color-scheme-toggle"
      onClick={() => colorScheme.setScheme(next())}
    >
      <ColorSchemeIcon scheme={colorScheme.scheme()} />
    </button>
  );
}
