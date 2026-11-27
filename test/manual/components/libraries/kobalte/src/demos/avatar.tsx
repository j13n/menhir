import { Image } from "@kobalte/core/image";

import { avatarImage, brokenImage } from "../../../../shared/content.ts";

export default function AvatarDemo() {
  return (
    <div class="row">
      <Image class="avatar">
        <Image.Img src={avatarImage} alt="Janusz Oppermann" />
        <Image.Fallback>JO</Image.Fallback>
      </Image>
      <Image class="avatar">
        <Image.Img src={brokenImage} alt="Janusz Oppermann" />
        <Image.Fallback>JO</Image.Fallback>
      </Image>
    </div>
  );
}
