import { HoverCard } from "radix-ui";

export default function PreviewCardDemo() {
  return (
    <p>
      Built with{" "}
      <HoverCard.Root>
        <HoverCard.Trigger href="#">@menhir</HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content className="popup padded">
            Menhir: unstyled components for Solid 2.
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
      .
    </p>
  );
}
