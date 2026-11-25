import toastSize from "virtual:menhir-sizes/toast";

import { toastDoc } from "../../../componentDocs/toast";
import ComponentPage from "../../../components/ComponentPage";
import { toastExample, toastSectionCode } from "../../../examples/toast";

export default function ToastPage() {
  return (
    <ComponentPage
      {...toastDoc}
      size={toastSize}
      example={toastExample}
      sectionCode={toastSectionCode}
    />
  );
}
