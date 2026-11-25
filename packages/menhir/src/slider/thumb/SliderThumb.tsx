import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../../core/renderElement.tsx";
import { useSliderRootContext } from "../root/SliderRootContext.ts";

export interface SliderThumbProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "id"
> {
  /** Renders the thumb's element as another element or component. Read once. */
  render?: RenderProp;
}

/**
 * The thumb: a `<div>` the consumer places with `--slider`, with the
 * slider's control inside it, a visually hidden `<input type="range">`.
 * Its `aria-label`, `aria-labelledby` and `aria-describedby` go on the
 * input. Place it inside `Slider.Track`.
 */
export function SliderThumb(props: SliderThumbProps) {
  const root = useSliderRootContext();
  // Whether a key, or the input itself, holds a change under way, which
  // ends once the key is released, focus leaves, or the input fires
  // `change`.
  let held = false;
  const hold = () => {
    if (!held) root.begin();
    held = true;
  };
  const release = () => {
    // Cleared first: the commit fires the input's `change`, which calls this
    // again.
    if (!held) return;
    held = false;
    root.end();
  };
  // The keys of the slider pattern. Each is canceled, so the input does not
  // move itself as well, which it would by its own rules, nor the page
  // scroll.
  const onKeyDown = (event: KeyboardEvent) => {
    // Alt+Left goes back, and the rest are the browser's too.
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const step = root.stepSize();
    const large = root.props.largeStep ?? step * 10;
    // Right to left, the track is drawn mirrored, and so are Left and Right.
    const right =
      getComputedStyle(event.currentTarget as Element).direction === "rtl"
        ? -step
        : step;
    // Home and End step past the ends, which the step clamps to.
    const amount = (
      {
        __proto__: null,
        ArrowRight: right,
        ArrowLeft: -right,
        ArrowUp: step,
        ArrowDown: -step,
        PageUp: large,
        PageDown: -large,
        Home: -Infinity,
        End: Infinity,
      } as Record<string, number | null | undefined>
    )[event.key];
    if (!amount) return;
    hold();
    root.step(amount);
    event.preventDefault();
  };
  const input = (
    <input
      type="range"
      style={visuallyHidden}
      id={root.props.id}
      name={root.props.name}
      form={root.props.form}
      min={root.props.min}
      max={root.props.max}
      step={root.props.step}
      value={String(root.value())}
      disabled={root.props.disabled}
      aria-valuetext={root.text()}
      aria-orientation={
        root.props.orientation === "vertical" ? "vertical" : undefined
      }
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      // The Thumb's own, else a Field's around the Root.
      aria-describedby={
        props["aria-describedby"] ?? root.props["aria-describedby"]
      }
      aria-invalid={root.props["aria-invalid"]}
      onKeyDown={onKeyDown}
      // A held key repeats, and commits once, when released.
      onKeyUp={release}
      onBlur={release}
      // A change the input made itself, as assistive technology may make
      // one, or a key with a modifier the browser moves it by. The slider's
      // own changes set the input's value first, so they match.
      onInput={(event) => {
        const number = Number((event.currentTarget as HTMLInputElement).value);
        if (number === root.requested()) return;
        hold();
        root.change(number);
      }}
      onChange={release}
      ref={(element) => {
        root.input = element;
      }}
    />
  );
  const ownProps = merge(root.attributes, {
    get children() {
      return [input, props.children];
    },
    ref: (element: HTMLElement) => {
      root.thumb = element;
    },
  }) as ElementProps;
  const elementProps = mergeElementProps(
    ownProps,
    omit(
      props,
      "render",
      "children",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
    ),
  );
  return renderElement(props, elementProps, (p) => <div {...p} />);
}

// Hidden from sight but not from the keyboard or assistive technology. Not
// `display: none`, so it can still take focus.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
