import separatorSize from "virtual:menhir-sizes/separator";

import { separatorDoc } from "../../../componentDocs/separator";
import ComponentPage from "../../../components/ComponentPage";
import { separatorExample } from "../../../examples/separator";

export default function SeparatorPage() {
  return (
    <ComponentPage
      {...separatorDoc}
      size={separatorSize}
      example={separatorExample}
    />
  );
}
