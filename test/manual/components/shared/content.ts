// Content the pages share, so that every library says the same words.

export const fruits = ["Apple", "Banana", "Cherry", "Durian", "Elderberry"];
/** The option that is disabled wherever a list of fruits has one. */
export const disabledFruit = "Durian";

/** Thirty lines, for a scroll area. */
export const lines = Array.from({ length: 30 }, (_, i) => `Line ${i + 1}`);

/** A picture that loads without the network, for an avatar. */
export const avatarImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#369"/><circle cx="20" cy="16" r="7" fill="#fff"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#fff"/></svg>',
  );
/** An address that fails to load, for an avatar's fallback. */
export const brokenImage = "/no-such-image.png";
