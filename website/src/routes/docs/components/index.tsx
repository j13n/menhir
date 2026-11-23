import { sizes } from "virtual:menhir-sizes";

import PageHead from "../../../components/PageHead";
import SizeTable from "../../../components/SizeTable";
import { isUtility } from "../../../utilities";

export default function Components() {
  return (
    <main>
      <PageHead
        title="Components · Menhir for SolidJS"
        description="Every Menhir component for SolidJS, such as Dialog, Menu, Select, Combobox, Tabs and Tooltip: unstyled, accessible, each its own entry point, with its size."
      />
      <h1>Components</h1>
      <p>
        Each component is its own entry point. Its size is what it adds to an
        app that uses every part of it, minified and gzipped, with Solid left
        out.
      </p>
      <SizeTable sizes={sizes.filter((row) => !isUtility(row.entryPoint))} />
    </main>
  );
}
