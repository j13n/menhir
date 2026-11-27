import { Skeleton } from "@kobalte/core/skeleton";

export default function SkeletonDemo() {
  return (
    <>
      <p>Loading the article:</p>
      <Skeleton class="skeleton" radius={6}>
        <p>
          A skeleton stands in for content that has not loaded yet, in the shape
          the content will have.
        </p>
      </Skeleton>
    </>
  );
}
