import { components } from "virtual:component-list";
import { sizes } from "virtual:menhir-sizes";
import { libraries, menhirTotal } from "virtual:size-comparison";

import ComparisonTable from "../../components/ComparisonTable";
import PageHead from "../../components/PageHead";
import Section from "../../components/Section";
import SizeTable from "../../components/SizeTable";

export default function BundleSize() {
  return (
    <main>
      <PageHead
        title="Bundle size · Menhir for SolidJS"
        description="The minified and gzipped size of every Menhir component, each its own entry point, beside the same components in other UI libraries, measured the same way."
      />
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
          Each library's version of the same components, measured the same way.
          Beside each size is its difference from Menhir's.
        </p>
        <p>
          These are sizes only. The libraries differ in API and in what each
          component includes, so a larger size can come with features Menhir
          leaves out.
        </p>
        <ComparisonTable
          sizes={sizes}
          libraries={libraries}
          menhirTotal={menhirTotal}
          components={components}
          notes={[
            {
              library: "Base UI",
              component: "menubar",
              children: (
                <>
                  Base UI's <code>@base-ui/react/menubar</code> is the bar
                  alone. Its menus are built from the parts of{" "}
                  <code>@base-ui/react/menu</code>, measured in the Menu row, so
                  an app with a Base UI menubar imports both.
                </>
              ),
            },
          ]}
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
          The app is a production build. Warnings and errors that Menhir shows
          only in development are not in it, so they are not counted.
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
          A component's size counts all the code it needs, so code that two
          components share is counted in both. The last row of the comparison is
          of the components imported together, as in an app that uses them all:
          there shared code is counted once.
        </p>
      </Section>
    </main>
  );
}
