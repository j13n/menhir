import { Title } from "@solidjs/meta";
import separatorSize from "virtual:menhir-sizes/separator";

import { separatorDoc } from "../../../componentDocs/separator";
import ComponentPage from "../../../components/ComponentPage";
import { separatorExample } from "../../../examples/separator";

export default function SeparatorPage() {
  return (
    <>
      <Title>Separator · Menhir</Title>
      <ComponentPage
        {...separatorDoc}
        size={separatorSize}
        example={separatorExample}
      />
    </>
  );
}
