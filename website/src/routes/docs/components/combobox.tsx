import { Title } from "@solidjs/meta";
import comboboxSize from "virtual:menhir-sizes/combobox";

import { comboboxDoc } from "../../../componentDocs/combobox";
import ComponentPage from "../../../components/ComponentPage";
import { comboboxExample } from "../../../examples/combobox";

export default function ComboboxPage() {
  return (
    <>
      <Title>Combobox · Menhir</Title>
      <ComponentPage
        {...comboboxDoc}
        size={comboboxSize}
        example={comboboxExample}
      />
    </>
  );
}
