import {
  Label,
  unstable_PasswordToggleField as PasswordToggleField,
} from "radix-ui";

export default function PasswordToggleFieldDemo() {
  return (
    <div className="stack">
      <Label.Root htmlFor="password">Password</Label.Root>
      <div className="row">
        <PasswordToggleField.Root>
          <PasswordToggleField.Input id="password" />
          <PasswordToggleField.Toggle>
            <PasswordToggleField.Icon
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              visible={
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5zM8 6a2 2 0 100 4 2 2 0 000-4z" />
              }
              hidden={
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5zM2 2l12 12" />
              }
            />
          </PasswordToggleField.Toggle>
        </PasswordToggleField.Root>
      </div>
    </div>
  );
}
