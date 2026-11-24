import radioSize from "virtual:menhir-sizes/radio";

import { radioDoc } from "../../../componentDocs/radio";
import ComponentPage from "../../../components/ComponentPage";
import { radioExample, radioSectionCode } from "../../../examples/radio";

export default function RadioPage() {
  return (
    <ComponentPage
      {...radioDoc}
      size={radioSize}
      example={radioExample}
      sectionCode={radioSectionCode}
    />
  );
}
