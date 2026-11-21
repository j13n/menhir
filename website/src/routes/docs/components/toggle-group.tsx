import { Title } from "@solidjs/meta";
import toggleGroupSize from "virtual:menhir-sizes/toggle-group";

import { toggleGroupDoc } from "../../../componentDocs/toggle-group";
import ComponentPage from "../../../components/ComponentPage";
import { toggleGroupExample } from "../../../examples/toggle-group";

export default function ToggleGroupPage() {
  return (
    <>
      <Title>Toggle Group · Menhir</Title>
      <ComponentPage
        {...toggleGroupDoc}
        size={toggleGroupSize}
        example={toggleGroupExample}
      />
    </>
  );
}
