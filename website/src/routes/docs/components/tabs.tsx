import { Title } from "@solidjs/meta";
import tabsSize from "virtual:menhir-sizes/tabs";

import { tabsDoc } from "../../../componentDocs/tabs";
import ComponentPage from "../../../components/ComponentPage";
import { tabsExample } from "../../../examples/tabs";

export default function TabsPage() {
  return (
    <>
      <Title>Tabs · Menhir</Title>
      <ComponentPage {...tabsDoc} size={tabsSize} example={tabsExample} />
    </>
  );
}
