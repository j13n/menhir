import multiComboboxSize from "virtual:menhir-sizes/multi-combobox";

import { multiComboboxDoc } from "../../../componentDocs/multi-combobox";
import ComponentPage from "../../../components/ComponentPage";
import { multiComboboxExample } from "../../../examples/multi-combobox";

export default function MultiComboboxPage() {
  return (
    <ComponentPage
      {...multiComboboxDoc}
      size={multiComboboxSize}
      example={multiComboboxExample}
    />
  );
}
