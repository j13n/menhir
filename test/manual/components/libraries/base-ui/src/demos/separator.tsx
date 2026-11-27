import { Separator } from "@base-ui/react/separator";

export default function SeparatorDemo() {
  return (
    <>
      <p>Above the separator.</p>
      <Separator className="separator" />
      <p>Below the separator.</p>

      <div className="row">
        <a href="#">Home</a>
        <Separator orientation="vertical" className="separator" />
        <a href="#">About</a>
      </div>
    </>
  );
}
