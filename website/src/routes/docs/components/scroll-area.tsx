import scrollAreaSize from "virtual:menhir-sizes/scroll-area";

import { scrollAreaDoc } from "../../../componentDocs/scroll-area";
import ComponentPage from "../../../components/ComponentPage";
import {
  scrollAreaExample,
  scrollAreaSectionCode,
} from "../../../examples/scroll-area";

export default function ScrollAreaPage() {
  return (
    <ComponentPage
      {...scrollAreaDoc}
      size={scrollAreaSize}
      example={scrollAreaExample}
      sectionCode={scrollAreaSectionCode}
    />
  );
}
