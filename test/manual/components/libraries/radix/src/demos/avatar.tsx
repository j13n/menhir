import { Avatar } from "radix-ui";

import { avatarImage, brokenImage } from "../../../../shared/content.ts";

export default function AvatarDemo() {
  return (
    <div className="row">
      <Avatar.Root className="avatar">
        <Avatar.Image src={avatarImage} alt="Janusz Oppermann" />
        <Avatar.Fallback>JO</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root className="avatar">
        <Avatar.Image src={brokenImage} alt="Janusz Oppermann" />
        <Avatar.Fallback>JO</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
