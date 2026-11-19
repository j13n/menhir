import { For } from "solid-js";

import Section from "../components/Section";

const inspirations = [
  { name: "Base UI", href: "https://base-ui.com" },
  { name: "Kobalte", href: "https://kobalte.dev" },
  { name: "corvu", href: "https://corvu.dev" },
  { name: "Radix", href: "https://www.radix-ui.com" },
  { name: "Ark UI", href: "https://ark-ui.com" },
  { name: "Floating UI", href: "https://floating-ui.com" },
];

export default function Home() {
  return (
    <main>
      <h1>Menhir</h1>
      <p>
        Unstyled, accessible UI primitives for SolidJS 2.0, inspired by{" "}
        <a href="https://base-ui.com">Base UI</a>, with small and measurable
        bundles.
      </p>
      <Section id="status" title="Status">
        <p>
          Planning. Nothing is built yet, and the <code>menhir</code> package is
          not published to npm yet.
        </p>
      </Section>
      <Section id="install" title="Install">
        <p>Once the first version is published:</p>
        <pre>
          <code>pnpm add menhir</code>
        </pre>
        <p>
          Each component has its own entry point, such as{" "}
          <code>menhir/switch</code>, so an app only ships what it imports.
        </p>
      </Section>
      <Section id="credits" title="Inspiration and credits">
        <p>
          Menhir is inspired by other open source projects, and we thank their
          authors for their work. In no particular order:
        </p>
        <ul>
          <For each={inspirations}>
            {(project) => (
              <li>
                <a href={project.href}>{project.name}</a>
              </li>
            )}
          </For>
        </ul>
        <p>
          Base UI, by the MUI team, is the starting point for Menhir's
          behaviour, accessibility work and tests. It is MIT licensed, and its
          copyright notice is kept in Menhir's licence.
        </p>
      </Section>
    </main>
  );
}
