import { Button } from "@base-ui/react/button";

export default function ButtonDemo() {
  return (
    <>
      <Button>Submit</Button>

      <h2>Disabled</h2>
      <Button disabled>Submit</Button>

      <h2>Disabled, focusable</h2>
      <Button disabled focusableWhenDisabled>
        Submit
      </Button>
    </>
  );
}
