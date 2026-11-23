import { Title } from "@solidjs/meta";
import selectSize from "virtual:menhir-sizes/select";

import { selectDoc } from "../../../componentDocs/select";
import ComponentPage from "../../../components/ComponentPage";
import { selectExample } from "../../../examples/select";

export default function SelectPage() {
  return (
    <>
      <Title>Select · Menhir</Title>
      <ComponentPage {...selectDoc} size={selectSize} example={selectExample} />
    </>
  );
}
