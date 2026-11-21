import { Title } from "@solidjs/meta";

import Section from "../../components/Section";

const usage = `import { Switch } from "menhir/switch";

export function AirplaneMode() {
  return (
    <label>
      <Switch.Root name="airplane-mode" class="switch">
        <Switch.Thumb class="thumb" />
      </Switch.Root>
      Airplane mode
    </label>
  );
}`;

const styles = `.switch[data-checked] {
  background: steelblue;
}
.thumb[data-checked] {
  transform: translateX(1.25rem);
}`;

export default function GettingStarted() {
  return (
    <main>
      <Title>Getting started · Menhir</Title>
      <h1>Getting started</h1>
      <p>
        Menhir is a set of unstyled, accessible UI primitives for SolidJS 2.0.
        Each component is its own entry point, so an app ships only what it
        imports.
      </p>
      <Section id="status" title="Status">
        <p>In development. Switch is the first component.</p>
      </Section>
      <Section id="install" title="Install">
        <pre>
          <code>pnpm add menhir</code>
        </pre>
        <p>Menhir needs Solid 2.0. If your app does not have it yet:</p>
        <pre>
          <code>pnpm add solid-js @solidjs/web</code>
        </pre>
      </Section>
      <Section id="first-component" title="Your first component">
        <p>
          Import a component from its entry point and compose its parts. Here a
          Switch is labelled by the <code>&lt;label&gt;</code> around it:
        </p>
        <pre>
          <code>{usage}</code>
        </pre>
        <p>
          Nothing is styled. Every part exposes its state as data attributes,
          such as <code>data-checked</code>, for your CSS to select:
        </p>
        <pre>
          <code>{styles}</code>
        </pre>
      </Section>
      <Section id="next" title="Next">
        <p>
          See <a href="/docs/components">all components</a>, with each one's
          parts, props, keyboard behaviour and size, or compare every entry
          point's <a href="/docs/bundle-size">bundle size</a>.
        </p>
      </Section>
    </main>
  );
}
