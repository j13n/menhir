import type { ParentProps } from "solid-js";

import DocsSidebar from "../components/DocsSidebar";

/**
 * The layout for every page in `docs/`: the docs navigation beside the page,
 * or above it on narrow screens. The page's `<main>` keeps its reading width
 * but starts at the left of its column instead of centring in it.
 */
export default function DocsLayout(props: ParentProps) {
  return (
    <div class="md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-12 [&>main]:mx-0 [&>main]:min-w-0">
      <aside class="mb-8 md:sticky md:top-6 md:mb-0 md:self-start">
        <DocsSidebar />
      </aside>
      {props.children}
    </div>
  );
}
