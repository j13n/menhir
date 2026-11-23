import cookieSize from "virtual:menhir-sizes/color-scheme/cookie";
import localStorageSize from "virtual:menhir-sizes/color-scheme/local-storage";

import ApiTable from "../../../components/ApiTable";
import type { ApiRow } from "../../../components/ApiTable";
import CodeBlock from "../../../components/CodeBlock";
import ComponentExample from "../../../components/ComponentExample";
import PageHead from "../../../components/PageHead";
import TableScroll from "../../../components/TableScroll";
import Section from "../../../components/Section";
import { colorSchemeExample } from "../../../examples/color-scheme";
import { formatMeasuredSize } from "../../../formatSize";
import { css, ts, tsx } from "../../../highlight";

const headScript = tsx`import { colorSchemeScript } from "menhir/color-scheme/local-storage";

// In the document's <head>, before the styles. As a child, the script would
// be HTML-escaped, so pass it as innerHTML.
<script innerHTML={colorSchemeScript()} />`;

const tailwindCss = css`/* Tailwind's dark: variant, from the attribute instead of the system. */
@custom-variant dark (&:where([data-color-scheme="dark"], [data-color-scheme="dark"] *));

/* Native controls and scrollbars follow the scheme too. */
:root[data-color-scheme="dark"] {
  color-scheme: dark;
}`;

const plainCss = css`:root {
  color-scheme: light;
}
:root[data-color-scheme="dark"] {
  color-scheme: dark;
}
/* Then pick colours with light-dark(), or under [data-color-scheme="dark"]. */`;

const serverDocument = tsx`import { getRequestEvent } from "@solidjs/web";
import {
  colorSchemeFromCookie,
  colorSchemeScript,
  createColorScheme,
} from "menhir/color-scheme/cookie";

// The server's document. The cookie names a fixed scheme, or none for system.
const scheme = colorSchemeFromCookie(
  getRequestEvent()?.request.headers.get("cookie"),
);

<html lang="en" data-color-scheme={scheme === "system" ? undefined : scheme}>
  <head>
    {/* Still needed: the server cannot see the system's preference. */}
    <script innerHTML={colorSchemeScript()} />
  </head>
  ...
</html>

// In the component that changes the scheme:
const colorScheme = createColorScheme();`;

const nonceScript = tsx`// nonce: the one the server made for this response. It goes in the header,
// Content-Security-Policy: script-src 'nonce-<nonce>', and to Solid's own
// scripts through the nonce option of renderToStream or renderToString.
<script nonce={nonce} innerHTML={colorSchemeScript()} />`;

const hashScript = ts`import { createHash } from "node:crypto";
import { colorSchemeScript } from "menhir/color-scheme/local-storage";

// In the build or the server's setup, with the options the page uses.
const hash = createHash("sha256").update(colorSchemeScript()).digest("base64");
// Content-Security-Policy: script-src 'sha256-<hash>'`;

const options: ApiRow[] = [
  {
    name: "storageKey",
    type: "string",
    description:
      'The localStorage key, or the cookie name, the choice is saved under. Default "color-scheme".',
  },
  {
    name: "attribute",
    type: '"class" | `data-${string}`',
    description:
      'Where the look goes on <html>: a data attribute set to light or dark, default "data-color-scheme", or "class" for a light or dark class, which Menhir then owns on <html>.',
  },
];

const state: ApiRow[] = [
  {
    name: "scheme",
    type: "() => ColorScheme",
    description:
      'The reader\'s choice: "light", "dark" or "system". System until the page has settled; from menhir/color-scheme/cookie, the saved choice from the first render.',
  },
  {
    name: "system",
    type: "() => ResolvedColorScheme",
    description:
      'The look the system prefers, "light" or "dark". Light until the page has settled.',
  },
  {
    name: "resolved",
    type: "() => ResolvedColorScheme",
    description:
      "The look on screen: scheme, with system replaced by system().",
  },
  {
    name: "setScheme",
    type: "(scheme: ColorScheme) => void",
    description:
      "Saves a choice and applies it, in every instance in the tab and in other tabs (with a cookie, once they are shown again). Choosing system removes the saved value. Call it from an event handler.",
  },
];

const functions: ApiRow[] = [
  {
    name: "createColorScheme",
    type: "(options?) => ColorSchemeState",
    description:
      "The choice, saved and applied to <html>, following the system while it is system. Call it in a component; it returns the state below.",
  },
  {
    name: "colorSchemeScript",
    type: "(options?) => string",
    description:
      "The source of the head script that applies the choice before the first paint. Give it the same options as createColorScheme.",
  },
  {
    name: "colorSchemeFromCookie",
    type: "(cookieHeader, options?) => ColorScheme",
    description:
      "From menhir/color-scheme/cookie only: the scheme saved in a request's Cookie header.",
  },
  {
    name: "nextColorScheme",
    type: "(scheme, system) => ColorScheme",
    description:
      "The scheme a single cycling toggle moves to next (see Cycling order).",
  },
  {
    name: "resolveColorScheme",
    type: "(scheme, system) => ResolvedColorScheme",
    description: "The look of a scheme: system replaced by the system's look.",
  },
];

