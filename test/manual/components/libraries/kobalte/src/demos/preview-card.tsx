import { HoverCard } from "@kobalte/core/hover-card";

export default function PreviewCardDemo() {
  return (
    <HoverCard>
      <p>
        Built with <HoverCard.Trigger href="#">@menhir</HoverCard.Trigger>.
      </p>
      <HoverCard.Portal>
        <HoverCard.Content class="popup padded">
          Menhir: unstyled components for Solid 2.
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard>
  );
}
