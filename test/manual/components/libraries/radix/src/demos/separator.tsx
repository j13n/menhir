import { Separator } from "radix-ui";

export default function SeparatorDemo() {
  return (
    <>
      <p>Above the separator.</p>
      <Separator.Root className="separator" />
      <p>Below the separator.</p>

      <div className="row">
        <a href="#">Home</a>
        <Separator.Root className="separator" orientation="vertical" />
        <a href="#">About</a>
      </div>
    </>
  );
}