export default function ColorSchemePage() {
  return (
    <main>
      <PageHead
        title="Color Scheme utility for SolidJS · Menhir"
        description="A SolidJS utility for the reader's light, dark or system color scheme, saved in localStorage or a cookie, applied to <html> and kept in step across tabs."
      />
      <h1>Color Scheme</h1>
      <p>
        The reader's choice of light, dark or system, saved in{" "}
        <code>localStorage</code> or a cookie and applied to{" "}
        <code>&lt;html&gt;</code>. It follows the system while the choice is
        system, and stays in step across tabs. A utility, not a component: the
        control is yours, and so is how each scheme looks. The toggle in this
        site's header is the example below. For a list of themes rather than
        light and dark, use <a href="/docs/utilities/theme">Theme</a>. The two
        write different attributes, <code>data-color-scheme</code> and{" "}
        <code>data-theme</code>, so a site can use both.
      </p>
      <dl>
        <dt>Entry points</dt>
        <dd>
          <code>menhir/color-scheme/local-storage</code>,{" "}
          {formatMeasuredSize(localStorageSize)}
        </dd>
        <dd>
          <code>menhir/color-scheme/cookie</code>,{" "}
          {formatMeasuredSize(cookieSize)}
        </dd>
      </dl>
      <ComponentExample
        tailwind={colorSchemeExample.tailwind}
        css={colorSchemeExample.css}
      />
      <Section id="setup" title="Setup">
        <p>
          Import from the entry point for where the choice is saved. Both export
          the same functions, so switching is a change of import. Use{" "}
          <code>menhir/color-scheme/local-storage</code> unless the server
          renders each page per request and should send the chosen scheme; then
          use <code>menhir/color-scheme/cookie</code> (see Server rendering).
        </p>
        <p>
          Add the head script, so the saved look is applied before the page
          first paints, without a flash of the other one:
        </p>
        <CodeBlock code={headScript} />
        <p>
          Style the schemes from the attribute. With Tailwind CSS, point the{" "}
          <code>dark:</code> variant at it:
        </p>
        <CodeBlock code={tailwindCss} />
        <p>With plain CSS:</p>
        <CodeBlock code={plainCss} />
        <p>
          Then call <code>createColorScheme()</code> in the component that
          changes the scheme, as the example does. The server cannot see{" "}
          <code>localStorage</code>, so the state starts as system and catches
          up once the page settles; the head script has already applied the
          right look by then.
        </p>
      </Section>
      <Section id="server-rendering" title="Server rendering">
        <p>
          From <code>menhir/color-scheme/cookie</code>, the choice is saved in a
          cookie that the browser sends with every request, so the server can
          render it. <code>createColorScheme</code> reads the cookie itself,
          from <code>getRequestEvent()</code> on the server, so its state is
          right from the first render. Put the attribute on{" "}
          <code>&lt;html&gt;</code> with <code>colorSchemeFromCookie</code>:
        </p>
        <CodeBlock code={serverDocument} />
        <p>
          The page has to be rendered for each request: a prerendered page has
          no cookie to read, so it shows system and disagrees with the saved
          choice when it hydrates. Keep the head script. While the choice is
          system the server cannot know the look, since the system's preference
          never reaches it; with a fixed scheme the script applies what the
          server already rendered. Cookies have no event for changes made in
          other tabs, so another tab picks up a choice when it is shown again.
        </p>
      </Section>
      <Section id="content-security-policy" title="Content Security Policy">
        <p>
          A policy without <code>'unsafe-inline'</code> blocks the head script
          until it is allowed, by a nonce or by its hash.{" "}
          <code>colorSchemeScript</code> returns the script's source and the
          element is yours, so neither needs an option. The script itself only
          reads the saved choice and sets the attribute, which a policy does not
          restrict.
        </p>
        <p>A server that renders each page can put its nonce on the element:</p>
        <CodeBlock code={nonceScript} />
        <p>
          A prerendered page has no nonce, so allow the script by the hash of
          its source:
        </p>
        <CodeBlock code={hashScript} />
        <p>
          Compute the hash rather than pasting it: the source depends on the
          entry point and the options, and may change with any Menhir release.
          Loading the script from a file instead would let the page paint before
          it runs, which is the flash it is there to prevent.
        </p>
      </Section>
      <Section id="cycling-order" title="Cycling order">
        <p>
          A single button has to step through three schemes that share two
          looks, so one click in every round changes nothing on screen.{" "}
          <code>nextColorScheme</code> puts that click last: from system it goes
          to the look the system is not showing, so the first click always does
          something visible.
        </p>
        <TableScroll>
          <table>
            <thead>
              <tr>
                <th scope="col">System prefers</th>
                <th scope="col">Order</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Light</th>
                <td>System → Dark → Light → System</td>
              </tr>
              <tr>
                <th scope="row">Dark</th>
                <td>System → Light → Dark → System</td>
              </tr>
            </tbody>
          </table>
        </TableScroll>
        <p>
          The button's name says the current scheme and what a click does, such
          as "Color scheme: system. Switch to dark.", and its icon shows the
          current scheme.
        </p>
      </Section>
      <Section id="api" title="API reference">
        <ApiTable head="Function" rows={functions} />
        <h3>Options</h3>
        <p>
          Taken by <code>createColorScheme</code> and{" "}
          <code>colorSchemeScript</code>. Pass both the same options.
        </p>
        <ApiTable head="Option" rows={options} />
        <h3>State</h3>
        <p>
          What <code>createColorScheme</code> returns.
        </p>
        <ApiTable head="Field" rows={state} />
      </Section>
    </main>
  );
}
