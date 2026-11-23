import checkboxSize from "virtual:menhir-sizes/checkbox";

import { checkboxDoc } from "../../../componentDocs/checkbox";
import ComponentPage from "../../../components/ComponentPage";
import {
  checkboxExample,
  checkboxSectionCode,
} from "../../../examples/checkbox";

export default function CheckboxPage() {
  return (
    <ComponentPage
      {...checkboxDoc}
      size={checkboxSize}
      example={checkboxExample}
      sectionCode={checkboxSectionCode}
    />
  );
}
