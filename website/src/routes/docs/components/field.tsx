import fieldSize from "virtual:menhir-sizes/field";

import { fieldDoc } from "../../../componentDocs/field";
import ComponentPage from "../../../components/ComponentPage";
import { fieldExample, fieldSectionCode } from "../../../examples/field";

export default function FieldPage() {
  return (
    <ComponentPage
      {...fieldDoc}
      size={fieldSize}
      example={fieldExample}
      sectionCode={fieldSectionCode}
    />
  );
}
