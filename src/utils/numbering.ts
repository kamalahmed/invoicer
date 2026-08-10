/**
 * Bump the numeric suffix of an invoice number, preserving padding and
 * any surrounding prefix/suffix. Falls back to "INV-0001" for blanks.
 */
export function nextNumber(prev: string | undefined | null): string {
  if (!prev) return `INV-${String(1).padStart(4, '0')}`;
  const m = prev.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return `${prev}-2`;
  const [, head, digits, tail] = m;
  const next = String(Number(digits) + 1).padStart(digits.length, '0');
  return `${head}${next}${tail}`;
}
