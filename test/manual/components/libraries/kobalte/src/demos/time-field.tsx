import { TimeField } from "@kobalte/core/time-field";

export default function TimeFieldDemo() {
  return (
    <TimeField class="stack">
      <TimeField.Label>Event time</TimeField.Label>
      <TimeField.Input class="time-input">
        {(segment) => (
          <TimeField.Segment class="time-segment" segment={segment()} />
        )}
      </TimeField.Input>
    </TimeField>
  );
}
