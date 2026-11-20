import MenhirScene from "../components/MenhirScene";
import Section from "../components/Section";

export default function Home() {
  return (
    <main>
      <h1>Menhir</h1>
      <p>
        Unstyled, accessible UI primitives for SolidJS 2.0, with small and
        measurable bundles.
      </p>
      <MenhirScene />
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
      <Section id="credits" title="Credits">
        <p>
          Menhir draws inspiration from{" "}
          <a href="https://base-ui.com">Base UI</a>,{" "}
          <a href="https://www.radix-ui.com">Radix</a>, and the Solid UI
          libraries <a href="https://kobalte.dev">Kobalte</a> and{" "}
          <a href="https://corvu.dev">corvu</a>. Thanks to their authors.
        </p>
      </Section>
    </main>
  );
}
