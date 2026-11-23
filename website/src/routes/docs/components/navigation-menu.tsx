import navigationMenuSize from "virtual:menhir-sizes/navigation-menu";

import { navigationMenuDoc } from "../../../componentDocs/navigation-menu";
import ComponentPage from "../../../components/ComponentPage";
import {
  navigationMenuExample,
  navigationMenuSectionCode,
} from "../../../examples/navigation-menu";

export default function NavigationMenuPage() {
  return (
    <ComponentPage
      {...navigationMenuDoc}
      size={navigationMenuSize}
      example={navigationMenuExample}
      sectionCode={navigationMenuSectionCode}
    />
  );
}
