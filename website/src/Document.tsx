import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import { colorSchemeScript } from "menhir/color-scheme/local-storage";

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
        {/* Applies the reader's saved color scheme, or the system's, before
            first paint. The script comes from menhir/color-scheme/local-storage, with no
            outside input. As a child it would be HTML-escaped, which breaks
            `&&` and `<`. */}
        {/* oxlint-disable-next-line solid/no-innerhtml */}
        <script innerHTML={colorSchemeScript()} />
        {/* Cloudflare Web Analytics: page views without cookies, counted
            only by browsers that run the beacon. Production builds only, so
            the dev server reports nothing. */}
        {import.meta.env.PROD && (
          <script
            type="module"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "dc4d6dba5e4e439f9877973d3fa3f04f"}'
          />
        )}
        <HydrationScript />
      </head>
      <body class="bg-stone-50 font-sans text-stone-900 motion-safe:transition-colors motion-safe:duration-150 dark:bg-stone-950 dark:text-stone-100">
        {props.children}
      </body>
    </html>
  );
}
