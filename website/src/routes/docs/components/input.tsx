import inputSize from "virtual:menhir-sizes/input";

import { inputDoc } from "../../../componentDocs/input";
import ComponentPage from "../../../components/ComponentPage";
import { inputExample, inputSectionCode } from "../../../examples/input";

export default function InputPage() {
  return (
    <ComponentPage
      {...inputDoc}
      size={inputSize}
      example={inputExample}
      sectionCode={inputSectionCode}
    />
  );
}
