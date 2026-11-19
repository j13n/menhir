import { createRenderer } from "#test-utils";
import { describe } from "vitest";

import { Toggle } from "../toggle/index.ts";

export const test = [createRenderer, describe, Toggle];
