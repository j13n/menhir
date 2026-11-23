import switchSize from "virtual:menhir-sizes/switch";

import { switchDoc } from "../../../componentDocs/switch";
import ComponentPage from "../../../components/ComponentPage";
import { switchExample, switchSectionCode } from "../../../examples/switch";

export default function SwitchPage() {
  return (
    <ComponentPage
      {...switchDoc}
      size={switchSize}
      example={switchExample}
      sectionCode={switchSectionCode}
    />
  );
}
