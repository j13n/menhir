import { Title } from "@solidjs/meta";
import navigationMenuSize from "virtual:menhir-sizes/navigation-menu";

import { navigationMenuDoc } from "../../../componentDocs/navigation-menu";
import ComponentPage from "../../../components/ComponentPage";
import {
  navigationMenuExample,
  navigationMenuSectionCode,
} from "../../../examples/navigation-menu";

export default function NavigationMenuPage() {
  return (
    <>
      <Title>Navigation Menu · Menhir</Title>
      <ComponentPage
        {...navigationMenuDoc}
        size={navigationMenuSize}
        example={navigationMenuExample}
        sectionCode={navigationMenuSectionCode}
      />
    </>
  );
}
