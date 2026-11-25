import { PreviewCard } from "menhir/preview-card";

import "./preview-card.css";

// The link is inside a paragraph, which holds no <div>: the Popup, the
// Arrow and the card's content are <span>s, styled as blocks.
const span = (props: object) => <span {...props} />;

export default function PreviewCardExample() {
  return (
    <p class="preview-card-text">
      Every control starts from a native element, as the{" "}
      <PreviewCard.Root>
        <PreviewCard.Trigger
          class="preview-card-link"
          href="/docs/components/switch"
        >
          Switch
        </PreviewCard.Trigger>
        <PreviewCard.Popup
          class="preview-card-popup"
          sideOffset={8}
          render={span}
        >
          <PreviewCard.Arrow class="preview-card-arrow" render={span} />
          <strong class="preview-card-title">Switch</strong>
          <span class="preview-card-description">
            A control that turns an option on or off, built on a native button.
          </span>
        </PreviewCard.Popup>
      </PreviewCard.Root>{" "}
      does.
    </p>
  );
}
