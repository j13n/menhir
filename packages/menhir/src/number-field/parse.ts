/**
 * Reads text written in a formatter's locale and format back to a number,
 * `NaN` when it is not one (src/number-field/README.md, "Decisions"). Reads
 * the locale's digits, and ASCII digits, its decimal separator, its minus
 * sign and `-`; drops its group separator, whitespace, apostrophes, and the
 * currency, percent sign, unit and literal text the format writes. Any
 * other character makes the text not a number. A percentage is read as the
 * fraction the formatter writes as one: `25%` is `0.25`. Empty text is
 * `NaN` too: the caller reads it as no value.
 */
export function parseNumber(
  formatter: Intl.NumberFormat,
  text: string,
): number {
  const { locale, numberingSystem, style } = formatter.resolvedOptions();
  const plain = new Intl.NumberFormat(locale, { numberingSystem });
  // What each character the locale writes stands for.
  const meaning: Record<string, string> = { "-": "-" };
  for (const { type, value } of plain.formatToParts(-12345.6)) {
    if (type === "decimal") meaning[value] = ".";
    if (type === "minusSign") meaning[value] = "-";
    if (type === "group") meaning[value] = "";
  }
  // The locale's digits, such as Arabic-Indic ones.
  for (let digit = 0; digit < 10; digit++) {
    meaning[plain.format(digit)] = String(digit);
  }
  // The text the format writes around the number.
  for (const { type, value } of [
    ...formatter.formatToParts(-1),
    ...formatter.formatToParts(1),
  ]) {
    if (/^(currency|percentSign|unit|literal|plusSign)$/.test(type)) {
      text = text.split(value).join("");
    }
  }
  let number = "";
  // Whitespace, for a no-break space typed as a space, and either
  // apostrophe, as ICU versions and keyboards differ on de-CH's.
  for (const char of text.replace(/[\s'’]/g, "")) {
    number += /\d/.test(char) ? char : (meaning[char] ?? "!");
  }
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(number)) return NaN;
  return style === "percent" ? Number(number) / 100 : Number(number);
}
