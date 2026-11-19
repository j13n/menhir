import { computePosition } from "@floating-ui/dom";
import { createSignal } from "solid-js";

import { core } from "../core/index.ts";

export const floating = [computePosition, createSignal, core];
