import { autoUpdate, computePosition } from "@floating-ui/dom";
import type {
  Alignment,
  Middleware,
  MiddlewareData,
  Side,
  VirtualElement,
} from "@floating-ui/dom";
import { createEffect, createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

export type { Side, VirtualElement };

/** Where along the anchor's side the popup sits. */
export type Align = Alignment | "center";

/**
 * A middleware of this folder, or of `@floating-ui/dom` through it. `write`
 * puts the middleware's result on the popup, and runs only for a result
 * that is not stale.
 */
export type PositionMiddleware = Middleware & {
  write?(popup: HTMLElement, data: MiddlewareData): void;
};

/** A placement that was written, as reactive state. */
export interface Position {
  readonly side: Side;
  readonly align: Align;
  /** The popup's left and top in the viewport, as written. */
  readonly x: number;
  readonly y: number;
  readonly middlewareData: MiddlewareData;
}

/** What one start of `autoUpdate` places. */
interface Run {
  anchor: Element | VirtualElement;
  popup: HTMLElement;
  placement: Side | `${Side}-${Alignment}`;
  middleware: PositionMiddleware[];
}

/**
 * Places `popup` against `anchor` while `open`, with the strategy `fixed` of
 * a popover in the top layer. Pass the options as getters, so a change to
 * one restarts the placement:
 *
 * ```ts
 * const position = createPosition({
 *   get anchor() { return trigger; },
 *   get popup() { return popup; },
 *   get open() { return open(); },
 *   get side() { return props.side; },
 *   get middleware() { return [offset(8), flip(), shift()]; },
 * });
 * ```
 *
 * Show the popup before placing it: create the effect that calls
 * `showPopover()` before calling this, so that the popup can be measured,
 * and is placed before the browser paints it. Writes on the popup its
 * `inset`, rounded to device pixels, `data-side`, `data-align`,
 * `--anchor-width`, `--anchor-height` and `--transform-origin`, then what
 * each middleware writes. Returns the last placement written. Nothing runs
 * on the server.
 */
export function createPosition(options: {
  readonly anchor: Element | VirtualElement | undefined;
  readonly popup: HTMLElement | undefined;
  readonly open: boolean;
  readonly side?: Side;
  readonly align?: Align;
  readonly middleware?: PositionMiddleware[];
}): Accessor<Position | undefined> {
  const [position, setPosition] = createSignal<Position>();
  // The elements usually come from refs, which are assigned while the
  // component renders, after this effect's first compute. Placing starts
  // once the owner has mounted.
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });

  // Each placement takes the next number, and closing takes one too. A
  // result is written only if it still has the latest number, so a
  // placement that resolves late, such as one that flipped and measured
  // twice, never overwrites a newer one.
  let generation = 0;
  // The newest result written while open, to write again over what a
  // stale run's middleware wrote while it measured, as `size` does.
  let written: { generation: number; write: () => void } | undefined;

  const update = (run: Run) => {
    const current = ++generation;
    void computePosition(run.anchor, run.popup, {
      placement: run.placement,
      strategy: "fixed",
      middleware: [...run.middleware, anchorBox],
    }).then((result) => {
      if (current !== generation) {
        if (written && written.generation > current) written.write();
        return;
      }
      const [side, align = "center"] = result.placement.split("-") as [
        Side,
        Alignment?,
      ];
      const x = roundToDevicePixels(result.x);
      const y = roundToDevicePixels(result.y);
      const popup = run.popup;
      const anchor = result.middlewareData.anchor as AnchorData;
      const write = () => {
        popup.style.inset = `${y}px auto auto ${x}px`;
        popup.setAttribute("data-side", side);
        popup.setAttribute("data-align", align);
        popup.style.setProperty("--anchor-width", `${anchor.width}px`);
        popup.style.setProperty("--anchor-height", `${anchor.height}px`);
        popup.style.setProperty("--transform-origin", anchor.origin);
        for (const middleware of run.middleware)
          middleware.write?.(popup, result.middlewareData);
      };
      write();
      written = { generation: current, write };
      setPosition({
        side,
        align,
        x,
        y,
        middlewareData: result.middlewareData,
      });
    });
  };

  createEffect(
    (): Run | undefined => {
      if (!mounted() || !options.open) return undefined;
      const { anchor, popup } = options;
      if (!anchor || !popup) return undefined;
      const side = options.side ?? "bottom";
      const align = options.align ?? "center";
      return {
        anchor,
        popup,
        placement: align === "center" ? side : `${side}-${align}`,
        middleware: options.middleware ?? [],
      };
    },
    (run) => {
      if (!run) return;
      const stop = autoUpdate(run.anchor, run.popup, () => update(run));
      return () => {
        generation++;
        written = undefined;
        stop();
      };
    },
  );

  return position;
}

interface AnchorData {
  width: number;
  height: number;
  origin: string;
}

/**
 * Runs last, after every middleware has moved the popup: the anchor's size,
 * and the point of the popup nearest the anchor's center, on the edge that
 * faces the anchor, for `transform-origin`.
 */
const anchorBox: Middleware = {
  name: "anchor",
  fn({ x, y, placement, rects: { reference, floating } }) {
    const side = placement.split("-")[0];
    const clamp = (value: number, max: number) =>
      Math.min(Math.max(value, 0), max);
    const centerX = clamp(
      reference.x + reference.width / 2 - x,
      floating.width,
    );
    const centerY = clamp(
      reference.y + reference.height / 2 - y,
      floating.height,
    );
    const [originX, originY] =
      side === "top"
        ? [centerX, floating.height]
        : side === "bottom"
          ? [centerX, 0]
          : side === "left"
            ? [floating.width, centerY]
            : [0, centerY];
    const data: AnchorData = {
      width: reference.width,
      height: reference.height,
      origin: `${originX}px ${originY}px`,
    };
    return { data };
  },
};

/** Snaps to the device's pixel grid, so the popup's edges stay sharp. */
function roundToDevicePixels(value: number): number {
  const ratio = window.devicePixelRatio || 1;
  return Math.round(value * ratio) / ratio;
}
