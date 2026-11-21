import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import { colorModeScript } from "menhir/color-mode/local-storage";

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
        {/* sizes="32x32" keeps browsers that read SVG from picking the
            .ico; the .ico is for those that do not. */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <title>Menhir</title>
        {/* Applies the reader's saved color mode, or the system's, before
            first paint. The script comes from menhir/color-mode/local-storage, with no
            outside input. As a child it would be HTML-escaped, which breaks
            `&&` and `<`. */}
        {/* oxlint-disable-next-line solid/no-innerhtml */}
        <script innerHTML={colorModeScript()} />
        <HydrationScript />
      </head>
      <body class="bg-stone-50 font-sans text-stone-900 motion-safe:transition-colors motion-safe:duration-150 dark:bg-stone-950 dark:text-stone-100">
        {props.children}
      </body>
    </html>
  );
}
