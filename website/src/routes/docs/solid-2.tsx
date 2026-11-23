import CodeBlock from "../../components/CodeBlock";
import PageHead from "../../components/PageHead";
import Section from "../../components/Section";
import { shell, tsx } from "../../highlight";

const install = shell`pnpm add menhir solid-js @solidjs/web`;

const props = tsx`import { createSignal } from "solid-js";
import { Switch } from "menhir/switch";

export function AirplaneMode() {
  const [on, setOn] = createSignal(false);
  return (
    <label>
      <Switch.Root checked={on()} onCheckedChange={setOn} class="switch">
        <Switch.Thumb class="thumb" />
      </Switch.Root>
      Airplane mode
    </label>
  );
}`;

const render = tsx`// The default element, a <button>.
<Switch.Root class="switch" />

// Another element: attributes only it has go in the function.
<Switch.Root render={(props) => <a {...props} href="/settings" />} />

// A component of your own that spreads its props onto an element.
<Dialog.Trigger render={Button} />
<Dialog.Trigger render={(props) => <Button {...props} variant="ghost" />} />`;

const async = tsx`import { createDeferred, createSignal, For, isPending, Loading } from "solid-js";
import { Combobox } from "menhir/combobox";

export function CountryPicker() {
  const [query, setQuery] = createSignal("");
  // After its first answer, a new query keeps the last items on screen.
  const results = createDeferred(() => searchCountries(query()));
  return (
    <Combobox.Root
      onInputValueChange={(text, { reason }) =>
        setQuery(reason === "input-change" ? text : "")
      }
    >
      <Combobox.Input aria-label="Country" />
      <Combobox.Popup>
        <Combobox.List aria-label="Countries">
          <Loading>
            <For each={results()}>
              {(name) => <Combobox.Item value={name}>{name}</Combobox.Item>}
            </For>
          </Loading>
        </Combobox.List>
        <Loading fallback={<p>Loading countries…</p>}>
          <Combobox.Status>
            {(count) =>
              isPending(() => results()) ? "Searching…" : \`\${count} results\`
            }
          </Combobox.Status>
        </Loading>
      </Combobox.Popup>
    </Combobox.Root>
  );
}`;

