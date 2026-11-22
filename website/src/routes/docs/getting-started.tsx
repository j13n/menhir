import { Title } from "@solidjs/meta";

import CodeBlock from "../../components/CodeBlock";
import Section from "../../components/Section";
import { css, shell, tsx } from "../../highlight";

const install = shell`pnpm add menhir`;
const installSolid = shell`pnpm add solid-js @solidjs/web`;

const usage = tsx`import { Switch } from "menhir/switch";

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

const styles = css`.switch[data-checked] {
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
        <p>
          Early 0.x versions: the API may change between minor versions. The
          simple components are built; Dialog, Popover and the other popups come
          next.
        </p>
      </Section>
      <Section id="install" title="Install">
        <CodeBlock code={install} />
        <p>Menhir needs Solid 2.0. If your app does not have it yet:</p>
        <CodeBlock code={installSolid} />
      </Section>
      <Section id="first-component" title="Your first component">
        <p>
          Import a component from its entry point and compose its parts. Here a
          Switch is labelled by the <code>&lt;label&gt;</code> around it:
        </p>
        <CodeBlock code={usage} />
        <p>
          Nothing is styled. Every part exposes its state as data attributes,
          such as <code>data-checked</code>, for your CSS to select:
        </p>
        <CodeBlock code={styles} />
      </Section>
      <Section id="styling-with-an-agent" title="Styling with a coding agent">
        <p>
          Menhir ships a skill for coding agents that styles its components in
          one consistent look, such as the shadcn look. Point your agent at it
          with a line in your project's <code>AGENTS.md</code>: "To style Menhir
          components, follow{" "}
          <code>node_modules/menhir/skills/menhir-styling/SKILL.md</code>".{" "}
          <a href="/docs/styling">Styling</a> has the rest: the looks, what to
          ask for, and a look of your own.
        </p>
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
