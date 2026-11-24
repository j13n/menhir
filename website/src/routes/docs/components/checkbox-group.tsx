import checkboxGroupSize from "virtual:menhir-sizes/checkbox-group";

import { checkboxGroupDoc } from "../../../componentDocs/checkbox-group";
import ComponentPage from "../../../components/ComponentPage";
import {
  checkboxGroupExample,
  checkboxGroupSectionCode,
} from "../../../examples/checkbox-group";

export default function CheckboxGroupPage() {
  return (
    <ComponentPage
      {...checkboxGroupDoc}
      size={checkboxGroupSize}
      example={checkboxGroupExample}
      sectionCode={checkboxGroupSectionCode}
    />
  );
}
