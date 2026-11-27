import { render } from "solid-js/web";

import { startShell } from "../../../shared/shell.ts";
import { demos } from "./demos/index.ts";

const root = document.getElementById("root")!;
const entry = startShell("Kobalte", demos);
if (entry) render(() => <entry.component />, root);
