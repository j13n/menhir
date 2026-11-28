import { Select } from "menhir/select";
import { Separator } from "menhir/separator";
import { createMemo, createSignal, For, onSettled } from "solid-js";

import CopyButton from "./CopyButton";

/** Each package manager's command to add a package, in the order listed. */
const packageManagers = [
  { name: "npm", add: (pkg: string) => `npm install ${pkg}` },
  { name: "pnpm", add: (pkg: string) => `pnpm add ${pkg}` },
  { name: "yarn", add: (pkg: string) => `yarn add ${pkg}` },
  { name: "bun", add: (pkg: string) => `bun add ${pkg}` },
  { name: "deno", add: (pkg: string) => `deno add npm:${pkg}` },
];

/** The localStorage key the chosen package manager is saved under. */
export const packageManagerKey = "package-manager";

const isPackageManager = (name: string | null) =>
  packageManagers.some((pm) => pm.name === name);

const item =
  "flex cursor-default items-center justify-between gap-4 rounded px-2 py-1.5 select-none data-active:bg-stone-200/70 dark:data-active:bg-stone-800";

/**
 * The command that installs a package, with a Select for the package
 * manager and a button that copies the command.
 */
export default function InstallCommand(props: { package: string }) {
  // Never null: selecting the selected item only closes the list.
  const [manager, setManager] = createSignal<string | null>("pnpm");

  // The server and hydration render pnpm; a saved choice replaces it after.
  onSettled(() => {
    try {
      const saved = localStorage.getItem(packageManagerKey);
      if (isPackageManager(saved)) setManager(saved);
    } catch {
      // Storage can be unavailable, such as with cookies blocked.
    }
  });

  const choose = (name: string | null) => {
    setManager(name);
    try {
      if (name) localStorage.setItem(packageManagerKey, name);
    } catch {
      // See above: the choice then lasts until the page is left.
    }
  };
  const command = createMemo(() =>
    packageManagers.find((pm) => pm.name === manager())!.add(props.package),
  );

  return (
    <div class="inline-flex items-center rounded-lg bg-stone-200/70 py-1.5 pr-2 pl-1.5 font-mono text-sm dark:bg-stone-800/70">
      <Select.Root value={manager()} onValueChange={choose}>
        <Select.Trigger
          aria-label="Package manager"
          class="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-stone-600 after:text-xs after:content-['▾'] hover:bg-stone-300/70 focus-visible:outline-2 focus-visible:outline-stone-500 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          <Select.Value />
        </Select.Trigger>
        <Select.Popup
          sideOffset={6}
          class="m-0 min-w-32 rounded-lg border border-stone-200 bg-white p-1 font-mono text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
        >
          <For each={packageManagers}>
            {(pm) => (
              <Select.Item value={pm.name} class={item}>
                {pm.name}
                <Select.ItemIndicator class="data-unselected:invisible">
                  ✓
                </Select.ItemIndicator>
              </Select.Item>
            )}
          </For>
        </Select.Popup>
      </Select.Root>
      <Separator.Root
        orientation="vertical"
        class="mr-3 ml-1 h-5 w-px bg-stone-300 dark:bg-stone-700"
      />
      <code class="mr-3">{command()}</code>
      <CopyButton
        getText={command}
        label="Copy"
        aria-label="Copy install command"
        class="rounded px-2 py-1 font-sans text-xs text-stone-600 hover:bg-stone-300/70 dark:text-stone-300 dark:hover:bg-stone-700"
      />
    </div>
  );
}
