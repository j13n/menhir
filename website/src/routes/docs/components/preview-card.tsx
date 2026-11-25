import previewCardSize from "virtual:menhir-sizes/preview-card";

import { previewCardDoc } from "../../../componentDocs/preview-card";
import ComponentPage from "../../../components/ComponentPage";
import {
  previewCardExample,
  previewCardSectionCode,
} from "../../../examples/preview-card";

export default function PreviewCardPage() {
  return (
    <ComponentPage
      {...previewCardDoc}
      size={previewCardSize}
      example={previewCardExample}
      sectionCode={previewCardSectionCode}
    />
  );
}
