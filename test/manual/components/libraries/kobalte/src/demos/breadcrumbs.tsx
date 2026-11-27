import { Breadcrumbs } from "@kobalte/core/breadcrumbs";

export default function BreadcrumbsDemo() {
  return (
    <Breadcrumbs>
      <ol class="row crumbs">
        <li>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
        </li>
        <li>
          <Breadcrumbs.Link href="#">Components</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
        </li>
        <li>
          <Breadcrumbs.Link current>Breadcrumbs</Breadcrumbs.Link>
        </li>
      </ol>
    </Breadcrumbs>
  );
}
