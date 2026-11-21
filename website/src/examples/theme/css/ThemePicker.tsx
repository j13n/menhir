import { For } from "solid-js";
import { createTheme } from "menhir/theme/local-storage";

import { themeOptions } from "../themes";
import "./theme-picker.css";

/** A native select of the themes, above a preview drawn in the chosen one. */
export default function ThemePicker() {
  const theme = createTheme(themeOptions);

  return (
    <div class="theme-picker">
      <label>
        Theme{" "}
        <select
          value={theme.theme()}
          onChange={(event) =>
            theme.setTheme(
              event.currentTarget.value as (typeof themeOptions.themes)[number],
            )
          }
        >
          <For each={themeOptions.themes}>
            {(name) => <option value={name}>{name}</option>}
          </For>
        </select>
      </label>
      <p class="theme-preview">Styled from the attribute on &lt;html&gt;.</p>
    </div>
  );
}
