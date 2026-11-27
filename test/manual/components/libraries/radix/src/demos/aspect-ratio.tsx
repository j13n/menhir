import { AspectRatio } from "radix-ui";

import { avatarImage } from "../../../../shared/content.ts";

export default function AspectRatioDemo() {
  return (
    <div className="stack">
      <p>A picture in a 16 by 9 box, 16rem wide:</p>
      <div className="aspect">
        <AspectRatio.Root ratio={16 / 9}>
          <img src={avatarImage} alt="Janusz Oppermann" />
        </AspectRatio.Root>
      </div>
    </div>
  );
}
