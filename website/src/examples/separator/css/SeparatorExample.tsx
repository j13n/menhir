import { Separator } from "menhir/separator";

import "./separator.css";

export default function SeparatorExample() {
  return (
    <div class="separator-example">
      <p>Unstyled, accessible UI primitives for SolidJS.</p>
      <Separator.Root class="separator" />
      <div class="separator-row">
        <span>Docs</span>
        <Separator.Root orientation="vertical" class="separator" />
        <span>Components</span>
        <Separator.Root orientation="vertical" class="separator" />
        <span>Source</span>
      </div>
    </div>
  );
}
