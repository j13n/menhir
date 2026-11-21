import { Title } from "@solidjs/meta";
import toggleSize from "virtual:menhir-sizes/toggle";

import { toggleDoc } from "../../../componentDocs/toggle";
import ComponentPage from "../../../components/ComponentPage";
import { toggleExample } from "../../../examples/toggle";

export default function TogglePage() {
  return (
    <>
      <Title>Toggle · Menhir</Title>
      <ComponentPage {...toggleDoc} size={toggleSize} example={toggleExample} />
    </>
  );
}
