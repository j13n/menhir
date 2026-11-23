import alertDialogSize from "virtual:menhir-sizes/alert-dialog";

import { alertDialogDoc } from "../../../componentDocs/alert-dialog";
import ComponentPage from "../../../components/ComponentPage";
import { alertDialogExample } from "../../../examples/alert-dialog";

export default function AlertDialogPage() {
  return (
    <ComponentPage
      {...alertDialogDoc}
      size={alertDialogSize}
      example={alertDialogExample}
    />
  );
}
