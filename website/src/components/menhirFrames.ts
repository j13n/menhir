/**
 * Draws one frame of the front page's ASCII animation: a menhir standing on
 * a plain through one day. The sun crosses the sky and the stone's shadow
 * sweeps the ground like a sundial's, then the moon rises among twinkling
 * stars. Each dawn brings the next stone in STONES. Frames are pure functions
 * of the step, so the drawing can be tested without timers.
 */

export const SCENE_WIDTH = 60;
export const SCENE_HEIGHT = 14;

/** Steps in the day, then in the night. One full cycle is their sum. */
export const DAY_STEPS = 72;
export const NIGHT_STEPS = 48;
export const CYCLE_STEPS = DAY_STEPS + NIGHT_STEPS;

const GROUND_ROW = 12;

export type Stone = {
  name: string;
  /** Rows from the top of the stone down to its base on the ground. */
  art: string[];
};

/** Turns a raw template literal into rows, dropping its first and last newline. */
const rows = (raw: string) => raw.split("\n").slice(1, -1);

/** The menhirs the scene cycles through, one per day. */
export const STONES: Stone[] = [
  {
    name: "leaning",
    art: rows(String.raw`
    _.--._
   /   .  '.
  /  :      |
  |     .   |
 /  ;       |
 |      :   \
 |  .        |
 |      ;  . |
/   :        |
|_____.______|
`),
  },
  {
    name: "carved",
    art: rows(String.raw`
    .-~~-.
   /      \
  |  @  ~  |
  |   ~~   |
  |  ~  @  |
  |        |
  | @  ~~  |
  |   ~    |
  |  ~~  @ |
 _|________|_
`),
  },
  {
    name: "squat",
    art: rows(String.raw`
     _.-~~~-._
   .'  ,   ' '.
  /  '   ,     '\
 |   ,   '   ,   |
 | '   ,    '    |
/   ,   '  ,   '  \
|__'_____,_____'__|
`),
  },
];

/** Where a stone stands: centred, its base on the ground row. */
function placeStone(stone: Stone) {
  const width = Math.max(...stone.art.map((line) => line.trimEnd().length));
  const left = Math.floor((SCENE_WIDTH - width) / 2);
  return {
    left,
    right: left + width - 1,
    top: GROUND_ROW - stone.art.length + 1,
    height: stone.art.length,
  };
}

const SUN = [" \\ | / ", "-- O --", " / | \\ "];
const MOON = [" _ ", "( `", " `'"];
const CLOUD = [" .--. ", "(    ).", " `--'' "];

/** Fixed star positions; each twinkles on its own phase. */
const STARS: Array<[col: number, row: number]> = [
  [3, 1],
  [9, 4],
  [14, 0],
  [19, 3],
  [24, 1],
  [33, 0],
  [40, 2],
  [45, 5],
  [49, 1],
  [55, 3],
  [58, 0],
  [6, 7],
  [52, 7],
];
const TWINKLE = [".", ".", "+", "*", "+", "."];

const GRASS = "_,_._'_";

export type SceneFrame = {
  /** The frame as text: SCENE_HEIGHT lines of SCENE_WIDTH characters. */
  text: string;
  /** The name of the stone standing in this frame. */
  stone: string;
  /** "day" while the sun is up, otherwise "night". */
  phase: "day" | "night";
  /** Which side of the stone its shadow falls on, or "none" at noon. */
  shadow: "left" | "right" | "none";
  /** Number of ground cells the shadow covers. */
  shadowLength: number;
};

/**
 * The frame at a step. Steps count up forever: step 0 is the first dawn,
 * each CYCLE_STEPS is one day and night, and each day has the next stone.
 */