export default function Solid2() {
  return (
    <main>
      <PageHead
        title="Accessible UI components for Solid 2.0 · Menhir"
        description="How Menhir's unstyled, accessible components are built for Solid 2.0: props, the render prop, controlled state, async data, server rendering and popups."
      />
      <h1>Accessible UI components for Solid 2.0</h1>
      <p>
        Solid 2.0 changed effects, ownership, async data and the props helpers,
        so a component library written for Solid 1.x has to be migrated, and one
        ported from React has to be rethought. Menhir is written for Solid 2.0
        from its first line: each component follows its WAI-ARIA pattern, and
        its API follows Solid 2.0's idioms. This page is what that means for an
        app that uses it.
      </p>
      <Section id="requirements" title="What it needs">
        <p>
          Menhir's peer dependencies are <code>solid-js</code> and{" "}
          <code>@solidjs/web</code> 2.0. Solid 1.x is not supported.
        </p>
        <CodeBlock code={install} />
        <p>
          The package ships its JSX source under the <code>solid</code> export
          condition, which <code>@solidjs/vite-plugin</code> compiles with your
          app. The same components then render on the server and hydrate in the
          browser.
        </p>
      </Section>
      <Section id="props" title="Props are read where they are used">
        <p>
          A Solid component runs once, and its props are read where they are
          used, never destructured. Menhir's parts read theirs the same way, so
          a signal passed to <code>checked</code> updates the switch without
          running anything again. Pass the value, <code>on()</code>, not the
          signal:
        </p>
        <CodeBlock code={props} />
      </Section>
      <Section id="render-prop" title="Another element: the render prop">
        <p>
          Every part that renders an element takes <code>render</code>, a
          function that receives the element's props and returns the element. In
          Solid, a function from props to JSX is a component, so{" "}
          <code>render</code> is the component to render the part with.
        </p>
        <CodeBlock code={render} />
        <p>
          There is no <code>as</code> prop. Rendering a tag name passed as a
          prop takes Solid's <code>dynamic</code>, which keeps the element
          runtime in every app that imports the part, about 1.6 kB gzipped,
          whether the app ever passes a tag name or not. A <code>render</code>{" "}
          function costs a few bytes per part. The function is read once, when
          the part is created, as an event handler is.
        </p>
      </Section>
      <Section id="state" title="Controlled and uncontrolled state">
        <p>
          A part's state is a value, its default and a change callback:{" "}
          <code>checked</code>, <code>defaultChecked</code> and{" "}
          <code>onCheckedChange</code> on a Switch, and the same pattern for{" "}
          <code>open</code> and <code>value</code>. An empty controlled value is{" "}
          <code>null</code>, since <code>undefined</code> means uncontrolled.
          The callback receives the new value; a popup's also receives{" "}
          <code>{"{ reason, event }"}</code>, such as <code>"escape-key"</code>{" "}
          or <code>"outside-press"</code>.
        </p>
        <p>
          In Solid 2.0, a write can be held until async work that the same
          update started settles. An uncontrolled part writes its own state
          right after the event's flush, with <code>onFlush</code>, so a Switch
          flips and a Menu closes at once, even when your callback starts a
          fetch or an action. A controlled part's value, and its timing, are
          yours.
        </p>
      </Section>
      <Section id="async-data" title="Async data under Loading">
        <p>
          Solid 2.0 has no <code>createResource</code>: a memo that returns a
          Promise is pending until it lands, and <code>&lt;Loading&gt;</code>{" "}
          shows a fallback meanwhile. Menhir's parts work inside it. A
          Combobox's items can come from a search, with{" "}
          <code>createDeferred</code> keeping the last items shown while the
          next answer is in flight, and <code>isPending</code> telling a screen
          reader that a search is running:
        </p>
        <CodeBlock code={async} />
        <p>
          The list opens before the first answer lands, and the keys reach the
          items as soon as they are rendered.
        </p>
      </Section>
      <Section id="server-rendering" title="Server rendering and hydration">
        <ul class="my-3 list-disc space-y-2 pl-6">
          <li>
            Controls such as Switch and Checkbox are native buttons, so their
            labels, focus and keyboard work in the server HTML, before the page
            hydrates.
          </li>
          <li>
            The ids that link one part to another, such as a trigger's{" "}
            <code>aria-controls</code>, are generated with Solid's{" "}
            <code>createUniqueId</code>, which the server render and hydration
            agree on. A Field's label names its control from the server HTML on.
          </li>
          <li>
            A popup open by default is rendered closed on the server and opened
            by hydration: a <code>&lt;dialog open&gt;</code> in the HTML would
            not be modal.
          </li>
        </ul>
      </Section>
      <Section id="popups" title="Popups without a Portal">
        <p>
          Dialog and Alert Dialog are native <code>&lt;dialog&gt;</code>{" "}
          elements; Popover, Tooltip, Menu, Select and Combobox use the{" "}
          <code>popover</code> attribute. Both open in the browser's top layer,
          above the rest of the page, so a popup stays where you wrote it in
          your component tree, with no Portal and no <code>z-index</code>. A
          closed popup stays in the document, so its content keeps its state
          between openings.
        </p>
      </Section>
      <Section id="bundle-size" title="Small bundles">
        <p>
          Each component is its own entry point, such as{" "}
          <code>menhir/dialog</code>, and its parts are re-exported so that a
          bundler drops the ones you do not render. Behaviour a component can do
          without, such as a popup's arrow, is a part rather than a flag, so an
          app that does not render it does not ship it. Every entry point's size
          is measured and budgeted: see{" "}
          <a href="/docs/bundle-size">Bundle size</a>.
        </p>
      </Section>
      <Section id="next" title="Next">
        <p>
          <a href="/docs/getting-started">Get started</a> with a first
          component, or browse <a href="/docs/components">all components</a>.
        </p>
      </Section>
    </main>
  );
}
