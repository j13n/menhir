import { For } from "solid-js";
import { createTheme } from "menhir/theme/local-storage";

import { themeOptions } from "../themes";

/** A native select of the themes, above a preview drawn in the chosen one. */
export default function ThemePicker() {
  const theme = createTheme(themeOptions);

  return (
    <div class="grid justify-items-start gap-3">
      <label class="text-sm">
        Theme{" "}
        <select
          class="rounded-md border border-stone-300 bg-transparent px-2 py-1 dark:border-stone-700"
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
      {/* Paper by default; in-[…] styles the other themes from the
          attribute on <html>. */}
      <p class="rounded-lg bg-amber-50 p-4 text-amber-950 in-[[data-example-theme=forest]]:bg-emerald-900 in-[[data-example-theme=forest]]:text-emerald-50 in-[[data-example-theme=slate]]:bg-slate-800 in-[[data-example-theme=slate]]:text-slate-100">
        Styled from the attribute on &lt;html&gt;.
      </p>
    </div>
  );
}
