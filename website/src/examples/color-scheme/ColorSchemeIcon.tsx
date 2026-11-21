import { Match, Switch } from "solid-js";
import type { ColorScheme } from "menhir/color-scheme/local-storage";

/** A sun, a moon or a screen, for the light, dark and system schemes. */
export default function ColorSchemeIcon(props: { scheme: ColorScheme }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <Switch>
        <Match when={props.scheme === "light"}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </Match>
        <Match when={props.scheme === "dark"}>
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
        </Match>
        <Match when={props.scheme === "system"}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </Match>
      </Switch>
    </svg>
  );
}
