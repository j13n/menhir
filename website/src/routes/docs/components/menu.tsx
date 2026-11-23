import { Title } from "@solidjs/meta";
import menuSize from "virtual:menhir-sizes/menu";

import { menuDoc } from "../../../componentDocs/menu";
import ComponentPage from "../../../components/ComponentPage";
import { menuExample } from "../../../examples/menu";

export default function MenuPage() {
  return (
    <>
      <Title>Menu · Menhir</Title>
      <ComponentPage {...menuDoc} size={menuSize} example={menuExample} />
    </>
  );
}
