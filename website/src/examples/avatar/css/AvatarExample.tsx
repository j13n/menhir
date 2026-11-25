import { Avatar } from "menhir/avatar";

import "./avatar.css";

export default function AvatarExample() {
  return (
    <div class="avatar-example">
      <Avatar.Root class="avatar">
        <Avatar.Image class="avatar-image" src="/avatar.svg" alt="Alex Kim" />
        <Avatar.Fallback
          class="avatar-fallback"
          role="img"
          aria-label="Alex Kim"
        >
          AK
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root class="avatar">
        <Avatar.Fallback
          class="avatar-fallback"
          role="img"
          aria-label="Jordan Lee"
        >
          JL
        </Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
