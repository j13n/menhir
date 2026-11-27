import { AccessibleIcon } from "radix-ui";

export default function AccessibleIconDemo() {
  return (
    <div className="stack">
      <p>A button whose only content is an icon labelled "Close":</p>
      <button>
        <AccessibleIcon.Root label="Close">
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" />
          </svg>
        </AccessibleIcon.Root>
      </button>
    </div>
  );
}
