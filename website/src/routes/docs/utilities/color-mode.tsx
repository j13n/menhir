import { Title } from "@solidjs/meta";
import { For } from "solid-js";
import cookieSize from "virtual:menhir-sizes/color-mode/cookie";
import localStorageSize from "virtual:menhir-sizes/color-mode/local-storage";

import ComponentExample from "../../../components/ComponentExample";
import Section from "../../../components/Section";
import TableScroll from "../../../components/TableScroll";
import { colorModeExample } from "../../../examples/color-mode";
import { formatSize } from "../../../formatSize";

const headScript = `import { colorModeScript } from "menhir/color-mode/local-storage";

// In the document's <head>, before the styles. As a child, the script would
// be HTML-escaped, so pass it as innerHTML.
<script innerHTML={colorModeScript()} />`;

const tailwindCss = `/* Tailwind's dark: variant, from the attribute instead of the system. */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* Native controls and scrollbars follow the mode too. */
:root[data-theme="dark"] {
  color-scheme: dark;
}`;

const plainCss = `:root {
  color-scheme: light;
}
:root[data-theme="dark"] {
  color-scheme: dark;
}
/* Then pick colours with light-dark(), or under [data-theme="dark"]. */`;

const serverDocument = `import { getRequestEvent } from "@solidjs/web";
import {
  colorModeFromCookie,
  colorModeScript,
  createColorMode,
} from "menhir/color-mode/cookie";

// The server's document. The cookie names a fixed mode, or none for system.
const mode = colorModeFromCookie(
  getRequestEvent()?.request.headers.get("cookie"),
);

<html lang="en" data-theme={mode === "system" ? undefined : mode}>
  <head>
    {/* Still needed: the server cannot see the system's preference. */}
    <script innerHTML={colorModeScript()} />
  </head>
  ...
</html>

// In the component that changes the mode:
const colorMode = createColorMode();`;

type Row = { name: string; type: string; description: string };

const options: Row[] = [
  {
    name: "storageKey",
    type: "string",
    description:
      'The localStorage key, or the cookie name, the choice is saved under. Default "color-mode".',
  },
  {
    name: "attribute",
    type: '"class" | `data-${string}`',
    description:
      'Where the look goes on <html>: a data attribute set to light or dark, default "data-theme", or "class" for a light or dark class.',
  },
];

const state: Row[] = [
  {
    name: "mode",
    type: "() => ColorMode",
    description:
      'The reader\'s choice: "light", "dark" or "system". System until the page has settled; from menhir/color-mode/cookie, the saved choice from the first render.',
  },
  {
    name: "system",
    type: "() => ResolvedColorMode",
    description:
      'The look the system prefers, "light" or "dark". Light until the page has settled.',
  },
  {
    name: "resolved",
    type: "() => ResolvedColorMode",
    description: "The look on screen: mode, with system replaced by system().",
  },
  {
    name: "setMode",
    type: "(mode: ColorMode) => void",
    description:
      "Saves a choice and applies it, in every instance in the tab and in other tabs (with a cookie, once they are shown again). Choosing system removes the saved value. Call it from an event handler.",
  },
];

const functions: Row[] = [
  {
    name: "createColorMode",
    type: "(options?) => ColorModeState",
    description:
      "The choice, saved and applied to <html>, following the system while it is system. Call it in a component; it returns the state below.",
  },
  {
    name: "colorModeScript",
    type: "(options?) => string",
    description:
      "The source of the head script that applies the choice before the first paint. Give it the same options as createColorMode.",
  },
  {
    name: "colorModeFromCookie",
    type: "(cookieHeader, options?) => ColorMode",
    description:
      "From menhir/color-mode/cookie only: the mode saved in a request's Cookie header.",
  },
  {
    name: "nextColorMode",
    type: "(mode, system) => ColorMode",
    description:
      "The mode a single cycling toggle moves to next (see Cycling order).",
  },
  {
    name: "resolveColorMode",
    type: "(mode, system) => ResolvedColorMode",
    description: "The look of a mode: system replaced by the system's look.",
  },
];

