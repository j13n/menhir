import { Title } from "@solidjs/meta";
import meterSize from "virtual:menhir-sizes/meter";

import { meterDoc } from "../../../componentDocs/meter";
import ComponentPage from "../../../components/ComponentPage";
import { meterExample } from "../../../examples/meter";

export default function MeterPage() {
  return (
    <>
      <Title>Meter · Menhir</Title>
      <ComponentPage {...meterDoc} size={meterSize} example={meterExample} />
    </>
  );
}
