import { Separator } from "@kobalte/core/separator";

export default function SeparatorDemo() {
  return (
    <>
      <p>Above the separator.</p>
      <Separator class="separator" />
      <p>Below the separator.</p>

      <div class="row">
        <a href="#">Home</a>
        <Separator class="separator" orientation="vertical" />
        <a href="#">About</a>
      </div>
    </>
  );
}
