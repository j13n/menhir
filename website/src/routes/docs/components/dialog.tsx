import { Title } from "@solidjs/meta";
import dialogSize from "virtual:menhir-sizes/dialog";

import { dialogDoc } from "../../../componentDocs/dialog";
import ComponentPage from "../../../components/ComponentPage";
import { dialogExample } from "../../../examples/dialog";

export default function DialogPage() {
  return (
    <>
      <Title>Dialog · Menhir</Title>
      <ComponentPage {...dialogDoc} size={dialogSize} example={dialogExample} />
    </>
  );
}
