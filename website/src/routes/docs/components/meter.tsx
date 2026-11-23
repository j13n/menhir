import meterSize from "virtual:menhir-sizes/meter";

import { meterDoc } from "../../../componentDocs/meter";
import ComponentPage from "../../../components/ComponentPage";
import { meterExample } from "../../../examples/meter";

export default function MeterPage() {
  return (
    <ComponentPage {...meterDoc} size={meterSize} example={meterExample} />
  );
}
