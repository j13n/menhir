import { Title } from "@solidjs/meta";
import cookieSize from "virtual:menhir-sizes/theme/cookie";
import localStorageSize from "virtual:menhir-sizes/theme/local-storage";

import ApiTable from "../../../components/ApiTable";
import type { ApiRow } from "../../../components/ApiTable";
import ComponentExample from "../../../components/ComponentExample";
import Section from "../../../components/Section";
import { themeExample } from "../../../examples/theme";
import { formatMeasuredSize } from "../../../formatSize";

const setup = `import { createTheme, themeScript } from "menhir/theme/local-storage";

// Every theme the reader can choose, and the one shown until they do.
// Give createTheme and themeScript the same options.
export const themeOptions = {
  themes: ["paper", "slate", "forest"],
  defaultTheme: "paper",
} as const;

// In the document's <head>, before the styles. As a child, the script would
// be HTML-escaped, so pass it as innerHTML.
<script innerHTML={themeScript(themeOptions)} />

// In the component that changes the theme:
const theme = createTheme(themeOptions);
theme.setTheme("slate");`;

const css = `:root[data-theme="paper"] {
  color-scheme: light;
  --background: #fbf7ee;
  --text: #3d2e1f;
}
:root[data-theme="slate"] {
  color-scheme: dark;
  --background: #1e293b;
  --text: #f1f5f9;
}`;

const serverDocument = `import { getRequestEvent } from "@solidjs/web";
import { themeFromCookie, themeScript } from "menhir/theme/cookie";

// The server's document. Pass the options given to createTheme.
const theme = themeFromCookie(
  getRequestEvent()?.request.headers.get("cookie"),
  themeOptions,
);

<html lang="en" data-theme={theme}>
  <head>
    <script innerHTML={themeScript(themeOptions)} />
  </head>
  ...
</html>`;

const withColorMode = `// Both default to data-theme, so give one of them another attribute.
const colorMode = createColorMode({ attribute: "data-color-mode" });
const theme = createTheme(themeOptions);`;

const options: ApiRow[] = [
  {
    name: "themes",
    type: "readonly string[]",
    description:
      "Every theme the reader can choose. Names use letters, digits, - and _. Their union is the type of a theme.",
  },
  {
    name: "defaultTheme",
    type: "string",
    description:
      "One of themes: the theme shown until the reader chooses. Choosing it removes the saved value.",
  },
  {
    name: "storageKey",
    type: "string",
    description:
      'The localStorage key, or the cookie name, the choice is saved under. Default "theme".',
  },
  {
    name: "attribute",
    type: '"class" | `data-${string}`',
    description:
      'Where the theme goes on <html>: a data attribute set to its name, default "data-theme", or "class" for a class named after it.',
  },
];

const state: ApiRow[] = [
  {
    name: "theme",
    type: "() => Theme",
    description:
      "The reader's theme. The default until the page has settled; from menhir/theme/cookie, the saved theme from the first render.",
  },
  {
    name: "setTheme",
    type: "(theme: Theme) => void",
    description:
      "Saves a theme and applies it, in every instance in the tab and in other tabs (with a cookie, once they are shown again). Choosing the default removes the saved value. Call it from an event handler.",
  },
];

const functions: ApiRow[] = [
  {
    name: "createTheme",
    type: "(options) => ThemeState",
    description:
      "The reader's theme, saved and applied to <html>. Call it in a component; it returns the state below.",
  },
  {
    name: "themeScript",
    type: "(options) => string",
    description:
      "The source of the head script that applies the theme before the first paint. Give it the same options as createTheme.",
  },
  {
    name: "themeFromCookie",
    type: "(cookieHeader, options) => Theme",
    description:
      "From menhir/theme/cookie only: the theme saved in a request's Cookie header, or the default.",
  },
];

