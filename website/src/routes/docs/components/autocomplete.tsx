import autocompleteSize from "virtual:menhir-sizes/autocomplete";

import { autocompleteDoc } from "../../../componentDocs/autocomplete";
import ComponentPage from "../../../components/ComponentPage";
import { autocompleteExample } from "../../../examples/autocomplete";

export default function AutocompletePage() {
  return (
    <ComponentPage
      {...autocompleteDoc}
      size={autocompleteSize}
      example={autocompleteExample}
    />
  );
}
