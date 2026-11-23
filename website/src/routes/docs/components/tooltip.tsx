import tooltipSize from "virtual:menhir-sizes/tooltip";

import { tooltipDoc } from "../../../componentDocs/tooltip";
import ComponentPage from "../../../components/ComponentPage";
import { tooltipExample } from "../../../examples/tooltip";

export default function TooltipPage() {
  return (
    <ComponentPage
      {...tooltipDoc}
      size={tooltipSize}
      example={tooltipExample}
    />
  );
}
