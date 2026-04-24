/**
 * Pull the numeric suffix off an invoice number and bump it by one, keeping
 * zero-padding and any surrounding prefix / suffix intact.
 *
 *   nextNumber(undefined)   === 'INV-0001'
 *   nextNumber('INV-0007')  === 'INV-0008'
 *   nextNumber('A-0099-X')  === 'A-0100-X'
 *   nextNumber('2026/042')  === '2026/043'
 *   nextNumber('draft')     === 'draft-2'  // no digits — appends a counter
 */
export function nextNumber(prev: string | undefined | null): string {
  if (!prev) return `INV-${String(1).padStart(4, '0')}`;
  const m = prev.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return `${prev}-2`;
  const [, head, digits, tail] = m;
  const next = String(Number(digits) + 1).padStart(digits.length, '0');
  return `${head}${next}${tail}`;
}
