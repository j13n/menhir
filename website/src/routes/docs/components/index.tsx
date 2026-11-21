import { Title } from "@solidjs/meta";
import { sizes } from "virtual:menhir-sizes";

import SizeTable from "../../../components/SizeTable";
import { isUtility } from "../../../utilities";

export default function Components() {
  return (
    <main>
      <Title>Components · Menhir</Title>
      <h1>Components</h1>
      <p>
        Each component is its own entry point. Its size is what it adds to an
        app that uses every part of it, minified and gzipped, with Solid left
        out. Every entry point has a budget, and a change that goes over it
        fails CI.
      </p>
      <SizeTable sizes={sizes.filter((row) => !isUtility(row.entryPoint))} />
    </main>
  );
}
