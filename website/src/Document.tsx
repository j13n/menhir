import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";

import { themeBootScript } from "./timeOfDay";

// The document shell (the index.html replacement), picked up by the
// src/Document.* convention; it must render the full <html> and ships no
// client JS. <HydrationScript /> is stripped from the prerendered shell in
// client mode and activates under `ssr: true`. Delete this file to fall
// back to the plugin's built-in shell.
export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>Menhir</title>
        {/* Picks the light or dark theme from the clock before first paint.
            The script is a constant from timeOfDay.ts with no outside input.
            As a child it would be HTML-escaped, which breaks `&&` and `<`. */}
        {/* oxlint-disable-next-line solid/no-innerhtml */}
        <script innerHTML={themeBootScript} />
        <HydrationScript />
      </head>
      <body class="bg-white font-sans text-stone-900 transition-colors duration-1000 dark:bg-stone-950 dark:text-stone-100">
        {props.children}
      </body>
    </html>
  );
}
