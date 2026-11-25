import { Avatar } from "menhir/avatar";

import "./avatar-wait.css";

// The initials wait 600 ms behind a picture that is loading, and show at
// once without one or when it fails.
const fallback =
  "col-start-1 row-start-1 grid place-items-center bg-stone-200 font-medium dark:bg-stone-700 [[data-loading]~&]:animate-[avatar-wait_0s_600ms_backwards]";

export default function AvatarExample() {
  return (
    <div class="flex gap-3">
      <Avatar.Root class="inline-grid size-12 overflow-hidden rounded-full align-middle">
        <Avatar.Image
          class="z-10 col-start-1 row-start-1 size-full object-cover"
          src="/avatar.svg"
          alt="Alex Kim"
        />
        <Avatar.Fallback class={fallback} role="img" aria-label="Alex Kim">
          AK
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root class="inline-grid size-12 overflow-hidden rounded-full align-middle">
        <Avatar.Fallback class={fallback} role="img" aria-label="Jordan Lee">
          JL
        </Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
