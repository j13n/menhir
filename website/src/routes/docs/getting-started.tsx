import CodeBlock from "../../components/CodeBlock";
import PageHead from "../../components/PageHead";
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

const agentInstructions = `To wire up Menhir components, follow node_modules/menhir/skills/menhir/SKILL.md.
To style Menhir components, follow node_modules/menhir/skills/menhir-styling/SKILL.md.`;

const copySkills = shell`cp -r node_modules/menhir/skills/menhir node_modules/menhir/skills/menhir-styling .claude/skills/`;

export default function GettingStarted() {
  return (
    <main>
      <PageHead
        title="Getting started · Menhir for SolidJS"
        description="Install Menhir, unstyled and accessible UI primitives for SolidJS 2.0, and build your first component: a Switch styled with your own CSS."
      />
      <h1>Getting started</h1>
      <p>
        Menhir is a set of unstyled, accessible UI primitives for SolidJS 2.0,
        written <a href="/docs/solid-2">the Solid 2.0 way</a>. Each component is
        its own entry point, so an app ships only what it imports.
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
      <Section id="install-the-skills" title="Give your agent the skills">
        <p>
          Menhir ships two skills for coding agents in the package, so they
          match the version you have installed:
        </p>
        <ul class="my-3 list-disc space-y-2 pl-6">
          <li>
            <code>menhir</code> wires components into an app: entry points and
            parts, controlled and uncontrolled state, forms and Field.
          </li>
          <li>
            <code>menhir-styling</code> styles them in one consistent look, such
            as the shadcn look or the Bootstrap look.
          </li>
        </ul>
        <p>
          Agents do not look for skills in <code>node_modules</code>, so point
          yours at them with lines in the file it reads at the start, such as{" "}
          <code>AGENTS.md</code> or <code>CLAUDE.md</code>:
        </p>
        <pre class="whitespace-pre-wrap">
          <code>{agentInstructions}</code>
        </pre>
        <p>
          Or copy them into your agent's skills folder, here Claude Code's. A
          copy does not follow new releases; copy them again when you update{" "}
          <code>menhir</code>.
        </p>
        <CodeBlock code={copySkills} />
        <p>
          <a href="/docs/styling">Styling</a> has the rest of the styling skill:
          the looks, what to ask for, and a look of your own.
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
