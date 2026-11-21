/** A size in bytes as kilobytes with one decimal, such as "1.9 kB". */
export function formatSize(bytes: number) {
  return `${(bytes / 1000).toFixed(1)} kB`;
}

/** A measured size, or "not measured yet" before the sizes are built. */
export function formatMeasuredSize(bytes: number | undefined) {
  return bytes === undefined ? "not measured yet" : formatSize(bytes);
}
