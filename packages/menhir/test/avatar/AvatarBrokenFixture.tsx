// AvatarFixture, starting with a picture that fails.
import { Avatars, broken } from "./AvatarFixture.tsx";

export default function AvatarBrokenFixture() {
  return <Avatars src={broken} />;
}
