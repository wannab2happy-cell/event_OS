/**
 * Sorting Utility Functions
 */

export type SortDirection = 'asc' | 'desc';

export interface SortOptions<T> {
  key: keyof T;
  direction: SortDirection;
}

/**
 * Sort array by key
 */
export function sortBy<T>(
  items: T[],
  options: SortOptions<T>
): T[] {
  const { key, direction } = options;
  const sorted = [...items];

  sorted.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison = aVal < bVal ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Sort array by multiple keys
 */
export function sortByMultiple<T>(
  items: T[],
  options: SortOptions<T>[]
): T[] {
  let sorted = [...items];

  for (const option of options.reverse()) {
    sorted = sortBy(sorted, option);
  }

  return sorted;
}

