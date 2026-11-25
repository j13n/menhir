import sliderSize from "virtual:menhir-sizes/slider";

import { sliderDoc } from "../../../componentDocs/slider";
import ComponentPage from "../../../components/ComponentPage";
import { sliderExample, sliderSectionCode } from "../../../examples/slider";

export default function SliderPage() {
  return (
    <ComponentPage
      {...sliderDoc}
      size={sliderSize}
      example={sliderExample}
      sectionCode={sliderSectionCode}
    />
  );
}