export function sceneFrame(step: number): SceneFrame {
  const whole = Math.floor(step);
  const s = mod(whole, CYCLE_STEPS);
  const stone = STONES[mod(Math.floor(whole / CYCLE_STEPS), STONES.length)];
  const place = placeStone(stone);
  const grid = blankGrid();
  drawGround(grid);

  const isDay = s < DAY_STEPS;
  const progress = isDay ? s / DAY_STEPS : (s - DAY_STEPS) / NIGHT_STEPS;
  const body = isDay ? SUN : MOON;
  const { col, row, height } = arc(progress, body);

  if (isDay) {
    drawCloud(grid, s, 2, 0);
    drawCloud(grid, s + 31, 5, 1);
  } else {
    drawStars(grid, s);
  }
  draw(grid, body, col, row);

  const shadow = castShadow(
    grid,
    place,
    col + Math.floor(body[0].length / 2),
    height,
    isDay ? "=" : "-",
  );
  draw(grid, stone.art, place.left, place.top, { opaque: true });

  return {
    text: grid.map((line) => line.join("")).join("\n"),
    stone: stone.name,
    phase: isDay ? "day" : "night",
    ...shadow,
  };
}

function blankGrid() {
  return Array.from({ length: SCENE_HEIGHT }, () =>
    Array.from({ length: SCENE_WIDTH }, () => " "),
  );
}

function drawGround(grid: string[][]) {
  for (let c = 0; c < SCENE_WIDTH; c++) {
    grid[GROUND_ROW][c] = GRASS[c % GRASS.length];
    grid[GROUND_ROW + 1][c] = c % 5 === 2 ? "." : " ";
  }
}

/** Where a sun or moon sits along its arc, and its height above the ground. */
function arc(progress: number, body: string[]) {
  const travel = SCENE_WIDTH - body[0].length;
  const col = Math.round(progress * travel);
  const highest = 0;
  const lowest = GROUND_ROW - body.length;
  const lift = Math.sin(progress * Math.PI);
  const row = Math.round(lowest - lift * (lowest - highest));
  return { col, row, height: GROUND_ROW - (row + body.length) + 1 + lift };
}

/**
 * Darkens the ground on the far side of the stone from the light. A low
 * light casts a long shadow; a light straight overhead casts almost none.
 */
function castShadow(
  grid: string[][],
  stone: ReturnType<typeof placeStone>,
  lightCol: number,
  lightHeight: number,
  mark: string,
): Pick<SceneFrame, "shadow" | "shadowLength"> {
  const stoneCentre = (stone.left + stone.right) / 2;
  const offset = stoneCentre - lightCol;
  if (Math.abs(offset) < 2) {
    return { shadow: "none", shadowLength: 0 };
  }
  // Similar triangles: shadow / stone height = horizontal distance / light height.
  const raw = (stone.height * Math.abs(offset)) / Math.max(lightHeight, 1) / 2;
  const length = Math.min(Math.round(raw), 22);
  const side = offset > 0 ? "right" : "left";
  let drawn = 0;
  for (let i = 1; i <= length; i++) {
    const c = side === "right" ? stone.right + i : stone.left - i;
    if (c < 0 || c >= SCENE_WIDTH) break;
    grid[GROUND_ROW][c] = mark;
    drawn++;
  }
  return { shadow: side, shadowLength: drawn };
}

function drawCloud(grid: string[][], step: number, row: number, speed: number) {
  const span = SCENE_WIDTH + CLOUD[0].length;
  const col = SCENE_WIDTH - ((step * (speed + 1)) % span);
  draw(grid, CLOUD, col, row);
}

function drawStars(grid: string[][], step: number) {
  STARS.forEach(([col, row], i) => {
    grid[row][col] = TWINKLE[(Math.floor(step / 2) + i * 5) % TWINKLE.length];
  });
}

/**
 * Copies art into the grid, clipping at the edges. Spaces are transparent,
 * except inside an opaque shape's outline.
 */
function draw(
  grid: string[][],
  art: string[],
  col: number,
  row: number,
  { opaque = false } = {},
) {
  art.forEach((line, r) => {
    const first = line.search(/\S/);
    const last = line.trimEnd().length - 1;
    for (let c = 0; c < line.length; c++) {
      const x = col + c;
      const y = row + r;
      const inside = opaque && c >= first && c <= last;
      if (line[c] === " " && !inside) continue;
      if (y >= 0 && y < SCENE_HEIGHT && x >= 0 && x < SCENE_WIDTH) {
        grid[y][x] = line[c];
      }
    }
  });
}

/** Remainder that is never negative, so steps before 0 still land in range. */
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
