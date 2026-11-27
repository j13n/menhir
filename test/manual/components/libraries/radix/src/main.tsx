import { createRoot } from "react-dom/client";

import { startShell } from "../../../shared/shell.ts";
import { demos } from "./demos/index.ts";

const root = document.getElementById("root")!;
const entry = startShell("Radix", demos);
if (entry) createRoot(root).render(<entry.component />);
