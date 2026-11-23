import menubarSize from "virtual:menhir-sizes/menubar";

import { menubarDoc } from "../../../componentDocs/menubar";
import ComponentPage from "../../../components/ComponentPage";
import { menubarExample } from "../../../examples/menubar";

export default function MenubarPage() {
  return (
    <ComponentPage
      {...menubarDoc}
      size={menubarSize}
      example={menubarExample}
    />
  );
}
