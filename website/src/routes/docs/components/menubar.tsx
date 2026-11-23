import { Title } from "@solidjs/meta";
import menubarSize from "virtual:menhir-sizes/menubar";

import { menubarDoc } from "../../../componentDocs/menubar";
import ComponentPage from "../../../components/ComponentPage";
import { menubarExample } from "../../../examples/menubar";

export default function MenubarPage() {
  return (
    <>
      <Title>Menubar · Menhir</Title>
      <ComponentPage
        {...menubarDoc}
        size={menubarSize}
        example={menubarExample}
      />
    </>
  );
}
