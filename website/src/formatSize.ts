/** A size in bytes as kilobytes with one decimal, such as "1.9 kB". */
export function formatSize(bytes: number) {
  return `${(bytes / 1000).toFixed(1)} kB`;
}
