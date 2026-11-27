import { Rating } from "@kobalte/core/rating";
import { Index } from "solid-js";

export default function RatingDemo() {
  return (
    <Rating class="stack">
      <Rating.Label>Rate this product</Rating.Label>
      <Rating.Control class="row">
        <Index each={Array(5)}>
          {() => (
            <Rating.Item class="rating-item">
              <Rating.ItemControl>
                {(state) => (state.highlighted() ? "★" : "☆")}
              </Rating.ItemControl>
            </Rating.Item>
          )}
        </Index>
      </Rating.Control>
    </Rating>
  );
}
