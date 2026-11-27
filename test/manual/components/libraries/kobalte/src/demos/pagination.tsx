import { Pagination } from "@kobalte/core/pagination";

export default function PaginationDemo() {
  return (
    <>
      <p>Search results</p>
      <Pagination
        class="pagination"
        count={10}
        itemComponent={(props) => (
          <Pagination.Item class="toggle" page={props.page}>
            {props.page}
          </Pagination.Item>
        )}
        ellipsisComponent={() => <Pagination.Ellipsis>…</Pagination.Ellipsis>}
      >
        <Pagination.Previous>Previous</Pagination.Previous>
        <Pagination.Items />
        <Pagination.Next>Next</Pagination.Next>
      </Pagination>
    </>
  );
}
