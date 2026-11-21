import { Title } from "@solidjs/meta";
import switchSize from "virtual:menhir-sizes/switch";

import { switchDoc } from "../../../componentDocs/switch";
import ComponentPage from "../../../components/ComponentPage";
import { switchExample } from "../../../examples/switch";

export default function SwitchPage() {
  return (
    <>
      <Title>Switch · Menhir</Title>
      <ComponentPage {...switchDoc} size={switchSize} example={switchExample} />
    </>
  );
}
