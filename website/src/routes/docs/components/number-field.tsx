import numberFieldSize from "virtual:menhir-sizes/number-field";

import { numberFieldDoc } from "../../../componentDocs/number-field";
import ComponentPage from "../../../components/ComponentPage";
import {
  numberFieldExample,
  numberFieldSectionCode,
} from "../../../examples/number-field";

export default function NumberFieldPage() {
  return (
    <ComponentPage
      {...numberFieldDoc}
      size={numberFieldSize}
      example={numberFieldExample}
      sectionCode={numberFieldSectionCode}
    />
  );
}
