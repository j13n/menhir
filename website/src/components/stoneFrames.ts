/** Frames in one full turn of the stone. */
export const TURN_FRAMES = 120;
/** Columns and rows of each frame. The stone stands on the bottom row. */
export const STONE_WIDTH = 76;
export const STONE_HEIGHT = 64;

/**
 * Characters from the brightest surface to the darkest. Dense characters
 * stand for bright surfaces.
 */
const RAMP =
  "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'.";

/** A character cell at line height 1 is about 1.7 times as tall as it is wide. */
const ROWS_PER_UNIT = 10.5;
const COLUMNS_PER_UNIT = ROWS_PER_UNIT * 1.7;
/** The stone's height in the same units as its radius. */
const STONE_UNITS = STONE_HEIGHT / ROWS_PER_UNIT;
/** Points sampled around the stone on each row. */
const SAMPLES = 900;

/** Light from the upper left, in front of the stone. */
const LIGHT = normalize([-0.55, 0.45, 0.7]);

/** How far the top leans off the axis, and towards which side of the stone. */
const LEAN = 0.35;
const LEAN_ANGLE = 0.5;

/**
 * The stone's radius at angle `phi` around its centre line and height `h`
 * (0 at the ground, 1 at the highest point of the top). A slab with flat
 * faces and rounded edges that bulges a little and tapers to a slanting,
 * rounded crown, so each side looks different as it turns.
 */
function radius(phi: number, h: number) {
  const top = 1 - 0.2 * (1 + Math.cos(phi - 0.9)) * 0.5;
  if (h >= top) return 0;
  // A superellipse: flatter faces than an oval.
  const n = 3;
  const slab =
    (Math.abs(Math.cos(phi) / 1.2) ** n +
      Math.abs(Math.sin(phi) / 0.65) ** n) **
    (-1 / n);
  const profile = (1 - 0.3 * h) * (1 + 0.1 * Math.sin(Math.PI * h));
  const lumps =
    1 +
    0.05 * Math.sin(2 * phi + 1 + 3 * h) +
    0.04 * Math.sin(3 * phi - 0.5 + 5 * h) +
    0.02 * Math.sin(7 * phi + 9 * h);
  const rounding = 0.2;
  const crown =
    h > top - rounding
      ? Math.sqrt(1 - ((h - top + rounding) / rounding) ** 2)
      : 1;
  return slab * profile * lumps * crown;
}

/** A point on the surface, with the stone turned by `turn` radians. */
function surface(phi: number, h: number, turn: number): Vec {
  const r = radius(phi, h);
  const lean = LEAN * h ** 1.5;
  const x = lean * Math.cos(LEAN_ANGLE) + r * Math.cos(phi);
  const z = lean * Math.sin(LEAN_ANGLE) + r * Math.sin(phi);
  return [
    x * Math.cos(turn) - z * Math.sin(turn),
    h * STONE_UNITS,
    x * Math.sin(turn) + z * Math.cos(turn),
  ];
}

/** The character for a surface with `brightness` from 0 to 1. */
function shade(brightness: number) {
  const clamped = Math.min(1, Math.max(0, brightness));
  return RAMP[Math.round((1 - clamped) * (RAMP.length - 1))];
}

/**
 * The frame at `step`: the stone turned by step / TURN_FRAMES of a full turn
 * about its upright axis, as STONE_HEIGHT lines of STONE_WIDTH characters.
 */
export function stoneFrame(step: number): string {
  const turn =
    (2 * Math.PI * (((step % TURN_FRAMES) + TURN_FRAMES) % TURN_FRAMES)) /
    TURN_FRAMES;
  const lines: string[] = [];

  for (let row = 0; row < STONE_HEIGHT; row++) {
    const h = (STONE_HEIGHT - row - 0.5) / STONE_HEIGHT;
    // The nearest surface in each column, and its character.
    const nearest = Array.from({ length: STONE_WIDTH }, () => -Infinity);
    const line = Array.from({ length: STONE_WIDTH }, () => " ");

    for (let i = 0; i < SAMPLES; i++) {
      const phi = (2 * Math.PI * i) / SAMPLES;
      if (radius(phi, h) <= 0) continue;
      const point = surface(phi, h, turn);
      const column = Math.round(
        STONE_WIDTH / 2 - 0.5 + point[0] * COLUMNS_PER_UNIT,
      );
      if (column < 0 || column >= STONE_WIDTH || point[2] <= nearest[column]) {
        continue;
      }
      nearest[column] = point[2];

      const d = 1e-3;
      const alongH = sub(surface(phi, h + d, turn), surface(phi, h - d, turn));
      const alongPhi = sub(
        surface(phi + d, h, turn),
        surface(phi - d, h, turn),
      );
      const normal = normalize(cross(alongH, alongPhi));
      line[column] = shade(Math.max(0, dot(normal, LIGHT)) * 0.9 + 0.08);
    }
    lines.push(line.join(""));
  }
  return lines.join("\n");
}

type Vec = [number, number, number];

function sub(a: Vec, b: Vec): Vec {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec, b: Vec): Vec {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: Vec, b: Vec) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v: number[]): Vec {
  const length = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}
