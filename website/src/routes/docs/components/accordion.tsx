import accordionSize from "virtual:menhir-sizes/accordion";

import { accordionDoc } from "../../../componentDocs/accordion";
import ComponentPage from "../../../components/ComponentPage";
import { accordionExample } from "../../../examples/accordion";

export default function AccordionPage() {
  return (
    <ComponentPage
      {...accordionDoc}
      size={accordionSize}
      example={accordionExample}
    />
  );
}
