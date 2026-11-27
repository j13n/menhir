import { PreviewCard } from "@base-ui/react/preview-card";

export default function PreviewCardDemo() {
  return (
    <PreviewCard.Root>
      <p>
        Built with <PreviewCard.Trigger href="#">@menhir</PreviewCard.Trigger>.
      </p>
      <PreviewCard.Portal>
        <PreviewCard.Positioner className="positioner" sideOffset={6}>
          <PreviewCard.Popup className="popup padded">
            Menhir: unstyled components for Solid 2.
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}
