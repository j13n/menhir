// Rendered on the server: a group with none checked and its first radio
// disabled.
import { Radio } from "../../src/radio/index.ts";

export default function RadioEmptyFixture() {
  return (
    <Radio.Root>
      <legend>Letters</legend>
      <Radio.Item value="a" aria-label="a" disabled />
      <Radio.Item value="b" aria-label="b" />
      <Radio.Item value="c" aria-label="c" />
    </Radio.Root>
  );
}