function RowTable(props: { head: string; rows: Row[] }) {
  return (
    <TableScroll>
      <table>
        <thead>
          <tr>
            <th scope="col">{props.head}</th>
            <th scope="col">Type</th>
            <th scope="col" class="min-w-48">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={props.rows}>
            {(row) => (
              <tr>
                <th scope="row">
                  <code>{row.name}</code>
                </th>
                <td>
                  <code>{row.type}</code>
                </td>
                <td>{row.description}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </TableScroll>
  );
}

function sizeText(size: number | undefined) {
  return size === undefined ? "not measured yet" : formatSize(size);
}

export default function ColorModePage() {
  return (
    <main>
      <Title>Color Mode · Menhir</Title>
      <h1>Color Mode</h1>
      <p>
        The reader's choice of light, dark or system, saved in{" "}
        <code>localStorage</code> or a cookie and applied to{" "}
        <code>&lt;html&gt;</code>. It follows the system while the choice is
        system, and stays in step across tabs. A utility, not a component: the
        control is yours, and so is how each mode looks. The toggle in this
        site's header is the example below.
      </p>
      <dl>
        <dt>Entry points</dt>
        <dd>
          <code>menhir/color-mode/local-storage</code>,{" "}
          {sizeText(localStorageSize)}
        </dd>
        <dd>
          <code>menhir/color-mode/cookie</code>, {sizeText(cookieSize)}
        </dd>
      </dl>
      <ComponentExample
        tailwind={colorModeExample.tailwind}
        css={colorModeExample.css}
      />
      <Section id="setup" title="Setup">
        <p>
          Import from the entry point for where the choice is saved. Both export
          the same functions, so switching is a change of import. Use{" "}
          <code>menhir/color-mode/local-storage</code> unless the server renders
          each page per request and should send the chosen mode; then use{" "}
          <code>menhir/color-mode/cookie</code> (see Server rendering).
        </p>
        <p>
          Add the head script, so the saved look is applied before the page
          first paints, without a flash of the other one:
        </p>
        <pre>
          <code>{headScript}</code>
        </pre>
        <p>
          Style the modes from the attribute. With Tailwind CSS, point the{" "}
          <code>dark:</code> variant at it:
        </p>
        <pre>
          <code>{tailwindCss}</code>
        </pre>
        <p>With plain CSS:</p>
        <pre>
          <code>{plainCss}</code>
        </pre>
        <p>
          Then call <code>createColorMode()</code> in the component that changes
          the mode, as the example does. The server cannot see{" "}
          <code>localStorage</code>, so the state starts as system and catches
          up once the page settles; the head script has already applied the
          right look by then.
        </p>
      </Section>
      <Section id="server-rendering" title="Server rendering">
        <p>
          From <code>menhir/color-mode/cookie</code>, the choice is saved in a
          cookie that the browser sends with every request, so the server can
          render it. <code>createColorMode</code> reads the cookie itself, from{" "}
          <code>getRequestEvent()</code> on the server, so its state is right
          from the first render. Put the attribute on <code>&lt;html&gt;</code>{" "}
          with <code>colorModeFromCookie</code>:
        </p>
        <pre>
          <code>{serverDocument}</code>
        </pre>
        <p>
          The page has to be rendered for each request: a prerendered page has
          no cookie to read, so it shows system and disagrees with the saved
          choice when it hydrates. Keep the head script. While the choice is
          system the server cannot know the look, since the system's preference
          never reaches it; with a fixed mode the script applies what the server
          already rendered. Cookies have no event for changes made in other
          tabs, so another tab picks up a choice when it is shown again.
        </p>
      </Section>
      <Section id="cycling-order" title="Cycling order">
        <p>
          A single button has to step through three modes that share two looks,
          so one click in every round changes nothing on screen.{" "}
          <code>nextColorMode</code> puts that click last: from system it goes
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
          The button's name says the current mode and what a click does, such as
          "Color mode: system. Switch to dark.", and its icon shows the current
          mode.
        </p>
      </Section>
      <Section id="api" title="API reference">
        <RowTable head="Function" rows={functions} />
        <h3>Options</h3>
        <p>
          Taken by <code>createColorMode</code> and <code>colorModeScript</code>
          . Pass both the same options.
        </p>
        <RowTable head="Option" rows={options} />
        <h3>State</h3>
        <p>
          What <code>createColorMode</code> returns.
        </p>
        <RowTable head="Field" rows={state} />
      </Section>
    </main>
  );
}
