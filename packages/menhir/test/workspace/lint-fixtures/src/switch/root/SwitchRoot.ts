import { render } from "@solidjs/web";
import { createSignal } from "solid-js";

import { core } from "../../core/index.ts";

export const SwitchRoot = [render, createSignal, core];
