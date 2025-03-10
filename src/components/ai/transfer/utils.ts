'use client';

/**
 * Converts position number to abbreviation
 */
export function getPositionShort(position: number): string {
  const positions: Record<number, string> = {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD'
  };
  return positions[position] || 'UNK';
}

/**
 * Formats date to locale string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Formats price from raw value (e.g. 75) to display value (e.g. £7.5m)
 */
export function formatPrice(price: number): string {
  return `£${(price / 10).toFixed(1)}m`;
}
