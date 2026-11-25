import type { ComponentExampleProps } from "../../components/ComponentExample";

import CssExample from "./css/OtpFieldExample";
import cssExampleCode from "./css/OtpFieldExample.tsx?highlight";
import cssCode from "./css/otp-field.css?highlight";
import inAFieldCode from "./in-a-field/OtpFieldInField.tsx?highlight";
import lettersAndDigitsCode from "./letters-and-digits/OtpFieldLetters.tsx?highlight";
import TailwindExample from "./tailwind/OtpFieldExample";
import tailwindExampleCode from "./tailwind/OtpFieldExample.tsx?highlight";

/** The OTP Field page's example, with plain CSS and with Tailwind CSS. */
export const otpFieldExample: ComponentExampleProps = {
  css: {
    render: CssExample,
    files: [
      { name: "OtpFieldExample.tsx", code: cssExampleCode },
      { name: "otp-field.css", code: cssCode },
    ],
  },
  tailwind: {
    render: TailwindExample,
    files: [{ name: "OtpFieldExample.tsx", code: tailwindExampleCode }],
  },
};

/** The code of the OTP Field page's further sections, by their id. */
export const otpFieldSectionCode = {
  "letters-and-digits": lettersAndDigitsCode,
  "in-a-field": inAFieldCode,
};
