import { createSignal } from "solid-js";
import { Input } from "menhir/input";

export default function InputExample() {
  const [username, setUsername] = createSignal("ada");
  return (
    <div class="flex flex-col items-start gap-1">
      <label for="username" class="text-sm font-medium">
        Username
      </label>
      <Input.Root
        id="username"
        name="username"
        value={username()}
        // Lower case, and no spaces: a space typed is undone.
        onValueChange={(value) =>
          setUsername(value.toLowerCase().replace(/\s/g, ""))
        }
        class="rounded-md border border-stone-300 bg-transparent px-3 py-1.5 dark:border-stone-700"
      />
      <p class="text-sm text-stone-500 dark:text-stone-400">
        Your page: example.com/@{username()}
      </p>
    </div>
  );
}
