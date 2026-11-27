import { Link } from "@kobalte/core/link";

export default function LinkDemo() {
  return (
    <div class="row">
      <Link href="#">Documentation</Link>
      <Link href="#" disabled>
        Changelog
      </Link>
    </div>
  );
}
