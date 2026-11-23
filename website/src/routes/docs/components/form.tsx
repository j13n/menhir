import formSize from "virtual:menhir-sizes/form";

import { formDoc } from "../../../componentDocs/form";
import ComponentPage from "../../../components/ComponentPage";
import { formExample, formSectionCode } from "../../../examples/form";

export default function FormPage() {
  return (
    <ComponentPage
      {...formDoc}
      size={formSize}
      example={formExample}
      sectionCode={formSectionCode}
    />
  );
}
