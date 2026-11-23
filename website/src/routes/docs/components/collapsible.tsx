import collapsibleSize from "virtual:menhir-sizes/collapsible";

import { collapsibleDoc } from "../../../componentDocs/collapsible";
import ComponentPage from "../../../components/ComponentPage";
import { collapsibleExample } from "../../../examples/collapsible";

export default function CollapsiblePage() {
  return (
    <ComponentPage
      {...collapsibleDoc}
      size={collapsibleSize}
      example={collapsibleExample}
    />
  );
}
