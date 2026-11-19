import Section from "../components/Section";

export default function Home() {
  return (
    <main>
      <h1>Menhir</h1>
      <p>
        Unstyled, accessible UI primitives for SolidJS 2.0, ported from{" "}
        <a href="https://base-ui.com">Base UI</a> one component at a time, with
        small and measurable bundles.
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
      <Section id="credits" title="Credits">
        <p>
          Menhir ports the behaviour, accessibility work and tests of Base UI by
          the MUI team. Base UI is MIT licensed, and its copyright notice is
          kept in Menhir's licence.
        </p>
      </Section>
    </main>
  );
}
