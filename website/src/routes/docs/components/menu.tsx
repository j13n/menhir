import menuSize from "virtual:menhir-sizes/menu";

import { menuDoc } from "../../../componentDocs/menu";
import ComponentPage from "../../../components/ComponentPage";
import { menuExample } from "../../../examples/menu";

export default function MenuPage() {
  return <ComponentPage {...menuDoc} size={menuSize} example={menuExample} />;
}
