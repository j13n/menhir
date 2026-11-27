import { Badge } from "@kobalte/core/badge";

export default function BadgeDemo() {
  return (
    <p>
      Inbox{" "}
      <Badge class="badge" textValue="5 unread messages">
        5
      </Badge>
    </p>
  );
}
