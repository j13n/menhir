import { createSignal } from "solid-js";
import { Input } from "menhir/input";

import "./input.css";

export default function InputExample() {
  const [username, setUsername] = createSignal("ada");
  return (
    <div class="input-example">
      <label for="username">Username</label>
      <Input.Root
        id="username"
        name="username"
        value={username()}
        // Lower case, and no spaces: a space typed is undone.
        onValueChange={(value) =>
          setUsername(value.toLowerCase().replace(/\s/g, ""))
        }
        class="input"
      />
      <p class="hint">Your page: example.com/@{username()}</p>
    </div>
  );
}
