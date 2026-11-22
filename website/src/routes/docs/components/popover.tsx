import { Title } from "@solidjs/meta";
import popoverSize from "virtual:menhir-sizes/popover";

import { popoverDoc } from "../../../componentDocs/popover";
import ComponentPage from "../../../components/ComponentPage";
import { popoverExample } from "../../../examples/popover";

export default function PopoverPage() {
  return (
    <>
      <Title>Popover · Menhir</Title>
      <ComponentPage
        {...popoverDoc}
        size={popoverSize}
        example={popoverExample}
      />
    </>
  );
}
