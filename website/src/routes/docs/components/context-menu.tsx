import { Title } from "@solidjs/meta";
import contextMenuSize from "virtual:menhir-sizes/context-menu";

import { contextMenuDoc } from "../../../componentDocs/context-menu";
import ComponentPage from "../../../components/ComponentPage";
import { contextMenuExample } from "../../../examples/context-menu";

export default function ContextMenuPage() {
  return (
    <>
      <Title>Context Menu · Menhir</Title>
      <ComponentPage
        {...contextMenuDoc}
        size={contextMenuSize}
        example={contextMenuExample}
      />
    </>
  );
}
