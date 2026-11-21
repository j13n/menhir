import type { ParentProps } from "solid-js";

/**
 * Holds a table that can be wider than a phone screen. The table scrolls
 * sideways inside this box instead of widening the page. The box takes the
 * table's vertical margin, so the table sits flush inside it.
 */
export default function TableScroll(props: ParentProps) {
  return (
    <div class="my-3 overflow-x-auto [&>table]:my-0">{props.children}</div>
  );
}
