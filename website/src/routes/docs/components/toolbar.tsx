import toolbarSize from "virtual:menhir-sizes/toolbar";

import { toolbarDoc } from "../../../componentDocs/toolbar";
import ComponentPage from "../../../components/ComponentPage";
import { toolbarExample, toolbarSectionCode } from "../../../examples/toolbar";

export default function ToolbarPage() {
  return (
    <ComponentPage
      {...toolbarDoc}
      size={toolbarSize}
      example={toolbarExample}
      sectionCode={toolbarSectionCode}
    />
  );
}
