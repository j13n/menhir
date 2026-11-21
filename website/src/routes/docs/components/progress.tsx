import { Title } from "@solidjs/meta";
import progressSize from "virtual:menhir-sizes/progress";

import { progressDoc } from "../../../componentDocs/progress";
import ComponentPage from "../../../components/ComponentPage";
import { progressExample } from "../../../examples/progress";

export default function ProgressPage() {
  return (
    <>
      <Title>Progress · Menhir</Title>
      <ComponentPage
        {...progressDoc}
        size={progressSize}
        example={progressExample}
      />
    </>
  );
}
