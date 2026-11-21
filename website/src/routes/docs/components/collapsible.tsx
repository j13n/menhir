import { Title } from "@solidjs/meta";
import collapsibleSize from "virtual:menhir-sizes/collapsible";

import { collapsibleDoc } from "../../../componentDocs/collapsible";
import ComponentPage from "../../../components/ComponentPage";
import { collapsibleExample } from "../../../examples/collapsible";

export default function CollapsiblePage() {
  return (
    <>
      <Title>Collapsible · Menhir</Title>
      <ComponentPage
        {...collapsibleDoc}
        size={collapsibleSize}
        example={collapsibleExample}
      />
    </>
  );
}