export default function ThemePage() {
  return (
    <main>
      <Title>Theme · Menhir</Title>
      <h1>Theme</h1>
      <p>
        The reader's choice of theme, out of the themes you list, saved in{" "}
        <code>localStorage</code> or a cookie and applied to{" "}
        <code>&lt;html&gt;</code>. It stays in step across tabs. A utility, not
        a component: the control is yours, and so is how each theme looks. A
        theme is just a theme, light or dark; for the reader's light, dark or
        system choice, use <a href="/docs/utilities/color-mode">Color Mode</a>.
      </p>
      <dl>
        <dt>Entry points</dt>
        <dd>
          <code>menhir/theme/local-storage</code>,{" "}
          {formatMeasuredSize(localStorageSize)}
        </dd>
        <dd>
          <code>menhir/theme/cookie</code>, {formatMeasuredSize(cookieSize)}
        </dd>
      </dl>
      <ComponentExample
        tailwind={themeExample.tailwind}
        css={themeExample.css}
      />
      <Section id="setup" title="Setup">
        <p>
          Import from the entry point for where the choice is saved. Both export
          the same functions, so switching is a change of import. Use{" "}
          <code>menhir/theme/local-storage</code> unless the server renders each
          page per request and should send the chosen theme; then use{" "}
          <code>menhir/theme/cookie</code> (see Server rendering).
        </p>
        <p>
          List the themes, add the head script so the saved theme is applied
          before the page first paints, and call <code>createTheme</code> in the
          component that changes it:
        </p>
        <pre>
          <code>{setup}</code>
        </pre>
        <p>
          Style each theme from the attribute. Each theme can say whether it is
          light or dark with <code>color-scheme</code>, so native controls and
          scrollbars match it:
        </p>
        <pre>
          <code>{css}</code>
        </pre>
        <p>
          The server cannot see <code>localStorage</code>, so the state starts
          as the default theme and catches up once the page settles; the head
          script has already applied the saved theme by then. A saved name that
          is no longer in <code>themes</code> reads as the default.
        </p>
        <p>
          Offer the themes in a <code>&lt;select&gt;</code>, a radio group or a
          menu, as the example does. With <code>attribute: "class"</code>, every
          theme name is a class Menhir owns on <code>&lt;html&gt;</code>:
          changing the theme removes all of them before adding one.
        </p>
      </Section>
      <Section id="server-rendering" title="Server rendering">
        <p>
          From <code>menhir/theme/cookie</code>, the choice is saved in a cookie
          that the browser sends with every request, so the server can render
          it. <code>createTheme</code> reads the cookie itself, from{" "}
          <code>getRequestEvent()</code> on the server, so its state is right
          from the first render. Put the attribute on <code>&lt;html&gt;</code>{" "}
          with <code>themeFromCookie</code>:
        </p>
        <pre>
          <code>{serverDocument}</code>
        </pre>
        <p>
          The page has to be rendered for each request: a prerendered page has
          no cookie to read, so it shows the default and disagrees with the
          saved theme when it hydrates. Cookies have no event for changes made
          in other tabs, so another tab picks up a theme when it is shown again.
        </p>
      </Section>
      <Section id="with-color-mode" title="With Color Mode">
        <p>
          Most sites have either a light, dark or system choice or a list of
          themes. A site with both runs the two side by side, each with its own
          attribute and storage key:
        </p>
        <pre>
          <code>{withColorMode}</code>
        </pre>
      </Section>
      <Section id="api" title="API reference">
        <ApiTable head="Function" rows={functions} />
        <h3>Options</h3>
        <p>
          Taken by <code>createTheme</code>, <code>themeScript</code> and{" "}
          <code>themeFromCookie</code>. Pass them all the same options.
        </p>
        <ApiTable head="Option" rows={options} />
        <h3>State</h3>
        <p>
          What <code>createTheme</code> returns. <code>Theme</code> is the union
          of the names in <code>themes</code>.
        </p>
        <ApiTable head="Field" rows={state} />
      </Section>
    </main>
  );
}
