import { Title } from "@solidjs/meta";
import checkboxSize from "virtual:menhir-sizes/checkbox";

import { checkboxDoc } from "../../../componentDocs/checkbox";
import ComponentPage from "../../../components/ComponentPage";
import { checkboxExample } from "../../../examples/checkbox";

export default function CheckboxPage() {
  return (
    <>
      <Title>Checkbox · Menhir</Title>
      <ComponentPage
        {...checkboxDoc}
        size={checkboxSize}
        example={checkboxExample}
      />
    </>
  );
}
