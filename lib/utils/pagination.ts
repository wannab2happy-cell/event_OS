/**
 * Pagination Utility Functions
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginate array
 */
export function paginate<T>(
  items: T[],
  params: PaginationParams
): PaginationResult<T> {
  const { page, pageSize } = params;
  const start = page * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);
  const totalPages = Math.ceil(items.length / pageSize);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    totalPages,
    hasMore: end < items.length,
  };
}

/**
 * Calculate pagination range for database queries
 */
export function getPaginationRange(page: number, pageSize: number): {
  from: number;
  to: number;
} {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

