import otpFieldSize from "virtual:menhir-sizes/otp-field";

import { otpFieldDoc } from "../../../componentDocs/otp-field";
import ComponentPage from "../../../components/ComponentPage";
import {
  otpFieldExample,
  otpFieldSectionCode,
} from "../../../examples/otp-field";

export default function OtpFieldPage() {
  return (
    <ComponentPage
      {...otpFieldDoc}
      size={otpFieldSize}
      example={otpFieldExample}
      sectionCode={otpFieldSectionCode}
    />
  );
}
