// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { createSignal, untrack } from "solid-js";

import { Avatar } from "../../src/avatar/index.ts";

// A 1×1 GIF, which a browser loads without a request, and bytes that are
// no image, which it fails to decode. jsdom loads neither.
export const picture =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
export const broken = "data:image/png;base64,AAAA";

export function Avatars(props: { src: string }) {
  // Read once: the fixture's starting picture.
  const [src, setSrc] = createSignal(untrack(() => props.src));
  return (
    <>
      <Avatar.Root id="jane">
        <Avatar.Image id="jane-image" src={src()} alt="Jane Doe" />
        <Avatar.Fallback id="jane-fallback" role="img" aria-label="Jane Doe">
          JD
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root id="john">
        <Avatar.Image src={undefined} alt="John Roe" />
        <Avatar.Fallback id="john-fallback" role="img" aria-label="John Roe">
          JR
        </Avatar.Fallback>
      </Avatar.Root>
      <button type="button" onClick={() => setSrc(broken)}>
        Break
      </button>
    </>
  );
}

export default function AvatarFixture() {
  return <Avatars src={picture} />;
}
