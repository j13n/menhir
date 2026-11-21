import { Title } from "@solidjs/meta";
import { components } from "virtual:component-list";
import { sizes } from "virtual:menhir-sizes";
import { libraries } from "virtual:size-comparison";

import ComparisonTable from "../../components/ComparisonTable";
import Section from "../../components/Section";
import SizeTable from "../../components/SizeTable";

export default function BundleSize() {
  return (
    <main>
      <Title>Bundle size · Menhir</Title>
      <h1>Bundle size</h1>
      <p>
        Each component is its own entry point, so an app pays only for the
        components it imports. Every size on this page is minified and gzipped:
        what a browser downloads.
      </p>
      <Section id="sizes" title="Sizes">
        <SizeTable sizes={sizes} />
      </Section>
      <Section id="comparison" title="Other libraries">
        <p>
          The same components in other libraries, measured the same way. Beside
          each size is its difference from Menhir's.
        </p>
        <ComparisonTable
          sizes={sizes}
          libraries={libraries}
          components={components}
        />
      </Section>
      <Section id="measured" title="How it is measured">
        <p>
          The size of an entry point is what it adds to an app that imports it
          and uses every part of it, bundled with Rolldown, minified and
          gzipped. <code>solid-js</code> and <code>@solidjs/web</code> are left
          out, since the app already has them.
        </p>
        <p>
          The other libraries are measured the same way, each module with every
          part of it, and each library's framework is left out as Solid is:{" "}
          <code>react</code> and <code>react-dom</code> for the React libraries,{" "}
          <code>solid-js</code> for the Solid ones. The sizes are of the
          versions listed under the table, and are measured again whenever this
          site is built.
        </p>
        <p>
          Every entry point has a budget. A change that takes an entry point
          over its budget fails CI.
        </p>
      </Section>
    </main>
  );
}
