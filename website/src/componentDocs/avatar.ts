import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const avatarDoc: ComponentDoc = {
  slug: "avatar",
  name: "Avatar",
  category: "Display",
  description:
    "A person's picture, such as a profile photo, with a fallback such as initials while it loads or if it fails. The picture is a native img, in the server HTML so that a cached one shows at once; the parts carry its loading status, data-idle, data-loading, data-loaded or data-error, and the Root reports it in onLoadingStatusChange. A picture that fails is taken out, and the fallback is taken out once the picture has loaded. Stack the two in one grid cell with the picture on top, so nothing shifts as either goes. To keep initials from flashing before a fast picture, delay them in CSS while the img is data-loading, as the example does. The name is the img's alt; give the Fallback the same name with role=\"img\" and aria-label, since initials are not a name, and it hides itself from screen readers while the picture loads above it.",
  anatomy: tsx`<Avatar.Root>
  <Avatar.Image />
  <Avatar.Fallback />
</Avatar.Root>`,
  api: [
    {
      part: "Root",
      description:
        "<span> around the picture and its fallback, with data-idle, data-loading, data-loaded or data-error, which it learns once the Image is mounted: in the server HTML it says data-idle.",
      props: [
        {
          name: "onLoadingStatusChange",
          type: '(status: "idle" | "loading" | "loaded" | "error") => void',
          description:
            "Called with each status the avatar moves to: loading once an Image with a src is mounted or its src changes, then loaded or error, and idle when the Image or its src goes. Not called for the idle it starts at.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the avatar with your own component. Read once.",
        },
      ],
    },
    {
      part: "Image",
      description:
        "<img>, rendered while it loads and once it has loaded, with its own status as data-loading or data-loaded, right in the server HTML too. Pass src, alt and any other attribute of an img. A change of src starts over at loading. Don't hide it while data-loading: the server HTML says data-loading for a cached picture too.",
      props: [
        {
          name: "src",
          type: "string",
          description:
            "The picture. Without one, or with an empty one, nothing is rendered and the status is idle.",
        },
        {
          name: "alt",
          type: "string",
          description:
            "The picture's name, such as the person's name. alt=\"\" for an avatar beside the name in text.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description: "Renders the img with your own component. Read once.",
        },
      ],
    },
    {
      part: "Fallback",
      description:
        '<span> shown until the picture has loaded, with the Root\'s data-* attributes, and aria-hidden="true" while the picture loads. Give it the picture\'s name with role="img" and aria-label, or aria-hidden="true" when the picture\'s alt is "".',
      props: [
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the fallback with your own component. Read once.",
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Tab",
      action:
        "Moves past the avatar, which is not focusable. In a link or a button, that element takes focus.",
    },
  ],
};
