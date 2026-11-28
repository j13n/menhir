import {
  createColorScheme,
  nextColorScheme,
} from "menhir/color-scheme/local-storage";
import { Tooltip } from "menhir/tooltip";

import ColorSchemeIcon from "../ColorSchemeIcon";
import "./color-scheme-toggle.css";

/**
 * One button that cycles through the schemes. Its name says the current scheme
 * and what a click does, and a Tooltip shows the name; the icon shows the
 * current scheme.
 */
export default function ColorSchemeToggle() {
  const colorScheme = createColorScheme();
  const next = () =>
    nextColorScheme(colorScheme.scheme(), colorScheme.system());
  const label = () =>
    `Color scheme: ${colorScheme.scheme()}. Switch to ${next()}.`;

  return (
    <Tooltip.Root>
      {/* The tooltip says the name again, so it does not describe the button
          as well. */}
      <Tooltip.Trigger
        aria-label={label()}
        aria-describedby={false}
        class="color-scheme-toggle"
        onClick={() => colorScheme.setScheme(next())}
      >
        <ColorSchemeIcon scheme={colorScheme.scheme()} />
      </Tooltip.Trigger>
      <Tooltip.Popup class="color-scheme-tooltip" side="bottom" sideOffset={8}>
        <Tooltip.Arrow class="color-scheme-tooltip-arrow" />
        {label()}
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}
