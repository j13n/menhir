import { Title } from "@solidjs/meta";
import { sizes } from "virtual:menhir-sizes";

import Section from "../../components/Section";
import SizeTable from "../../components/SizeTable";

export default function BundleSize() {
  return (
    <main>
      <Title>Bundle size · Menhir</Title>
      <h1>Bundle size</h1>
      <p>
        Each component is its own entry point, so an app pays only for the
        components it imports.
      </p>
      <Section id="sizes" title="Sizes">
        <SizeTable sizes={sizes} />
      </Section>
      <Section id="measured" title="How it is measured">
        <p>
          The size of an entry point is what it adds to an app that imports it
          and uses every part of it, bundled with Rolldown, minified and
          gzipped. <code>solid-js</code> and <code>@solidjs/web</code> are left
          out, since the app already has them.
        </p>
        <p>
          Every entry point has a budget. A change that takes an entry point
          over its budget fails CI.
        </p>
      </Section>
    </main>
  );
}
