import avatarSize from "virtual:menhir-sizes/avatar";

import { avatarDoc } from "../../../componentDocs/avatar";
import ComponentPage from "../../../components/ComponentPage";
import { avatarExample } from "../../../examples/avatar";

export default function AvatarPage() {
  return (
    <ComponentPage {...avatarDoc} size={avatarSize} example={avatarExample} />
  );
}
