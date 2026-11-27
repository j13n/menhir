import { Input } from "@base-ui/react/input";

// Base UI has no textarea, so there is no "Comment".
export default function InputDemo() {
  return (
    <label className="stack">
      Name
      <Input />
    </label>
  );
}
