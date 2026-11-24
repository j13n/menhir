// Rendered on the server and hydrated in the test, so both sides get the
// same tree: the recipe's required radio group.
import { Field } from "../../src/field/index.ts";

export default function FieldsetFixture() {
  return (
    <form>
      <Field.Root name="delivery">
        <Field.Control
          data-testid="fieldset"
          render={(props) => <fieldset {...props} />}
        >
          <legend>Delivery</legend>
          <Field.Description>We ship within two days.</Field.Description>
          <label>
            <input type="radio" name="delivery" value="standard" required />
            Standard
          </label>
          <label>
            <input type="radio" name="delivery" value="express" />
            Express
          </label>
          <Field.Error data-testid="error" />
        </Field.Control>
      </Field.Root>
      <button type="button">Next</button>
    </form>
  );
}
